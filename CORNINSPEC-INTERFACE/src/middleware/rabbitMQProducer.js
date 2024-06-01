const amqp = require('amqplib');
require('dotenv').config(); // Ensure the .env file is loaded from the root directory

async function sendToQueue(data) {
    const connectionString = process.env.RABBITMQ_URL;

    try {
        const connection = await amqp.connect(connectionString);
        const channel = await connection.createChannel();
        const queue = 'interface_queue';

        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });

        console.log('Message sent to queue:', data);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending message to queue:', error);
        throw new Error('Error sending message to RabbitMQ');
    }
}

module.exports = { sendToQueue };
