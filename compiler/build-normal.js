/*
	R3 Auto Map Gen.
	build-normal.js
*/

// Get compiler
const COMPILER = require('./build.js');

// Clear console and start process
console.clear();
COMPILER.run('normal', process.argv);