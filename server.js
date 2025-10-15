require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpecs = require('./config/swagger');

const app = express();

app.use(cors({
  origin: true, // allow origin or set specific frontend origin
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

connectDB();

app.get('/', (req, res) => res.send('✅ ToDoList API is running'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ToDoList API Documentation'
}));

app.use('/api/auth', require('./routers/auth'));
app.use('/api/tasks', require('./routers/tasks'));

// health
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
