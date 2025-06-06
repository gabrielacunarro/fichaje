const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

const registrarUsuario = async (req, res) => {
      console.log('Datos recibidos en req.body:', req.body);
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword
    });

    await nuevoUsuario.save();

    res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = { registrarUsuario };
