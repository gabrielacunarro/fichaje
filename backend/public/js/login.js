document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensaje');

  // Lista de admins (igual que en backend)
  const admins = ['gabiicai17@gmail.com', 'aleelcharobolso1899@hotmail.com'];

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email); // Opcional para autocompletar

      if (admins.includes(email.toLowerCase())) {
        window.location.href = '/dashboard';  // Admin va al dashboard
      } else {
        window.location.href = '/index'; // Usuario normal va al fichaje
      }

    } else {
      mensaje.textContent = data.message || 'Error al iniciar sesión';
      mensaje.style.color = 'red';
    }
  } catch (err) {
    mensaje.textContent = 'Error al comunicarse con el servidor';
    mensaje.style.color = 'red';
  }
});

