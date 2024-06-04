const consumeLoginSAP = require('./loginSAPConsumer');
const consumeSampleRequest = require('./sampleConsumer');
const consumePredictResult = require('./predictResultConsumer');
const consumeInspectionResult = require('./sendDataSAPConsumer');

async function startConsumers() {
    const maxRetries = 5;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await consumeLoginSAP();
            await consumeSampleRequest(); // This will run after consumeLoginSAP
            await consumePredictResult();
            await consumeInspectionResult();
            console.log('All consumers started successfully');
            break;
        } catch (error) {
            retries += 1;
            console.error(`Error starting consumers, retrying... (${retries}/${maxRetries})`);
            console.error('Specific error:', error.message); // Log the specific error message
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    if (retries === maxRetries) {
        throw new Error('Error starting consumers after maximum retries');
    }
}

module.exports = startConsumers;

