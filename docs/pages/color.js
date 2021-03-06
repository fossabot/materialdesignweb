import * as Overlay from '../../core/overlay/index';
import * as Ripple from '../../core/ripple/index';
import { iterateArrayLike, nextTick } from '../../core/dom';

iterateArrayLike(document.getElementsByClassName('mdw-overlay'), Overlay.attach);
iterateArrayLike(document.getElementsByClassName('mdw-ripple'), Ripple.attach);

const sampleSurface = document.getElementById('sample-surface');
const sampleInk = document.getElementById('sample-ink');

const sampleButton = document.getElementById('sample-button');
const sampleButtonSelected = document.getElementById('sample-button__selected');
const sampleButtonActivated = document.getElementById('sample-button__activated');

const sampleContrastText = document.getElementById('sample-contrast__text');
const sampleContrastSelected = document.getElementById('sample-contrast__selected');
const sampleContrastActivated = document.getElementById('sample-contrast__activated');


/** @typedef {{r:number,g:number,b:number,a:number}} Color */

/**
 * @param {Color} color
 * @return {string}
 */
function colorToString(color) {
  return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

/**
 * @param {string} colorString
 * @return {Color}
 */
function parseColor(colorString) {
  if (colorString === 'transparent') {
    return {
      r: 0, g: 0, b: 0, a: 0,
    };
  }
  return colorString
    .match(/\(([^)]+)\)/)[1]
    .split(',')
    .map((value) => (value == null ? 1.0 : parseFloat(value)))
    .reduce((prev, curr, index) => {
      if (index > 3) {
        throw new Error('Unexpected 5th value');
      }
      return {
        r: index === 0 ? curr : prev.r,
        g: index === 1 ? curr : prev.g,
        b: index === 2 ? curr : prev.b,
        a: index === 3 ? curr : prev.a,
      };
    }, {
      r: 255, g: 255, b: 255, a: 1.0,
    });
}

/**
 * @param {Color} color
 * @param {Color} overlay
 * @return {Color}
 */
function overlayColor(color, overlay) {
  return {
    r: (1.0 - overlay.a) * color.r + overlay.a * overlay.r,
    g: (1.0 - overlay.a) * color.g + overlay.a * overlay.g,
    b: (1.0 - overlay.a) * color.b + overlay.a * overlay.b,
    a: 1.0,
  };
}

/**
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
 * @param {Color} color
 * @return {number}
 */
function getLuminance(color) {
  /**
   * @param {number} colorValue
   * @return {number}
   */
  function sRGBMapping(colorValue) {
    if (colorValue <= (0.03928 * 255)) {
      return colorValue / 255 / 12.92;
    }
    return ((colorValue / 255 + 0.055) / 1.055) ** 2.4;
  }
  const R = 0.2126 * sRGBMapping(color.r);
  const G = 0.7152 * sRGBMapping(color.g);
  const B = 0.0722 * sRGBMapping(color.b);
  return (R + G + B);
}

/**
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
 * @param {Color} a
 * @param {Color} b
 * @return {number} X:1 ratio
 */
