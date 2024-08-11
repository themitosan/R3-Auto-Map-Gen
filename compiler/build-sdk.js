/*
	R3 Auto Map Gen.
	build-sdk.js
*/

// Get compiler
const COMPILER = require('./build.js');

// Clear console and start process
console.clear();
COMPILER.run('sdk', process.argv);