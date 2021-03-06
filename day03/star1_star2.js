const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);
const claimRegex = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/;

function fromClaimStringToParsedRect(claimString) {
  const matches = claimRegex.exec(claimString);
  const left = parseInt(matches[2]);
  const top = parseInt(matches[3]);
  const width = parseInt(matches[4]);
  const height = parseInt(matches[5]);
  return {
    claimStr: matches[0],
    claimId: matches[1],
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
const nonOverlappingClaims = {};
const overlappingClaims = {};

// compare each claim rect with all the ones after it so that all pairs are compared.
// (i'm not crazy about this nested loop, but haven't thought of a better way)
for (let i = 0; i < parsedClaimRects.length; i++) {
  for (let j = i + 1; j < parsedClaimRects.length; j++) {
    const overlap = overlappingRect(parsedClaimRects[i], parsedClaimRects[j]);

    if (overlap) {
      Object.keys(mapAllSquaresInRect(overlap)).forEach(square => {
        overlappingSquaresMap[square] = true;
      });

      delete nonOverlappingClaims[parsedClaimRects[i].claimId];
      delete nonOverlappingClaims[parsedClaimRects[j].claimId];
      overlappingClaims[parsedClaimRects[i].claimId] = true;
      overlappingClaims[parsedClaimRects[j].claimId] = true;
    } else {
      if (!overlappingClaims[parsedClaimRects[i].claimId]) {
        nonOverlappingClaims[parsedClaimRects[i].claimId] = true;
      }
      if (!overlappingClaims[parsedClaimRects[j].claimId]) {
        nonOverlappingClaims[parsedClaimRects[j].claimId] = true;
      }
    }
  }
}

console.log('Star 1: Unique overlapping square inches:', Object.keys(overlappingSquaresMap).length);
console.log('Star 2: Non-Overlapping Claim IDs:');
Object.keys(nonOverlappingClaims).forEach(claim => {
  console.log(`  ${claim}`);
});
