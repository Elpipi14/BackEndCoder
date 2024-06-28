// Passport con estrategia de autenticación y autorización.
import passport from "passport";
import jwt from "passport-jwt";
import GitHubStrategy from "passport-github2";
import configObject from '../config/config.js';
const { private_key } = configObject;
import { UserModel } from "../mongoDb/schema/user.model.js";

const JWT_SECRET = private_key;
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["coderHouseToken"];
  }
  return token;
}

const initializePassport = () => {

  const jwtExtractor = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: JWT_SECRET,
  };

  passport.use("jwt", new JWTStrategy(jwtExtractor, async (jwt_payload, done) => {
    try {
      // console.log(`busca el usuario passport: `, jwt_payload);
      const user = await UserModel.findById(jwt_payload.user._id);
      // console.log(`busca despues playLoad: `, user);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));

  passport.use("jwt-admin", new JWTStrategy(jwtExtractor, async (jwt_payload, done) => {
    try {
      const user = await UserModel.findById(jwt_payload.user._id);
      if (!user) {
        return done(null, false);
      }
      // Verificar si el usuario es un administrador
      if (user.role === 'admin' || user.role === 'premium') {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }));

};

export default initializePassport;

