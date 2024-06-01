const amqp = require('amqplib');

async function sendToQueue(data) {
    // Build the connection string using environment variables
    const connectionString = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}`;

    const connection = await amqp.connect(connectionString);  // Use the dynamically built connection string
    const channel = await connection.createChannel();
    const queue = 'interface_data_queue';

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });

    console.log('Message sent to queue:', data);
    await channel.close();
    await connection.close();
}

module.exports = { sendToQueue };


