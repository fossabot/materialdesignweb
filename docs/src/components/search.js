import { setupMenuOptions } from '../menuoptions';
import { List, ListItem } from '../../../components/list/index';
import { TextField } from '../../../components/textfield/index';
import { Search } from '../../../components/search/index';

/** @return {void} */
function buildCustomSearch1() {
  const textfield = document.getElementById('search-textfield-custom1');
  const list = document.getElementById('search-list-custom1');
  const busyIndicator = textfield.querySelector('.custom-busy-indicator');
  let resultsCache;
  let listUpdated = false;
  const customPerformSearch = (input, resolve) => {
    if (listUpdated) {
      resolve();
      return;
    }
    if (resultsCache != null) {
      resolve(resultsCache);
      return;
    }
    busyIndicator.style.setProperty('display', '');
    const myData = [];
    for (const key in window.navigator) {
      myData.push({ line1: key, line2: navigator[key] });
    }
    setTimeout(() => {
      resultsCache = myData;
      resolve(myData);
    }, 2000);
  };
  const customUpdateList = (items, resolve) => {
    if (listUpdated) {
      resolve();
      return;
    }
    while (list.lastChild) {
      list.removeChild(list.lastChild);
    }
    busyIndicator.style.setProperty('display', 'none');
    const markup = `
    <div class="mdw-list__text">
      <div class="mdw-list__text-line"></div>
      <div class="mdw-list__text-line"></div>
    </div>
    `.trim();
    items.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.classList.add('mdw-list__item');
      listItem.innerHTML = markup;
      const lines = listItem.querySelectorAll('.mdw-list__text-line');
      lines[0].textContent = item.line1;
      lines[1].textContent = item.line2;
      ListItem.attach(listItem);
      list.appendChild(listItem);
    });
    listUpdated = true;
    resolve();
  };
  
  const searchDocsCustom = new Search({
    textfield,
    list,
    searchOnFocus: false,
    dropdown: true,
    textFilter: 'startsWith',
    suggestionMethod: 'append',
    performSearch: customPerformSearch,
    updateList: customUpdateList,
  });
}


/**
 * @param {HTMLElement} element
 * @return {void}
 */
function hideElement(element) {
  element.style.setProperty('display', 'none');
}
/**
 * @param {HTMLElement} element
 * @return {void}
 */
function showElement(element) {
  element.style.setProperty('display', '');
}

/** @return {void} */
function buildCustomSearch2() {
  const textfield = document.getElementById('search-textfield-custom2');
  const list = document.getElementById('search-list-custom2');
  /** @type {HTMLElement} */
  const [busyIndicator] = textfield.getElementsByClassName('custom-busy-indicator');
  /** @type {HTMLElement} */
  const [noResultsIndicator] = textfield.getElementsByClassName('custom-no-results-indicator');
  const customPerformSearch = (searchTerm, resolve) => {
    while (list.lastChild) {
      list.removeChild(list.lastChild);
    }
    showElement(busyIndicator);
    hideElement(noResultsIndicator);
    const myData = [];
    for (const key in window.navigator) {
      const value = navigator[key] && navigator[key].toString();
      if (key.indexOf(searchTerm) !== -1 || (value && value.indexOf(searchTerm) !== -1)) {
        myData.push({ line1: key, line2: navigator[key] });
      }
    }
    setTimeout(() => {
      resolve(myData);
    }, 1000);
  };
  const customUpdateList = (items, resolve) => {
    hideElement(busyIndicator);
    if (!items.length) {
      showElement(noResultsIndicator);
      resolve();
      return;
    }
    const markup = `
    <div class="mdw-list__text">
      <div class="mdw-list__text-line"></div>
      <div class="mdw-list__text-line"></div>
    </div>
    `.trim();
    items.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.classList.add('mdw-list__item');
      listItem.innerHTML = markup;
      const lines = listItem.querySelectorAll('.mdw-list__text-line');
      lines[0].textContent = item.line1;
      lines[1].textContent = item.line2;
      ListItem.attach(listItem);
      list.appendChild(listItem);
    });
    resolve();
  };
  const searchDocsCustom = new Search({
    textfield,
    list,
    debounce: 300,
    dropdown: true,
    filterItems: false,
    performSearch: customPerformSearch,
    updateList: customUpdateList,
  });
}

/** @return {void} */
function setupSearches() {
  const searchDocsSimple = new Search({
    textfield: document.getElementById('search-textfield-simple'),
    list: document.getElementById('search-list-simple'),
  });
  const searchDocsMultiline = new Search({
    textfield: document.getElementById('search-textfield-multiline'),
    list: document.getElementById('search-list-multiline'),
    suggestionMethod: 'none',
  });

  buildCustomSearch1();
  buildCustomSearch2();
}

/** @return {void} */
function initializeMdwComponents() {
  let components;

  components = document.querySelectorAll('.js .mdw-textfield');
  for (let i = 0; i < components.length; i += 1) {
    TextField.attach(components.item(i));
  }

  components = document.querySelectorAll('.js .mdw-list');
  for (let i = 0; i < components.length; i += 1) {
    List.attach(components.item(i));
  }

  components = document.querySelectorAll('.js .mdw-list__item');
  for (let i = 0; i < components.length; i += 1) {
    ListItem.attach(components.item(i));
  }
}

initializeMdwComponents();
setupMenuOptions();
setupSearches();
