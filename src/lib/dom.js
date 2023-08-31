import React from "react";
import "../i18n";
import { CardDesigner } from "./index";

function createCardEditor(domContainer, props) {
  if (props === undefined) {
    props = {
      enableDownload: domContainer.dataset.enableDownload === 'true',
      enablePrint: domContainer.dataset.enablePrint === 'true',
      enableLoad: domContainer.dataset.enableLoad === 'true',
      enableName: domContainer.dataset.enableName === 'true'
    };
  }
  const el = React.createElement(CardDesigner, props);
  ReactDOM.render(el, domContainer);
  return el;
}

document.querySelectorAll('.cardeditor')
  .forEach(domContainer => {
    createCardEditor(domContainer);
  });

export { createCardEditor };