// Orbit ruleset
//
// Teams orbit around the center point in opposite directions

var ruleset = new Ruleset(server);

ruleset.name = "orbit";

ruleset.properties.bots.radius = 12;
ruleset.properties.orbitSpeed = 0.008;
ruleset.properties.bots.colors[0] = "#78e63a";
ruleset.properties.bots.colors[1] = "#e71d1d";

ruleset.generateObstacles = function() {
	// Central planet
	var obstacles = [
		{ "x": 675, "y": 375, "width": 150, "height": 150 },
	];

	return obstacles;
};

// Disable forward/backward/strafe
ruleset.commands.forward = function(bot) { return; }
ruleset.commands.backward = function(bot) { return; }
ruleset.commands['strafe-left'] = function(bot) { return; }
ruleset.commands['strafe-right'] = function(bot) { return; }

ruleset.setInitialPlacement = function(bot) {
	var positions = [
		// TIE fighters
		{ 'x': 750, 'y': 50 },
		{ 'x': 750, 'y': 125 },
		{ 'x': 750, 'y': 225 },
		{ 'x': 750, 'y': 300 },

		// X-wings
		{ 'x': 750, 'y': 625 },
		{ 'x': 750, 'y': 700 },
		{ 'x': 750, 'y': 800 },
		{ 'x': 750, 'y': 875 },
	];

	if (positions.length > bot.id) {
		bot.x = positions[bot.id].x;
		bot.y = positions[bot.id].y;
	} else {
		// Get a random position
		botPos = this.server.getRandomPoint();
		bot.x = botPos.x;
		bot.y = botPos.y;

		// Loop until we get a position that doesn't collide
		while (this.server.collisionBotObjects(bot)) {
			botPos = this.server.getRandomPoint();
			bot.x = botPos.x;
			bot.y = botPos.y;
		}
	}
};

ruleset.updateBot = function(bot, pos) {
	// Use the latest position
	if (pos == undefined) {
		pos = { x: bot.x, y: bot.y };
	}

	// Get bot's team
	var teams = this.server.getTeams();
	var teamIndex = teams.indexOf(bot.name);

	// Move the bot in orbit around the center point
	var halfWidth = ruleset.properties.world.width / 2;
	var halfHeight = ruleset.properties.world.height / 2;
	var radius = bot.distanceToPoint(pos.x, pos.y, halfWidth, halfHeight);
	var angle = ruleset.properties.orbitSpeed;

	// Switch direction depending on team
	angle = angle * ((teamIndex == 0) ? 1 : -1);

	var x = pos.x - halfWidth;
	var y = pos.y - halfHeight;

	// Rotate around
	var newX = x * Math.cos(angle) - y * Math.sin(angle);
	var newY = y * Math.cos(angle) + x * Math.sin(angle);

	if (!bot.collided) {
		botX = halfWidth + newX;
		botY = halfHeight + newY;
		return { x: botX, y: botY };
	} else {
		return pos;
	}
};

ruleset.draw.obstacle = function(obstacle) {
	var centerX = obstacle.x + (obstacle.width / 2);
	var centerY = obstacle.y + (obstacle.height / 2);
	var radius = obstacle.width / 2;

	this.c.strokeStyle = "#222";
	this.c.lineWidth = 5;
	this.c.fillStyle = "#333";

	this.c.beginPath();
	this.c.arc(centerX, centerY, radius, 0, 2 * Math.PI);
	this.c.closePath();
	this.c.fill();
	this.c.stroke();

	// Laser cavity
	this.c.fillStyle = "#282828";
	this.c.beginPath();
	this.c.arc(centerX + 28, centerY - 29, 16, 0, 2 * Math.PI);
	this.c.closePath();
	this.c.fill();

	this.c.fillStyle = "#2c2c2c";
	this.c.beginPath();
	this.c.arc(centerX + 30, centerY - 27, 14, 0, 2 * Math.PI);
	this.c.closePath();
	this.c.fill();

	// Horizontal line
	this.c.lineWidth = 1;
	this.c.beginPath();
	this.c.moveTo(centerX - radius, centerY);
	this.c.lineTo(centerX + radius, centerY);
	this.c.closePath();
	this.c.stroke();
}

