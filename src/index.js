import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import { CardDesigner } from "./lib";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/jsCardRendering.css";

const App = () => (
  <div style={{ width: '75%', margin: "15px auto" }}>
	<h1>JS-CardEditor</h1>
	<p>This react component allows you to define the card printing template from a web UI.</p>
	<p>Use the JSON or XML output as a `template` for further processing.</p>
	<p>
		It usually needs to be consumed by an application implementing the business value (eg. a <a href="https://leosac.com/credential-provisioning/">credential provisioning solution</a>).<br />
		This project is heavily based on <a href="https://github.com/leosac/js-cardrendering">JS-CardRendering</a>.
	</p>
    <CardDesigner enableDownload="true" enablePrint="true" />
  </div>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);