/**
 * Función para calcular el hash SHA-256 de una cadena de texto.
 * 
 * Esta función toma una cadena de texto en formato de texto plano y calcula su hash utilizando el algoritmo 
 * SHA-256. El hash se devuelve como una cadena hexadecimal de 64 caracteres.
 * 
 * @param {string} plain - La cadena de texto que se va a cifrar utilizando el algoritmo SHA-256.
 * 
 * @returns {Promise<string>} - Una promesa que se resuelve con el hash hexadecimal de la cadena de texto.
 * 
 * @example
 * // Uso de la función sha256
 * sha256('texto a cifrar').then(hash => {
 *     console.log(hash); // Imprime el hash SHA-256 en formato hexadecimal
 * });
 * 
 * @throws {Error} - Si ocurre un error durante el proceso de cálculo del hash.
 */
async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(buffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}

export { sha256 };
