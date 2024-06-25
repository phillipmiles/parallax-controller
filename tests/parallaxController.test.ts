/**
 * @jest-environment jsdom
 */

import { describe, expect, test, afterEach, jest } from '@jest/globals';
import ParallaxTrigger from '../src/classes/ParallaxTrigger';
import ParallaxController from '../src/classes/ParallaxController';

// https://stackoverflow.com/questions/57311971/error-not-implemented-window-scrollto-how-do-we-remove-this-error-from-jest-t
// window.scrollTo = jest.fn(() => {
//   console.log('Hi');
// });

// afterEach(() => {
//   jest.resetAllMocks();
// });
// afterAll(() => {
//   jest.clearAllMocks();
// });

// // // Save original window so we can restore it after tests.
// const originalScrollY = window.scrollY;
const originalWindowHeight = window.innerHeight;

// // // Restore window after each test to avoid state leaking.
afterEach(() => {
  // window.scrollY = originalScrollY;
  document.body.style.height = 'auto';
});

test('ParallaxTrigger - Point Trigger / Both', () => {
  const DISTANCE = 100;
  const controller = new ParallaxController({
    distance: DISTANCE,
  });

  controller.init();

  expect(document.body.style.height).toBe(
    originalWindowHeight + DISTANCE + 'px'
  );
});

test('ParallaxTrigger - Point Trigger / Both', () => {
  const controller = new ParallaxController({
    distance: 100,
  });

  let didTrigger = false;

  const trigger = new ParallaxTrigger(100, {
    triggerDirection: 'both',
    onTrigger: () => {
      didTrigger = true;
    },
  });

  controller.addTrigger(trigger);
  controller.init();
  controller.scrollHistory = [100, 50, 0, 0, 0];
  controller.processTriggers();

  expect(didTrigger).toBe(true);
});
