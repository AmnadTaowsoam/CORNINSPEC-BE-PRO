const amqp = require('amqplib');
const axios = require('axios');
const { interfacePool } = require('../config/dbconfig');

async function processEvent4(msg) {
    const data = JSON.parse(msg.content.toString());
    const { request_ref } = data;

    try {
        // Query interface.inspections to get inspection data
        const inspectionRes = await interfacePool.query('SELECT * FROM interface.inspections WHERE request_ref = $1', [request_ref]);
        const inspectionData = inspectionRes.rows[0];

        if (!inspectionData) {
            throw new Error('Inspection data not found in the database');
        }

        // Load the latest token from the database
        const tokenRes = await interfacePool.query('SELECT token FROM interface.tokens ORDER BY created_at DESC LIMIT 1');
        const token = tokenRes.rows[0]?.token;

        if (!token) {
            throw new Error('Token not found in the database');
        }

        // Prepare data for SAP
        const pointData = [
            { mic: 'PHYS003', result: inspectionData.mic_phys003.toString() },
            { mic: 'PHYS004', result: inspectionData.mic_phys004.toString() },
            { mic: 'PHYS005', result: inspectionData.mic_phys005.toString() },
            { mic: 'PHYS006', result: inspectionData.mic_phys006.toString() },
            { mic: 'PHYS007', result: inspectionData.mic_phys007.toString() },
            { mic: 'PHYS008', result: inspectionData.mic_phys008.toString() },
            { mic: 'PHYS009', result: inspectionData.mic_phys009.toString() }
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

        const response = await axios.post(`${process.env.SAP_URL}/interface-sap`, sapData, {
            headers: {
                'APIKey': process.env.API_KEY,
                'X-CSRF-Token': token,
                'AppId': 'BTG-AGROQA-01'
            }
        });

        console.log('Event 4: Data sent to SAP', response.data);
    } catch (error) {
        console.error('Error in Event 4:', error.message);
    }
}

async function consumeEvent4() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'event4_queue'; // กำหนดชื่อคิวตามการใช้งานจริง

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        await processEvent4(msg);
        channel.ack(msg);
    });

    console.log('Event 4 Consumer started');
}

module.exports = consumeEvent4;
