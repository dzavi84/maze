const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 5;
const cellsVertical = 5;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width,
		height,
		wireframes: false,
	},
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
	Bodies.rectangle(width / 5, 0, width, 5, {
		isStatic: true,
	}),
	Bodies.rectangle(width / 5, height, width, 5, {
		isStatic: true,
	}),
	Bodies.rectangle(0, height / 5, 5, height, {
		isStatic: true,
	}),
	Bodies.rectangle(width, height / 5, 5, height, {
		isStatic: true,
	}),
];
World.add(world, walls);

//Maze generation

const shuffle = (arr) => {
	let counter = arr.length;

	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);
		counter--;

		const temp = arr[counter];
		arr[counter] = arr[index];
		arr[index] = temp;
	}
	return arr;
};

const grid = Array(cellsVertical)
	.fill(null)
	.map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
	.fill(null)
	.map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
	.fill(null)
	.map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepTroughCell = (row, column) => {
	if (grid[row][column]) {
		return;
	}
	grid[row][column] = true;

	const neighbors = shuffle([
		[row - 1, column, 'up'],
		[row, column + 1, 'right'],
		[row + 1, column, 'down'],
		[row, column - 1, 'left'],
	]);

	for (let neighbor of neighbors) {
		const [nextRow, nextColumn, direction] = neighbor;
		if (
			nextRow < 0 ||
			nextRow >= cellsVertical ||
			nextColumn < 0 ||
			nextColumn >= cellsHorizontal
		) {
			continue;
		}
		if (grid[nextRow][nextColumn]) {
			continue;
		}

		if (direction === 'left') {
			verticals[row][column - 1] = true;
		} else if (direction === 'right') {
			verticals[row][column] = true;
		} else if (direction === 'up') {
			horizontals[row - 1][column] = true;
		} else if (direction === 'down') {
			horizontals[row][column] = true;
		}

		stepTroughCell(nextRow, nextColumn);
	}
};
stepTroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}
		const wall = Bodies.rectangle(
			columnIndex * unitLengthX + unitLengthX / 2,
			rowIndex * unitLengthY + unitLengthY,
			unitLengthX,
			5,
			{ label: 'wall', isStatic: true, render: { fillStyle: 'red' } }
		);
		World.add(world, wall);
	});
});
verticals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}
		const wall = Bodies.rectangle(
			columnIndex * unitLengthX + unitLengthX,
			rowIndex * unitLengthY + unitLengthY / 2,
			5,
			unitLengthY,
			{ label: 'wall', isStatic: true, render: { fillStyle: 'red' } }
		);
		World.add(world, wall);
	});
});
// Goal
const goal = Bodies.rectangle(
	width - unitLengthX / 2,
	height - unitLengthY / 2,
	unitLengthX * 0.7,
	unitLengthY * 0.7,
	{ label: 'goal', isStatic: true, render: { fillStyle: 'green' } }
);
World.add(world, goal);
// ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
	label: 'goal',
	render: { fillStyle: 'blue' },
});

World.add(world, ball);

document.addEventListener('keydown', (event) => {
	const { x, y } = ball.velocity;
	if (event.keyCode === 87) {
		Body.setVelocity(ball, { x, y: y - 5 });
	}
	if (event.keyCode === 68) {
		Body.setVelocity(ball, { x: x + 5, y });
	}
	if (event.keyCode === 83) {
		Body.setVelocity(ball, { x, y: y + 5 });
	}
	if (event.keyCode === 65) {
		Body.setVelocity(ball, { x: x - 5, y });
	}
});
// Win Condition

Events.on(engine, 'collisionStart', (event) => {
	event.pairs.forEach((collision) => {
		const labels = ['ball', 'goal'];
		if (
			labels.includes(collision.bodyA.label) &&
			labels.includes(collision.bodyB.label)
		) {
			document.querySelector('.winner').classList.remove('hidden');
			world.gravity.y = 1;
			world.bodies.forEach((body) => {
				if (body.label === 'wall') {
					Body.setStatic(body, false);
				}
			});
		}
	});
});
