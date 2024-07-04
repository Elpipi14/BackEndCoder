import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'doc E-commerce Sneakers',
            description: 'App dedicated to the sale of fashion sneakers in a course applying the backend course structure',
        },
    },
    apis: ['./src/docs/**/*.yaml'], // Asegúrate de que la ruta es correcta
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app) => {
    app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));
};