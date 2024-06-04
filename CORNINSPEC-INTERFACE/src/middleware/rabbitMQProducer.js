const amqp = require('amqplib');
require('dotenv').config(); // Ensure the .env file is loaded from the root directory

async function sendToQueue(data) {
    const connectionString = process.env.RABBITMQ_URL;
    console.log('sendToQueue: Connection string:', connectionString);

    try {
        console.log('sendToQueue: Connecting to RabbitMQ...');
        const connection = await amqp.connect(connectionString);
        console.log('sendToQueue: Connection established.');

        console.log('sendToQueue: Creating channel...');
        const channel = await connection.createChannel();
        console.log('sendToQueue: Channel created.');

        const queue = 'interface_queue';
        console.log(`sendToQueue: Asserting queue: ${queue}`);
        await channel.assertQueue(queue, { durable: true });
        console.log('sendToQueue: Queue asserted.');

        console.log('sendToQueue: Sending message to queue:', data);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
        console.log('sendToQueue: Message sent to queue.');

        console.log('sendToQueue: Closing channel and connection...');
        await channel.close();
        await connection.close();
        console.log('sendToQueue: Channel and connection closed.');
    } catch (error) {
        console.error('Error sending message to queue:', error);
        throw new Error('Error sending message to RabbitMQ');
    }
}

module.exports = { sendToQueue };
