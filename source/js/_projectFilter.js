import Isotope from 'isotope-layout';
import { breakPoints, getWindowSize } from './_breakPoints';

const dropdown = document.querySelector('[data-dropdown]');
const projectList = document.querySelector('.project-list');

const textClassName = 'project-filter__text';
const itemClassName = 'project-filter__btn';
const activeClassName = 'project-filter__btn--active';

class ProjectFilter {
  constructor(element, onSelect = () => {}) {
    this._element = element;
    this._onSelect = onSelect;

    this._dropdownText = element.querySelector(`.${textClassName}`);
    this._activeItem = element.querySelector(`.${activeClassName}`);
    this._mount();

    this._element.addEventListener('click', this.handleClick.bind(this));
  }

  isDropdown() {
    return 'dropdown' in this._element.dataset;
  }

  isDropdownActive() {
    return this._element.dataset.dropdownActive !== undefined;
  }

  selectItem(newItem) {
    if (!newItem) return;
    if (this._activeItem) this._activeItem.classList.remove(activeClassName);

    newItem.classList.add(activeClassName);
    this._activeItem = newItem;

    if (this.isDropdown()) {
      this._selectDropdownItem(newItem);
    } else {
      this._selectFilterItem(newItem);
    }

    this._onSelect(newItem);
  }

  _selectFilterItem(newItem) {
    this._element.style.setProperty(
      '--selectorLeft',
      `${newItem.offsetLeft}px`
    );
    this._element.style.setProperty(
      '--selectorWidth',
      `${newItem.clientWidth}px`
    );
  }

  _selectDropdownItem(newItem) {
    this._dropdownText.textContent = newItem.textContent;
    this.hideDropdown();
  }

  handleClick(evt) {
    let target = evt.target.closest(`.${itemClassName}`);

    if (!target) {
      target = evt.target.closest(`[data-dropdown]`);

      if (target) this.toggleDropdown();
    } else {
      this.selectItem(target);
    }
  }

  showDropdown() {
    this._element.dataset.dropdownActive = '';
  }

  hideDropdown() {
    delete this._element.dataset.dropdownActive;
  }

  toggleDropdown() {
    if (this.isDropdownActive()) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  toFilterList() {
    this.hideDropdown();
    delete this._element.dataset.dropdown;

    this._mount();
  }

  toDropdown() {
    this._element.dataset.dropdown = '';

    this._mount();
  }

  _mount() {
    if (this.isDropdown()) {
      this._element.tabIndex = '0';
    } else {
      this._element.removeAttribute('tabIndex');
    }

    this.selectItem(this._activeItem);
  }
}

const projectGrid = new Isotope(projectList, {
  itemSelector: '.project-list__item',
});

const projectFilter = new ProjectFilter(dropdown, (item) => {
  const { filter = '*' } = item.dataset;

  projectGrid.arrange({ filter });
});

const handleResize = () => {
  if (getWindowSize() <= breakPoints.landscape) {
    projectFilter.toDropdown();
  } else {
    projectFilter.toFilterList();
  }
};

window.addEventListener('resize', handleResize);
handleResize();
