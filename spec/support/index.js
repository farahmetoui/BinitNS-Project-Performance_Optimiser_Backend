"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDatabase = cleanDatabase;
const UserRepo_1 = __importDefault(require("@src/repos/UserRepo"));
/******************************************************************************
                                Functions
******************************************************************************/
/**
 * Delete all records for unit testing.
 */
async function cleanDatabase() {
    await Promise.all([
        UserRepo_1.default.deleteAllUsers(),
    ]);
}
