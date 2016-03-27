## What is it?
This is, basically, a static site generator created for a friend so that she could write transcripts of counseling sessions in a templatized fashion.

## How do I use it?
Install it, write some files, run the build script, read the documents, print the documents, etc...

## How do I view the files?
Look in the `output` directory, which is recreated each time you "build" the transcripts. You can view these in your web browser by just opening the file. `index.html` has a reverse chronological list of the sessions.

If you need to print a copy, then just print from the browser.

## How do I write the files?
Just place a file with an extension `.md` in the `content` directory. Look at the example file included (`1.md`) to get a sense of what to do.

The files are written in [Github Flavored Markdown](https://guides.github.com/features/mastering-markdown/) with a few extra tags to control the formatting. Each file needs a header that takes some necessary values. See the example file for, well, an example.

_Note: write the date as `YYYY-MM-DD` (using hypens), and write the time in a 24hr format._

_Another Note: Do not use Microsoft Word to write the files. They must be written as a plain text document. TextEdit can do this, but make sure that Plain Text mode is on and not Rich Text Format_ 

## Error Checking
There is very little error checking.

## Pre-install Instructions
Open a terminal (`/Applications/Utilities/Terminal`)

Type or copy/paste the following commands:
    * `xcode-select --install` ([More information](http://osxdaily.com/2014/02/12/install-command-line-tools-mac-os-x/))
    * `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"` ([More information](http://brew.sh/))
    * `brew install node` (This installs [`nodejs`](https://nodejs.org/en/))

## Install Instructions

* Open a Terminal
* `cd ~/Dropbox`
* `git clone https://github.com/shawnrice/transcript-generator.git`
* `mv transcript-generator transcripts`
* `cd transcripts`
* `npm install`
* `node index.js`

## Update Instructions
Assuming you followed exactly the above.
* Open a Terminal
* `cd ~/Dropbox/transcripts`
* `git pull`
...and Bob's your uncle.


## Build from Finder
Just double-click `build.sh`

## Personalize
Open `config.js` and change the values.
