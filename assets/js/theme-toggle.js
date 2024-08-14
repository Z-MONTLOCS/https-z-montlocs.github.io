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




