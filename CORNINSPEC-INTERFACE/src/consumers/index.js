const consumeEvent1 = require('./loginSAPConsumer');
const consumeEvent2 = require('./sampleConsumer');
const consumeEvent3 = require('./predictResultConsumer');
const consumeEvent4 = require('./sendDataSAPConsumer');

async function startConsumers() {
    const maxRetries = 5;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await consumeEvent1();
            await consumeEvent2();
            await consumeEvent3();
            await consumeEvent4();
            console.log('All consumers started successfully');
            break;
        } catch (error) {
            retries += 1;
            console.error(`Error starting consumers, retrying... (${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    if (retries === maxRetries) {
        throw new Error('Error starting consumers after maximum retries');
    }
}

module.exports = startConsumers;
