// Importaciones de dependencias externas
import { doc, setDoc, getDoc, updateDoc, deleteDoc, deleteField } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Importaciones de utilidades o funciones comunes
import { db } from './firebaseConfig.js';
import { sha256 } from './sha256.js';

// Importaciones de módulos internos del proyecto
import crudObservable from '../observable/crudObservable.js';


/**
 * Función para obtener la IP pública del usuario.
 * 
 * Esta función realiza una solicitud a la API de ipify para obtener la dirección IP pública del usuario.
 * Si la solicitud es exitosa, la función devuelve la IP como una cadena de texto.
 * En caso de error durante la solicitud, se captura el error, se registra en la consola y se devuelve `null`.
 * 
 * @returns {Promise<string|null>} La IP pública del usuario o `null` si ocurre un error.
 */
export async function getUserIp() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Error al obtener la IP del usuario:", error);
        return null;
    }
}






/**
 * Función para agregar un texto cifrado a la base de datos.
 * 
 * Esta función intenta agregar un texto cifrado asociado a una clave y a la IP del usuario en una base de datos.
 * La función verifica si ya existe un documento para la IP del usuario. Si existe, actualiza el documento 
 * con el nuevo texto cifrado, siempre y cuando no se haya alcanzado el límite de textos cifrados. 
 * Si no existe, crea un nuevo documento con el texto cifrado.
 * 
 * @param {string} encryptedText - El texto cifrado que se va a almacenar.
 * @param {string} newKey - La clave asociada al texto cifrado.
 * @param {string} userIp - La IP pública del usuario, utilizada como ID del documento.
 * 
 * @returns {Promise<{success: boolean, message: string}>} 
 * Un objeto que indica el éxito de la operación y un mensaje descriptivo.
 * 
 * @throws {Error} - Si ocurre un error durante la operación de agregar o actualizar el documento.
 */
export async function addEncryptedText(encryptedText, newKey, userIp) {
    try {
        // Verifica si la IP del usuario está disponible
        if (!userIp) {
            return { success: false, message: "No se pudo obtener la IP del usuario." };
        }

        // Genera un hash del texto cifrado
        const hash = await sha256(encryptedText);
        const docRef = doc(db, "encrypted-texts", userIp); // Usa la IP como ID de documento
        const docSnapshot = await getDoc(docRef);

        // Si ya existe un documento para la IP
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const { encryptedTexts, encryptedTextCount, textLimit } = data;

            // Verifica si se alcanzó el límite de textos cifrados para esta IP
            if (encryptedTextCount >= textLimit) {
                return { success: false, message: "Límite de textos cifrados alcanzado para la IP." };
            }

            // Verifica si el texto cifrado ya existe para esta IP
            if (encryptedTexts && encryptedTexts[hash]) {
                return { success: false, message: "El texto cifrado ya existe para esta IP." };
            }

            // Actualiza el documento con el nuevo texto cifrado
            await updateDoc(docRef, {
                encryptedTextCount: encryptedTextCount + 1,
                [`encryptedTexts.${hash}`]: encryptedText,
                updatedAt: new Date()
            });

            return { success: true, message: "Texto cifrado y guardado con éxito." };
        } else {
            // Crea un nuevo documento para esta IP
            await setDoc(docRef, {
                encryptedTextCount: 1,
                textLimit: 10, // Límite de textos cifrados por IP (ajustable)
                ipAddress: userIp,
                createdAt: new Date(),
                encryptedTexts: {
                    [hash]: encryptedText
                }
            });

            return { success: true, message: "Nuevo documento creado con éxito." };
        }
    } catch (error) {
        // Manejo de errores durante la operación
        return { success: false, message: "Error al agregar el nuevo documento: " + error.message };
    }
}






/**
 * Función para obtener datos de los contadores de un usuario en la base de datos.
 * 
 * Esta función busca un documento en la colección "encrypted-texts" de la base de datos utilizando la IP 
 * del usuario como ID del documento. Si el documento existe, extrae y devuelve los valores de los contadores 
 * de visitas, textos cifrados, y el límite de textos cifrados permitidos. Si no se encuentra el documento 
 * o ocurre un error, se devuelven valores predeterminados.
 * 
 * @param {string} userIp - La IP pública del usuario, utilizada como ID del documento.
 * 
 * @returns {Promise<{visitCount: number, encryptedTextCount: number, textLimit: number}> | null} 
 * Un objeto con los datos de los contadores (visitas, textos cifrados, límite de textos cifrados) o `null` 
 * si no se proporciona la IP del usuario.
 * 
 * @throws {Error} - Si ocurre un error durante la operación de lectura del documento.
 */
