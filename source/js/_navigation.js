const pageNav = document.querySelector('.page-nav');
const disabledClassName = 'page-nav--disabled';

pageNav.addEventListener('click', (evt) => {
  const target = evt.target.closest('a');
  if (!target) return;

  pageNav.classList.add(disabledClassName);

  // focus click handling
  if (document.elementFromPoint(evt.clientX, evt.clientY) !== evt.target) {
    pageNav.classList.remove(disabledClassName);
    return;
  }

  target.addEventListener(
    'pointerleave',
    () => {
      pageNav.classList.remove(disabledClassName);
    },
    { once: true }
  );
});
