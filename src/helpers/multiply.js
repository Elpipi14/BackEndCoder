// En el archivo helpers/multiply.js
import Handlebars from 'handlebars';

// Define la función multiply
function multiply(a, b) {
    return a * b;
}

// Registra la función como un helper en Handlebars
Handlebars.registerHelper('multiply', multiply);

// Exporta la función para que esté disponible en otros archivos
export { multiply };
