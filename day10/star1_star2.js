const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);
const pointsRegex = /position=<(.+), (.+)> velocity=<(.+), (.+)>/;

function fromInputStringToPoint(inputString) {
  const matches = pointsRegex.exec(inputString);
  return {
    x: parseInt(matches[1].trim()),
    y: parseInt(matches[2].trim()),
    velocityX: parseInt(matches[3].trim()),
    velocityY: parseInt(matches[4].trim()),
    elapsedX: function (elapsedTime) {
      return this.x + (this.velocityX * elapsedTime);
    },
    elapsedY: function (elapsedTime) {
      return this.y + (this.velocityY * elapsedTime);
    }
  };
}

function getExtremes(points, elapsedTime) {
  return points.reduce((extremes, point) => {
    const elapsedX = point.elapsedX(elapsedTime);
    const elapsedY = point.elapsedY(elapsedTime);
    if (elapsedX < extremes.xMin) extremes.xMin = elapsedX;
    if (elapsedX > extremes.xMax) extremes.xMax = elapsedX;
    if (elapsedY < extremes.yMin) extremes.yMin = elapsedY;
    if (elapsedY > extremes.yMax) extremes.yMax = elapsedY;
    return extremes;
  }, {
    xMin: Number.MAX_SAFE_INTEGER,
    xMax: Number.MIN_SAFE_INTEGER,
    yMin: Number.MAX_SAFE_INTEGER,
    yMax: Number.MIN_SAFE_INTEGER
  });
}

function boxArea(extremes) {
  return (extremes.xMax - extremes.xMin) * (extremes.yMax - extremes.yMin);
}

function findTimeInflection(points) {
  let time = 0;
  let prevArea = Number.MAX_SAFE_INTEGER;
  let initialExtremes = getExtremes(points, 0);
  let currentArea = boxArea(initialExtremes);

  // assume bounding box area gets smaller as time passes, and find the
  // time at which it hits a minimum area (and then starts growing again after)
  while (currentArea < prevArea) {
    prevArea = currentArea;
    time++;
    currentArea = boxArea(getExtremes(points, time));
  }

  return time - 1;
}

function mapPoints(points, elapsedTime) {
  return points.reduce((map, point) => {
    map[`${point.elapsedX(elapsedTime)},${point.elapsedY(elapsedTime)}`] = point;
    return map;
  }, {});
}

function drawPointsWithinBounds(extremes, pointsMap) {
  let str = '';

  for (let y = extremes.yMin; y <= extremes.yMax; y++) {
    for (let x = extremes.xMin; x <= extremes.xMax; x++) {
      str += pointsMap[`${x},${y}`] ? '#' : '.';
    }
    str += '\n';
  }

  console.log(str);
}

const points = lines.map(fromInputStringToPoint);
const minAreaElapsedTime = findTimeInflection(points);
console.log(`Minimum bounding box area for set of points occurs at ${minAreaElapsedTime} sec.`);
console.log('');

const extremes = getExtremes(points, minAreaElapsedTime);
const pointsMap = mapPoints(points, minAreaElapsedTime);
drawPointsWithinBounds(extremes, pointsMap);
