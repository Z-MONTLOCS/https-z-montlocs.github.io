import { clearTextareaOnClick } from './db/crudFunctions.js';

// Mostrar el modal y copiar el código al portapapeles
export function showModal(code) {
    const modal = document.getElementById('myModal');
    const generatedCodeTextArea = document.getElementById('generated-code');
    generatedCodeTextArea.value = code; // Mostrar el código en el área de texto del modal
    modal.style.display = 'block'; // Mostrar el modal

    // Copiar código al portapapeles y cerrar el modal
    document.getElementById('copy-code-button').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(code);
            console.log('Código copiado al portapapeles!');
            
            // Cerrar el modal después de copiar
            modal.style.display = 'none';

            // Limpia el textarea del área de texto principal
            clearTextareaOnClick('message-to-encrypt');
        } catch (error) {
            console.error('Error al copiar el código:', error);
        }
    });

    // Cerrar el modal cuando se hace clic en el botón de cerrar
    document.querySelector('.close-button').onclick = () => {
        modal.style.display = 'none';
    };

    // Cerrar el modal cuando se hace clic fuera del contenido del modal
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}
