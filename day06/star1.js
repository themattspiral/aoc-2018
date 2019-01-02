const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);
const coordsRegex = /(\d+), (\d+)/;

function fromInputStringToCoords(inputString) {
  const matches = coordsRegex.exec(inputString);
  return {
    x: parseInt(matches[1]),
    y: parseInt(matches[2])
  };
}

function findExtremesAndEdgeCoords(coords) {
  const minXandCoords = {
    value: Number.MAX_SAFE_INTEGER,
    coords: []
  };
  const minYandCoords = {
    value: Number.MAX_SAFE_INTEGER,
    coords: []
  };
  const maxXandCoords = {
    value: 0,
    coords: []
  };
  const maxYandCoords = {
    value: 0,
    coords: []
  };

  coords.forEach(coord => {
    if (coord.x < minXandCoords.value) {
      minXandCoords.value = coord.x;
      minXandCoords.coords = [coord];
    } else if (coord.x === minXandCoords.value) {
      minXandCoords.coords.push(coord);
    }

    if (coord.y < minYandCoords.value) {
      minYandCoords.value = coord.y;
      minYandCoords.coords = [coord];
    } else if (coord.y === minYandCoords.value) {
      minYandCoords.coords.push(coord);
    }

    if (coord.x > maxXandCoords.value) {
      maxXandCoords.value = coord.x;
      maxXandCoords.coords = [coord];
    } else if (coord.x === maxXandCoords.value) {
      maxXandCoords.coords.push(coord);
    }

    if (coord.y > maxYandCoords.value) {
      maxYandCoords.value = coord.y;
      maxYandCoords.coords = [coord];
    } else if (coord.y === maxYandCoords.value) {
      maxYandCoords.coords.push(coord);
    }
  });

  const uniqueEdgeCoords =
    [ ...minXandCoords.coords, ...minYandCoords.coords,
      ...maxXandCoords.coords, ...maxYandCoords.coords ]
      .reduce((edgeCoords, coord) => {
        edgeCoords[`${coord.x},${coord.y}`] = coord;
        return edgeCoords;
      }, {});

  return {
    minXandCoords,
    minYandCoords,
    maxXandCoords,
    maxYandCoords,
    uniqueEdgeCoords
  };
}

function mapAllPointsForBounds(x1, y1, x2, y2) {
  const squares = {};

  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      squares[x + ',' + y] = {
        x,
        y
      };
    }
  }

  return squares;
}

function taxicabDistance(coord1, coord2) {
  return Math.abs(coord1.x - coord2.x) + Math.abs(coord1.y - coord2.y);
}

function calcTaxicabDistanceAndBucketByClosetCoord(allPoints, coords) {
  const closestPointsByCoord = {};

  Object.values(allPoints).forEach(point => {

    // compare the poont to each coord and find the min distance
    let minDistance = Number.MAX_SAFE_INTEGER;
    let distanceToCoordMap = {};
    coords.forEach(coord => {
      const distance = taxicabDistance(coord, point);

      if (distanceToCoordMap[distance]) {
        distanceToCoordMap[distance].push(coord);
      } else {
        distanceToCoordMap[distance] = [coord];
      }

      if (distance < minDistance) {
        minDistance = distance;
      }
    });

    // only bucket point if it 'belongs' to 1 coord (e.g. if there is 1 single min distance)
    if (distanceToCoordMap[minDistance].length === 1) {
      const coordKey = `${distanceToCoordMap[minDistance][0].x},${distanceToCoordMap[minDistance][0].y}`;

      if (closestPointsByCoord[coordKey]) {
        closestPointsByCoord[coordKey].push(point);
      } else {
        closestPointsByCoord[coordKey] = [point];
      }
    }
  });

  return closestPointsByCoord;
}

function getMaxPointsCount(pointsByCoord) {
  return Object.values(pointsByCoord).reduce((max, points) => {
    return points.length > max ? points.length : max;
  }, 0);
}

function filterInvalidCoords(pointsByCoord, extremes) {
  const pointsByValidCoord = {};

  Object.keys(pointsByCoord).forEach(coordKey => {
    const isEdgeCoord = !!extremes.uniqueEdgeCoords[coordKey];
    let hasClosestPointsOnEdge = false;

    // exclude coords if any closest point lies on an edge, indicating it has infinite area
    for (let point of pointsByCoord[coordKey]) {
      if (point.x === extremes.minXandCoords.value || point.x === extremes.maxXandCoords.value
        || point.y === extremes.minYandCoords.value || point.y === extremes.maxYandCoords.value) {
        hasClosestPointsOnEdge = true;
        break;
      }
    }

    if (!isEdgeCoord && !hasClosestPointsOnEdge) {
      pointsByValidCoord[coordKey] = pointsByCoord[coordKey];
    }
  });

  return pointsByValidCoord;
}

const parsedCoords = lines.map(fromInputStringToCoords);
const extremes = findExtremesAndEdgeCoords(parsedCoords);
const allPoints = mapAllPointsForBounds(
  extremes.minXandCoords.value, extremes.minYandCoords.value,
  extremes.maxXandCoords.value, extremes.maxYandCoords.value
);
const closestPointsByCoord = calcTaxicabDistanceAndBucketByClosetCoord(allPoints, parsedCoords);
const closestPointsByValidCoord = filterInvalidCoords(closestPointsByCoord, extremes);
const largestValidArea = getMaxPointsCount(closestPointsByValidCoord);
console.log(`Star 1 - Size of largest valid area: ${largestValidArea}`);
