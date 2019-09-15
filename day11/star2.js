function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  if (args.length === 1) {
    parsed.serial = parseInt(args[0]);
  } else {
    throw new Error('Enter 1 argument (serial)!');
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
    throw new Error(`Trying to make a square that's too big - this shouldn't happen!`);
  }

  let powerLevelSum = powerLevels[topLeftX][topLeftY][1];

  // add up square size 1 power levels directly across from top left
  for (let x = topLeftX + 1; x < topLeftX + squareSize; x++) {
    powerLevelSum += powerLevels[x][topLeftY][1];
  }
  // add up square size 1 power levels directly below top left
  for (let y = topLeftY + 1; y < topLeftY + squareSize; y++) {
    powerLevelSum += powerLevels[topLeftX][y][1];
  }
  // add the next-over-and-down square's size for square size - 1
  powerLevelSum += powerLevels[topLeftX + 1][topLeftY + 1][squareSize - 1];

  return  powerLevelSum;
}

const gridSize = 300;
const parsed = parseArgs();

const powerLevels = new Array(gridSize + 1).fill(NaN);
powerLevels.forEach((x, i) => {
  powerLevels[i] = new Array(gridSize + 1).fill(NaN);
});

const maxSquarePowerLevel = {
  topLeftX: 0,
  topLeftY: 0,
  size: 0,
  squarePower: Number.MIN_SAFE_INTEGER
};

for (let x = gridSize; x >= 1; x--) {
  for (let y = gridSize; y >= 1; y--) {
    const maxSquareSize = Math.min(gridSize - x + 1, gridSize - y + 1);
    powerLevels[x][y] = new Array(maxSquareSize + 1).fill(NaN);
    powerLevels[x][y][1] = powerLevel(parsed.serial, x, y);

    for (let squareSize = 2; squareSize <= maxSquareSize; squareSize++) {
      const squarePower = squarePowerLevel(x, y, squareSize, gridSize, powerLevels);
      powerLevels[x][y][squareSize] = squarePower;

      if (squarePower > maxSquarePowerLevel.squarePower) {
        maxSquarePowerLevel.topLeftX = x;
        maxSquarePowerLevel.topLeftY = y;
        maxSquarePowerLevel.size = squareSize;
        maxSquarePowerLevel.squarePower = squarePower;
      }
    }
  }
}

console.log(maxSquarePowerLevel);
