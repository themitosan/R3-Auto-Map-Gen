/*
	R3 Auto Map Gen
	build.js

	I had to rewrite this thing since the old verions of nwbuilder stopped working :/
*/

/*
	Require modules
*/

import * as module_fs from 'fs';
import nwbuild from 'nw-builder';
import { zip } from 'zip-a-folder';

/*
	Functions
*/

/**
	* Create a zip file from an specific target
	* @param target [Path] Folder to be compressed
	* @param zipPath [Path] Path to zip file
*/
async function zipFolder(target, zipPath){
	await zip(target, zipPath);
}

/**
	* Main function
*/
function runCompiler(flavor, args){

	// Create main vars
	var buildHash = '',
		date = new Date,
		prevSettings = void 0,
		packageJson = JSON.parse(module_fs.readFileSync('package.json')),
		nwVersion = packageJson.dependencies.nw.replace('-sdk', '').replace('^', '');

	// Clear console and check if hash file exists
	console.clear();
	if (module_fs.existsSync('hash.inc') === !0) buildHash = module_fs.readFileSync('hash.inc', 'utf-8');

	// Check if args was provided
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

				// Disable window actions
				case '--disableWindowActions':
					packageJson.extra.disableWindowActions = !0;
					break;

				// Preserve previous build settings file
				case '--preserveSettings':
					if (module_fs.existsSync('./build/r3_auto_map_gen/win64/Settings.json') === !0){
						prevSettings = JSON.parse(module_fs.readFileSync('./build/r3_auto_map_gen/win64/Settings.json', 'utf-8'));
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
	packageJson.scripts = void 0;
	packageJson.main = 'index.htm';
	packageJson.dependencies = void 0;
	packageJson.devDependencies = void 0;
	packageJson.window.icon = 'img/icon.png';
	if (buildHash.length !== 0) packageJson.hash = buildHash.slice(0, 6);

	// Update package.json and remove hash.inc file
	module_fs.writeFileSync('./App/package.json', JSON.stringify(packageJson), 'utf-8');
	if (module_fs.existsSync('hash.inc') === !0) module_fs.unlinkSync('hash.inc');

	// Start build process
	console.info(`=== Running compiler ===\nApp version: ${packageJson.version}\nNW.js version: ${nwVersion}\nFlavor: ${flavor}\nArgs: ${args}`);
	try {

		// Create hash file again and prepare some consts
		module_fs.writeFileSync('hash.inc', '');
		const
			help = module_fs.readFileSync('help.txt', 'utf-8'),
			license = module_fs.readFileSync('LICENSE', 'utf-8'),
			readme = module_fs.readFileSync('README.md', 'utf-8');

		// Start compiler
		nwbuild({
			flavor,
			zip: !1,
 			glob: !1,
			arch: 'x64',
 			mode: 'build',
 			srcDir: 'App',
			outDir: 'build',
			platform: 'win',
 			cacheDir: 'cache',
			version: nwVersion,
			manifestUrl: 'https://nwjs.io/versions.json',
			app: {
				icon: 'App/img/icon.ico',
				productName: 'R3 Auto Map Gen.',
				productVersion: packageJson.version,
				fileVersion: `Ver. ${packageJson.version}, NW.js: ${nwVersion}`,
				legalCopyright: `2023, ${date.getFullYear()} - Juliana (TheMitoSan)`
			}
		})
		.then(function(){

			// Zip all files from package.nw
			zipFolder('build/package.nw', 'build/package.nw.zip').then(function() {

				// Bundle package.nw on main executable
				const
					packageNw = module_fs.readFileSync('build/package.nw.zip', 'binary'),
					tempExecutable = module_fs.readFileSync('build/r3_auto_map_gen.exe', 'binary');

				module_fs.writeFileSync('build/R3 Auto Map Gen.exe', tempExecutable + packageNw, 'binary');

				// Remove temp files / dirs
				[
					'package.nw',
					'package.nw.zip',
					'r3_auto_map_gen.exe'
				].forEach(function(cPath){
					module_fs.rmSync(`build/${cPath}`, { recursive: !0 });
				});

				// Copy required files to build dir
				module_fs.writeFileSync('build/help.txt', help, 'utf-8');
				module_fs.writeFileSync('build/LICENSE', license, 'utf-8');
				module_fs.writeFileSync('build/README.md', readme, 'utf-8');
				module_fs.writeFileSync('version.txt', `Version: ${packageJson.version}`, 'utf-8');
				module_fs.writeFileSync('build/version.txt', `Version: ${packageJson.version}`, 'utf-8');

				// Check if needs to restore previous settings file
				if (prevSettings !== void 0 && module_fs.existsSync('build/Settings.json') === !0){
					console.info('INFO - Restoring previous settings file (Settings.json)');
					module_fs.writeFileSync('build/Settings.json', JSON.stringify(prevSettings), 'utf-8');
				}

				console.info(`\n=== Process Complete ===\n`);

			});

		});

	} catch (err) {
		throw err;
	}

}

// Run compiler
runCompiler('normal', process.argv);