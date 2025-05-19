"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jet_schema_1 = __importDefault(require("jet-schema"));
const jet_validators_1 = require("jet-validators");
const validators_1 = require("./validators");
exports.default = (0, jet_schema_1.default)({
    globals: [
        { vf: validators_1.isRelationalKey, default: -1 },
        { vf: jet_validators_1.isNumber, default: 0 },
        { vf: jet_validators_1.isString, default: '' },
        { vf: jet_validators_1.isBoolean, default: false },
    ],
});
