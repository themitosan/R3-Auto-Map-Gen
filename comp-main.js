/*
	R3 Auto Map Gen.
	comp-main.js
*/

// Get compiler
var COMPILER = require('./compile.js');

// Set values
COMPILER.nwFlavor = 'normal';
COMPILER.nwVersion = '0.76.1';
COMPILER.projectVersion = '1.0.0';

// Start process
COMPILER.run();