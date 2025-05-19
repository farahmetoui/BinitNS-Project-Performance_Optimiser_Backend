"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReq = parseReq;
const jet_validators_1 = require("jet-validators");
const utils_1 = require("jet-validators/utils");
const route_errors_1 = require("@src/common/route-errors");
/******************************************************************************
                                Functions
******************************************************************************/
/**
 * Parse a Request object property and throw a Validation error if it fails.
 */
function parseReq(schema) {
    return (arg) => {
        // Don't alter original object
        if ((0, jet_validators_1.isObject)(arg)) {
            arg = { ...arg };
        }
        // Error callback
        const errArr = [];
        const errCb = (prop = 'undefined', value, caughtErr) => {
            const err = { prop, value };
            if (caughtErr !== undefined) {
                let moreInfo;
                if (!(0, jet_validators_1.isString)(caughtErr)) {
                    moreInfo = JSON.stringify(caughtErr);
                }
                else {
                    moreInfo = caughtErr;
                }
                err.moreInfo = moreInfo;
            }
            errArr.push(err);
        };
        // Return
        const retVal = (0, utils_1.parseObject)(schema, errCb)(arg);
        if (errArr.length > 0) {
            throw new route_errors_1.ValidationErr(errArr);
        }
        return retVal;
    };
}
