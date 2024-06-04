const amqp = require('amqplib');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const { interfacePool } = require('../config/dbconfig');
require('dotenv').config();

const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));

async function sapLogin(msg, channel) {
    console.log('sapLogin: Received message', msg.content.toString());
    const data = JSON.parse(msg.content.toString());

    try {
        const response = await client.get(`${process.env.SAP_AUTH_ENDPOINT}`, {
            headers: {
                'APIKey': process.env.SAP_APIKEY,
                'X-CSRF-Token': 'Fetch',
                'AppId': process.env.SAP_AUTH_APPID
            },
            timeout: 5000
        });

        const csrfToken = response.headers['x-csrf-token'];
        console.log('sapLogin: Received CSRF token', csrfToken);

        const cookies = cookieJar.getCookiesSync(`${process.env.SAP_AUTH_ENDPOINT}`);
        const storedCookies = cookies.map(cookie => cookie.cookieString()).join('; ');
        console.log('sapLogin: Received Cookies', storedCookies);

        await interfacePool.query('INSERT INTO interface.tokens (token, cookies) VALUES ($1, $2)', [csrfToken, storedCookies]);
        console.log('sapLogin: Token and Cookies saved to database');

        const nextQueue = 'sample_request_queue';
        channel.sendToQueue(nextQueue, Buffer.from(JSON.stringify(data)));
        console.log(`sapLogin: Message sent to ${nextQueue}`);

    } catch (error) {
        console.error('Error in sapLogin:', error.message);
        if (error.code === 'ETIMEDOUT') {
            console.error('Connection timed out. Check your network settings or the endpoint server.');
        } else {
            console.error('An unexpected error occurred:', error);
        }
    }
}

async function consumeSapLogin() {
    try {
        console.log('consumeSapLogin: Connecting to RabbitMQ');
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'interface_queue';

        await channel.assertQueue(queue, { durable: true });
        channel.consume(queue, async (msg) => {
            await sapLogin(msg, channel);
            channel.ack(msg);
        });

        console.log('Event 1 Consumer started');
    } catch (error) {
        console.error('Error in consumeSapLogin:', error.message);
        throw error;
    }
}

module.exports = consumeSapLogin;
