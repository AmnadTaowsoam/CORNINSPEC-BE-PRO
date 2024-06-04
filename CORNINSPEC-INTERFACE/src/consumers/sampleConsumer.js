const amqp = require('amqplib');
const axios = require('axios');
const { getLatestTokenAndCookies } = require('../models/tokenModel');
const { interfacePool } = require('../config/dbconfig');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');

const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));

async function sampleRequest(msg, channel) {
    console.log('sampleRequest: Received message', msg.content.toString());
    const data = JSON.parse(msg.content.toString());
    const { requestRef } = data;

    try {
        console.log('Executing database query to fetch request data');
        const requestRes = await interfacePool.query('SELECT inslot, operationno FROM interface.interface_requests WHERE request_ref = $1', [requestRef]);
        const request = requestRes.rows[0];
        if (!request) throw new Error('Request not found in the database');

        const { inslot, operationno } = request;

        console.log('Fetching latest token and cookies');
        const tokenData = await getLatestTokenAndCookies();
        const token = tokenData?.token;
        const cookies = tokenData?.cookies;
        if (!token || !cookies) throw new Error('Token or cookies not found in the database');

        const headers = {
            'APIKey': process.env.SAP_APIKEY,
            'X-CSRF-Token': token,
            'AppId': process.env.SAP_SAMPLES_APPID,
            'Cookie': cookies,
            'Content-Type': 'application/json'
        };

        console.log('Sending request to SAP endpoint with headers:', headers);
        const response = await client.post(`${process.env.SAP_SAMPLES_ENDPOINT}`, {
            sampleData: {
                requestRef,
                inspLot: inslot,
                operation: operationno,
                numSample: data.numSample || "1",
                sampleCat: data.sampleCat || "",
                sampleCon: data.sampleCon || "",
                sampleSize: data.sampleSize || "1",
                sampleUnit: data.sampleUnit || "KG",
                storage: data.storage || "",
                sampleLoc: data.sampleLoc || "",
                storageInfo: data.storageInfo || "",
                deadline: data.deadline || "",
                days: data.days || ""
            }
        }, { headers });

        console.log('SAP Response:', response.data);

        const sampleResponse = response.data.samples;
        if (!sampleResponse.sampleNo || sampleResponse.sampleNo.length === 0) {
            throw new Error('Sample number not found in the response');
        }
        const sampleNo = sampleResponse.sampleNo[0].number;
        const { status, message } = sampleResponse;

        console.log('Extracted Sample Number:', sampleNo);

        console.log('Inserting sample data into the database');
        await interfacePool.query(
            'INSERT INTO interface.samples (request_ref, insp_lot, operation, sample_no, status, message) VALUES ($1, $2, $3, $4, $5, $6)',
            [requestRef, inslot, operationno, sampleNo, status, message]
        );

        const nextQueue = 'predict_result_queue';
        channel.sendToQueue(nextQueue, Buffer.from(JSON.stringify(data)));
        console.log(`sampleRequest: Message sent to ${nextQueue}`);

    } catch (error) {
        console.error('Error in sampleRequest:', error.message);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
        }
    }
}

async function consumeSampleRequest() {
    console.log('consumeSampleRequest: Connecting to RabbitMQ');
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'sample_request_queue';

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        await sampleRequest(msg, channel);
        channel.ack(msg);
    });

    console.log('Event 2 Consumer started');
}

module.exports = consumeSampleRequest;
