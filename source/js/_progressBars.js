import { animate } from './_animate';

const progressBars = [...document.querySelectorAll('.progress-bar')];

const fillProgressBar = (progressBar) => {
  const { value = 0, fillColor = '#fff' } = progressBar.dataset;

  const fillCircle = progressBar.querySelector('.progress-bar__fill');
  const circleRadius = fillCircle.r.baseVal.value;
  const circleLength = 2 * circleRadius * Math.PI;

  fillCircle.style.strokeDasharray = circleLength;
  fillCircle.style.strokeDashoffset = 0;

  const progressBarText = progressBar.querySelector('.progress-bar__value')
    .firstElementChild;
  const endOffset = (value / 100) * circleLength;

  animate({
    callback: (progress) => {
      const currentOffset = endOffset * progress;
      const txt = Math.round(value * progress);

      fillCircle.style.strokeDashoffset = circleLength - currentOffset;
      fillCircle.style.stroke = fillColor;
      progressBarText.textContent = txt;
    },
    duration: value * 70,
  });
};

document.addEventListener('aos:in', function onAosIn({ detail }) {
  if (detail.dataset.aos !== 'percentangeFill') return;

  const index = progressBars.indexOf(detail);
  if (index === -1) return;

  fillProgressBar(detail);
  progressBars.splice(index, 1);

  if (progressBars.length === 0) {
    document.removeEventListener('aos:in', onAosIn);
  }
});
