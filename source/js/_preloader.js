import Toast from './_toasts';

const preloader = document.getElementById('preloader');

window.addEventListener('load', () => {
  preloader.classList.add('preloader--complete');
  document.body.classList.remove('preload');

  preloader.addEventListener('transitionend', function onTransitionEnd(evt) {
    if (evt.propertyName === 'transform') {
      new Toast('Hi, welcome to my portfolio!');

      preloader.remove();
      preloader.removeEventListener('transitionend', onTransitionEnd);
    }
  });
});
