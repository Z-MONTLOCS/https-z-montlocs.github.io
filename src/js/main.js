// Importaciones de módulos de base de datos
import {
    initializeThemeToggle,
    incrementPageVisitCounter,
    addEncryptedText,
    getEncryptedTextByKey,
    getUserIp,
    
    
} from './db/crudFunctions.js';

// Importaciones de módulos de contadores
import { updateCounters } from './counters.js';

// Importaciones de módulos de geolocalización
import { updateGeoInfo } from './geolocation.js';

// Importaciones de módulos de cifrado
import { encryptText, decryptText } from './encryptionModule.js';

// Importaciones de utilidades
import { generateHash } from './utils/hashUtils.js';
import { showMessage } from './utils/notifications.js';


// Importaciones de módulos de observables
import crudObservable from './observable/crudObservable.js';

// Importaciones de módulos de interfaz de usuario
import { showModal } from './modal.js';


// Selecciona el área de texto por su ID
const textarea = document.getElementById('message-to-encrypt');


// Al cargar la página principal
window.addEventListener('load', async () => {
    // Llama a la función para inicializar el cambio de tema
initializeThemeToggle();

    const visitCount = await incrementPageVisitCounter();
    if (visitCount !== null) {
        document.getElementById('visit-counter').innerText = visitCount;
    }
});


textarea.addEventListener('click', function () {
    this.value = '';
    document.getElementById('decrypt-code').value = '';

});





// Agrega un evento al botón de cifrado cuando se hace clic
document.getElementById('encrypt-button').addEventListener('click', async () => {
    // Obtiene el texto a cifrar desde el campo de entrada
    const textToEncrypt = document.getElementById('message-to-encrypt').value;

    // Verifica si el texto a cifrar está vacío
    if (!textToEncrypt) {
        showMessage("El texto a cifrar está vacío.", "error"); // Muestra un mensaje de error si el texto está vacío
        return;
    }

    // Cifra el texto utilizando la función `encryptText`
    const result = encryptText(textToEncrypt);

    // Verifica si la operación de cifrado fue exitosa
    if (result.success) {
        const encryptedText = result.encryptedText; // Obtiene el texto cifrado
        const userIp = await getUserIp(); // Obtiene la IP del usuario

        // Verifica si se obtuvo la IP del usuario correctamente
        if (userIp) {
            // Genera un hash del texto cifrado utilizando `generateHash`
            const newKey = await generateHash(encryptedText);

            // Agrega el texto cifrado a la base de datos utilizando `addEncryptedText`
            const addResult = await addEncryptedText(encryptedText, newKey, userIp);

            // Verifica si la operación de agregar el texto cifrado fue exitosa
            if (addResult.success) {
                // Muestra un modal con el hash del código generado
                showModal(`${newKey}`);
                showMessage("Texto cifrado exitosamente.", "success"); // Muestra un mensaje de éxito
            } else {
                showMessage(addResult.message, "error"); // Muestra un mensaje de error si no se pudo agregar el texto cifrado
                // Deshabilita el botón si el límite de textos cifrados ha sido alcanzado
                if (addResult.message.includes("Límite de textos cifrados alcanzado")) {
                    document.getElementById('encrypt-button').disabled = true;
                }
            }
        } else {
            showMessage("No se pudo obtener la IP del usuario.", "error"); // Muestra un mensaje de error si no se pudo obtener la IP
        }
    } else {
        showMessage(result.message, "error"); // Muestra un mensaje de error si el cifrado falló
    }
});





// Manejo del evento de clic para pegar el contenido del portapapeles
document.getElementById('paste-code').addEventListener('click', async () => {
    try {
        const clipboardData = await navigator.clipboard.readText();
        document.getElementById('decrypt-code').value = clipboardData;
        document.getElementById('message-to-encrypt').value = '';

        console.log('Código pegado desde el portapapeles!');


    } catch (error) {
        console.error('Error al acceder al portapapeles:', error);
    }
});

// Manejo del evento de enfoque para borrar el contenido del área de texto
document.getElementById('decrypt-code').addEventListener('focus', () => {
    document.getElementById('message-to-encrypt').value = '';
});







document.getElementById('decrypt-button').addEventListener('click', async () => {
    const keyToDecrypt = document.getElementById('decrypt-code').value;
    if (!keyToDecrypt) {
        showMessage("El código de descifrado está vacío.", "error");
        return;
    }

    try {
        const userIp = await getUserIp(); // Obtener la IP del usuario
        if (!userIp) {
            showMessage("No se pudo obtener la IP del usuario.", "error");
            return;
        }

        const result = await getEncryptedTextByKey(userIp, keyToDecrypt);
        if (result.success) {
            const decryptedResult = decryptText(result.encryptedText);
            if (decryptedResult.success) {
                document.getElementById('message-to-encrypt').value = decryptedResult.decryptedText;
                showMessage("Texto descifrado exitosamente.", "success");
            } else {
                showMessage(decryptedResult.message, "error");
            }
        } else {
            showMessage(result.message, "error");
        }
    } catch (error) {
        showMessage("Error al descifrar el texto: " + error.message, "error");
    }
});




// Llamada para actualizar los contadores y la información geográfica cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    updateCounters();
    updateGeoInfo();
});

// Registrar un observador para recibir notificaciones de cambios en documentos
crudObservable.addObserver((data) => {
    switch (data.action) {
        case 'add':
            console.log(`Se ha agregado un nuevo documento con ID: ${data.docId}`);
            // Aquí podrías actualizar la interfaz de usuario para reflejar el nuevo documento agregado
            break;
        case 'update':
            console.log(`Se ha actualizado el documento con ID: ${data.docId}`);
            // No se requiere actualización inmediata en la interfaz porque ya se actualizó al realizar la acción
            break;
        case 'delete':
            console.log(`Se ha eliminado el documento con ID: ${data.docId}`);
            // Limpiar el área de texto después de eliminar el documento
            document.getElementById('encryptedText').value = "";
            break;
        default:
            console.log("Acción no reconocida:", data.action);
    }
});
