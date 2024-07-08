<h1 align="center">
    <img src="App/img/icon.png" alt="R3_auto_map_gen_icon" title="R3 Auto Map Gen." width="200"/>
    <br>R3 Auto Map Gen.<br>
    <p align="center">
        <img alt="license" src="https://img.shields.io/github/license/themitosan/R3-Auto-Map-Gen">
        <img alt="workflow_status" src="https://img.shields.io/github/actions/workflow/status/themitosan/R3-Auto-Map-Gen/main.yaml?style=plastic">
    </p>
</h1>
  
This app creates an node-conected map on the go for classic Resident Evil games.

<sup>
  
 _(Click [here](https://twitter.com/themitosan/status/1659312625384140802) to see how it works)_
  
</sup>

## How to install
- Download [latest release](https://github.com/themitosan/R3-Auto-Map-Gen/releases) _(or the latest build from [GitHub Actions](https://github.com/themitosan/R3-Auto-Map-Gen/actions))_
- Extract the zip on a _cool-looking_ place
- Run `R3 Auto Map Gen.exe`
- Click on `App Setup`, select your game executable and then insert ram positions for current stage and room.

...If everything is fine, just open your game - go to main menu and then click on `Hook game process`.

## How this thing works?
- Open your game, start hook, transition from one room to other and **see the magic**!

<p align="center">
<img src="https://github.com/themitosan/R3-Auto-Map-Gen/blob/main/example.png?raw=true" alt="R3_Example" width="800"/>
</p>

## Where this thing can be helpful?
_...Do you have heard about the word of **[BioRand](https://github.com/IntelOrca/biorand)**?_

## Shortcuts
You can find a list with all available shortcuts on `help.txt`.

## How to build
- Make sure to have latest [node.js](https://nodejs.org/) version installed!
- Run `npm run build` for common build or `npm run build-debug` for debug build.
- If everything is okay, binaries will be available on `build/R3 Auto Map Gen/`.

## External plugins on this project
- [memoryjs](https://github.com/rob--/memoryjs) from [Rob--](https://github.com/rob--/)
- [TMS.js](https://github.com/themitosan/TMS.js) from [TheMitoSan](https://github.com/themitosan/) <sup>_Hi!_</sup>

<br>
<sup>

_[BioRand](https://github.com/IntelOrca/biorand) is a Classic Resident Evil Randomizer created by [IntelOrca](https://github.com/IntelOrca)._

_Some parts from this project was obtained from [R3ditor V2](https://github.com/themitosan/R3ditor-V2) and R3V3._

_Code Veronica database was created using [Evil Resource](evilresource.com/resident-evil-code-veronica/maps) as reference._

</sup>
