import { iterateArrayLike, setTextNode } from '../../components/common/dom';

const sampleComponent = document.getElementById('sample-component');

const colspans = [
  '1',
  '25%', '50%', '75%', '100%',
  '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
];

/**
 * @param {Element} target
 * @return {void}
 */
function onLayoutItemClick(target) {
  let colspan = target.getAttribute('mdw-colspan') || '1';
  const index = colspans.indexOf(colspan);
  colspan = colspans[index + 1] || '1';
  target.setAttribute('mdw-colspan', colspan.toString());
  setTextNode(target.firstElementChild, colspan.toString());
}

/**
 * @param {Event} event
 * @return {void}
 */
function onOptionChange(event) {
  const { name, value, checked } = event.target;
  const layout = sampleComponent.getElementsByClassName('mdw-layout')[0];

  switch (name) {
    case 'default-margins':
      if (checked) {
        layout.removeAttribute('mdw-margin');
        layout.removeAttribute('mdw-gutter');
        layout.removeAttribute('mdw-margin-8col');
        layout.removeAttribute('mdw-gutter-8col');
        layout.removeAttribute('mdw-margin-4col');
        layout.removeAttribute('mdw-gutter-4col');
      } else {
        layout.setAttribute('mdw-margin', '40');
        layout.setAttribute('mdw-gutter', '40');
        layout.setAttribute('mdw-margin-8col', '8');
        layout.setAttribute('mdw-gutter-8col', '8');
        layout.setAttribute('mdw-margin-4col', '0');
        layout.setAttribute('mdw-gutter-4col', '0');
      }
      break;
    case 'top-margin':
      if (checked) {
        layout.setAttribute('mdw-margin-top', '');
      } else {
        layout.removeAttribute('mdw-margin-top');
      }
      break;
    case 'bottom-margin':
      if (checked) {
        layout.setAttribute('mdw-margin-bottom', '');
      } else {
        layout.removeAttribute('mdw-margin-bottom');
      }
      break;
    case 'stretch':
      if (checked) {
        layout.setAttribute('mdw-stretch', '');
      } else {
        layout.removeAttribute('mdw-stretch');
      }
      break;
    case 'center':
      if (checked) {
        layout.setAttribute('mdw-center', '');
      } else {
        layout.removeAttribute('mdw-center');
      }
      break;
    case 'style':
      switch (value) {
        case 'grid':
          layout.setAttribute('mdw-grid', '');
          break;
        case 'flex':
          layout.removeAttribute('mdw-grid');
          break;
        default:
      }
      break;
    case 'dense':
      if (checked) {
        layout.setAttribute('mdw-dense', '');
      } else {
        layout.removeAttribute('mdw-dense');
      }
      break;
    case 'columns':
      switch (value) {
        default:
        case '12':
          layout.removeAttribute('mdw-columns');
          break;
        case '8':
          layout.setAttribute('mdw-columns', '8');
          break;
        case '4':
          layout.setAttribute('mdw-columns', '4');
          break;
        case '1':
          layout.setAttribute('mdw-columns', '1');
          break;
      }
      break;
    default:
  }
}

/** @return {void} */
function setupInteractions() {
  iterateArrayLike(sampleComponent.getElementsByClassName('mdw-layout__item'), (item) => {
    item.addEventListener('click', () => {
      onLayoutItemClick(item);
    });
  });
  iterateArrayLike(document.querySelectorAll('[name]'), (el) => {
    el.addEventListener('change', onOptionChange);
  });
}

setupInteractions();