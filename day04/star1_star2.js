const fs = require('fs');
const moment = require('moment');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);
const timestampRegex = /\[(.+)\]/;
const shiftRegex = /Guard #(\d+)/;

const SHIFT_EVENT = {
  BEGIN: 'BEGIN',
  SLEEP: 'SLEEP',
  WAKE: 'WAKE'
};

function fromRecordStringToShiftEvent(recordString) {
  const timestamp = moment(timestampRegex.exec(recordString)[1]);
  let event, guard;

  if (recordString.endsWith('begins shift')) {
    event = SHIFT_EVENT.BEGIN;
    guard = shiftRegex.exec(recordString)[1];
  } else if (recordString.endsWith('falls asleep')) {
    event = SHIFT_EVENT.SLEEP;
  } else if (recordString.endsWith('wakes up')) {
    event = SHIFT_EVENT.WAKE;
  }

  return {
    timestamp,
    event,
    guard
  };
}

function compareTimestamp(eventA, eventB) {
  if (eventA.timestamp.isBefore(eventB.timestamp)) return -1;
  if (eventA.timestamp.isAfter(eventB.timestamp)) return 1;
  return 0;
}

function bucketSleepIntervalsBuGuard(sortedShiftEvents) {
  const sleepIntervalsByGuard = {};

  let lastBeginShiftEvent;
  let lastSleepEvent;
  for (let i = 0; i < sortedShiftEvents.length; i++) {
    if (sortedShiftEvents[i].event === SHIFT_EVENT.BEGIN) {
      if (!sleepIntervalsByGuard[sortedShiftEvents[i].guard]) {
        sleepIntervalsByGuard[sortedShiftEvents[i].guard] = {
          intervals: [],
          sumMinutes: 0
        };
      }

      // if lastSleepEvent is not null here, guard slept through end of shift - don't need to handle this
      lastSleepEvent = null;
      lastBeginShiftEvent = sortedShiftEvents[i];
    } else if (sortedShiftEvents[i].event === SHIFT_EVENT.SLEEP) {
      lastSleepEvent = sortedShiftEvents[i];
    } else if (sortedShiftEvents[i].event === SHIFT_EVENT.WAKE) {
      if (lastSleepEvent) {
        const interval = {
          sleepTimestamp: lastSleepEvent.timestamp,
          wakeTimestamp: sortedShiftEvents[i].timestamp,
          durationMinutes: sortedShiftEvents[i].timestamp.diff(lastSleepEvent.timestamp, 'minutes')
        };
        sleepIntervalsByGuard[lastBeginShiftEvent.guard].intervals.push(interval);
        sleepIntervalsByGuard[lastBeginShiftEvent.guard].sumMinutes += interval.durationMinutes;

        lastSleepEvent = null;
      } else {
        // if lastSleepEvent is null, guard woke without sleeping. should not happen!
        console.log(`ERROR: guard ${lastBeginShiftEvent.guard} woke without sleeping at ${sortedShiftEvents[i].timestamp}`);
      }
    }
  }

  return sleepIntervalsByGuard;
}

function findSleepiestGuard(sleepIntervalsByGuard) {
  return Object.keys(sleepIntervalsByGuard).reduce((maxGuard, guard) => {
    if (sleepIntervalsByGuard[guard].sumMinutes > maxGuard.sumMinutes) {
      return {
        guard: guard,
        sumMinutes: sleepIntervalsByGuard[guard].sumMinutes
      };
    } else {
      return maxGuard;
    }
  }, {
    guard: null,
    sumMinutes: 0
  }).guard;
}

function minutesInInterval(interval) {
  const mins = [];
  for (let i = interval.sleepTimestamp.minute(); i < interval.wakeTimestamp.minute(); i++) {
    mins.push(i);
  }
  return mins;
}

function minuteHistogramForIntervals(intervals) {
  const histogram = {};

  intervals.forEach(interval => {
    minutesInInterval(interval).forEach(minute => {
      if (!histogram[minute]) {
        histogram[minute] = 1;
      } else {
        histogram[minute] += 1;
      }
    });
  });

  return histogram;
}

function getMinuteWithMaxCount(minuteHistogram) {
  return Object.keys(minuteHistogram).reduce((maxMinute, minute) => {
    if (minuteHistogram[minute] > maxMinute.count) {
      return {
        minute: minute,
        count: minuteHistogram[minute]
      };
    } else {
      return maxMinute;
    }
  }, {
    minute: null,
    count: 0
  });
}

const shiftEvents = lines.map(fromRecordStringToShiftEvent).sort(compareTimestamp);
const sleepIntervalsByGuard = bucketSleepIntervalsBuGuard(shiftEvents);
let overallMaxMinuteCount = {
  guard: null,
  minuteWithMaxCount: {
    minute: null,
    count: 0
  }
};
Object.keys(sleepIntervalsByGuard).forEach(guard => {
  sleepIntervalsByGuard[guard].minuteHistogram = minuteHistogramForIntervals(sleepIntervalsByGuard[guard].intervals);
  sleepIntervalsByGuard[guard].minuteWithMaxCount = getMinuteWithMaxCount(sleepIntervalsByGuard[guard].minuteHistogram);
  if (sleepIntervalsByGuard[guard].minuteWithMaxCount.count > overallMaxMinuteCount.minuteWithMaxCount.count) {
    overallMaxMinuteCount.guard = guard;
    overallMaxMinuteCount.minuteWithMaxCount = sleepIntervalsByGuard[guard].minuteWithMaxCount;
  }
});
const sleepiestGuard = findSleepiestGuard(sleepIntervalsByGuard);
const sleepiestGuardsSleepiestMinute = sleepIntervalsByGuard[sleepiestGuard].minuteWithMaxCount.minute;

console.log(`Star 1:`);
console.log(`  Sleepiest Guard: #${sleepiestGuard}`);
console.log(`  #${sleepiestGuard}'s Sleepiest Minute: ${sleepiestGuardsSleepiestMinute}`);
console.log(`  ${sleepiestGuard} * ${sleepiestGuardsSleepiestMinute} = ${parseInt(sleepiestGuard) * sleepiestGuardsSleepiestMinute}`);
console.log(`Star 2:`);
console.log(`  Overall max minute count: ${overallMaxMinuteCount.minuteWithMaxCount.count}`);
console.log(`  Minute with this count: ${overallMaxMinuteCount.minuteWithMaxCount.minute}`);
console.log(`  Guard with this minute count: #${overallMaxMinuteCount.guard}`);
console.log(`  ${overallMaxMinuteCount.guard} * ${overallMaxMinuteCount.minuteWithMaxCount.minute} = ${parseInt(overallMaxMinuteCount.guard) * overallMaxMinuteCount.minuteWithMaxCount.minute}`);
