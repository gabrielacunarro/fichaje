// public/login.js
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensaje');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email); // Opcional para auto completar
      window.location.href = '/index.html'; // Redirigir al fichaje
    } else {
      mensaje.textContent = data.message || 'Error al iniciar sesión';
      mensaje.style.color = 'red';
    }
  } catch (err) {
    mensaje.textContent = 'Error al comunicarse con el servidor';
    mensaje.style.color = 'red';
  }
});
