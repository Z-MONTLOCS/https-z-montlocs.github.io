// utils/hashUtils.js

/**
 * Genera un hash SHA-256 de una cadena de texto.
 * 
 * Esta función toma una cadena de texto como entrada y calcula su hash utilizando el algoritmo SHA-256.
 * El hash resultante se devuelve como una cadena hexadecimal de 64 caracteres.
 * 
 * @param {string} text - La cadena de texto que se va a cifrar usando SHA-256.
 * 
 * @returns {Promise<string>} - Una promesa que se resuelve con el hash hexadecimal de la cadena de texto.
 * 
 * @example
 * // Uso de la función generateHash
 * generateHash('texto a cifrar').then(hash => {
 *     console.log(hash); // Imprime el hash SHA-256 en formato hexadecimal
 * });
 * 
 * @throws {Error} - Si ocurre un error durante el cálculo del hash.
 */
export async function generateHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
