import { apiKey, ipApiUrl, geoApiUrl } from './db/env.js'; // Importa las variables de entorno

/**
 * Actualiza la información geográfica en el DOM.
 * Obtiene la IP del usuario y luego utiliza esa IP para obtener información de geolocalización.
 * Actualiza los elementos del DOM con la información obtenida.
 */
async function updateGeoInfo() {
    try {
        // Obtener la IP del usuario
        const ipResponse = await fetch(ipApiUrl);
        const ipData = await ipResponse.json();
        const ipAddress = ipData.ip;

        // Obtener la información de geolocalización
        const geoResponse = await fetch(`${geoApiUrl}?api_key=${apiKey}&ip_address=${ipAddress}`);
        const data = await geoResponse.json();

        // Actualizar el contenido de los elementos del DOM
        document.getElementById('flag').src = `https://www.cual-es-mi-ip.net/img/flags/${data.country_code.toLowerCase()}.svg`;
        document.getElementById('country').textContent = data.country;
        document.getElementById('city').textContent = data.city;
        document.getElementById('local-time').textContent = data.timezone.current_time;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Exportar la función para que pueda ser utilizada en otros módulos si es necesario
export { updateGeoInfo };

