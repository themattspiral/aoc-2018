const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);
const claimRegex = /#\d+ @ (\d+),(\d+): (\d+)x(\d+)/;

function fromClaimStringToParsedRect(claimString) {
  const matches = claimRegex.exec(claimString);
  const left = parseInt(matches[1]);
  const top = parseInt(matches[2]);
  const width = parseInt(matches[3]);
  const height = parseInt(matches[4]);
  return {
    claim: matches[0],
    left,
    top,
    width,
    height,
    endLeft: left + width,
    endTop: top + height
  };
}

function mapAllSquaresInRect(claimRect) {
  const squares = {};

  for (let x = claimRect.left; x < claimRect.endLeft; x++) {
    for (let y = claimRect.top; y < claimRect.endTop; y++) {
      squares[x + ',' + y] = true;
    }
  }

  return squares;
}

function overlappingRect(claimRectA, claimRectB) {
  const left = Math.max(claimRectA.left, claimRectB.left);
  const top = Math.max(claimRectA.top, claimRectB.top);
  const endLeft = Math.min(claimRectA.endLeft, claimRectB.endLeft);
  const endTop = Math.min(claimRectA.endTop, claimRectB.endTop);

  // 0 or negative area means no overlap
  if (left >= endLeft || top >= endTop) {
    return null;
  } else {
    return {
      left,
      top,
      width: endLeft - left,
      height: endTop - top,
      endLeft,
      endTop
    };
  }
}

const parsedClaimRects = lines.map(fromClaimStringToParsedRect);
const overlappingSquaresMap = {};

// compare each claim rect with all the ones after it so that all pairs are compared.
// (i'm not crazy about this nested loop, but haven't thought of a better way)
for (let i = 0; i < parsedClaimRects.length; i++) {
  for (let j = i + 1; j < parsedClaimRects.length; j++) {
    const overlap = overlappingRect(parsedClaimRects[i], parsedClaimRects[j]);
    if (overlap) {
      Object.keys(mapAllSquaresInRect(overlap)).forEach(square => {
        overlappingSquaresMap[square] = true;
      });
    }
  }
}

console.log(Object.keys(overlappingSquaresMap).length);
