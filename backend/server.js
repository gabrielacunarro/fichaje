const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler')

dotenv.config();
connectDB();

const app = express();

app.use(morgan('combined', {
  stream: {
    write: message => logger.info(message.trim())
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas API
const fichajeRoutes = require('./routes/fichajeRouter');
app.use('/api/fichajes', fichajeRoutes);

const registroRoutes = require('./routes/registroRouter');
app.use('/api/registro', registroRoutes);

const authRoutes = require('./routes/authRouter');
app.use('/api/auth', authRoutes);

const ubicacionesRoutes = require('./routes/ubicacionRouter');
app.use('/api/ubicaciones', ubicacionesRoutes);

// Middleware global de manejo de errores 
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
});
