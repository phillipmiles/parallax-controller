import { describe, expect, test } from '@jest/globals';
import { convertPercentToPixel } from '../js/parallax';

test('convertPercentToPixel', () => {
  const half = convertPercentToPixel(50, 1000);
  const halfnearlyhigh = convertPercentToPixel(50.1, 1000);
  const halfnearlylow = convertPercentToPixel(49.9, 1000);
  const zero = convertPercentToPixel(0, 1000);
  const twofifty = convertPercentToPixel(250, 50);
  const fractionlow = convertPercentToPixel(50, 4.9);
  const fractionmid = convertPercentToPixel(50, 5);
  const fractionhigh = convertPercentToPixel(50, 5.1);
  const negative = convertPercentToPixel(-100, 25);
  const hundredofnothing = convertPercentToPixel(100, 0);

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
