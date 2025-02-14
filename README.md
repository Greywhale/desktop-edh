# test-mtg

An Electron application with React

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

default damage source should be turn player Try new UI Get feedback

### BUG List
0) turn rendering still buggy, sometimes disappears on add. I assume something is fighting over state?
1) css is a little off on overlay
2) change opacity to work with black on black 
3) add col borders to table (change color?)
4) sometimes you have to doubleclick damage to enter

### TODO LIST
0) pass turn using mouse?
2) Click to enlarge 
3) Integrate with scryfall 
4) Timer 
5) Metrics on dmg + time 
6) Show your cmder 
7) Commander in username field 
8) turn off video option (turn off video when elimed?)
9) shared dungeon 
10) shared tokens? 
11) hide screen from select players?
