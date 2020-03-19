class Universe {
	constructor(model, savedWorld) {
		/*Generating universe model*/

		/*Basic constants*/
		this.SECTOR_SIZE = model.universe.sectorSize;
		this.G = model.universe.gravitionalConstant;

		/*Basic variables*/
		this.time = 0;
		this.timeSpeed = 1;
		this.paused = true;

		/*------UNIVERSE STRUCTURE------*/

		this.allCelestials = {};
		/*------GALAXIES------*/
		this.galaxies = [];
		model.universe.galaxies.forEach(function(galaxy) {
			let galaxyObject = new Galaxy(galaxy);

			/*------STARS------*/
			let stars = [];
			galaxy.stars.forEach(function(star) {
				let starObject = new Star(star);

				/*------PLANETS------*/
				let planets = [];
				star.planets.forEach(function(planet) {
					let planetObject = new Planet(planet);

					/*------MOONS------*/
					planet.moons.forEach(function(moon) {
						let moonObject = new Moon(moon);
						planetObject.addSatellite(moonObject);
						this.allCelestials[moonObject.uid] = moonObject;
					}.bind(this));
					/*------PLANET CONTINUATION------*/
					starObject.addSatellite(planetObject);
					this.allCelestials[planetObject.uid] = planetObject;
				}.bind(this));
				/*------STAR CONTINUATION------*/
				galaxyObject.addSatellite(starObject);
				this.allCelestials[starObject.uid] = starObject;
			}.bind(this));
			/*------GALAXY CONTINUATION------*/
			this.galaxies.push(galaxyObject);
		}.bind(this));
		/*------END GALAXIES------*/


		/*------BLUEPRINTS------*/

		/*------ROCKET MODULES------*/
		let rocketModules = {};
		Object.keys(model.rocketModules.sets).forEach(function(setKey) {
			model.rocketModules.sets[setKey].forEach(function(rocketModule) {
				rocketModules[rocketModule.uid] = rocketModule;
			})
		});

		/*------ROCKETS------*/
		let rockets = {};
		model.rockets.forEach(function(rocket) {
			rockets[rocket.uid] = rocket;
		})

		this.blueprints = {
			rocketModules: rocketModules,
			rockets: rockets
		};

		/*------ARRAYS------*/
		this.spacecrafts = [];
	}

	putSpacecraft(spacecraft, orbitedBody) {
		orbitedBody.spacecrafts.push(spacecraft);
		this.spacecrafts.push(spacecraft);
		spacecraft.trajectory.celestial = orbitedBody;
		spacecraft.calculateOrbit(orbitedBody);
	}

	removeSpacecraft(spacecraft) {
		this.spacecrafts.splice(this.spacecrafts.indexOf(spacecraft));
	}

	resume() {
		this.lastFrameTime = Date.now();
		this.paused = false;
		this.nextFrame();
	}

	pause() {
		this.paused = true;
	}

	nextFrame() {
		if (this.paused) {
			return;
		}
		/*------CALCULATING TIME------*/
		let now = Date.now();
		this.framePassedTime = (now - this.lastFrameTime) / 1000 * this.timeSpeed;
		this.lastFrameTime = now;
		this.time += this.framePassedTime;
		//console.log(1 / (this.framePassedTime / this.timeSpeed));

		/*------MOVING SPACECRAFTS------*/
		this.spacecrafts.forEach(function(spacecraft) {
			spacecraft.updatePosition(this.time);
		}.bind(this));

		/*------INFORMING VIEW TO RENDER------*/
		if (this.view) {
			this.view.render();
		}
	}
}
