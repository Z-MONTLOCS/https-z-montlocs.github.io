import { apiKey, geoApiUrl } from './db/env.js'; // Importa las variables de entorno
import { getUserIp, getGeoInfo, registerGeoInfo } from './db/crudFunctions.js'; // Importa las funciones necesarias

/**
 * Actualiza la información geográfica en el DOM.
 * Obtiene la IP del usuario y luego verifica si ya está en la base de datos.
 * Si no está, utiliza la API de geolocalización, guarda los datos en la base de datos,
 * y luego actualiza el DOM.
 */
async function updateGeoInfo() {
    try {
        // Obtener la IP del usuario
        const ipAddress = await getUserIp();

        if (!ipAddress) {
            console.error("No se pudo obtener la IP del usuario.");
            return;
        }

        // Verificar si la IP ya está en la base de datos
        const geoInfoResult = await getGeoInfo(ipAddress);

        let geoData;
        if (geoInfoResult.success) {
            geoData = geoInfoResult.data;
        } else {
            // Si no está en la base de datos, obtener la información de geolocalización desde la API
            const geoResponse = await fetch(`${geoApiUrl}?api_key=${apiKey}&ip_address=${ipAddress}`);
            geoData = await geoResponse.json();

            // Guardar la información de geolocalización en la base de datos
            const registerResult = await registerGeoInfo(ipAddress, geoData);
            if (!registerResult.success) {
                console.error(registerResult.message);
                return;
            }
        }

        // Actualizar el contenido de los elementos del DOM con la información obtenida
        document.getElementById('flag').src = `https://www.cual-es-mi-ip.net/img/flags/${geoData.country_code.toLowerCase()}.svg`;
        document.getElementById('country').textContent = geoData.country;
        document.getElementById('city').textContent = geoData.city;
        document.getElementById('local-time').textContent = geoData.timezone.current_time;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Exportar la función para que pueda ser utilizada en otros módulos si es necesario
export { updateGeoInfo };
