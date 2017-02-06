# onion-omega-oled-text

##  Write text with big 16x16 font on the OLED expansion of the Onion Omega / Omega2

Any contributions / PRs welcome!


# Prerequisites

- Onion Omega / Onion Omega 2
- Onion OLED expansion


# Installation

1. Make sure you have Node.js and npm installed on your Omega.
To do so, ssh into your device (or open the terminal from the web console)
and then run the following commands:

```
opkg update
opkg install nodejs
opkg install npm
```

Then check if the `oled-exp` command works by running the following:

```
oled-exp -h
```

It should print out a help containing a list of commands.

Then go into your local project directory and execute:

```
npm install onion-omega-oled-text
```


# Example usage

Within your project, create a .js file like this:

```
var omegaOledText = require('onion-omega-oled-text');

omegaOledText.init().then(function() {
  omegaOledText.writeText('Hello\nworld!');
});
```

## More examples

Check out example.clock.js

(When using the example code in a local folder where you plan to use it with the node module,
please change `require('./index')` to `require('onion-omega-oled-text')`).


# Character support

Out of the box, the following characters are supported:
- 0-9
- a-z
- A-Z
- `!?"':,;+-=()$./@`
- space character

You can, however, add your own custom characters!
There is a character editor available (`editor.html`) which will help you creating the necessary matrix for the character.
Once you have created your character, copy the character byte matrix array from the input field at the bottom of the page
and use it e.g. as follows:

```
var omegaOledText = require('onion-omega-oled-text');

omegaOledText.addCharacter('♥', ['0x00','0x78','0xfc','0xfe','0xfe','0xfc','0xf8','0xf0','0xf8','0xfc','0xfe','0xfe','0xfc','0x78','0x00','0x00','0x00','0x00','0x01','0x07','0x0f','0x1f','0x3f','0x7f','0x3f','0x1f','0x0f','0x03','0x01','0x00','0x00','0x00']);

omegaOledText.init().then(function() {
  omegaOledText.writeText('Hello! ♥');
});
```

Please also note that currently (02/2017) the vi/vim/nano versions of the omega do not support all utf8 characters,
therefore it's possible that you see other characters instead.
This does however not influence the execution of the script.


# Commands

- `init()`
Initialize the display
- `writeText(text, reset = true)`
If reset is set to true (default), text will start at the beginning of the display
and other contents will be erased.
- `addCharacter(character, byteMatrix)`
Add a new character that can be used in `writeText` or replace an existing one, see custom character example above

If you need more commands, have a look at:
https://github.com/jonathan-reisdorf/node-onion-omega-oled


# Additional information

## How many 16x16 characters fit onto the OLED screen?

8 characters x 4 lines

## Line breaks

As shown in the example, you can create line breaks by inserting \n into your text.
