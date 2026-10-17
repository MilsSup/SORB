import assert from 'node:assert/strict';
import test from 'node:test';
import { formatTime, snapTime, timeAtPosition } from '../src/timeline.ts';

test('formats a quarter past the hour without changing it to :30', () => {
  assert.equal(formatTime(9.25), '09:15');
});

test('formats a quarter to the hour and the end of the day', () => {
  assert.equal(formatTime(12.75), '12:45');
  assert.equal(formatTime(19), '19:00');
});

test('keeps selected time inside the 09:00–19:00 day', () => {
  assert.equal(snapTime(8.75), 9);
  assert.equal(snapTime(19.25), 19);
});

test('snaps values on either side of the nearest quarter-hour boundary', () => {
  assert.equal(snapTime(12.12), 12);
  assert.equal(snapTime(12.13), 12.25);
});

test('measures a click from the time axis, excluding the resource column', () => {
  assert.equal(timeAtPosition(360, 100, 800), 12.25);
});

test('uses the visible axis position after horizontal scrolling', () => {
  assert.equal(timeAtPosition(100, -240, 800), 13.25);
});

test('selects the same time at all three hour widths', () => {
  assert.equal(timeAtPosition(500, 200, 800), 12.75);
  assert.equal(timeAtPosition(620, 200, 1120), 12.75);
  assert.equal(timeAtPosition(740, 200, 1440), 12.75);
});

test('clamps pointer positions outside the time axis', () => {
  assert.equal(timeAtPosition(50, 100, 800), 9);
  assert.equal(timeAtPosition(950, 100, 800), 19);
});

test('falls back to the start of the day when the axis has no usable width', () => {
  assert.equal(timeAtPosition(500, 200, 0), 9);
  assert.equal(timeAtPosition(500, 200, -100), 9);
});
