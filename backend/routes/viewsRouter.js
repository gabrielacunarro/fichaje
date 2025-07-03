const express = require('express');
const router = express.Router();
const { protegerSesion } = require('../middlewares/protegerSesion');

const admins = ['gabiicai17@gmail.com', 'aleelcharobolso1899@hotmail.com'];

// Middleware para verificar sesión
function protegerRuta(req, res, next) {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  next();
}

// Ruta pública - página principal
router.get('/', (req, res) => {
  res.render('index', { user: req.session?.user || null });
});

// Ruta login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Ruta para mostrar el formulario de recuperación de contraseña
router.get('/forgot', (req, res) => {
  res.render('forgot');
});

// Ruta para mostrar el formulario de registro de usuario
router.get('/registro', (req, res) => {
  res.render('registro', { mensajeError: null });
});

// Ruta para mostrar el formulario de reset de contraseña
router.get('/reset', (req, res) => {
  res.render('reset', { mensajeError: null });
});


// Dashboard (menú) - solo para usuarios logueados
router.get('/dashboard', protegerSesion, (req, res) => {
  const user = req.session.user;
  const isAdmin = admins.includes(user.email.toLowerCase());
  if (!isAdmin) return res.redirect('/'); // para que usuarios normales no entren aquí
  res.render('dashboard', { user, isAdmin });
});

// Ruta jornadas
router.get('/jornadas', protegerSesion, (req, res) => {
  const user = req.session.user;
  const isAdmin = admins.includes(user.email.toLowerCase());
  if (!isAdmin) return res.status(403).send('Acceso denegado');

  res.render('jornadas', { user });
});



module.exports = router;
