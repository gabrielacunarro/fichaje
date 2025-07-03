const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');
const morgan = require('morgan');
const logger = require('./utils/logger');

dotenv.config();
connectDB();

const app = express();

// Middleware para loguear requests con morgan + winston
app.use(morgan('combined', {
  stream: {
    write: message => logger.info(message.trim())
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para leer formularios

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave-secreta145@165165',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: false } // cambiar a true si usas HTTPS!!!!!!!!!!!!!!!!
}));

// Configuración EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, '../public')));

// Rutas API (ya existentes)
const fichajeRoutes = require('./routes/fichajeRouter');
app.use('/api/fichaje', fichajeRoutes);

const registroRoutes = require('./routes/registroRouter');
app.use('/api/registro', registroRoutes);

const authRoutes = require('./routes/authRouter');
app.use('/api/auth', authRoutes);

const ubicacionesRoutes = require('./routes/ubicacionRouter');
app.use('/api/ubicaciones', ubicacionesRoutes);

// Rutas para vistas EJS (dashboard, admin, etc)
const viewsRouter = require('./routes/viewsRouter');
app.use('/', viewsRouter);

// Puerto y servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
});
