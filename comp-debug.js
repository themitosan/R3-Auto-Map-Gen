/*
	R3 Auto Map Gen.
	comp-main.js
*/

// Get compiler
const COMPILER = require('./compile.js');

// Set values
COMPILER.nwFlavor = 'sdk';
COMPILER.nwVersion = '0.82.0';

// Start process
COMPILER.run();