// js/registro.js
import { registrarUsuario } from './api.js';

document.getElementById('registro-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const mensaje = document.getElementById('mensaje');

  if (password !== confirmPassword) {
    mensaje.textContent = 'Las contraseñas no coinciden.';
    mensaje.style.color = 'red';
    return;
  }

  try {
    await registrarUsuario({ nombre, email, password, confirmPassword });
    mensaje.textContent = 'Usuario registrado con éxito.';
    mensaje.style.color = 'green';
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.style.color = 'red';
  }
});


// Mostrar / ocultar contraseñas
document.getElementById('togglePassword').addEventListener('click', () => {
  const pass = document.getElementById('password');
  pass.type = pass.type === 'password' ? 'text' : 'password';
});
document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
  const pass = document.getElementById('confirm-password');
  pass.type = pass.type === 'password' ? 'text' : 'password';
});
