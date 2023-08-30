import React from "react";
import "../i18n";
import { CardDesigner } from "./index";

document.querySelectorAll('.cardeditor')
  .forEach(domContainer => {
    // Read the properties from data-* attributes.
    const enableDownload = domContainer.dataset.enableDownload === 'true';
    const enablePrint = domContainer.dataset.enablePrint === 'true';
    ReactDOM.render(React.createElement(CardDesigner, { enableDownload: enableDownload, enablePrint: enablePrint }), domContainer);
  });