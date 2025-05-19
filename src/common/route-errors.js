"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationErr = exports.RouteError = void 0;
const HttpStatusCodes_1 = __importDefault(require("@src/common/HttpStatusCodes"));
/******************************************************************************
                              Classes
******************************************************************************/
/**
 * Error with status code and message.
 */
class RouteError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.RouteError = RouteError;
/**
 * Validation in route layer errors.
 */
class ValidationErr extends RouteError {
    static MSG = 'One or more parameters were missing or invalid.';
    constructor(errObj) {
        const msg = JSON.stringify({
            message: ValidationErr.MSG,
            parameters: errObj,
        });
        super(HttpStatusCodes_1.default.BAD_REQUEST, msg);
    }
}
exports.ValidationErr = ValidationErr;
