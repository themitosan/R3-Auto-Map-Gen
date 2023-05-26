/*
	R3 Auto Map Gen.
	compile.js

	This script was based on another top-secret-project™ from TemmieHeartz.
*/

module.exports = {

	// Get JSON files
	packageJson: require('./package.json'),

	// Compiler data
	nwFlavor: void 0,
	nwVersion: void 0,

	// Require nw-builder
	nwBuilder: require('nw-builder'),

	// Start compiler
	run: function(){

		// Get main data
		var date = new Date,
			fs = require('fs'),
			packageJson = this.packageJson,
			buildHash = fs.readFileSync('hash.inc', 'utf8');

		// Get run data
		nwFlavor = this.nwFlavor;
		nwVersion = this.nwVersion;

		// Update package.json
		if (buildHash.length !== 0){
			packageJson.hash = buildHash.slice(0, 6);
		}
		packageJson.scripts = void 0;
		packageJson.main = 'index.htm';
		packageJson.dependencies = void 0;
		packageJson.devDependencies = void 0;
		packageJson.window.icon = 'img/icon.png';

		// Update package.json and remove inc file
		fs.writeFileSync('./App/package.json', JSON.stringify(packageJson), 'utf8');
		fs.unlinkSync('hash.inc');

		// Log data before builder setup
		console.info('INFO - Running compiler\n\nVersion: ' + this.nwVersion + '\nFlavor: ' + this.nwFlavor + '\n\npackage.json: ');
		console.info(packageJson);

		// Setup nw-builder
		const compileData = new this.nwBuilder({

			// Main metadata
			appName: packageJson.name,
			appVersion: packageJson.version,

			// Running mode
			zip: !0,
			arch: 'x64',
			mode: 'build',
			srcDir: './App',
			ourDir: './Build/',
			files: './App/**/*',
			platforms: ['win64'],

			// Set flavor and version
			flavor: nwFlavor,
			version: nwVersion,

			// Windows settings
			winIco: './App/img/icon.ico',
			winVersionString: {
				'ProductName': packageJson.name,
				'CompanyName': packageJson.author,
				'ProductShortName': packageJson.name,
				'CompanyShortName': packageJson.author,
				'FileDescription': packageJson.description,
				'LegalCopyright': '2023, ' + date.getFullYear() + ' - TemmieHeartz',
				'FileVersion': 'Ver. ' + packageJson.version + ', nwjs: ' + nwVersion
			}

		});

		try {

			// Create new hash file
			fs.writeFileSync('hash.inc', '', 'utf8');

			// Get licence and readme files
			const license = fs.readFileSync('./LICENSE', 'utf8'),
				readme = fs.readFileSync('./README.md', 'utf8');

			// Run nw-builder
			compileData.build().then(function(){
	
				// Copy license and readme to build dir
				fs.writeFileSync('./build/R3 Auto Map Gen/win64/LICENSE', license, 'utf8');
				fs.writeFileSync('./build/R3 Auto Map Gen/win64/README.md', readme, 'utf8');
				fs.writeFileSync('./version.txt', 'Version: ' + packageJson.version, 'utf8');
				fs.writeFileSync('./build/R3 Auto Map Gen/win64/version.txt', 'Version: ' + packageJson.version, 'utf8');
	
			});

		} catch (err) {

			// Display error
			throw new Error(err);

		}

	}

};