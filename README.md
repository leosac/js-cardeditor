# JS-CardEditor [![Build Status](https://github.com/leosac/js-cardeditor/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/leosac/js-cardeditor/actions/workflows/node.js.yml)
JS-CardEditor is a React component used to create/edit card printing templates.
It works with node.js and web browsers (once packaged with webpack).

![CardEditor Demo](https://github.com/leosac/js-cardeditor/blob/master/public/demo-cardeditor.gif?raw=true)

Related projects:
 * [js-cardrendering](https://github.com/leosac/js-cardrendering): the card rendering engine used by this project
 * [card-printing-worker](https://github.com/leosac/card-printing-worker): a node server providing REST API for bitmap generation/printing
 * [leosac-credential-provisioning](https://leosac.com/credential-provisioning/): a complete professional card provisioning solution for both card encoding and printing

## Prerequisites
You need React >= 18

## Installation
`npm install @leosac/js-cardeditor --save`

## Usage
```js
import { CardDesigner } from "@leosac/js-cardeditor";

/* Import bootstrap css if missing */
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => (
  <CardDesigner enableDownload="true" enablePrint="true" />
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```

## From source
```bash
git clone https://github.com/leosac/js-cardeditor.git
cd "js-cardeditor"
npm install
```

### Build for redistribution
```bash
npm run build
```

### Start in development mode
```bash
npm start
```

### Run tests
```bash
npm run test
```

## Parameters
Several parameters can be optionally passed to the component.

    - content [`Object`]: Card Template
    - draggableFields [`Array`] (`{name : String, default_value: String}`): List of draggable fields
    - formatVersion [`String`] (`Default: Undefined`): Force a specific format version for the output (default to latest version)
    - enabledCardSizes [`Object` : Select cards templates you want to authorize. (more informations inside "Card Templates" section)
    - enableDownload [`Boolean`] (`Default: false`): Enable/Disable Download features
    - enableName [`Boolean`] (`Default:true`): Enable/Disable Name input
    - maxNameLength [`Number`]: Set name max length
    - enablePrint [`Boolean`] (`Default:false`): Enable/Disable Printing features
    - enableUnprintable [`Boolean`] (`Default:false`): Active unprintable objects, like fingerprint
    - onEdit [`Function`] (`Param 1: Snapshot): Function called at each template changed / field edition (created, removed, resized, moved...)
    - onSubmit [`Function`] (): Enable the Submit button and trigger this function on submition

## Enable Card Sizes
Parameter `enabledCardSizes` enable/disable templates size.
To customize the allowed size list, create an `Object` like:

```js
enabledCardSizes: {
  cr80: true,
  res_4to3: false,
  res_3to2 : false,
  res_16to9 : true,
  custom: false
}
```

Current list of supported sizes:
  - `cr80` : Standard card size
  - `res_4to3` : 4/3 visual
  - `res_3to2` : 3/2 visual
  - `res_8to5` : 8/5 visual
  - `res_5to3` : 5/3 visual
  - `res_16to9` : 16/9 visual
  - `custom` : Allow custom size

## Load Card Templates
The function can take a card template in parameter `content`, useful if you want to edit a card directly after loading.

It is recommended to use JSON format.

XML import and export is supported as well for compatibility reasons (.dpf files).

## Jquery
Jquery is being used for some specific aspects of this component. This is not a best practice as it may conflict with React DOM management. Ideally, it will be further removed on a later version.

# License
This project has been created by Leosac SAS.
The source code of this library is released under LGPLv3 license.