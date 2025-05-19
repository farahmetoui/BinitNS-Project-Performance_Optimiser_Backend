"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRelationalKey = isRelationalKey;
const jet_validators_1 = require("jet-validators");
/**
 * Database relational key.
 */
function isRelationalKey(arg) {
    return (0, jet_validators_1.isNumber)(arg) && arg >= -1;
}