export async function getDataForCounters(userIp) {
    try {
        // Verifica si la IP del usuario está disponible
        if (!userIp) {
            console.error("No se proporcionó la IP del usuario.");
            return null;
        }

        // Referencia al documento en la colección "encrypted-texts" usando la IP del usuario como ID
        const docRef = doc(db, "encrypted-texts", userIp);
        const docSnapshot = await getDoc(docRef);

        // Si el documento existe, extrae los datos necesarios
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            return {
                visitCount: data.visitCount || 0,
                encryptedTextCount: data.encryptedTextCount || 0,
                textLimit: data.textLimit || 10
            };
        } else {
            // Si no se encuentra el documento, devuelve valores predeterminados
            console.log("No se encontró el documento con ID:", userIp);
            return {
                visitCount: 0,
                encryptedTextCount: 0,
                textLimit: 10 // Límite predeterminado ajustable
            };
        }
    } catch (error) {
        // Manejo de errores durante la operación
        console.error("Error al obtener datos del contador:", error);
        return {
            visitCount: 0,
            encryptedTextCount: 0,
            textLimit: 10 // Límite predeterminado ajustable
        };
    }
}










/**
 * Función para obtener un texto cifrado usando una clave específica.
 * 
 * Esta función busca un texto cifrado en la base de datos utilizando la IP del usuario como ID del documento 
 * y una clave proporcionada para descifrar. Si el documento y la clave existen, se devuelve el texto cifrado 
 * correspondiente. Si no se proporcionan la IP del usuario o la clave, o si el texto no se encuentra, la 
 * función devuelve un mensaje de error.
 * 
 * @param {string} userIp - La IP pública del usuario, utilizada como ID del documento.
 * @param {string} keyToDecrypt - La clave que se usará para buscar el texto cifrado.
 * 
 * @returns {Promise<{success: boolean, encryptedText?: string, message?: string}>} 
 * Un objeto que indica el éxito de la operación. Si es exitoso, contiene el texto cifrado. Si falla, 
 * contiene un mensaje descriptivo del error.
 * 
 * @throws {Error} - Si ocurre un error durante la operación de búsqueda del texto cifrado.
 */
export async function getEncryptedTextByKey(userIp, keyToDecrypt) {
    try {
        // Verifica si la IP del usuario está disponible
        if (!userIp) {
            return { success: false, message: "No se proporcionó la IP del usuario." };
        }

        // Verifica si se proporcionó la clave para descifrar
        if (!keyToDecrypt) {
            return { success: false, message: "No se proporcionó la clave para descifrar." };
        }

        // Referencia al documento en la colección "encrypted-texts" usando la IP del usuario como ID
        const docRef = doc(db, "encrypted-texts", userIp);
        const docSnapshot = await getDoc(docRef);

        // Si el documento existe, intenta recuperar el texto cifrado con la clave proporcionada
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const { encryptedTexts } = data;

            // Verifica si el texto cifrado existe para la clave proporcionada
            if (encryptedTexts && encryptedTexts[keyToDecrypt]) {
                return { success: true, encryptedText: encryptedTexts[keyToDecrypt] };
            } else {
                return { success: false, message: "No se encontró el texto cifrado para la clave proporcionada." };
            }
        } else {
            // Si no se encuentra el documento, devuelve un mensaje de error
            return { success: false, message: "No se encontró el documento con ID: " + userIp };
        }
    } catch (error) {
        // Manejo de errores durante la operación
        return { success: false, message: "Error al obtener el texto cifrado: " + error.message };
    }
}











/**
 * Función para actualizar un texto cifrado en un documento existente en la base de datos.
 * 
 * Esta función actualiza un texto cifrado en un documento de la colección "encrypted-texts" en la base de datos 
 * utilizando el ID del documento y un hash que identifica el texto cifrado. Si el documento y el hash existen, 
 * el texto cifrado es reemplazado por uno nuevo. Si no se encuentra el documento o el hash, se registran errores 
 * en la consola.
 * 
 * @param {string} docId - El ID del documento en el cual se actualizará el texto cifrado.
 * @param {string} hash - El hash que identifica el texto cifrado que se va a actualizar.
 * @param {string} newEncryptedText - El nuevo texto cifrado que reemplazará al existente.
 * 
 * @returns {Promise<void>} - Esta función no devuelve un valor; sin embargo, notifica a los observadores 
 * registrados sobre la actualización realizada.
 * 
 * @throws {Error} - Si ocurre un error durante la operación de actualización del documento.
 */
