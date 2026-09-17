# R3 Auto Map Gen - Help file

## General Shortcuts

| Key            | Action                                             |
|----------------|----------------------------------------------------|
| F1             | Show about window                                  |
| Alt            | Toggle between drag canvas being active            |
| F7 or Numpad 5 | Center current map                                 |
| F8             | Reset canvas zoom                                  |
| F9             | Reset map                                          |
| F10            | Reload latest saved / loaded map                   |
| Shift          | (Hold) Lock X axis while moving Rooms / Map Canvas |
| Ctrl           | (Hold) Lock Y axis while moving Rooms / Map Canvas |
| Escape         | Clear selected map list                            |
| ArrowUp        | Move selected maps up                              |
| ArrowDown      | Move selected maps down                            |
| ArrowLeft      | Move selected maps left                            |
| ArrowRight     | Move selected maps right                           |
| Numpad 1       | Move selected maps down + left                     |
| Numpad 2       | Move selected maps down                            |
| Numpad 3       | Move selected maps down + right                    |
| Numpad 4       | Move selected maps left                            |
| Numpad 6       | Move selected maps right                           |
| Numpad 7       | Move selected maps up + left                       |
| Numpad 8       | Move selected maps up                              |
| Numpad 9       | Move selected maps up + right                      |

## Global Shortcuts

| Key             | Action                              |
|-----------------|-------------------------------------|
| Ctrl+Shift+S    | Save current map                    |
| Ctrl+F7         | Center current map                  |
| Ctrl+F8         | Reset canvas zoom                   |
| Ctrl+F9, Ctrl+L | Reset map                           |
| Ctrl+F10        | Reload latest saved / loaded map    |
| Ctrl+Delete     | Delete all saves from selected game |
| Ctrl+Shift+R    | Run game                            |
| Ctrl+Shift+H    | Hook game process                   |
| Ctrl+Shift+Q    | Restore right menu                  |

## Tips:

### App setup

- If you are using Classic REBirth, just click on `App Setup`, close the first popup, Select your main executable and click on `Cancel` for every prompt until you see the `"INFO - Process complete!"` message.

### Map Selection

- You can select more than one map by holding `Control` key. To clear your selection, press `Escape`.
- The map selection will clear if you go to another location in-game.


### Wine / Proton

- If you are not using this tool with windows, the main **setup will not work** unless if you add the following override to wine:

```bash
WINEDLLOVERRIDES="ddraw.dll=n,b" wine R3\ Auto\ Map\ Gen.exe
```

If you are using Steam, add the following:

```bash
WINEDLLOVERRIDES="ddraw.dll=n,b" %command%
```

- If you are playing **Resident Evil 3: Nemesis** using **Classic REBirth version 1.0.2 with Direct3D 11**, there is a high probability of the game not **closing properly after closing the main window!** You will need to kill the main process manually.