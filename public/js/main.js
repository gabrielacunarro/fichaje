import { enviarFichaje } from './api.js';

const mensaje = document.getElementById('mensaje');

document.getElementById('fichaje-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  mensaje.textContent = '';
  mensaje.style.color = 'black';

  const tipo = document.getElementById('tipo').value;
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

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      try {
        const resultado = await enviarFichaje(tipo, { lat, lng }, token);

        if (resultado.success) {
          mensaje.style.color = 'green';
          mensaje.textContent = resultado.message + (resultado.horas != null ? ` (${resultado.horas.toFixed(2)} hs)` : '');
        } else {
          mensaje.style.color = 'red';
          mensaje.textContent = resultado.message;
        }
      } catch (error) {
        mensaje.style.color = 'red';
        mensaje.textContent = 'Error al comunicarse con el servidor.';
      }
    },
    (err) => {
      mensaje.style.color = 'red';
      mensaje.textContent = 'No se pudo obtener la ubicación: ' + err.message;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
});
