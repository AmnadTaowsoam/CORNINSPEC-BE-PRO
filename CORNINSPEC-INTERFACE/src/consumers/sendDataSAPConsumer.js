const amqp = require('amqplib');
const axios = require('axios');
const { getLatestTokenAndCookies } = require('../models/tokenModel');
const { interfacePool } = require('../config/dbconfig');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');

const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));

async function inspectionResult(msg) {
    console.log('inspectionResult: Received message', msg.content.toString());
    const data = JSON.parse(msg.content.toString());
    const { requestRef } = data;

    if (!requestRef) {
        console.error('inspectionResult: requestRef is undefined');
        return;
    }

    try {
        console.log(`inspectionResult: Querying interface.inspections with request_ref ${requestRef}`);
        const inspectionRes = await interfacePool.query('SELECT * FROM interface.inspections WHERE request_ref = $1', [requestRef]);
        const inspectionData = inspectionRes.rows[0];
        if (!inspectionData) throw new Error('Inspection data not found in the database');
        console.log('inspectionResult: Fetched inspection data from interface.inspections', inspectionData);

        const tokenData = await getLatestTokenAndCookies();
        const token = tokenData?.token;
        const cookies = tokenData?.cookies;
        if (!token || !cookies) throw new Error('Token or cookies not found in the database');

        const pointData = [
            { mic: 'PHYS0003', result: inspectionData.phys0003.toString() },
            { mic: 'PHYS0004', result: inspectionData.phys0004.toString() },
            { mic: 'PHYS0005', result: inspectionData.phys0005.toString() },
            { mic: 'PHYS0006', result: inspectionData.phys0006.toString() },
            { mic: 'PHYS0007', result: inspectionData.phys0007.toString() },
            { mic: 'PHYS0008', result: inspectionData.phys0008.toString() },
            { mic: 'PHYS0009', result: inspectionData.phys0009.toString() }
        ];

        const sapData = {
            inspectionData: {
                requestRef: inspectionData.request_ref,
                inspLot: inspectionData.insp_lot,
                plant: inspectionData.plant,
                pointData: pointData.map(pd => ({
                    operation: inspectionData.operation,
                    sampleNo: inspectionData.sample_no,
                    mic: pd.mic,
                    result: pd.result
                }))
            }
        };

        console.log('inspectionResult: SAP-data:', sapData);

        const headers = {
            'APIKey': process.env.SAP_APIKEY,
            'X-CSRF-Token': token,
            'AppId': process.env.SAP_INSPECTION_RESULT_APPID,
            'Cookie': cookies,
            'Content-Type': 'application/json'
        };

        console.log('inspectionResult: Sending data to SAP with headers:', headers);

        const response = await client.put(`${process.env.SAP_INSPECTION_RESULT_ENDPOINT}`, sapData, { headers });

        console.log('inspectionResult: Data sent to SAP', response.data);
    } catch (error) {
        console.error('Error in inspectionResult:', error.message);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
        }
    }
}

async function consumeInspectionResult() {
    console.log('consumeInspectionResult: Connecting to RabbitMQ');
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'inspection_result_queue';

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        await inspectionResult(msg);
        channel.ack(msg);
    });

    console.log('Event 4 Consumer started');
}

module.exports = consumeInspectionResult;