export async function updateEncryptedText(docId, hash, newEncryptedText) {
    try {
        // Referencia al documento en la colección "encrypted-texts" usando el ID del documento
        const docRef = doc(db, "encrypted-texts", docId);
        const docSnapshot = await getDoc(docRef);
        
        // Verifica si el documento existe
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const { encryptedTexts } = data;

            // Verifica si el texto cifrado existe para el hash proporcionado
            if (encryptedTexts && encryptedTexts[hash]) {
                await updateDoc(docRef, {
                    [`encryptedTexts.${hash}`]: newEncryptedText,
                    updatedAt: new Date()
                });

                // Registro de la actualización en la consola
                console.log("Texto cifrado actualizado en el documento con ID:", docId);
                
                // Notificación a los observadores sobre la actualización
                crudObservable.notifyObservers({ action: 'update', docId: docId });
            } else {
                // Error si no se encuentra el texto cifrado para el hash proporcionado
                console.error("No se encontró el texto cifrado con el hash:", hash);
            }
        } else {
            // Error si no se encuentra el documento
            console.error("No se encontró el documento con ID:", docId);
        }
    } catch (error) {
        // Manejo de errores durante la operación
        console.error("Error al actualizar el texto cifrado:", error);
    }
}





/**
 * Función para incrementar el contador general de visitas a la página.
 * 
 * Esta función gestiona un contador que registra el número total de visitas a la página. Si el documento
 * que almacena el contador ya existe en la base de datos, se incrementa el contador en 1. Si el documento
 * no existe, se crea un nuevo documento con un contador inicial de 1.
 * 
 * @returns {Promise<number|null>} - El nuevo valor del contador de visitas si la operación es exitosa, 
 * o `null` si ocurre un error durante la actualización.
 * 
 * @throws {Error} - Si ocurre un error durante la operación de actualización del contador de visitas.
 */
export async function incrementPageVisitCounter() {
    try {
        // Referencia al documento que almacena el contador de visitas en la colección "pageStats"
        const docRef = doc(db, "pageStats", "visitCounter");
        const docSnapshot = await getDoc(docRef);

        // Si el documento existe, incrementar el contador
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const newVisitCount = (data.visitCount || 0) + 1;

            await updateDoc(docRef, {
                visitCount: newVisitCount,
                updatedAt: new Date()
            });

            console.log("Contador de visitas actualizado:", newVisitCount);
            return newVisitCount;
        } else {
            // Si el documento no existe, crear uno nuevo con el contador inicial
            await setDoc(docRef, {
                visitCount: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log("Nuevo contador de visitas creado: 1");
            return 1;
        }
    } catch (error) {
        // Manejo de errores durante la operación
        console.error("Error al actualizar el contador de visitas:", error);
        return null;
    }
}


/**
 * Borra el contenido de un área de texto al hacer clic en ella.
 * @param {string} textareaId - El ID del área de texto que se desea limpiar.
 */
export function clearTextareaOnClick(textareaId) {
    // Selecciona el área de texto por su ID
    const textarea = document.getElementById(textareaId);
    
    if (textarea) {
        // Añade un evento que borra el contenido cuando se hace clic en el área de texto
        textarea.addEventListener('click', function() {
            // Borra el contenido del área de texto
            this.value = '';
        });
    } else {
        console.error(`No se encontró el área de texto con el ID: ${textareaId}`);
    }
}



/**
 * Inicializa el cambio de tema en la página.
 */
export function initializeThemeToggle() {
    document.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');
        const themeToggleLabel = document.getElementById('theme-toggle-label');

        // Obtener el tema actual del almacenamiento local o usar el tema claro por defecto
        const currentTheme = localStorage.getItem('theme') || 'light-theme';

        // Aplicar el tema actual al cuerpo
        document.body.classList.add(currentTheme);

        // Actualizar el texto del botón y el color del ícono según el tema actual
        themeToggleLabel.textContent = currentTheme === 'light-theme' ? 'Modo Claro' : 'Modo Oscuro';
        themeToggle.classList.toggle('dark-theme-icon', currentTheme === 'dark-theme');
        themeToggle.classList.toggle('light-theme-icon', currentTheme === 'light-theme');

        themeToggle.addEventListener('click', () => {
            // Alternar entre temas claro y oscuro
            if (document.body.classList.contains('light-theme')) {
                document.body.classList.replace('light-theme', 'dark-theme');
                localStorage.setItem('theme', 'dark-theme');
                themeToggleLabel.textContent = 'Modo Oscuro';
            } else {
                document.body.classList.replace('dark-theme', 'light-theme');
                localStorage.setItem('theme', 'light-theme');
                themeToggleLabel.textContent = 'Modo Claro';
            }
            // Actualizar el color del ícono al cambiar de tema
            themeToggle.classList.toggle('dark-theme-icon');
            themeToggle.classList.toggle('light-theme-icon');
        });
    });
}
