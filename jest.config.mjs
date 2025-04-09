/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {

  // Automatically clear mock calls, instances, contexts and results before every test
clearMocks: true,
// Specify .mjs as ESM
// extensionsToTreatAsEsm: [".mjs"],

// Transform files using Babel for .mjs, .js, and TypeScript (if any)
transform: {
  "^.+\\.m?[tj]sx?$": "babel-jest",
},

// Jest test environment
testEnvironment: "node",

// Handle Node.js ESM compatibility
moduleFileExtensions: ["mjs", "js", "cjs", "json", "node"],

// Optional: Adjust transformIgnorePatterns to include specific ESM modules if needed
transformIgnorePatterns: [
  "node_modules/(?!(your-esm-package)/)", // Replace `your-esm-package` as necessary
],

setupFilesAfterEnv: ['<rootDir>/__test__/testPrisma.js']
};



export default config;



