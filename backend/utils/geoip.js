const axios = require('axios');

async function checkIPLocation(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return {
      city: response.data.city,
      country: response.data.country_name,
      latitude: response.data.latitude,
      longitude: response.data.longitude
    };
  } catch (error) {
    console.error('Error consultando GeoIP:', error.message);
    return null;
  }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }

  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = { checkIPLocation, calcularDistancia };