// Stars
ruleset.draw.bgItems = [];
for (var x=0; x<280; x++) {
	ruleset.draw.bgItems.push({ 'x': Math.random() * ruleset.draw.width, 'y': Math.random() * ruleset.draw.height, 'radius': Math.random() * 2 });
}

ruleset.draw.backgroundLayer = function() {
	this.c.fillStyle = "rgba(255, 255, 255, 0.25)";

	for (i in this.bgItems) {
		var item = this.bgItems[i];

		this.c.beginPath();
		this.c.arc(item.x, item.y, item.radius, 0, Math.PI * 2, true);
		this.c.closePath();
		this.c.fill();
	}
};

// Draw bot
ruleset.draw.bot = function(x, y, angle, color, radius, health) {
	var healthValue = parseInt(health * (255 / 100)); // hardcoded for now

	this.c.save();
	this.c.translate(x, y);
	this.c.rotate(angle);

	// Get bot's team
	var teamIndex = this.ruleset.properties.bots.colors.indexOf(color);

	if (teamIndex == 0) {
		// TIE Fighter

		this.c.strokeStyle = "#555";
		this.c.fillStyle = "#555";
		this.c.lineWidth = 2;

		// Draw lines
		this.c.beginPath();
		this.c.moveTo(-radius, -radius);
		this.c.lineTo(radius, -radius);

		this.c.moveTo(-radius, radius);
		this.c.lineTo(radius, radius);

		this.c.moveTo(0, -radius);
		this.c.lineTo(0, radius);
		this.c.closePath();

		this.c.stroke();

		// Draw gray circle
		this.c.beginPath();
		this.c.arc(0, 0, radius * .5, 0, Math.PI * 2, true);
		this.c.closePath();
		this.c.fill();

		// Draw color circle
		this.c.fillStyle = color;
		this.c.beginPath();
		this.c.arc(0, 0, radius * .2, 0, Math.PI * 2, true);
		this.c.closePath();
		this.c.fill();
	} else {
		// X-Wing

		this.c.strokeStyle = "#666";
		this.c.fillStyle = "#666";
		this.c.lineWidth = 2;

		// Wings
		this.c.beginPath();
		this.c.moveTo(-radius * .6, -radius);
		this.c.lineTo(-radius * .2, -radius);
		this.c.lineTo(-radius * .2, radius);
		this.c.lineTo(-radius * .6, radius);
		this.c.lineTo(-radius * .8, radius * .35);
		this.c.lineTo(-radius * .8, -radius * .35);
		this.c.closePath();
		this.c.fill();

		// Guns
		this.c.beginPath();
		this.c.moveTo(-radius * .2, -radius + 1); // offset lineWidth
		this.c.lineTo(radius * .3, -radius + 1);
		this.c.closePath();
		this.c.stroke();

		this.c.beginPath();
		this.c.moveTo(-radius * .2, radius - 1);
		this.c.lineTo(radius * .3, radius - 1);
		this.c.closePath();
		this.c.stroke();

		// Engines
		this.c.beginPath();
		this.c.rect(-radius, -radius * .3, radius * .2, radius * .1);
		this.c.closePath();
		this.c.fill();

		this.c.beginPath();
		this.c.rect(-radius, radius * .3, radius * .2, radius * .1);
		this.c.closePath();
		this.c.fill();

		// Main body
		this.c.beginPath();
		this.c.moveTo(-radius * .2, -radius * .15);
		this.c.lineTo(radius, -0.5);
		this.c.lineTo(radius, 0.5);
		this.c.lineTo(-radius * .2, radius * .15);
		this.c.closePath();
		this.c.fill();

		// Draw color circle
		this.c.fillStyle = color;
		this.c.beginPath();
		this.c.arc(-radius * .45, 0, radius * .2, 0, Math.PI * 2, true);
		this.c.closePath();
		this.c.fill();
	}

	this.c.restore();
};

server.setRuleset(ruleset);
