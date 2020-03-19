/*Publisher-subscriber pattern*/

class Publisher {
	constructor() {
		this.events = [];
	}
	subscribe(event, func) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(func);
	}
	emit(event) {
		for (let i = 0, m = this.events[event].length; i < m; i++) {
			this.events[event][i]();
		}
	}
}


/*Variables existence control*/

function placeholder(variable, placeholder) {
	return variable !== undefined ? variable : placeholder;
}
let ph = placeholder;

function isset(variable) {
	return variable !== undefined;
}

function getProperties(object, properties) {
	let returned = {};
	properties.forEach(property => {
		if (!isset(object[property])) {
			throw new Error("Data property '"+property+"' is undefined");
		}
		returned[property] = object[property];
	});
	return returned;
}


/*Universe typical utilities*/

function toLightYears(meters) {
	return meters / 9460800000000000;
}

function toMeters(lightYears) {
	return lightYears * 9460800000000000;
}


/*Angles*/

function toRadians(degrees) {
	return degrees * Math.PI / 180;
}

function toDegrees(radians) {
	return radians * 180 / Math.PI;
}


/*Math*/

function randomInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function randomFloat(min, max) {
	return min + Math.random() * (max - min);
}

function mod2(a, b) {
	return ((a % b) + b) % b;
}

function between(a, b, c) {
	return Math.min(c, Math.max(b, a));
}
