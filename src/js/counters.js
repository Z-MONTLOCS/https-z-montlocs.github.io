import { getUserIp, getDataForCounters } from './db/crudFunctions.js'; // Ajusta la importación según corresponda

/**
 * Actualiza los contadores en la interfaz de usuario basándose en los datos obtenidos.
 * Obtiene la IP del usuario, consulta los datos correspondientes y actualiza los contadores mostrados.
 */
async function updateCounters() {
    try {
        // Obtiene la IP del usuario
        const userIp = await getUserIp();
        if (!userIp) {
            console.error("No se pudo obtener la IP del usuario.");
            return;
        }

        console.log("IP del usuario:", userIp);

        // Obtiene los datos del contador para la IP del usuario
        const docData = await getDataForCounters(userIp);
        
        console.log("Datos del documento:", docData);

        if (docData) {
            // Actualiza los contadores con los datos obtenidos
            document.getElementById('visit-counter').textContent = docData.visitCount || 0;
            document.getElementById('encrypted-text-counter').textContent = docData.encryptedTextCount || 0;
            document.getElementById('remaining-text-counter').textContent = (docData.textLimit || 10) - (docData.encryptedTextCount || 0);
        } else {
            console.log("No se encontraron datos para la IP:", userIp);
            // Establece valores predeterminados si no se encuentran datos
            document.getElementById('visit-counter').textContent = 0;
            document.getElementById('encrypted-text-counter').textContent = 0;
            document.getElementById('remaining-text-counter').textContent = 10; // Ajusta según tu límite predeterminado
        }
    } catch (error) {
        console.error("Error al actualizar los contadores:", error);
    }
}

export { updateCounters };
