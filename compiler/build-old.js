/*
	R3 Auto Map Gen
	build-old.js

	This script was based on another top-secret-project™ from TemmieHeartz.
*/

// Main compiler function
const COMPILER = {

	// Require nw-builder and get JSON files
	nwBuilder: require('nw-builder'),
	packageJson: require('../package.json'),

	// Start compiler
	run: function(flavor, args){

		// Get main data
		var date = new Date,
			fs = require('fs'),
			prevSettings = void 0,
			packageJson = this.packageJson,
			buildHash = fs.readFileSync('hash.inc', 'utf-8'),
			nwVersion = packageJson.dependencies.nw.replace('-sdk', '').replace('^', '');

		// Clear console and check if args was provided. If so, process them
		console.clear();
		if (args !== void 0 && args.length !== 0){
			args.forEach(function(cArg){

				// Switches
				switch (cArg){

					/*
						Compile app with some wine fixes

						- Set wineFix flag as true
						- Disable some transition effects
						- Main window will always have frame
						- Main window can't use transparency
						- NW version must be 0.83.0 (Wine have issues rendering text on newer versions)
					*/
					case '--enableWineFix':
						packageJson.window.frame = !0;
						packageJson.extra.wineFix = !0;
						packageJson.window.transparent = !1;
						packageJson.dependencies.nw = '0.83.0';
						nwVersion = packageJson.dependencies.nw;
						break;

					// Preserve previous build settings file
					case '--preserveSettings':
						if (fs.existsSync('./build/r3_auto_map_gen/win64/Settings.json') === !0){
							prevSettings = JSON.parse(fs.readFileSync('./build/r3_auto_map_gen/win64/Settings.json', 'utf-8'));
						}
						break;

					// Set flavor as sdk
					case '--sdk':
						flavor = 'sdk';
						break;

				}

				// Set nw version
				if (cArg.indexOf('--nwVer=') !== -1){
					const newNwVer = cArg.replace('--nwVer=', '');
					packageJson.dependencies.nw = newNwVer;
					nwVersion = newNwVer;
				}


			});
		}

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
		console.info(`=== Running compiler ===\nApp version: ${packageJson.version}\nNW.js version: ${nwVersion}\nFlavor: ${flavor}\nArgs: ${args}\n`);
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
				'FileVersion': `Ver. ${packageJson.version}, NW.js: ${nwVersion}`,
				'LegalCopyright': `2023, ${date.getFullYear()} - Juliana (TheMitoSan)`
			}

		});

		try {

			// Create new hash file and read text files
			fs.writeFileSync('hash.inc', '', 'utf-8');
			const
				help = fs.readFileSync('./help.txt', 'utf-8'),
				license = fs.readFileSync('./LICENSE', 'utf-8'),
				readme = fs.readFileSync('./README.md', 'utf-8');

			// Run nw-builder
			compileData.build().then(COMPILER.postCompile);

		} catch (err) {

			// Display error
			throw new Error(err);

		}

	},

	// Post compile function
	postCompile: function(){

		// Copy required files to build dir
		fs.writeFileSync('./build/r3_auto_map_gen/win64/help.txt', help, 'utf-8');
		fs.writeFileSync('./build/r3_auto_map_gen/win64/LICENSE', license, 'utf-8');
		fs.writeFileSync('./build/r3_auto_map_gen/win64/README.md', readme, 'utf-8');
		fs.writeFileSync('./version.txt', `Version: ${packageJson.version}`, 'utf-8');
		fs.writeFileSync('./build/r3_auto_map_gen/win64/version.txt', `Version: ${packageJson.version}`, 'utf-8');

		// Check if needs to restore previous settings file
		if (prevSettings !== void 0){
			console.info('INFO - Restoring previous settings file (Settings.json)');
			fs.writeFileSync('./build/r3_auto_map_gen/win64/Settings.json', JSON.stringify(prevSettings), 'utf-8');
		}

		// Rename main executable and log process complete
		fs.renameSync('./build/r3_auto_map_gen/win64/r3_auto_map_gen.exe', './build/r3_auto_map_gen/win64/R3 Auto Map Gen.exe');
		console.info(`\n=== Process Complete ===`);

	}

};

// Run compiler
COMPILER.run('normal', process.argv);