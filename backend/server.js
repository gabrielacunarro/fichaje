const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Esta línea es clave para servir index.html, registro.html, etc.
app.use(express.static(path.join(__dirname, '../public')));


// API Routes
const fichajeRoutes = require('./routes/fichajeRouter');
app.use('/api/fichaje', fichajeRoutes);
const registroRoutes = require('./routes/registroRouter');
app.use('/api/registro', registroRoutes);
const authRoutes = require('./routes/authRouter');
app.use('/api/auth', authRoutes);
const ubicacionesRoutes = require('./routes/ubicacionRouter');
app.use('/api/ubicaciones', ubicacionesRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
