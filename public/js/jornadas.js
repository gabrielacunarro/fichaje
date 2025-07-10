document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const tablaBody = document.querySelector("#tabla-jornadas tbody");
  const formBusqueda = document.getElementById("form-busqueda");
  const inputBusqueda = document.getElementById("busqueda-nombre");
  const paginacionDiv = document.getElementById("pagination");

  let currentPage = 1;
  const pageSize = 15;

  async function cargarJornadas(nombre = "", page = 1) {
    try {
      const res = await fetch(
        `/api/fichajes/jornadas?nombre=${encodeURIComponent(nombre)}&page=${page}&limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      tablaBody.innerHTML = "";

      if (!Array.isArray(data.jornadas)) {
        tablaBody.innerHTML = `<tr><td colspan="5">${data.message || "Error al cargar jornadas"}</td></tr>`;
        paginacionDiv.innerHTML = "";
        return;
      }

      if (data.jornadas.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="5">No se encontraron jornadas.</td></tr>`;
        paginacionDiv.innerHTML = "";
        return;
      }

      data.jornadas.forEach((j) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${j.nombreEmpleado || j.usuarioId || "N/A"}</td>
          <td>${new Date(j.fecha).toLocaleString()}</td>
          <td>${j.checkOut ? new Date(j.checkOut).toLocaleString() : "-"}</td>
          <td>${j.horasTrabajadas ? j.horasTrabajadas.toFixed(2) : "-"}</td>
          <td>${j.ubicacion?.nombre || "-"}</td>
        `;
        tablaBody.appendChild(row);
      });

      currentPage = data.page || 1;
      const totalPages = data.pages || 1;

      renderPaginacionNumerica(currentPage, totalPages);

    } catch (err) {
      console.error(err);
      tablaBody.innerHTML = `<tr><td colspan="5">Error al cargar jornadas.</td></tr>`;
      paginacionDiv.innerHTML = "";
    }
  }

  function renderPaginacionNumerica(current, total) {
    paginacionDiv.innerHTML = "";

    // Botón Anterior
    const btnAnterior = document.createElement("button");
    btnAnterior.textContent = "Anterior";
    btnAnterior.disabled = current <= 1;
    btnAnterior.addEventListener("click", () => {
      if (current > 1) cargarJornadas(inputBusqueda.value.trim(), current - 1);
    });
    paginacionDiv.appendChild(btnAnterior);

    // Botones numéricos (máximo 5 botones)
    let startPage = Math.max(current - 2, 1);
    let endPage = Math.min(startPage + 4, total);
    if (endPage - startPage < 4) {
      startPage = Math.max(endPage - 4, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.disabled = i === current;
      btn.addEventListener("click", () => {
        cargarJornadas(inputBusqueda.value.trim(), i);
      });
      paginacionDiv.appendChild(btn);
    }

    // Botón Siguiente
    const btnSiguiente = document.createElement("button");
    btnSiguiente.textContent = "Siguiente";
    btnSiguiente.disabled = current >= total;
    btnSiguiente.addEventListener("click", () => {
      if (current < total) cargarJornadas(inputBusqueda.value.trim(), current + 1);
    });
    paginacionDiv.appendChild(btnSiguiente);
  }

  formBusqueda.addEventListener("submit", (e) => {
    e.preventDefault();
    cargarJornadas(inputBusqueda.value.trim(), 1);
  });

  cargarJornadas();
});
