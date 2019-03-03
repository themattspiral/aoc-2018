const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);
const marbleRegex = /(\d+) players; last marble is worth (\d+) points/;

const DEBUG = false;

function fromInputStringToGameParams(inputString) {
  if (!inputString.startsWith('#')) {
    const matches = marbleRegex.exec(inputString);
    return {
      playerCount: parseInt(matches[1]),
      lastMarbleValue: parseInt(matches[2])
    };
  }
}

function printCircle(circle, currentIndex, playerIndex) {
  let str = `[${playerIndex + 1}]  `;
  for (let i = 0; i < circle.length; i++) {
    str += (i === currentIndex) ? ` (${circle[i]})` : ` ${circle[i]}`;
  }
  console.log(str);
}

function playMarbles(playerCount, lastMarbleValue) {
  const playerScores = new Array(playerCount).fill(0);
  const marbles = new Array(lastMarbleValue + 1).fill(0).map((x, i) => i).reverse();

  const circle = [marbles.pop()]; // start with 0 marble in the circle
  let currentMarbleIndex = 0;
  let currentPlayerIndex = 0;

  while (marbles.length) {
    // remove the lowest value marble
    const marbleToPlay = marbles.pop();

    if (circle.length === 1) { // edge case: first marble
      circle.push(marbleToPlay);
      currentMarbleIndex = 1;
      if (DEBUG) console.log('edge, added first played marble to end of list');
    } else {
      if (marbleToPlay % 23 === 0) {
        // accumulate score for the current player
        playerScores[currentPlayerIndex] += marbleToPlay;
        if (DEBUG) console.log(`scoring marbleToPlay (multiple of 23): ${marbleToPlay}`);

        let marbleIndexToRemove = currentMarbleIndex - 7;
        if (marbleIndexToRemove < 0) {
          marbleIndexToRemove = circle.length + marbleIndexToRemove;
        }

        // add marble to remove to score also
        playerScores[currentPlayerIndex] += circle[marbleIndexToRemove];
        if (DEBUG) console.log(`scoring marble to remove at index ${marbleIndexToRemove}: ${circle[marbleIndexToRemove]}`);

        // remove marble
        circle.splice(marbleIndexToRemove, 1);

        // update current index
        if (marbleIndexToRemove >= circle.length) {
          currentMarbleIndex = 0;
        } else {
          currentMarbleIndex = marbleIndexToRemove;
        }
      } else {
        // figure out where to put the marble
        let indexToPlace;
        if (currentMarbleIndex === circle.length - 1) { // current marble is last
          indexToPlace = 1;
          if (DEBUG) console.log(`current marble before change (${circle[currentMarbleIndex]}) is at end, skipping 0 to splice played marble (${marbleToPlay}) at index 1`);
        } else if (currentMarbleIndex === circle.length - 2) { // current marble is 2nd-to-last
          indexToPlace = circle.length;
          if (DEBUG) console.log(`current marble before change (${circle[currentMarbleIndex]}) is at 2nd-to-last, splicing played marble (${marbleToPlay}) to end`);
        } else {
          indexToPlace = currentMarbleIndex + 2;
          if (DEBUG) console.log(`current marble before change (${circle[currentMarbleIndex]}) ok, splicing played marble (${marbleToPlay}) to index ${indexToPlace}`);
        }

        // add the marble and update the current index
        circle.splice(indexToPlace, 0, marbleToPlay);
        currentMarbleIndex = indexToPlace;
      }
    }

    if (DEBUG) {
      printCircle(circle, currentMarbleIndex, currentPlayerIndex);
      console.log('');
    }

    // update to the next player
    currentPlayerIndex++;
    if (currentPlayerIndex > playerCount - 1) {
      currentPlayerIndex = 0;
    }
  }

  return playerScores;
}

function maxScore(scores) {
  let maxScore = 0;
  let maxScoreIndex = -1;

  for (let i=0; i < scores.length; i++) {
    if (scores[i] > maxScore) {
      maxScore = scores[i];
      maxScoreIndex = i;
    }
  }

  return maxScore;
}

const gameParams = lines.map(fromInputStringToGameParams).filter(p => !!p);

gameParams.forEach(p => {
  const scores = playMarbles(p.playerCount, p.lastMarbleValue);
  console.log(`For ${p.playerCount} players & last marble ${p.lastMarbleValue}, high score is ${maxScore(scores)}`);
});
