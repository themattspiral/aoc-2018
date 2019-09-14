function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  if (args.length === 1) {
    parsed.serial = parseInt(args[0]);
  } else if (args.length === 3) {
    parsed.serial = parseInt(args[0]);
    parsed.x = parseInt(args[1]);
    parsed.y = parseInt(args[2]);
  } else {
    throw new Error('Enter 1 argument (serial) or 3 arguments (serial, x, y)!');
  }

  return parsed;
}

function powerLevel(serial, x = 1, y = 1) {
  const rackId = x + 10;
  const power = ((rackId * y) + serial) * rackId;
  const hundreds = Math.floor((power / 100) % 10);
  return hundreds - 5;
}

function squarePowerLevel(topLeftX, topLeftY, squareSize, gridSize, powerLevels) {
  if (topLeftX + squareSize - 1 > gridSize || topLeftY + squareSize - 1 > gridSize) {
    return Number.MIN_SAFE_INTEGER;
  }

  let powerLevelSum = 0;
  for (let x = topLeftX; x < topLeftX + squareSize; x++) {
    for (let y = topLeftY; y < topLeftY + squareSize; y++) {
      powerLevelSum += powerLevels[x][y];
    }
  }

  return  powerLevelSum;
}

const gridSize = 300;
const squareSize = 3;
const parsed = parseArgs();

if (parsed.x && parsed.y) {
  console.log(`Power Level (s:${parsed.serial} x:${parsed.x} y:${parsed.y}): ${powerLevel(parsed.serial, parsed.x, parsed.y)}`);
} else {
  const powerLevels = new Array(gridSize + 1).fill(NaN);
  powerLevels.forEach((x, i) => {
    powerLevels[i] = new Array(gridSize + 1).fill(NaN);
  });

  const maxSquarePowerLevel = {
    topLeftX: 0,
    topLeftY: 0,
    squarePower: Number.MIN_SAFE_INTEGER
  };

  for (let x = gridSize; x >= 1; x--) {
    for (let y = gridSize; y >= 1; y--) {
      powerLevels[x][y] = powerLevel(parsed.serial, x, y);
      const squarePower = squarePowerLevel(x, y, squareSize, gridSize, powerLevels);

      if (squarePower > maxSquarePowerLevel.squarePower) {
        maxSquarePowerLevel.topLeftX = x;
        maxSquarePowerLevel.topLeftY = y;
        maxSquarePowerLevel.squarePower = squarePower;
      }
    }
  }

  console.log(maxSquarePowerLevel);
}
