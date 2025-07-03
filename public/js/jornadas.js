document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const tablaBody = document.querySelector("#tabla-jornadas tbody");
  const formBusqueda = document.getElementById("form-busqueda");
  const inputBusqueda = document.getElementById("busqueda-nombre");

  // Función para cargar jornadas
  async function cargarJornadas(nombre = "") {
    try {
      const res = await fetch(
        `/api/fichaje/jornadas?nombre=${encodeURIComponent(nombre)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      tablaBody.innerHTML = ""; // Limpiar tabla

      if (!Array.isArray(data)) {
        tablaBody.innerHTML = `<tr><td colspan="5">${
          data.message || "Error al cargar jornadas"
        }</td></tr>`;
        return;
      }

      if (data.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="5">No se encontraron jornadas.</td></tr>`;
        return;
      }

data.forEach(j => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${j.nombreEmpleado || j.usuarioId || 'N/A'}</td>
    <td>${new Date(j.fecha).toLocaleString()}</td>
    <td>${j.checkOut ? new Date(j.checkOut).toLocaleString() : '-'}</td>
    <td>${j.horasTrabajadas ? j.horasTrabajadas.toFixed(2) : '-'}</td>
    <td>${j.ubicacion?.nombre || '-'}</td>
  `;
  tablaBody.appendChild(row);
});

    } catch (err) {
      console.error(err);
      tablaBody.innerHTML = `<tr><td colspan="5">Error al cargar jornadas.</td></tr>`;
    }
  }

  // Al cargar la página
  cargarJornadas();

  // Búsqueda
  formBusqueda.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = inputBusqueda.value.trim();
    cargarJornadas(nombre);
  });
});
