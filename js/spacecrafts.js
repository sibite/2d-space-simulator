class RocketModule {
	constructor(blueprint) {
		this.uid = ph(blueprint.uid, "unknown-"+Math.floor(Math.random()*1000000000));
		this.name = ph(blueprint.name, this.uid);
		this.hitboxes = ph(blueprint.hitboxes, {x: -1, y: 1, width: 2, height: 2});
		this.image = blueprint.image;
		let placeholder = new Image();
		placeholder.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAA
		QCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA
		7DAcdvqGQAAABLSURBVDhP3Y+xEcBADINcZP8xs8an4VSg9wLh6ESj2Xifc5W5UReZG3WRu
		VEXmRt1kblRF5kbdZG5URf/fW5DXWRu1EXmRl1kFjMfcHr0gYUbHK8AAAAASUVORK5CYII=`;
		this.image.element = placeholder;
		this.engines = blueprint.engines;
	}

	clone() {
		return new this.constructor(this);
	}

	setImage(image) {
		this.image.element = image;
	}
}

class Rocket {
	constructor(universe, blueprintUID, state) {
		this.universe = universe;
		this.blueprint = universe.blueprints.rockets[blueprintUID];
		this.modules = [];
		this.blueprint.modules.forEach(function(moduleInfo) {
			let uid = moduleInfo.uid,
				rocketModuleObject = new RocketModule(universe.blueprints.rocketModules[uid]),
				rocketModule = {
					x: moduleInfo.x,
					y: moduleInfo.y,
					object: rocketModuleObject
				};
			this.modules.push(rocketModule);
		}.bind(this));

		this.rotation = 0;
		this.trajectory = {celestial: null};
		this.name = this.blueprint.uid;
		state = ph(state, {});
		this.sector = ph(state.sector, new Vector(0, 0));
		this.position = ph(state.position, new Vector(0, 0));
		this.velocity = ph(state.velocity, new Vector(0, 0));
		this.center()
	}

	accelerate(vector, time) {
		this.velocity.add(vector.toLength(vector.length * time));
	}

	getPosition() {
		if (this.trajectory.orbit) {
			return this.trajectory.orbit.orbitedBody.getPosition().add(this.position);
		} else {
			return this.position;
		}
	}

	getSector() {
		return this.trajectory.orbit.orbitedBody.getSector();
	}

	calculateOrbit(orbitedBody) {
		/*
		------STARTING PARAMETERS------
		v -> velocity vector
		r -> position vector
		gm -> gravitional parameter (G*M)

		------PROPERTIES------
		e -> eccentricity
		a -> semi-major axis
		b -> semi-minor axis
		f -> focal length
		period -> orbital period
		tp -> periapsis time
		direction -> clockwise (1) or anticlockwise (-1)

		------ANOMALIES------
		trueAnomaly -> true anomaly
		M -> mean anomaly
		E -> eccentric anomaly
		*/
		/*------PROPERTIES------*/
		let r = this.position.copy(),
			v = this.velocity.copy(),
			gm = this.universe.G * orbitedBody.mass;

		/*------ECCENTRICITY VECTOR, ANGLE AND DIRECTION------*/
		let angle = v.angle - r.angle,
			vSin = Math.sin(angle),
			h = v.length*r.length*vSin,
			ev1 = v.toLength(h*v.length/gm);
			ev1.angle -= Math.PI/2;
		let	ev2 = r.toFactor(),
			e = ev1.copy().subtract(ev2),
			trueAnomaly = (r.angle - e.angle) % (Math.PI*2),
			direction = vSin < 0 ? -1 : 1;

		/*------OTHER ORBIT PARAMETERS------*/
		let a = h*h/(gm*(1-e.length*e.length)),
			f = a*e.length,
			b = Math.sqrt(a*a - f*f);
		if (isNaN(b)) {
			b = -a*Math.sqrt(e.length*e.length - 1);
		}

		/*If orbit is an ellipse*/
		if (e.length < 1) {
			/*Calculating next orbital elements*/
			let period = 2*Math.PI*Math.sqrt(a*a*a/gm);

			/*Calculating ellipse points*/

			/*Calculating first quarter*/
			let points = [],
				absPoints = [];
			for (let degrees = 0; degrees <= 90; degrees += 2) {
				let radians = degrees*Math.PI/180,
					tan = Math.atan(Math.tan(radians) / a * b),
					x = Math.cos(tan) * a,
					y = Math.sin(tan) * b;
				points.push({x: x, y: y});
			}

			/*Calculating other three quarters*/
			let l = points.length;
			for (let i = 0; i < l; i++) {
				let p = points[i];
				points[l*2-2 - i] = {x: -p.x, y: p.y};
				points[l*2-2 + i] = {x: -p.x, y: -p.y};
				points[l*4-4 - i] = {x: p.x, y: -p.y};
			}
			points.pop();
			points.forEach(point => point.x -= f);

			/*Calculating rotated points*/
			points.forEach(point => {
				let absPoint = new Vector(point.x, point.y);
				absPoint.angle += e.angle;
				absPoints.push(absPoint);
			});


			/*------CALCULATING PERIAPSIS TIME------*/
			let rotR = r.toAngle(r.angle - e.angle);
			let cosE = rotR.x / a + e.length,
				sinE = rotR.y / b,
				E = Math.atan2(sinE, cosE),
				M = mod2(direction * (E - e.length * Math.sin(E)), Math.PI*2),
				tp = this.universe.time - M / (Math.PI*2) * period;

			//TEMPORARY ITERATIONS CHECKING
			let	iterations = Math.floor(40 * Math.pow(f / (a - f), 81/100));
			iterations = between(7, iterations + (iterations + 1) % 2, 999);
			console.log("Iterations: "+iterations);

			this.trajectory.orbit = {
				type: "ellipse",
				e: e,
				a: a,
				b: b,
				f: f,
				period: period,
				tp: tp,
				direction: direction,
				orbitedBody: orbitedBody,
				points: points,
				absPoints: absPoints
			};
		}
		else {
			/*Calculating hyperbolic points*/
			let points = [],
				absPoints = [],
				asq = a*a,
				bsq = b*b,
				beforePeriapsis = trueAnomaly > Math.PI || trueAnomaly < 0;
			for (let i = 0; i < 20000; i+=300) {
				let y = i*i,
					x = -Math.sqrt((1 + y*y/bsq)*asq);
				if (vSin < 0) {
					points.push({x: x - f, y: -y});
					if (beforePeriapsis) {
						points.unshift({x: x - f, y: y})
					}
				} else {
					points.push({x: x - f, y: y});
					if (beforePeriapsis) {
						points.unshift({x: x - f, y: -y})
					}
				}
			}

			/*Calculating rotated points*/
			points.forEach(point => {
				let absPoint = new Vector(point.x, point.y);
				absPoint.angle += e.angle;
				absPoints.push(absPoint);
			});
			this.trajectory.orbit = {
				type: "hyperbolic",
				e: e,
				a: a,
				b: b,
				f: f,
				orbitedBody: orbitedBody,
				points: points,
				absPoints: absPoints
			};
		}
	}

	updatePosition(time) {
		/*
		M -> mean anomaly
		E -> eccentric anomaly
		n -> mean motion [angle/s]
		*/
		if (this.trajectory.orbit) {
			let orbit = this.trajectory.orbit;

			/*------CALCULATING ITERATIONS COUNT------*/
			let iterations = Math.floor(40 * Math.pow(orbit.f / (orbit.a - orbit.f), 81/100));
			iterations = between(7, iterations + (iterations + 1) % 2, 999);

			/*------CALCULATING ECCENTRIC ANOMALY------*/
			let n = Math.PI*2/orbit.period,
				M = mod2(orbit.direction*n*(time - orbit.tp), Math.PI*2),
				E = orbit.e > 0.8 ? Math.PI : M;
			for (let i = 0; i < iterations; i++) {
				E = M + orbit.e.length * Math.sin(E);
			}

			/*------CONVERTING E TO POSITION------*/
			let position = new Vector(
				orbit.a * (Math.cos(E) - orbit.e.length),
				orbit.b * Math.sin(E)
			);
			position.angle += orbit.e.angle;
			this.position = position;
		}
		else {

		}
	}

	center() {
		let bottom = Infinity,
			top = -Infinity;

		this.modules.forEach(rocketModule => {
			rocketModule.object.hitboxes.forEach(hitbox => {
				let currentTop = rocketModule.y + hitbox.y,
					currentBottom = currentTop - hitbox.height;
				if (currentTop > top) {
					top = currentTop;
				}
				if (currentBottom < bottom) {
					bottom = currentBottom;
				}
			});
		});

		let height = top - bottom,
			yDifference = height / 2;

		this.modules.forEach(rocketModule => {
			rocketModule.y -= yDifference;
		})

		let positionChange = new Vector(0, yDifference);
		positionChange.angle += this.rotation;
		this.position.add(positionChange);
		if (this.trajectory.celestial) {
			this.calculateOrbit();
		}
	}
}
