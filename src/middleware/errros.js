import { EErrors } from "../helpers/errors/enum.js";

const handlingError = (error, req, res, next) => {
    console.error(error.cause);
    switch (error.code) {
        case EErrors.TIPO_INVALIDO:
            res.status(400).send({ status: "error", error: error.message });
            break;
        default:
            res.status(500).send({ status: "error", error: "Internal server error" });
            break;
    }
};

export default handlingError;
