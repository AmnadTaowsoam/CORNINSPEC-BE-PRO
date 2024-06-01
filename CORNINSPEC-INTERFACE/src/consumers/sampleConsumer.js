const amqp = require('amqplib');
const axios = require('axios');
const { interfacePool } = require('../config/dbconfig');

async function processEvent2(msg) {
    const data = JSON.parse(msg.content.toString());
    const { requestRef } = data;

    try {
        // Load the request details from the database using requestRef
        const requestRes = await interfacePool.query('SELECT inslot, operationno FROM interface.interface_requests WHERE request_ref = $1', [requestRef]);
        const request = requestRes.rows[0];

        if (!request) {
            throw new Error('Request not found in the database');
        }

        const { inslot, operationno } = request;

        // Load the latest token from the database
        const tokenRes = await interfacePool.query('SELECT token FROM interface.tokens ORDER BY created_at DESC LIMIT 1');
        const token = tokenRes.rows[0]?.token;

        if (!token) {
            throw new Error('Token not found in the database');
        }

        const response = await axios.post(`${process.env.SAP_SAMPLES_ENDPOINT}`, {
            sampleData: {
                requestRef: requestRef,
                inspLot: inslot,
                operation: operationno,
                numSample: data.numSample || "",
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
        }, {
            headers: {
                'APIKey': process.env.SAP_APIKEY,
                'X-CSRF-Token': token,
                'AppId': process.env.SAP_SAMPLES_APPID
            }
        });

        const sampleNo = response.data.samples.sampleNo[0].number;
        const status = response.data.samples.status;
        const message = response.data.samples.message;

        await interfacePool.query(
            'INSERT INTO interface.samples (request_ref, insp_lot, operation, sample_no, status, message) VALUES ($1, $2, $3, $4, $5, $6)', 
            [requestRef, inslot, operationno, sampleNo, status, message]
        );

        console.log('Event 2: Sample number saved to database');
    } catch (error) {
        console.error('Error in Event 2:', error.message);
    }
}

async function consumeEvent2() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'event2_queue'; // กำหนดชื่อคิวตามการใช้งานจริง

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        await processEvent2(msg);
        channel.ack(msg);
    });

    console.log('Event 2 Consumer started');
}

module.exports = consumeEvent2;
