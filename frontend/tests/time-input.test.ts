import assert from 'node:assert/strict';
import test from 'node:test';
import { editTime, getTimeError, isTimeRangeValid, normalizeTime, timeOptions, timeToMinutes } from '../src/time-input.ts';

test('regex accepts only complete 24-hour times', () => {
  for (const value of ['00:00', '09:05', '13:10', '23:59']) assert.notEqual(timeToMinutes(value), null);
  for (const value of ['', '9:05', '24:00', '12:60', 'aa:bb', '13:3_', '1_:__', '13:30\n', '13:30 extra']) assert.equal(timeToMinutes(value), null, value);
});

test('four digits overwrite the time mask and skip the colon', () => {
  let value = '';
  let caret = 0;
  for (const key of '1330') ({ value, caret } = editTime(value, caret, caret, key));
  assert.deepEqual({ value, caret }, { value: '13:30', caret: 5 });
});

test('editing hours or minutes preserves the other segment', () => {
  assert.deepEqual(editTime('13:30', 0, 2, '0'), { value: '0_:30', caret: 1 });
  assert.deepEqual(editTime('13:30', 3, 5, '4'), { value: '13:4_', caret: 4 });
  assert.deepEqual(editTime('13:30', 3, 3, '1'), { value: '13:10', caret: 4 });
});

test('backspace and delete clear digit slots without getting stuck on the colon', () => {
  assert.deepEqual(editTime('13:30', 3, 3, 'Backspace'), { value: '1_:30', caret: 1 });
  assert.deepEqual(editTime('13:30', 2, 2, 'Delete'), { value: '13:_0', caret: 3 });
  assert.deepEqual(editTime('13:30', 0, 5, 'Backspace'), { value: '', caret: 0 });
});

test('normalizes pasted compact and single-hour values without silently fixing invalid times', () => {
  assert.equal(normalizeTime('1330'), '13:30');
  assert.equal(normalizeTime('930'), '09:30');
  assert.equal(normalizeTime(' 9:30 '), '09:30');
  assert.equal(normalizeTime('25:00'), '25:00');
  assert.equal(normalizeTime('tomorrow 13:30'), null);
});

test('end must be strictly later than start, and both values must be valid', () => {
  assert.equal(isTimeRangeValid('13:00', '13:01'), true);
  assert.equal(isTimeRangeValid('13:00', '13:00'), false);
  assert.equal(isTimeRangeValid('15:00', '13:00'), false);
  assert.equal(isTimeRangeValid('23:00', '00:30'), false);
  assert.equal(isTimeRangeValid('13:__', '15:00'), false);
  assert.equal(getTimeError('13:00', { after: '13:00' }), 'Окончание должно быть позже начала.');
});

test('revalidates an existing end when the start changes, without restricting manually typed minutes', () => {
  assert.equal(getTimeError('13:10', { after: '13:00' }), '');
  assert.notEqual(getTimeError('13:10', { after: '14:00' }), '');
  assert.notEqual(getTimeError('', { required: true }), '');
  assert.equal(getTimeError(''), '');
});

test('availability bounds are inclusive', () => {
  assert.equal(getTimeError('09:00', { min: '09:00', max: '19:00' }), '');
  assert.equal(getTimeError('19:00', { min: '09:00', max: '19:00' }), '');
  assert.notEqual(getTimeError('08:59', { min: '09:00' }), '');
  assert.notEqual(getTimeError('19:01', { max: '19:00' }), '');
});

test('clock list uses quarter-hours and excludes times at or before the start', () => {
  const all = timeOptions();
  assert.equal(all.length, 96);
  assert.equal(all[0], '00:00');
  assert.equal(all.at(-1), '23:45');
  assert.deepEqual(timeOptions({ min: '09:00', max: '10:00', after: '09:10' }), ['09:15', '09:30', '09:45', '10:00']);
  assert.deepEqual(timeOptions({ min: '09:00', max: '10:00', after: '09:15' }), ['09:30', '09:45', '10:00']);
  assert.deepEqual(timeOptions({ after: '23:59' }), []);
});
