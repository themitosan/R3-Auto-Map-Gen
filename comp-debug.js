/*
	R3 Auto Map Gen.
	comp-main.js
*/

// Get compiler
var COMPILER = require('./compile.js');

// Set values
COMPILER.nwFlavor = 'sdk';
COMPILER.nwVersion = '0.72.0';

// Start process
COMPILER.run();