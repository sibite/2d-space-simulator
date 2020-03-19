let model = getModel(),
	universe = new Universe(model),
	view = new View(universe);

let earth = universe.allCelestials["847395385"];

//let speed1 = Math.sqrt(universe.G * earth.mass / (6371000 + 3000000));
//let speed2 = Math.sqrt(universe.G * earth.mass / (6371000 + 4000000))
let rocket1 = new Rocket(
	universe,
	"038947285",
	{
		sector: earth.star.sector,
		position: Vector.fromAngle(toRadians(0), 6371000 + 2000 * 1000),
		velocity: Vector.fromAngle(toRadians(90), 9200)
	}
);
let rocket2 = new Rocket(
	universe,
	"038947285",
	{
		sector: earth.star.sector,
		position: Vector.fromAngle(toRadians(0), 6371000 + 3000 * 1000),
		velocity: Vector.fromAngle(toRadians(90), 9000)
	}
);

/*for (let i = 0; i < 30; i++) {
	let angle = randomFloat(0, 360);
	let rocket = new Rocket(
		universe,
		"038947285",
		{
			sector: earth.star.sector,
			position: Vector.fromAngle(toRadians(angle), 6371000 + randomFloat(1000000, 50000000)),
			velocity: Vector.fromAngle(toRadians(angle + randomFloat(0, 180)), randomFloat(2000, 9000))
		}
	);
	universe.putSpacecraft(rocket, earth);
	if (rocket.trajectory.orbit.type == "hyperbolic" || rocket.trajectory.orbit.a-rocket.trajectory.orbit.f < earth.radius) {
		universe.removeSpacecraft(rocket);
	}
}*/

universe.putSpacecraft(rocket1, earth);
//universe.putSpacecraft(rocket2, earth);

view.lockCamera(earth);
view.camera.scale = view.canvas.minSize / 100000000;
universe.timeSpeed = 4096;
universe.resume();



document.body.addEventListener("keypress", function(event) {
	if (event.code == "Minus") {
		universe.timeSpeed /= 2;
	}
	else if (event.code == "Equal") {
		universe.timeSpeed *= 2;
	}
	else if (event.code == "KeyR") {
		universe.timeSpeed *= -1;
	}
});
