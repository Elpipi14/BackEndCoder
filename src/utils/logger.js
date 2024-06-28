// logger.js
import winston from "winston";
import configObject from "../config/config.js";
const { node_log } = configObject;

console.log("NODE_LOG value: ", node_log);

const levels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'yellow',
        warning: 'blue',
        info: 'green',
        http: 'magenta',
        debug: 'white'
    }
};

const log_level = node_log === "production" ? "debug" : "info";
console.log("Log level set to: ", log_level);

winston.addColors(levels.colors);

const logger = winston.createLogger({
    levels: levels.levels,
    transports: [
        new winston.transports.Console({
            level: log_level,
            format: winston.format.combine(
                winston.format.colorize({ colors: levels.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: "./errors.log",
            level: "warning",
            format: winston.format.simple()
        })
    ]
});

const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
};

export default addLogger;




// //le pasamos un objeto de config para crear un logger
// transports: [
//     new winston.transports.Console({ level: "http" }),
//     //Agregamos un transporte adicional
//     new winston.transports.File({
//         filename: "./errors.log",
//         level: "warn"
//     })
// ]