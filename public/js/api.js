const API_BASE = '/api';

export async function enviarFichaje(tipo, coords, token) {
  const res = await fetch(`${API_BASE}/fichaje`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ tipo, lat: coords.lat, lng: coords.lng }),
  });
  return res.json();
}



export async function registrarUsuario(datos) {
  const res = await fetch(`${API_BASE}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error en registro');
  }

  return data;
}

