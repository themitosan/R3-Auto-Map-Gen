/*
	R3 Auto Map Gen.
	comp-main.js
*/

// Get compiler
const COMPILER = require('./compile.js');

// Set values
COMPILER.nwFlavor = 'normal';
COMPILER.nwVersion = '0.82.0';

// Start process
COMPILER.run();