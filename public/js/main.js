import { enviarFichaje } from './api.js';

document.getElementById('fichaje-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  // Ya no hace falta pedir email, asumimos que el token identifica al usuario
  const tipo = document.getElementById('tipo').value;
  const mensaje = document.getElementById('mensaje');

  const token = localStorage.getItem('token');
  if (!token) {
    mensaje.textContent = 'Debés iniciar sesión para fichar.';
    mensaje.style.color = 'red';
    return;
  }

  if (!navigator.geolocation) {
    mensaje.textContent = 'Geolocalización no disponible';
    mensaje.style.color = 'red';
    return;
  }

  mensaje.textContent = 'Obteniendo ubicación...';
  mensaje.style.color = 'black';

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    try {
      // Nota que acá envío solo tipo, lat, lng y token
      const resultado = await enviarFichaje(tipo, { lat, lng }, token);

      if (resultado.success) {
        mensaje.textContent = resultado.message + (resultado.horas ? ` (${resultado.horas.toFixed(2)} hs)` : '');
        mensaje.style.color = 'green';
      } else {
        mensaje.textContent = resultado.message;
        mensaje.style.color = 'red';
      }
    } catch (error) {
      mensaje.textContent = 'Error al comunicarse con el servidor.';
      mensaje.style.color = 'red';
    }
  }, (err) => {
    mensaje.textContent = 'No se pudo obtener la ubicación: ' + err.message;
    mensaje.style.color = 'red';
  });
});
