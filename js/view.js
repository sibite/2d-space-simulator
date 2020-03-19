class View {
	constructor(universe, views) {
		this.universe = universe;
		this.universe.view = this;
		this.views = views;

		this.camera = {
			lockedTo: null,
			positionSystem: "outsideSector",
			sector: {x: 0, y: 0},
			relativePosition: new Vector(0, 0),
			scale: 0.00002
		};

		this.canvas = {};
		this.canvas.element = document.createElement("canvas");
		this.canvas.ctx = this.canvas.element.getContext("2d");
		document.body.innerHTML = "";
		document.body.appendChild(this.canvas.element);

		this.resize();

		/*------CREATING RENDERERS------*/
		this.universeRenderer = new UniverseRenderer(this);

		window.addEventListener("resize", function() {this.resize();}.bind(this));
	}

	resize(width, height) {
		width = ph(width, window.innerWidth);
		height = ph(height, window.innerHeight);
		this.canvas.ratio = window.devicePixelRatio;
		this.canvas.width = this.canvas.element.width = width * this.canvas.ratio;
		this.canvas.height = this.canvas.element.height = height * this.canvas.ratio;
		this.canvas.element.style.width = (this.canvas.styleWidth = width) + "px";
		this.canvas.element.style.height = (this.canvas.styleHeight = height) + "px";
		this.canvas.minSize = Math.min(this.canvas.width, this.canvas.height);
		this.canvas.maxSize = Math.max(this.canvas.width, this.canvas.height);
	}

	/*------CAMERA------*/

	lockCamera(object) {
		this.camera.lockedTo = object;
	}

	/*------RENDERING------*/

	render() {
		let lockedTo = this.camera.lockedTo;

		if (lockedTo) {
			this.camera.position = lockedTo.getPosition();
			this.camera.sector = lockedTo.getSector();
			this.camera.relativePosition.x = -25000000;
			this.camera.relativePosition.y = 0;
		}

		this.universeRenderer.render();
		
		/*------SETTING NEXT FRAME------*/
		window.requestAnimationFrame(function() {this.universe.nextFrame()}.bind(this));
	}
}
