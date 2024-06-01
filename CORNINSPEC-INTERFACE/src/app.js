// app.js

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authenticateToken = require('./middleware/authenticateToken');
const startConsumers = require('./consumers');

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');
const interfaceRoutes = require('./routes/interfaceRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const resultToSAPRoutes = require('./routes/resultToSAPRoutes');

app.use('/api/auth', authRoutes);
app.use('/interfaces', authenticateToken, interfaceRoutes);
app.use('/webhook', authenticateToken, webhookRoutes);
app.use('/api', resultToSAPRoutes);

startConsumers().catch(error => {
    console.error('Error starting consumers:', error);
    process.exit(1);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.INTERFACE_SERVICE_PORT || 8008;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

