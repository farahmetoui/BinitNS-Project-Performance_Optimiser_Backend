"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const find_1 = __importDefault(require("find"));
const jasmine_1 = __importDefault(require("jasmine"));
const jet_logger_1 = __importDefault(require("jet-logger"));
const process_1 = require("process");
/******************************************************************************
                              Run
******************************************************************************/
// Init Jasmine
const jasmine = new jasmine_1.default();
jasmine.exitOnCompletion = false;
// Set location of test files
jasmine.loadConfig({
    random: true,
    spec_dir: 'spec',
    spec_files: [
        './tests/**/*.spec.ts',
    ],
    stopSpecOnExpectationFailure: false,
});
// Run all or a single unit-test
let execResp;
if (!!process_1.argv[2]) {
    const testFile = process_1.argv[2];
    find_1.default.file(testFile + '.spec.ts', './spec', (files) => {
        if (files.length === 1) {
            jasmine.execute([files[0]]);
        }
        else {
            jet_logger_1.default.err('Test file not found!');
        }
    });
}
else {
    execResp = jasmine.execute();
}
// Wait for tests to finish
(async () => {
    if (!!execResp) {
        const info = await execResp;
        if (info.overallStatus === 'passed') {
            jet_logger_1.default.info('All tests have passed :)');
        }
        else {
            jet_logger_1.default.err('At least one test has failed :(');
        }
    }
})();
