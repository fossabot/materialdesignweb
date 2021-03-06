// Keyboard Navigation

import { dispatchDomEvent, isRtl } from '../dom';

export const FORWARD_ARROW_KEY = 'mdw:keyboard-forwardarrowkey';
export const BACK_ARROW_KEY = 'mdw:keyboard-backarrowkey';
export const UP_ARROW_KEY = 'mdw:keyboard-uparrowkey';
export const DOWN_ARROW_KEY = 'mdw:keyboard-downarrowkey';
export const HOME_KEY = 'mdw:keyboard-homekey';
export const END_KEY = 'mdw:keyboard-endkey';
export const PAGEUP_KEY = 'mdw:keyboard-pageupkey';
export const PAGEDOWN_KEY = 'mdw:keyboard-pagedownkey';
export const SPACEBAR_KEY = 'mdw:keyboard-spacebarkey';
export const ENTER_KEY = 'mdw:keyboard-enterkey';

/**
 * @param {Element} element
 * @return {void}
 */
export function attach(element) {
  element.addEventListener('keydown', onKeyDownHandler);
}

/**
 * @param {Element} element
 * @return {void}
 */
export function detach(element) {
  element.removeEventListener('keydown', onKeyDownHandler);
}


/**
 * @param {KeyboardEvent} event
 * @return {void}
 */
function onKeyDownHandler(event) {
  /** @type {Element} */
  const element = (event.currentTarget);
  const detail = {
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
    repeat: event.repeat,
  };

  let type;
  switch (event.key) {
    case 'Enter':
      type = ENTER_KEY;
      break;
    case ' ':
    case 'Spacebar':
      type = SPACEBAR_KEY;
      break;
    case 'ArrowDown':
    case 'Down':
      type = DOWN_ARROW_KEY;
      break;
    case 'ArrowUp':
    case 'Up':
      type = UP_ARROW_KEY;
      break;
    case 'ArrowLeft':
    case 'Left':
      type = isRtl() ? FORWARD_ARROW_KEY : BACK_ARROW_KEY;
      break;
    case 'ArrowRight':
    case 'Right':
      type = isRtl() ? BACK_ARROW_KEY : FORWARD_ARROW_KEY;
      break;
    case 'Home':
      type = HOME_KEY;
      break;
    case 'End':
      type = END_KEY;
      break;
    case 'PageUp':
      type = PAGEUP_KEY;
      break;
    case 'PageDown':
      type = PAGEDOWN_KEY;
      break;
    default:
      return;
  }

  if (!dispatchDomEvent(element, type, detail)) {
    // preventDefault called
    event.stopPropagation();
    event.preventDefault();
  }
}
