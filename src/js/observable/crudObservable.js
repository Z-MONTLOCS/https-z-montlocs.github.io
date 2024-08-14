// crudObservable.js

/**
 * Clase Observable para manejar observadores en el patrón de diseño Observer.
 * 
 * Esta clase permite agregar observadores a una lista y notificarles cuando ocurre un evento. Es útil
 * para implementar una arquitectura en la que diferentes partes del sistema necesitan reaccionar a cambios
 * o eventos, como operaciones CRUD en una base de datos.
 * 
 * @class
 */
class Observable {
    constructor() {
        this.observers = []; // Lista de observadores
    }

    /**
     * Agrega un nuevo observador a la lista de observadores.
     * 
     * @param {Function} observer - La función que actuará como observador. Debe aceptar un argumento de datos.
     */
    addObserver(observer) {
        this.observers.push(observer);
    }

    /**
     * Notifica a todos los observadores registrados con los datos proporcionados.
     * 
     * @param {Object} data - Los datos que se pasarán a los observadores.
     */
    notifyObservers(data) {
        this.observers.forEach(observer => observer(data));
    }
}

// Exporta una instancia única de Observable para operaciones CRUD
const crudObservable = new Observable();
export default crudObservable;
