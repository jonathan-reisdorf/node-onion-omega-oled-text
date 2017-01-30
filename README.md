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

# Commands

- `init()`
Initialize the display
- `writeText(text, reset)`
If reset is set to true, text will start at the beginning of the display
and other contents will be erased.

If you need more commands, have a look at:
https://github.com/jonathan-reisdorf/node-onion-omega-oled

# Additional information

## How many 16x16 characters fit onto the OLED screen?

8 characters x 4 lines

## Line breaks

As shown in the example, you can create line breaks by inserting \n into your text.
