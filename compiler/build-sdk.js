/*
	R3 Auto Map Gen.
	build-sdk.js
*/

// Get compiler and start process
const COMPILER = require('./build.js');
COMPILER.run('sdk', process.argv);