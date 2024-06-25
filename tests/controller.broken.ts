/**
 * @jest-environment jsdom
 */

import { describe, expect, test, afterEach, jest } from '@jest/globals';
import {
  calcPercentOfValue,
  convertAllPropsToPx,
  getTotalDuration,
} from '../src/parallax';
import scenes1 from './scenes1';

// // Save original window so we can restore it after tests.
const originalWindowHeight = window.innerHeight;
const originalWindowWidth = window.innerWidth;

// // // Restore window after each test to avoid state leaking.
afterEach(() => {
  window.innerHeight = originalWindowHeight;
  window.innerWidth = originalWindowWidth;
});

test('calcPercentOfValue', () => {
  const half = calcPercentOfValue(50, 1000);
  const halfnearlyhigh = calcPercentOfValue(50.1, 1000);
  const halfnearlylow = calcPercentOfValue(49.9, 1000);
  const zero = calcPercentOfValue(0, 1000);
  const twofifty = calcPercentOfValue(250, 50);
  const fractionlow = calcPercentOfValue(50, 4.9);
  const fractionmid = calcPercentOfValue(50, 5);
  const fractionhigh = calcPercentOfValue(50, 5.1);
  const negative = calcPercentOfValue(-100, 25);
  const hundredofnothing = calcPercentOfValue(100, 0);

  expect(half).toBe(500);
  expect(halfnearlyhigh).toBe(501);
  expect(halfnearlylow).toBe(499);
  expect(zero).toBe(0);
  expect(twofifty).toBe(125);
  expect(fractionlow).toBe(2);
  expect(fractionmid).toBe(3);
  expect(fractionhigh).toBe(3);
  expect(negative).toBe(-25);
  expect(hundredofnothing).toBe(0);
});

test('convertAllPropsToPx', () => {
  window.innerHeight = 800;
  window.innerWidth = 1200;

  convertAllPropsToPx(scenes1);

  expect(scenes1[0].duration).toBe(1200);
  expect(scenes1[1].duration).toBe(400);
  expect(scenes1[0].animations[0].translateY['positions']).toStrictEqual([
    0, 0, -200, 200,
  ]);
  expect(scenes1[0].animations[0].translateY['keys']).toStrictEqual([
    0, 480, 960, 1200,
  ]);
});

test('getTotalDuration', () => {
  // const totalDuration = getTotalDuration(scenes1);
  // console.log(scenes1);
});
