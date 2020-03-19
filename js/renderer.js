/*------BASIC RENDERER CLASS------*/

class Renderer {
	constructor(view) {
		this.view = view;
		this.universe = universe;
		this.camera = view.camera;
		this.canvas = view.canvas;
		this.ctx = view.canvas.ctx;
	}

	getOnViewPosition(vector) {
		let cameraX = this.camera.position.x + this.camera.relativePosition.x,
			cameraY = -this.camera.position.y - this.camera.relativePosition.y
		let x = this.canvas.width / 2 +
				(vector.x - cameraX) * this.camera.scale,
			y = this.canvas.height / 2 +
				(-vector.y - cameraY) * this.camera.scale;
		return {x: x, y: y};
	}


	/*------DRAWING FUNCTIONS------*/

	drawCelestial(celestial) {
		let onViewPos = this.getOnViewPosition(celestial.getPosition());

		this.ctx.save();
		this.ctx.translate(onViewPos.x, onViewPos.y);
		this.ctx.save();
		this.ctx.scale(this.camera.scale, this.camera.scale);

		/*------DRAWING CIRCLE------*/
		let circle = new Path2D();
		circle.arc(0, 0, celestial.radius, 0, Math.PI*2);

		this.ctx.lineWidth = 0.2 * celestial.radius;
		this.ctx.strokeStyle = "rgb(255, 255, 255, 0.3)";
		this.ctx.fillStyle = "rgb(255, 255, 255)";
		this.ctx.stroke(circle);
		this.ctx.fill(circle);

		/*------DRAWING NAME------*/
		this.ctx.restore();
		this.ctx.font = "bold 18px sans-serif";
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillStyle = "#00000";
		this.ctx.lineWidth = 3;
		this.ctx.strokeStyle = "#FFFFFF";
		this.ctx.strokeText(celestial.name, 0, 0);
		this.ctx.fillText(celestial.name, 0, 0);

		this.ctx.restore();
	}

	drawTrajectory(object) {
		if (object instanceof Rocket) {
			if (object.trajectory.orbit && object.trajectory.orbit.absPoints) {
				let path = new Path2D();
				object.trajectory.orbit.absPoints.forEach(point => {
					let scrState = this.getOnViewPosition(point.copy().add(object.trajectory.orbit.orbitedBody.getPosition()));
					path.lineTo(scrState.x, scrState.y);
				});
				if (object.trajectory.orbit.type == "ellipse") {
					path.closePath();
				}
				this.ctx.strokeStyle = "rgba(50, 50, 255, 1)";
				this.ctx.lineWidth = 1;
				this.ctx.stroke(path);
			}
		}
	}

	drawSpacecraft(spacecraft) {
		let onViewPos = this.getOnViewPosition(spacecraft.getPosition());

		this.ctx.save();
		this.ctx.translate(onViewPos.x, onViewPos.y);

		/*------DRAWING ICON------*/
		let triangle = new Path2D(),
			a = 20,
			h = a * Math.sqrt(3) / 2;
		triangle.lineTo(-a/2, h/2);
		triangle.lineTo(0, -h/2);
		triangle.lineTo(a/2, h/2);
		triangle.closePath();

		this.ctx.lineWidth = 2;
		this.ctx.fillStyle = "rgba(50, 50, 255, 0.4)";
		this.ctx.strokeStyle = "rgba(50, 50, 255, 1)";
		this.ctx.stroke(triangle);
		this.ctx.fill(triangle);

		this.ctx.restore();
	}
}





/*------UNIVERSER RENDERER CLASS------*/

class UniverseRenderer extends Renderer {
	constructor(view) {
		super(view);
	}

	render() {
		/*------DRAWING BACKGROUND------*/
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		/*------DRAWING TRAJECTORIES------*/
		this.universe.spacecrafts.forEach(function(spacecraft) {
			this.drawTrajectory(spacecraft);
		}.bind(this));

		/*------DRAWING CELESTIAL BODIES------*/
		Object.keys(this.universe.allCelestials).forEach(function(celestialUID) {
			this.drawCelestial(this.universe.allCelestials[celestialUID]);
		}.bind(this));

		/*------DRAWING SPACECRAFTS------*/
		this.universe.spacecrafts.forEach(function(spacecraft) {
			this.drawSpacecraft(spacecraft);
		}.bind(this));


		//temporary time speed
		this.ctx.textBaseline = "bottom";
		this.ctx.textAlign = "start";
		this.ctx.font = "bold 16px sans-serif";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.fillText("Czas x "+parseInt(this.universe.timeSpeed), 10, this.canvas.height - 10);
	}
}
