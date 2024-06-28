import passport from 'passport';

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = passport.authenticate('jwt', { session: false });

export default isAuthenticated;

