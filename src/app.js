// Importa el módulo HTTP para crear el servidor HTTP
import http from "http";
// Importa express
import express from "express";
//compression
import compression from "express-compression";
// Importa passport
import passport from "passport";
// Importa el middleware de cookies para express
import cookieParser from "cookie-parser";
// Importa mongoose para la conexión a la base de datos
import "./mongoDb/connection/mongooseConnection.js";
// Importa los routers 
import routes from "./routes/routes.js";
// Importa Passport
import initializePassport from "./config/passport.config.js";
// Importa socket.io
import initializeSocketAdmin from "./socket/socket.io.js";
// Importa Handlebars
import exphbs from "express-handlebars";
// Importa la función multiply desde el archivo correcto
import { multiply } from "./helpers/multiply.js";
// Importa method-override
import methodOverride from "method-override";

import handlingError from "./middleware/errros.js";

//logger winston
import addLogger from "./utils/logger.js"

//swagger 
import { setupSwagger } from './helpers/swagger/swagger.js'

// Designa el puerto
const PORT = 8080;
// Crea una nueva instancia de la aplicación Express
const app = express();

// Middleware para la compresión gzip
app.use(compression());
// Middleware para soportar métodos HTTP adicionales a través de _method
app.use(methodOverride('_method'));
// Middleware para analizar y convertir las solicitudes codificadas en URL a un objeto JavaScript
app.use(express.urlencoded({ extended: true }));
// Middleware para analizar las solicitudes con cuerpo JSON
app.use(express.json());

app.engine("handlebars", exphbs.engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    helpers: {
        multiply: multiply
    },
}));
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Carpeta estática public
app.use(express.static('./src/public'));

// Instancia passport y configura el middleware de cookies para la estrategia
app.use(passport.initialize());
initializePassport();
app.use(cookieParser());

//logger
app.use(addLogger);

// Rutas de la aplicación
app.use(routes);

app.use(handlingError);

//swagger 
setupSwagger(app);

// Crea un servidor HTTP utilizando la aplicación Express
const httpServer = http.createServer(app);

//// Inicializa Socket.io pasando el servidor HTTP
initializeSocketAdmin(httpServer);

// Indica al servidor que comience a escuchar las solicitudes en el puerto especificado
httpServer.listen(PORT, () => {
    console.log(`Escuchando en el puerto ${PORT}`);
});

// //Ruta para testear winston:
// app.get("/loggertest", (req, res) => {
//     req.logger.debug("Mensaje de Debug");
//     req.logger.http("Mensaje de HTTP");
//     req.logger.info("Mensaje de INFO");
//     req.logger.warning("Mensaje de Warning");
//     req.logger.error("Mensaje de ERROR");

//     res.send("Logs generados");
// });
// //Ruta para testear winston:
// app.get("/loggertest", (req, res) => {
//     req.logger.debug("Mensaje de Debug");
//     req.logger.http("Mensaje de HTTP");
//     req.logger.info("Mensaje de INFO");
//     req.logger.warning("Mensaje de Warning");
//     req.logger.error("Mensaje de ERROR");

//     res.send("Logs generados");
// })
// //test Artillery 🔫/
// app.get("/operacionsimple", (req, res) => {
//     let suma = 0
//     for (let i = 0; i < 1000000; i++) {
//         suma += i;
//     };
//     res.send({ suma })
// })
// app.get("/operacioncompleja", (req, res) => {
//     let suma = 0
//     for (let i = 0; i < 5e8; i++) {
//         suma += i;
//     };
//     res.send({ suma })
// })
