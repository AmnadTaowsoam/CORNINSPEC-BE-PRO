const amqp = require('amqplib');
const axios = require('axios');
const { interfacePool } = require('../config/dbconfig');

async function processEvent3(msg) {
    const data = JSON.parse(msg.content.toString());
    const { request_ref } = data;

    try {
        // Query interface_requests to get inslot, material, batch, plant, operationno
        const requestRes = await interfacePool.query(
            'SELECT inslot, material, batch, plant, operationno FROM interface.interface_requests WHERE request_ref = $1',
            [request_ref]
        );
        const request = requestRes.rows[0];

        if (!request) {
            throw new Error('Request not found in the database');
        }

        const { inslot, material, batch, plant, operationno } = request;

        // Query interface.samples to get sample_no
        const sampleRes = await interfacePool.query(
            'SELECT sample_no FROM interface.samples WHERE request_ref = $1',
            [request_ref]
        );
        const sample = sampleRes.rows[0];

        if (!sample) {
            throw new Error('Sample not found in the database');
        }

        const { sample_no } = sample;

        // Authenticate with the PREDICT_RESULT_SERVICE
        const authResponse = await axios.post(`${process.env.PREDICT_RESULT_SERVICE_URL}/login`, {
            apiKey: process.env.API_KEY,
            apiSecret: process.env.API_SECRET
        });

        const token = authResponse.data.token;

        // Query PREDICT_RESULT_SERVICE for results
        const queryUrl = `${process.env.PREDICT_RESULT_SERVICE_URL}/interfaces/search?inslot=${inslot}&batch=${batch}&material=${material}&plant=${plant}&operationno=${operationno}`;
        const resultResponse = await axios.get(queryUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const results = resultResponse.data.results;
        const averageResults = {
            mic_phys003: results.reduce((sum, r) => sum + r.mic_phys003, 0) / results.length,
            mic_phys004: results.reduce((sum, r) => sum + r.mic_phys004, 0) / results.length,
            mic_phys005: results.reduce((sum, r) => sum + r.mic_phys005, 0) / results.length,
            mic_phys006: results.reduce((sum, r) => sum + r.mic_phys006, 0) / results.length,
            mic_phys007: results.reduce((sum, r) => sum + r.mic_phys007, 0) / results.length,
            mic_phys008: results.reduce((sum, r) => sum + r.mic_phys008, 0) / results.length,
            mic_phys009: results.reduce((sum, r) => sum + r.mic_phys009, 0) / results.length,
        };

        // Insert results into interface.inspections
        await interfacePool.query(
            'INSERT INTO interface.inspections (request_ref, insp_lot, plant, operation, sample_no, mic_phys003, mic_phys004, mic_phys005, mic_phys006, mic_phys007, mic_phys008, mic_phys009) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [request_ref, inslot, plant, operationno, sample_no, averageResults.mic_phys003, averageResults.mic_phys004, averageResults.mic_phys005, averageResults.mic_phys006, averageResults.mic_phys007, averageResults.mic_phys008, averageResults.mic_phys009]
        );

        console.log('Event 3: Inspection results saved to database');
    } catch (error) {
        console.error('Error in Event 3:', error.message);
    }
}

async function consumeEvent3() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'event3_queue'; // กำหนดชื่อคิวตามการใช้งานจริง

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        await processEvent3(msg);
        channel.ack(msg);
    });

    console.log('Event 3 Consumer started');
}

module.exports = consumeEvent3;
