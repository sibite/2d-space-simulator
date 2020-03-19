function getModel() {
	/*
	Warning! This is not a model from MVC, but a universe model.
	Stars positions are counted in sectors.
	*/

	let sectorSize = 5e+12;

	function getSector(sectorSize, vector) {
		let x = Math.sign(vector.x) * Math.floor(
				(Math.abs(vector.x) + sectorSize) / (sectorSize * 2)
			),
			y = Math.sign(vector.y) * Math.floor(
				(Math.abs(vector.y) + sectorSize) / (sectorSize * 2)
			);
		return {x: x, y: y};
	}

	let model = {
		universe: {
			gravitionalConstant: 6.67e-11,
			sectorSize: sectorSize,
			galaxies: [
				{
					uid: "283847102",
					id: "1",
					name: "Droga Mleczna",
					sector: getSector(sectorSize, new Vector(0, 0)),
					centralBlackHole: {
						uid: "858482937",
						id: "1.0",
						name: "Supermasywna Czarna Dziura",
						mass: 1.78e+41,
						radius: 264566016000000
					},
					stars: [
						{
							uid: "389218379",
							id: "1.1",
							name: "Słońce",
							sector: getSector(sectorSize, Vector.fromAngle(toRadians(250), toMeters(26000))),
							mass: 1.98e+30,
							radius: 696342000,
							planets: [
								{
									uid: "847395385",
									id: "1.1.3",
									name: "Ziemia",
									orbitRadius: 149597887000,
									orbitAngle: 0,
									mass: 5.97e+24,
									radius: 6371000,
									moons: [
										{
											uid: "573957245",
											id: "1.1.3.1",
											name: "Księżyc",
											orbitRadius: 400000000,
											orbitAngle: 0,
											mass: 7.35e+22,
											radius: 1737000
										}
									]
								}
							]
						}
					]
				}
			]
		},
		rockets: [
			{
				uid: "038947285",
				name: "Test rocket",
				modules: [
					{
						uid: "364729173",
						x: 0,
						y: 5
					}
				]
			}
		],
		rocketModules: {
			sets: {
				test_set: [
					{
						uid: "364729173",
						name: "Main Module",
						hitboxes: [
							{
								x: -1,
								y: 5,
								width: 2,
								height: 10
							}
						],
						image: {
							src: "spacecraft_modules/test_set/main_module.svg",
							x: -1,
							y: -5,
							width: 2,
							height: 10
						},
						engines: [
							{
								x: 0,
								y: -5,
								r: 1
							}
						]
					}
				]
			}
		}
	};

	return model;
}
