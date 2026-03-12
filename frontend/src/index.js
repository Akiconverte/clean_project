import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import * as lamejs from "lamejs";

window.lamejs = lamejs;
// Fallback para versões que procuram por Lame diretamente
window.Lame = lamejs.Lame || {};
window.Presets = {};
window.GainAnalysis = {};
window.QuantizePVT = {};
window.Quantize = {};
window.Takehiro = {};
window.Reservoir = {};
window.MPEGMode = {};
window.BitStream = {};
window.VBRTag = {};
window.Version = {};

import App from "./App";

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root")
);

// ReactDOM.render(
// 	<React.StrictMode>
// 		<CssBaseline>
// 			<App />
// 		</CssBaseline>,
//   </React.StrictMode>

// 	document.getElementById("root")
// );
