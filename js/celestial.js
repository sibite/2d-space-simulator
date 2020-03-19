/*------GALAXY CLASS------*/

class Galaxy {
	constructor(data) {
		this.uid = data.uid;
		this.id = data.id;
		this.name = data.name;
		this.type = "Galaxy",
		this.sector = data.sector;
		this.satellites = [];
		this.allSatellites = [];
	}

	addSatellite(satellite) {
		if (this.satellites.indexOf(satellite) == -1) {
			this.satellites.push(satellite);
			this.allSatellites = [];
			this.satellites.forEach(function(satellite) {
				this.allSatellites.push(satellite, ...satellite.allSatellites);
			}.bind(this));
		}
	}
}


/*------MAIN CELESTIAL CLASS------*/

class Celestial {
	constructor(data) {
		this.uid = data.uid;
		this.id = data.id;
		this.name = data.name;
		this.type = "Celestial";
		this.subType = "Custom";
		this.satellites = [];
		this.allSatellites = [];
		this.spacecrafts = [];
	}

	addSatellite(satellite) {
		if (this.satellites.indexOf(satellite) == -1) {
			this.satellites.push(satellite);
			satellite.parent = this;
		}
	}
}


/*------STAR CLASS------*/

class Star extends Celestial {
	constructor(data) {
		super(data);
		this.subType = "Star";
		this.sector = data.sector;
		this.mass = data.mass;
		this.radius = data.radius;
	}

	addSatellite(satellite) {
		super.addSatellite(satellite);
		/*------RECREATING THE "ALL SATELLITES" ARRAY------*/
		this.allSatellites = [];
		this.satellites.forEach(function(satellite) {
			this.allSatellites.push(satellite, ...satellite.satellites);
		}.bind(this));

		/*------PUTTING THE STAR OBJECT TO ITS PLANETS AND MOONS------*/
		satellite.star = this;
		satellite.satellites.forEach(function(moon) {
			moon.star = this;
		}.bind(this))
	}

	getSector() {
		return this.sector;
	}

	getPosition() {
		return new Vector(0, 0);
	}
}


/*------PLANET CLASS------*/

class Planet extends Celestial {
	constructor(data) {
		super(data);
		this.subType = "Planet";
		this.orbitRadius = data.orbitRadius;
		this.orbitInitialAngle = data.orbitAngle;
		this.mass = data.mass;
		this.radius = data.radius;
	}

	getSector() {
		return this.star.getSector();
	}

	getPosition() {
		return Vector.fromAngle(this.orbitInitialAngle, this.orbitRadius);
	}
}


/*------MOON CLASS------*/

class Moon extends Celestial {
	constructor(data) {
		super(data);
		this.subType = "Moon";
		this.orbitRadius = data.orbitRadius;
		this.orbitInitialAngle = data.orbitAngle;
		this.mass = data.mass;
		this.radius = data.radius;
	}

	getSector() {
		return this.star.getSector();;
	}

	getPosition() {
		return this.parent.getPosition()
		.add(Vector.fromAngle(this.orbitInitialAngle, this.orbitRadius));
	}
}
