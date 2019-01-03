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

function buildStepGraph(rules) {
  const processedSteps = {};

  rules.forEach(rule => {
    if (!processedSteps[rule.stepId]) {
      processedSteps[rule.stepId] = {
        id: rule.stepId,
        pre: [],
        next: [],
        completed: false
      };
    }

    if (!processedSteps[rule.preId]) {
      processedSteps[rule.preId] = {
        id: rule.preId,
        pre: [],
        next: [],
        completed: false
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

  return rootSteps;
}

function spacesForLevel(level) {
  return level === 0 ? '' : new Array(level * 2).fill(' ').join('');
}

function print(step, level, levelLimit) {
  if (level > levelLimit) {
    return;
  }
  const s = spacesForLevel(level);
  const end = step.next.length ? '' : '.';
  console.log(`${s}${step.id}${end}`);

  for (let next of step.next) {
    print(next, level + 1, levelLimit);
  }
}

function orderStepsById(a, b) {
  return a.id.localeCompare(b.id);
}

function isStepReadyToComplete(step) {
  console.log(`    Checking pre steps of step ${step.id}`);
  return step.pre.reduce((ready, pre) => ready && pre.completed, true);
}

function stepsSummary(steps) {
  let sum = '';
  if (steps && steps.length) {
    sum = steps.map(s => s.id).join(',');
  }
  return sum;
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

function stepsMapSummary(stepsMap) {
  let sum = '';
  if (stepsMap) {
    sum = Object.keys(stepsMap).join(',');
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

  // let pendingSteps = [].concat(head.next).sort(orderStepsById);
  const pendingStepsMap = {};
  addStepsToMap(pendingStepsMap, rootSteps);

  // while (pendingSteps.length) {
  while (Object.keys(pendingStepsMap).length) {
    // console.log(`Pending steps: [${stepsSummary(pendingSteps)}]`);

    // check all pending steps in order until we have one that is ready
    let pendingIndex = 0;
    const orderedPendingSteps = Object.values(pendingStepsMap).sort(orderStepsById);
    console.log('');
    console.log(`Pending steps (ordered): [${stepsSummary(orderedPendingSteps)}]`);

    while (pendingIndex < orderedPendingSteps.length && !isStepReadyToComplete(orderedPendingSteps[pendingIndex])) {
      console.log(`  Pending Step ${orderedPendingSteps[pendingIndex].id} (${pendingIndex}) is not yet ready`);
      pendingIndex++;
    }

    if (pendingIndex === orderedPendingSteps.length) {
      throw new Error('Error - no pending step is ready to complete!\n' + stepsDebug(orderedPendingSteps));
    }

    // let stepTocomplete = pendingSteps[pendingIndex];
    const stepTocomplete = orderedPendingSteps[pendingIndex];
    console.log(`  Completing ${stepTocomplete.id}`);
    stepTocomplete.completed = true;
    completedOrder += stepTocomplete.id;
    console.log(`  Current order: ${completedOrder}`);
    // pendingSteps.splice(pendingIndex, 1);
    delete pendingStepsMap[stepTocomplete.id];
    // console.log(`  Pending steps after removal: [${stepsSummary(pendingSteps)}]`);
    console.log(`  Pending steps after removal: [${stepsMapSummary(pendingStepsMap)}]`);
    // pendingSteps = pendingSteps.concat(stepTocomplete.next).sort(orderStepsById);
    addStepsToMap(pendingStepsMap, stepTocomplete.next);
    // console.log(`  Pending steps after adding next & sorting: [${stepsSummary(pendingSteps)}]`);
    console.log(`  Pending steps after adding next: [${stepsMapSummary(pendingStepsMap)}]`);
  }

  return completedOrder;
}

const parsedRules = lines.map(fromInputStringToRules);
const rootSteps = buildStepGraph(parsedRules);

// console.log('=========================');
// print(stepGraph, 0, 1);
// console.log('=========================');

const stepOrder = determineStepOrder(rootSteps);

console.log('');
console.log(`Star 1 - Step Order: ${stepOrder}`);
