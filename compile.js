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

	// Require modules
	fs: require('fs'),
	nwBuilder: require('nw-builder'),

	// Start compiler
	run: function(){

		// Get main data
		var date = new Date,
			packageJson = this.packageJson,
			buildHash = this.fs.readFileSync('hash.inc', 'utf8');

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
		this.fs.writeFileSync('./App/package.json', JSON.stringify(packageJson), 'utf8');
		this.fs.unlinkSync('hash.inc');

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

			// Run nw-builder
			compileData.build();

			// Create new hash file
			this.fs.writeFileSync('hash.inc', '', 'utf8');

		} catch (err) {

			// Display error
			throw new Error(err);

		}

	}

};