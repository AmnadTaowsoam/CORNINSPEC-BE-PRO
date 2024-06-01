const amqp = require('amqplib');
const axios = require('axios');
const { interfacePool } = require('../config/dbconfig');

async function processEvent1(msg) {
    const data = JSON.parse(msg.content.toString());

    try {
        const response = await axios.get(`${process.env.SAP_AUTH_ENDPOINT}`, {
            headers: {
                'APIKey': process.env.SAP_APIKEY,
                'X-CSRF-Token': 'Fetch',
                'AppId': process.env.SAP_AUTH_APPID
            }
        });

        const token = response.headers['x-csrf-token'];

        await interfacePool.query('INSERT INTO interface.tokens (token) VALUES ($1)', [token]);

        console.log('Event 1: Token saved to database');
    } catch (error) {
        console.error('Error in Event 1:', error);
    }
}

async function consumeEvent1() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = process.env.RABBITMQ_INTERFACE_QUEUE_NAME; // ใช้ค่าจาก .env

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        await processEvent1(msg);
        channel.ack(msg);
    });

    console.log('Event 1 Consumer started');
}

module.exports = consumeEvent1;
