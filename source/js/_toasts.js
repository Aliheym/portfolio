import { animate } from './_animate';

class Toast {
  static _createContainer() {
    const container = document.createElement('div');
    container.classList.add('toast-container');

    document.body.appendChild(container);
    Toast._container = container;
  }

  constructor(message, className = '', duration = 4000) {
    this._message = message;
    this._duration = duration;
    this._className = className;

    if (!Toast._container) {
      Toast._createContainer();
    }

    Toast._toasts.push(this);
    const toast = this._createToast(message);

    this._element = toast;
    this._show();
    this._timer();
  }

  _createToast() {
    const toast = document.createElement('div');
    toast.className = `toast ${this._className}`;
    toast.innerHTML = this._message;

    Toast._container.appendChild(toast);
    return toast;
  }

  _show() {
    const top = parseFloat(getComputedStyle(this._element).top);

    animate({
      callback: (progress) => {
        this._element.style.opacity = progress;
        this._element.style.top = `${top * (1 - progress)}px`;
      },
      duration: 300,
    });
  }

  _hide() {
    const top = parseFloat(getComputedStyle(this._element).marginTop);
    const endTop = -40;

    animate({
      callback: (progress) => {
        this._element.style.opacity = 1 - progress;
        this._element.style.marginTop = `${top + (endTop - top) * progress}px`;
      },
      duration: 300,
      onComplete: () => {
        this._element.remove();

        Toast._toasts.splice(Toast._toasts.indexOf(this), 1);
        if (Toast._toasts.length === 0) {
          Toast._container.remove();
          Toast._container = null;
        }
      },
    });
  }

  _timer() {
    if (this._duration !== Infinity) {
      setTimeout(() => this._hide(), this._duration);
    }
  }
}

Toast._toasts = [];
Toast._container = null;

export default Toast;
