import { throttle } from './_utils';

const sections = [...document.querySelectorAll('[data-section]')];
const activeClassName = 'page-nav__item--active';

const getActiveSection = (sections) => {
  let activeSection = null;
  let activeSectionTop = -Infinity;

  for (let i = 0; i < sections.length; i++) {
    const top = sections[i].getBoundingClientRect().top - 5;

    if (top > 0) continue;

    if (top > activeSectionTop) {
      activeSection = sections[i];
      activeSectionTop = top;
    }
  }

  return activeSection;
};

const handleActivateSection = (newSection) => {
  const { section } = newSection.dataset;
  const link = `#${section}`;

  if (activeNavLink && activeNavLink.href === link) return;
  if (activeNavLink) activeNavLink.classList.remove(activeClassName);

  activeNavLink = document.querySelector(`.page-nav__link[href="${link}"]`)
    .parentElement;

  if (activeNavLink) activeNavLink.classList.add(activeClassName);
};

const onScroll = () => {
  handleActivateSection(getActiveSection(sections));
};

window.addEventListener('scroll', throttle(onScroll, 300));

const activeSection = getActiveSection(sections);
let activeNavLink = document.querySelector(`.${activeClassName}`);

handleActivateSection(activeSection);
