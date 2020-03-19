let scripts = [
		"utilities.js",
		"vector.js",
		"celestial.js",
		"spacecrafts.js",
		"universe.js",
		"renderer.js",
		"view.js",
		"model.js",
		"main.js"
	];

function load() {
	let scriptsToLoad = scripts;
	function loadScript() {
		if (scriptsToLoad.length > 0) {
			let scriptSrc = scriptsToLoad.shift(),
				scriptEl = document.createElement("script");
			scriptEl.type = "text/javascript";
			scriptEl.onload = loadScript;
			scriptEl.src = "js/"+scriptSrc;
			document.head.appendChild(scriptEl);
		}
	}
	loadScript();
}

window.addEventListener("load", load);
