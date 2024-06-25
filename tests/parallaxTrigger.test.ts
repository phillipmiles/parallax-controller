/**
 * @jest-environment jsdom
 */

import { describe, expect, test, afterEach, jest } from '@jest/globals';
import ParallaxTrigger from '../src/classes/ParallaxTrigger';

test('ParallaxTrigger - Point Trigger / Both', () => {
  const trigger = new ParallaxTrigger(100, {
    triggerDirection: 'both',
    onTrigger: () => {},
  });

  expect(trigger.shouldTrigger(101, 99)).toBe(true);
  expect(trigger.shouldTrigger(99, 101)).toBe(true);

  // Only trigger when first hitting number not when moving off number.
  expect(trigger.shouldTrigger(100, 101)).toBe(false);
  expect(trigger.shouldTrigger(99, 100)).toBe(true);
  expect(trigger.shouldTrigger(101, 100)).toBe(true);
  expect(trigger.shouldTrigger(100, 99)).toBe(false);
});

test('ParallaxTrigger - Point Trigger / Forwards', () => {
  const trigger = new ParallaxTrigger(100, {
    triggerDirection: 'forwards',
    onTrigger: () => {},
  });

  expect(trigger.shouldTrigger(101, 99)).toBe(false);
  expect(trigger.shouldTrigger(99, 101)).toBe(true);

  // Only trigger when first hitting number not when moving off number.
  expect(trigger.shouldTrigger(100, 101)).toBe(false);
  expect(trigger.shouldTrigger(99, 100)).toBe(true);
  expect(trigger.shouldTrigger(101, 100)).toBe(false);
  expect(trigger.shouldTrigger(100, 99)).toBe(false);
});

test('ParallaxTrigger - Point Trigger / Backwards', () => {
  const trigger = new ParallaxTrigger(100, {
    triggerDirection: 'backwards',
    onTrigger: () => {},
  });

  expect(trigger.shouldTrigger(101, 99)).toBe(true);
  expect(trigger.shouldTrigger(99, 101)).toBe(false);

  // Only trigger when first hitting number not when moving off number.
  expect(trigger.shouldTrigger(100, 101)).toBe(false);
  expect(trigger.shouldTrigger(99, 100)).toBe(false);
  expect(trigger.shouldTrigger(101, 100)).toBe(true);
  expect(trigger.shouldTrigger(100, 99)).toBe(false);
});

test('ParallaxTrigger - Range Trigger / Both', () => {
  const trigger = new ParallaxTrigger([100, 200], {
    triggerDirection: 'both',
    onTrigger: () => {},
  });

  expect(trigger.shouldTrigger(99, 101)).toBe(true);
  expect(trigger.shouldTrigger(101, 99)).toBe(false);
  expect(trigger.shouldTrigger(199, 201)).toBe(false);
  expect(trigger.shouldTrigger(201, 199)).toBe(true);

  // Only trigger when first hitting number not when moving off number.
  expect(trigger.shouldTrigger(100, 101)).toBe(false);
  expect(trigger.shouldTrigger(99, 100)).toBe(true);
  expect(trigger.shouldTrigger(201, 200)).toBe(true);
  expect(trigger.shouldTrigger(200, 199)).toBe(false);
});

test('ParallaxTrigger - Range Trigger / Forwards', () => {
  const trigger = new ParallaxTrigger([100, 200], {
    triggerDirection: 'forwards',
    onTrigger: () => {},
  });

  expect(trigger.shouldTrigger(99, 101)).toBe(true);
  expect(trigger.shouldTrigger(101, 99)).toBe(false);
  expect(trigger.shouldTrigger(199, 201)).toBe(false);
  expect(trigger.shouldTrigger(201, 199)).toBe(false);

  // Only trigger when first hitting number not when moving off number.
  expect(trigger.shouldTrigger(100, 101)).toBe(false);
  expect(trigger.shouldTrigger(99, 100)).toBe(true);
  expect(trigger.shouldTrigger(201, 200)).toBe(false);
  expect(trigger.shouldTrigger(200, 199)).toBe(false);
});

test('ParallaxTrigger - Range Trigger / Backwards', () => {
  const trigger = new ParallaxTrigger([100, 200], {
    triggerDirection: 'backwards',
    onTrigger: () => {},
  });

  expect(trigger.shouldTrigger(99, 101)).toBe(false);
  expect(trigger.shouldTrigger(101, 99)).toBe(false);
  expect(trigger.shouldTrigger(199, 201)).toBe(false);
  expect(trigger.shouldTrigger(201, 199)).toBe(true);

  // Only trigger when first hitting number not when moving off number.
  expect(trigger.shouldTrigger(100, 101)).toBe(false);
  expect(trigger.shouldTrigger(99, 100)).toBe(false);
  expect(trigger.shouldTrigger(201, 200)).toBe(true);
  expect(trigger.shouldTrigger(200, 199)).toBe(false);
});

test('ParallaxTrigger - Disabled', () => {
  const trigger = new ParallaxTrigger(100, {
    triggerDirection: 'both',
    onTrigger: () => {},
  });

  expect(trigger.shouldTrigger(99, 101)).toBe(true);

  trigger.disabled = true;

  expect(trigger.shouldTrigger(99, 101)).toBe(false);
});
