const amqp = require('amqplib');
const axios = require('axios');
const { interfacePool } = require('../config/dbconfig');

async function getAccessToken() {
    const response = await axios.post(`${process.env.PREDICT_RESULT_SERVICE_URL}/api/auth/login`, {
        apiKey: process.env.API_KEY,
        apiSecret: process.env.API_SECRET
    });
    return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
    };
}

async function predictResult(msg, channel) {
    console.log('predictResult: Received message', msg.content.toString());
    const data = JSON.parse(msg.content.toString());
    const { requestRef } = data;

    try {
        console.log('predictResult: Checking database connection');
        const testRes = await interfacePool.query('SELECT NOW()');
        console.log('Database connection test result:', testRes.rows);

        console.log(`predictResult: Querying interface_requests with request_ref ${requestRef}`);
        // Query request data from the database
        const requestRes = await interfacePool.query('SELECT inslot, material, batch, plant, operationno FROM interface.interface_requests WHERE request_ref = $1', [requestRef]);
        console.log('predictResult: Query result:', requestRes.rows);

        const request = requestRes.rows[0];
        if (!request) throw new Error('Request not found in the database');
        console.log('predictResult: Fetched request data from interface_requests', request);
        const { inslot, material, batch, plant, operationno } = request;

        console.log(`predictResult: Querying samples with request_ref ${requestRef}`);
        // Query sample data from the database
        const sampleRes = await interfacePool.query('SELECT sample_no FROM interface.samples WHERE request_ref = $1', [requestRef]);
        console.log('predictResult: Sample query result:', sampleRes.rows);

        const sample = sampleRes.rows[0];
        if (!sample) throw new Error('Sample not found in the database');
        console.log('predictResult: Fetched sample data from samples', sample);
        const { sample_no } = sample;

        console.log('predictResult: Authenticating with PREDICT_RESULT_SERVICE');
        console.log(`predictResult: PREDICT_RESULT_SERVICE_URL is ${process.env.PREDICT_RESULT_SERVICE_URL}`);
        
        let { accessToken, refreshToken } = await getAccessToken();

        const queryUrl = `${process.env.PREDICT_RESULT_SERVICE_URL}/interfaces/search?inslot=${inslot}&batch=${batch}&material=${material}&plant=${plant}&operationno=${operationno}`;
        console.log(`predictResult: Fetching results from PREDICT_RESULT_SERVICE with URL ${queryUrl}`);

        let resultResponse;
        try {
            resultResponse = await axios.get(queryUrl, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('predictResult: Access token expired, fetching new token');
                ({ accessToken } = await getAccessToken());
                resultResponse = await axios.get(queryUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
            } else {
                throw error;
            }
        }

        if (resultResponse && resultResponse.data) {
            console.log('predictResult: Fetched data from PREDICT_RESULT_SERVICE:', resultResponse.data);
        } else {
            throw new Error('No data received from PREDICT_RESULT_SERVICE');
        }

        const results = resultResponse.data;
        if (!results || results.length === 0) {
            throw new Error('No results found from PREDICT_RESULT_SERVICE');
        }

        console.log('predictResult: Fetched results from PREDICT_RESULT_SERVICE', results);
        const averageResults = {
            phys0003: results.reduce((sum, r) => sum + parseFloat(r.phys0003 || 0), 0) / results.length,
            phys0004: results.reduce((sum, r) => sum + parseFloat(r.phys0004 || 0), 0) / results.length,
            phys0005: results.reduce((sum, r) => sum + parseFloat(r.phys0005 || 0), 0) / results.length,
            phys0006: results.reduce((sum, r) => sum + parseFloat(r.phys0006 || 0), 0) / results.length,
            phys0007: results.reduce((sum, r) => sum + parseFloat(r.phys0007 || 0), 0) / results.length,
            phys0008: results.reduce((sum, r) => sum + parseFloat(r.phys0008 || 0), 0) / results.length,
            phys0009: results.reduce((sum, r) => sum + parseFloat(r.phys0009 || 0), 0) / results.length
        };
        console.log('predictResult: Calculated average results', averageResults);

        console.log('predictResult: Inserting results into interface.inspections');
        // Insert fetched results into interface.inspections
        await interfacePool.query(
            `INSERT INTO interface.inspections 
            (request_ref, insp_lot, plant, operation, sample_no, phys0003, phys0004, phys0005, phys0006, phys0007, phys0008, phys0009) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
                requestRef,
                inslot,
                plant,
                operationno,
                sample_no,
                averageResults.phys0003,
                averageResults.phys0004,
                averageResults.phys0005,
                averageResults.phys0006,
                averageResults.phys0007,
                averageResults.phys0008,
                averageResults.phys0009
            ]
        );
        console.log('predictResult: Inserted results into interface.inspections successfully, request_ref:', requestRef);

        // Send message to the next queue
        const nextQueue = 'inspection_result_queue';
        channel.sendToQueue(nextQueue, Buffer.from(JSON.stringify(data)));
        console.log(`predictResult: Message sent to ${nextQueue} with request_ref:`, requestRef);

    } catch (error) {
        console.error('Error in predictResult:', error.message);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
        }
    }
}

async function consumePredictResult() {
    console.log('consumePredictResult: Connecting to RabbitMQ');
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'predict_result_queue';

    await channel.assertQueue(queue, { durable: true });
    console.log(`consumePredictResult: Waiting for messages in ${queue}`);
    channel.consume(queue, async (msg) => {
        console.log(`consumePredictResult: Received message`);
        await predictResult(msg, channel);
        channel.ack(msg);
        console.log(`consumePredictResult: Message acknowledged`);
    });

    console.log('Event 3 Consumer started');
}

module.exports = consumePredictResult;
