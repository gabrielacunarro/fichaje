const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectas.' });
    }

    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectas.' });
    }

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

//  RECUPERAR CONTRASEÑA
exports.recuperarPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'No existe una cuenta con ese email.' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await usuario.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'gcunarro94@gmail.com', // CAMBIA ESTO
        pass: 'poqo skcy yyuc umwu'    // APP PASSWORD DE GOOGLE SEC (no tu contraseña normal)
      }
    });

    const mailOptions = {
      to: usuario.email,
      from: 'gcunarro94@gmail.com', // MISMO QUE ARRIBA
      subject: 'Recuperación de contraseña',
      text: `Recibiste este correo porque solicitaste restablecer tu contraseña.\n\n` +
            `Ingresa al siguiente enlace para continuar:\n\n` +
            `http://localhost:5000/reset.html?token=${token}\n\n` +
            `Si no solicitaste esto, ignora este correo.\n`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Email de recuperación enviado. Revisa tu correo.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error enviando email de recuperación.' });
  }
};

//RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;
    await usuario.save();

    res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al restablecer la contraseña', error });
  }
};