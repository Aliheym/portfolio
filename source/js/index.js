'use strict';

import Toast from './_toasts';
import './_preloader';

import './_sections';
import './_navigation';

import './_progressBars';
import './_projectFilter';

import './_form';

import AOS from 'aos';

AOS.init({ once: true });

document.addEventListener('aos:in', function onAosIn({ detail }) {
  if (detail.dataset.aos !== 'notify') return;

  new Toast(
    'Please, note that the project designs are not mine. Just the code.'
  );

  document.removeEventListener('aos:in', onAosIn);
});
