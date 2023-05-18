/*
	R3 Auto Map Gen.
	comp-pr.js
*/

// Get compiler
var COMPILER = require('./compile.js');

// Set values
COMPILER.nwFlavor = 'sdk';
COMPILER.nwVersion = '0.76.0';
COMPILER.projectVersion = '1.0.0';

// Start process
COMPILER.run();