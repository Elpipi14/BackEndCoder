import dotenv from "dotenv";
import program from "../utils/commander.js";

const { mode } = program.opts();

dotenv.config({
    path: mode === "production" ? "./.env.production" : "./.env.development"
});

const configObject = {
    mongo_url: process.env.MONGO_URL,
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    private_key: process.env.PRIVATE_KEY,
    jwt_key: process.env.JWT_KEY,
    node_log: process.env.NODE_LOG
};

export default configObject;