function getContrastRatio(a, b) {
  const lumA = getLuminance(a);
  const lumB = getLuminance(b);
  if (lumA === 0 && lumB === 0) {
    return 0;
  }
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

/**
 * @param {string} name
 * @return {void}
 */
function updateSurfaces(name) {
  sampleButton.setAttribute('mdw-surface', name);
  sampleButtonSelected.setAttribute('mdw-surface', name);
  sampleButtonActivated.setAttribute('mdw-surface', name);
}

/**
 * @param {string} name
 * @return {void}
 */
function updateInks(name) {
  sampleButton.setAttribute('mdw-ink', name);
  sampleButtonSelected.setAttribute('mdw-ink', name);
  sampleButtonActivated.setAttribute('mdw-ink', name);
}

/** @return {void} */
function calculateContrast() {
  nextTick(() => {
    const style = window.getComputedStyle(sampleButton);
    const surfaceColor = parseColor(style.backgroundColor);
    const inkColor = parseColor(style.color);
    sampleSurface.textContent = ` ${colorToString(surfaceColor)}`;
    sampleInk.textContent = ` ${colorToString(inkColor)}`;
    const flattenedInk = overlayColor(surfaceColor, inkColor);
    sampleContrastText.textContent = ` ${getContrastRatio(surfaceColor, flattenedInk).toFixed(2)}`;

    let selectedOpacity = 0.08;
    let activatedOpacity = 0.12;
    let overlayInkColor = inkColor;

    if (document.documentElement.hasAttribute('mdw-dark')) {
      selectedOpacity = 0.12;
      activatedOpacity = 0.24;
      overlayInkColor = inkColor;
    }

    const selectedInkColor = parseColor(window.getComputedStyle(sampleButtonSelected).color);
    const selectedFlattenedInk = overlayColor(surfaceColor, selectedInkColor);
    const selectedOverlay = parseColor(`rgba(${overlayInkColor.r},${overlayInkColor.g},${overlayInkColor.b},${selectedOpacity})`);
    const selectedBackground = overlayColor(surfaceColor, selectedOverlay);
    const selectedColor = overlayColor(selectedFlattenedInk, selectedOverlay);
    sampleContrastSelected.textContent = ` ${getContrastRatio(selectedBackground, selectedColor).toFixed(2)}`;

    const activatedOverlay = parseColor(`rgba(${overlayInkColor.r},${overlayInkColor.g},${overlayInkColor.b},${activatedOpacity})`);
    const activatedBackground = overlayColor(surfaceColor, activatedOverlay);
    const activatedColor = overlayColor(flattenedInk, activatedOverlay);
    sampleContrastActivated.textContent = ` ${getContrastRatio(activatedBackground, activatedColor).toFixed(2)}`;
  });
}

/**
 * @param {MouseEvent} event
 * @return {void}
 */
function onItemClick(event) {
  /** @type {HTMLElement} */
  const item = (event.currentTarget);
  if (item.id) {
    return;
  }
  const ink = item.getAttribute('mdw-ink');
  if (ink == null) {
    updateSurfaces(item.getAttribute('mdw-surface'));
  } else {
    updateInks(item.getAttribute('mdw-ink'));
  }
  calculateContrast();
}

const currentInkOptions = {
  color: 'secondary',
  tone: 'contrast',
  opacity: '',
};

const currentSurfaceOptions = {
  color: 'binary',
  tone: '',
};

/** @return {void} */
function refresh() {
  const inkProperties = [
    currentInkOptions.color,
    currentInkOptions.tone,
    currentInkOptions.opacity,
  ].filter((v) => v).join(' ');
  const surfaceProperties = [
    currentSurfaceOptions.color,
    currentSurfaceOptions.tone,
  ].filter((v) => v).join(' ');
  iterateArrayLike(document.querySelectorAll('#color-sample-area .demo-core-item'), (el) => {
    el.setAttribute('mdw-ink', inkProperties);
    el.setAttribute('mdw-surface', surfaceProperties);
  });
  calculateContrast();
}

/**
 * @param {Event} event
 * @return {void}
 */
function onOptionChange(event) {
  /** @type {HTMLSelectElement} */
  const selectElement = (event.target);
  const { name, value } = selectElement;
  switch (name) {
    case 'ink-color':
      currentInkOptions.color = value;
      break;
    case 'ink-tone':
      currentInkOptions.tone = value;
      break;
    case 'ink-opacity':
      currentInkOptions.opacity = value;
      break;
    case 'surface-color':
      currentSurfaceOptions.color = value;
      break;
    case 'surface-tone':
      currentSurfaceOptions.tone = value;
      break;
    default:
      return;
  }
  refresh();
}

/** @return {void} */
function setupComponentOptions() {
  // sampleComponent = document.querySelector('.component-sample .mdw-button');
  // Button.attach(sampleComponent);
  iterateArrayLike(document.querySelectorAll('#color-page-options [name]'), (el) => {
    el.addEventListener('change', onOptionChange);
  });
}

iterateArrayLike(
  document.getElementsByClassName('demo-core-item'),
  (item) => item.addEventListener('click', onItemClick)
);

[
  document.getElementById('darkModeButton'),
  document.getElementById('altThemeButton'),
].forEach((button) => button.addEventListener('click', calculateContrast));

setupComponentOptions();
refresh();
