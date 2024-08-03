/*
	R3 Auto Map Gen.
	build.js

	This script was based on another top-secret-project™ from TemmieHeartz.
*/

module.exports = {

	// Require nw-builder and get JSON files
	nwBuilder: require('nw-builder'),
	packageJson: require('../package.json'),

	// Start compiler
	run: function(flavor){

		// Get main data
		var date = new Date,
			fs = require('fs'),
			packageJson = this.packageJson,
			buildHash = fs.readFileSync('hash.inc', 'utf-8'),
			nwVersion = packageJson.dependencies.nw.replace('-sdk', '').replace('^', '');

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
		fs.writeFileSync('./App/package.json', JSON.stringify(packageJson), 'utf-8');
		fs.unlinkSync('hash.inc');

		// Log initial data and setup nw-builder
		console.info(`=== Running compiler ===\nApp version: ${this.packageJson.version}\nnwjs version: ${nwVersion}\nFlavor: ${flavor}\n`);
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
			flavor: flavor,
			version: nwVersion,

			// Windows settings
			winIco: './App/img/icon.ico',
			winVersionString: {
				'ProductName': packageJson.name,
				'CompanyName': packageJson.author,
				'ProductShortName': packageJson.name,
				'CompanyShortName': packageJson.author,
				'FileDescription': packageJson.description,
				'FileVersion': `Ver. ${packageJson.version}, nwjs: ${nwVersion}`,
				'LegalCopyright': `2023, ${date.getFullYear()} - Juliana (TheMitoSan)`
			}

		});

		try {

			// Create new hash file
			fs.writeFileSync('hash.inc', '', 'utf-8');

			// Get licence and readme files
			const
				help = fs.readFileSync('./help.txt', 'utf-8'),
				license = fs.readFileSync('./LICENSE', 'utf-8'),
				readme = fs.readFileSync('./README.md', 'utf-8');

			// Run nw-builder
			compileData.build().then(function(){

				// Copy required files to build dir
				fs.writeFileSync('./build/r3_auto_map_gen/win64/help.txt', help, 'utf-8');
				fs.writeFileSync('./build/r3_auto_map_gen/win64/LICENSE', license, 'utf-8');
				fs.writeFileSync('./build/r3_auto_map_gen/win64/README.md', readme, 'utf-8');
				fs.writeFileSync('./version.txt', `Version: ${packageJson.version}`, 'utf-8');
				fs.writeFileSync('./build/r3_auto_map_gen/win64/version.txt', `Version: ${packageJson.version}`, 'utf-8');

				// Rename main executable and log process complete
				fs.renameSync('./build/r3_auto_map_gen/win64/r3_auto_map_gen.exe', './build/r3_auto_map_gen/win64/R3 Auto Map Gen.exe');
				console.info(`\n=== Process Complete ===`);

			});

		} catch (err) {

			// Display error
			throw new Error(err);

		}

	}

};