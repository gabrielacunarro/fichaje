import { registrarUsuario } from './api.js';

const mensaje = document.getElementById('mensaje');
const form = document.getElementById('registro-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensaje.textContent = '';

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mensaje.textContent = 'Email inválido.';
    mensaje.style.color = 'red';
    return;
  }

  if (password !== confirmPassword) {
    mensaje.textContent = 'Las contraseñas no coinciden.';
    mensaje.style.color = 'red';
    return;
  }

  try {
    await registrarUsuario({ nombre, email, password, confirmPassword });
    mensaje.textContent = 'Usuario registrado con éxito.';
    mensaje.style.color = 'green';
    form.reset(); // Limpia el formulario tras registro exitoso
  } catch (error) {
    mensaje.textContent = error.message || 'Error en el registro.';
    mensaje.style.color = 'red';
  }
});

// Mostrar / ocultar contraseñas con toggle
const togglePass = (idToggle, idInput) => {
  document.getElementById(idToggle).addEventListener('click', () => {
    const pass = document.getElementById(idInput);
    pass.type = pass.type === 'password' ? 'text' : 'password';
  });
};

togglePass('togglePassword', 'password');
togglePass('toggleConfirmPassword', 'confirm-password');
