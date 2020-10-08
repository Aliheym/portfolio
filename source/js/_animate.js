import BezierEasing from 'bezier-easing';

export const timingFunctions = {
  ease: BezierEasing(0.25, 0.1, 0.25, 1),
  linear: BezierEasing(0, 0, 1, 1),
  easeIn: BezierEasing(0.42, 0, 1, 1),
  easeOut: BezierEasing(0, 0, 0.58, 1),
  easeInOut: BezierEasing(0.42, 0, 0.58, 1),
};

export const animate = ({
  callback,
  duration = 1000,
  timingFunction = timingFunctions.ease,
  onComplete,
} = {}) => {
  let start;

  function step(timestamp) {
    if (start === undefined) start = timestamp;

    const elapsed =
      Math.min(Math.max(timestamp - start, 0), duration) / duration;

    const progress = timingFunction(isNaN(elapsed) ? 1 : elapsed);

    callback(progress);

    if (progress === 1) {
      return typeof onComplete === 'function' && onComplete();
    }

    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
};
