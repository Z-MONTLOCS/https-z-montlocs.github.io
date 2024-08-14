
/**
 * Muestra un mensaje de error o éxito en la interfaz de usuario.
 * 
 * Esta función muestra un mensaje en un contenedor específico en función del tipo de mensaje proporcionado 
 * ("error" o "success"). Ajusta el color del mensaje según el tema actual almacenado en el almacenamiento local 
 * y oculta el mensaje automáticamente después de unos segundos.
 * 
 * @param {string} message - El texto del mensaje que se desea mostrar.
 * @param {string} type - El tipo de mensaje a mostrar, puede ser `"error"` o `"success"`.
 * 
 * @example
 * // Mostrar un mensaje de error
 * showMessage('Se ha producido un error.', 'error');
 * 
 * // Mostrar un mensaje de éxito
 * showMessage('Operación exitosa.', 'success');
 * 
 * @throws {Error} - Si los elementos de mensaje o el contenedor no están presentes en el DOM.
 */

export function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Obtener el tema actual del almacenamiento local o usar el tema claro por defecto
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', 'dark'); 

    const styles = getComputedStyle(document.documentElement);

    // Obtener y mostrar los colores de error y éxito
    const errorColor = styles.getPropertyValue('--error-color').trim();
    const successColor = styles.getPropertyValue('--success-color').trim();

    // Ocultar ambos mensajes primero
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    messageContainer.style.display = 'none';

    // Mostrar el mensaje correspondiente
    if (type === "error") {
        messageContainer.style.display = 'block';
        errorMessage.textContent = message;
        errorMessage.style.color = errorColor; 
        errorMessage.style.display = 'block';
    } else if (type === "success") {
        messageContainer.style.display = 'block';
        successMessage.textContent = message;
        successMessage.style.color = successColor; 
        successMessage.style.display = 'block';
    }

    // Ocultar el mensaje después de unos segundos (opcional)
    setTimeout(() => {
        messageContainer.style.display = 'none';
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }, 5000);
}
