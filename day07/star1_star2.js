const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);
const stepRuleRegex = /Step (.+) must be finished before step (.+) can begin\./;

function fromInputStringToRules(inputString) {
  const matches = stepRuleRegex.exec(inputString);
  return {
    preId: matches[1],
    stepId: matches[2]
  };
}

function getLetterCompletionTime(letter) {
  const aCode = 'A'.charCodeAt(0);
  return letter.charCodeAt(0) - aCode + 1;
}

function buildStepGraph(rules, completionTimeOffset) {
  const processedSteps = {};

  rules.forEach(rule => {
    if (!processedSteps[rule.stepId]) {
      processedSteps[rule.stepId] = {
        id: rule.stepId,
        pre: [],
        next: [],
        completed: false,
        timeToComplete: getLetterCompletionTime(rule.stepId) + completionTimeOffset
      };
    }

    if (!processedSteps[rule.preId]) {
      processedSteps[rule.preId] = {
        id: rule.preId,
        pre: [],
        next: [],
        completed: false,
        timeToComplete: getLetterCompletionTime(rule.preId) + completionTimeOffset
      };
    }

    processedSteps[rule.stepId].pre.push(processedSteps[rule.preId]);
    processedSteps[rule.preId].next.push(processedSteps[rule.stepId]);
  });

  // allow for multiple root steps
  const rootSteps = [];

  for (let step of Object.values(processedSteps)) {
    if (step.pre.length === 0) {
      rootSteps.push(step);
    }
  }

  return {
    rootSteps,
    uniqueSteps: processedSteps
  };
}

function orderStepsById(a, b) {
  return a.id.localeCompare(b.id);
}

function allPreStepsAreComplete(step) {
  return step.pre.reduce((ready, pre) => ready && pre.completed, true);
}

function stepsDebug(steps) {
  let sum = '';
  if (steps && steps.length) {
    sum = steps.map(s => {
      return `Step ${s.id} - Pre (${s.pre.length}):\n` +
        s.pre.reduce((str, pre) => {
          return str + `  ${pre.id} - ${pre.completed}\n`;
        }, '');
    }).join('');
  }
  return sum;
}

function addStepsToMap(map, steps) {
  if (steps && steps.length) {
    steps.forEach(step => {
      map[step.id] = step;
    });
  }
}

function determineStepOrder(rootSteps) {
  let completedOrder = '';

  const pendingStepsMap = {};
  addStepsToMap(pendingStepsMap, rootSteps);

  while (Object.keys(pendingStepsMap).length) {
    // check all pending steps in order until we have one that is ready
    let pendingIndex = 0;
    const orderedPendingSteps = Object.values(pendingStepsMap).sort(orderStepsById);
    while (pendingIndex < orderedPendingSteps.length && !allPreStepsAreComplete(orderedPendingSteps[pendingIndex])) {
      pendingIndex++;
    }

    // if we went past end of pending queue, nothing is ready - this should not happen if steps are defined correctly
    if (pendingIndex === orderedPendingSteps.length) {
      throw new Error('Error - no pending step is ready to complete!\n' + stepsDebug(orderedPendingSteps));
    }

    const stepToComplete = orderedPendingSteps[pendingIndex];
    stepToComplete.completed = true;
    completedOrder += stepToComplete.id;
    delete pendingStepsMap[stepToComplete.id];
    addStepsToMap(pendingStepsMap, stepToComplete.next);
  }

  return completedOrder;
}

function determineStepOrderWithTime(rootSteps, workerCount, allStepsCount) {
  const result = {
    completedOrder: '',
    seconds: 0
  };

  const pendingStepsMap = {};
  addStepsToMap(pendingStepsMap, rootSteps);

  const workers = new Array(workerCount).fill({}).map(x => {
    return {
      stepBeingWorked: null,
      workStartSecond: 0
    };
  });

  while (result.completedOrder.length < allStepsCount) {
    // first clear out all workers with complete steps.
    // doing this first for ALL workers ensures that the pending queue is full of ALL
    // possible steps to start BEFORE we start loading free workers with pending steps.
    for (let i = 0; i < workerCount; i++) {
      if (workers[i].stepBeingWorked) {
        const elapsed = result.seconds - workers[i].workStartSecond;

        if (elapsed === workers[i].stepBeingWorked.timeToComplete) {
          workers[i].stepBeingWorked.completed = true;
          result.completedOrder += workers[i].stepBeingWorked.id;
          addStepsToMap(pendingStepsMap, workers[i].stepBeingWorked.next);
          workers[i].stepBeingWorked = null;
        }
      }
    }

    // load each worker up with a pending step if worker is free and pending step available
    for (let i = 0; i < workerCount; i++) {
      if (!workers[i].stepBeingWorked) {
        // check all pending steps in order until we have one that is ready
        let pendingIndex = 0;
        const orderedPendingSteps = Object.values(pendingStepsMap).sort(orderStepsById);
        while (pendingIndex < orderedPendingSteps.length && !allPreStepsAreComplete(orderedPendingSteps[pendingIndex])) {
          pendingIndex++;
        }

        // if we went past end of pending queue, nothing is ready so we loop. otherwise, load ready step into worker
        if (pendingIndex < orderedPendingSteps.length) {
          const stepToStart = orderedPendingSteps[pendingIndex];
          workers[i].stepBeingWorked = stepToStart;
          workers[i].workStartSecond = result.seconds;
          delete pendingStepsMap[stepToStart.id];
        }
      }
    }

    // each run of the while loop is 1 sec
    if (result.completedOrder.length < allStepsCount) {
      result.seconds++;
    }
  }

  return result;
}

const parsedRules = lines.map(fromInputStringToRules);
const rootSteps1 = buildStepGraph(parsedRules);
const stepOrder = determineStepOrder(rootSteps1.rootSteps);
console.log(`Star 1 - Step Order: ${stepOrder}`);

const workerCount = 5;
const completionTimeOffset = 60;
const rootSteps2 = buildStepGraph(parsedRules, completionTimeOffset);
const stepOrderAndTime = determineStepOrderWithTime(rootSteps2.rootSteps, workerCount, Object.keys(rootSteps2.uniqueSteps).length);
console.log(`Star 2 - Time: ${stepOrderAndTime.seconds} seconds ( Step Order: ${stepOrderAndTime.completedOrder} )`);
