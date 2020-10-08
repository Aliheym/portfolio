export const debounce = (func, wait = 0, immediate = true) => {
  let timerId = null;

  function debounced(...args) {
    const execute = () => {
      timerId = null;
      if (!immediate) func.apply(this, args);
    };

    const needCall = immediate && !timerId;

    clearTimeout(timerId);
    timerId = setTimeout(execute, wait);

    if (needCall) func.apply(this, args);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);

    timerId = null;
  };

  return debounced;
};

export const throttle = (func, wait = 0, options = {}) => {
  let { leading = true, trailing = true } = options;

  let timerId = null;
  let lastData = [];

  return function throttled(...args) {
    if (timerId) {
      lastData = [this, args];

      return;
    }

    if (leading) {
      func.apply(this, args);
    }

    leading = true;

    timerId = setTimeout(() => {
      timerId = null;

      if (trailing && lastData.length !== 0) {
        throttled.apply(...lastData);
        lastData = [];
      }
    }, wait);
  };
};
