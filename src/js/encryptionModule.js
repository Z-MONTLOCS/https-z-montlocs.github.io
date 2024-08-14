// Reglas de encriptación
const encryptionRules = {
    'e': 'enter',
    'i': 'imes',
    'a': 'ai',
    'o': 'ober',
    'u': 'ufat'
};

// Crea un mapeo inverso para desencriptación
const decryptionRules = Object.fromEntries(
    Object.entries(encryptionRules).map(([key, value]) => [value, key])
);

/**
 * Valida si un texto contiene solo letras minúsculas (sin acentos) y espacios entre letras, sin espacios al inicio o al final.
 * 
 * @param {string} inputText - El texto a validar.
 * @returns {boolean} - Retorna `true` si el texto es válido y cumple con las condiciones, `false` de lo contrario.
 */
function isValidText(inputText) {
    // Asegúrate de que el texto no esté vacío y solo contenga letras minúsculas y espacios entre letras
    return /^[a-z]+(?:\s[a-z]+)*$/.test(inputText);
}

/**
 * Encripta un texto según las reglas especificadas.
 * 
 * @param {string} originalText - El texto original a encriptar.
 * @returns {Object} - Un objeto con el texto encriptado y un mensaje de estado.
 */
function encryptText(originalText) {
    if (!isValidText(originalText)) {
        return { success: false, message: 'El texto debe contener solo letras minúsculas sin acentos, y puede incluir espacios.' };
    }

    const encryptedText = originalText.replace(/[eioua]/g, match => encryptionRules[match]);
    return { success: true, encryptedText };
}

/**
 * Desencripta un texto encriptado según las reglas especificadas.
 * 
 * @param {string} encryptedText - El texto encriptado a desencriptar.
 * @returns {Object} - Un objeto con el texto desencriptado y un mensaje de estado.
 */
function decryptText(encryptedText) {
    try {
        const pattern = new RegExp(Object.keys(decryptionRules).join('|'), 'g');
        const decryptedText = encryptedText.replace(pattern, match => decryptionRules[match]);
        return { success: true, decryptedText };
    } catch (error) {
        return { success: false, message: 'Error al desencriptar el texto.' };
    }
}

export { encryptText, decryptText, isValidText };
