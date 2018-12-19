import { getChildElementByClass, nextTick } from '../common/dom';

class Ripple {
  /**
   * @param {Element} element
   * @return {void}
   */
  static attach(element) {
    let ripple = getChildElementByClass(element, 'mdw-ripple');
    if (!ripple) {
      ripple = document.createElement('div');
      ripple.classList.add('mdw-ripple');
      if (element.firstChild) {
        element.insertBefore(ripple, element.firstChild);
      } else {
        element.appendChild(ripple);
      }
    }

    let rippleInner = getChildElementByClass(ripple, 'mdw-ripple__inner');
    if (!rippleInner) {
      rippleInner = document.createElement('div');
      rippleInner.classList.add('mdw-ripple__inner');
      ripple.appendChild(rippleInner);
    }
    element.setAttribute('mdw-ripple', '');
    element.addEventListener('click', Ripple.onClick);
    element.addEventListener('mousedown', Ripple.onMouseEvent);
    element.addEventListener('mouseup', Ripple.onMouseEvent);
    element.addEventListener('mouseout', Ripple.onMouseEvent);
    element.addEventListener('touchstart', Ripple.onTouchEvent);
    element.addEventListener('touchend', Ripple.onTouchEvent);
    element.addEventListener('touchcancel', Ripple.onTouchEvent);
    element.addEventListener('keydown', Ripple.onKeyEvent);
    element.addEventListener('keyup', Ripple.onKeyEvent);
  }

  /**
   * @param {PointerEvent|MouseEvent} event
   * @return {void}
   */
  static onMouseEvent(event) {
    /** @type {HTMLElement} */
    const el = (event.currentTarget);
    /** @type {HTMLElement} */
    const ripple = (getChildElementByClass(el, 'mdw-ripple'));
    /** @type {HTMLElement} */
    const rippleInner = (getChildElementByClass(ripple, 'mdw-ripple__inner'));
    if (!rippleInner) {
      return;
    }
    if (event.type === 'mousedown') {
      if (!event.pointerType && !event.detail) {
        return;
      }
      if (rippleInner.hasAttribute('mdw-touchstart')) {
        return;
      }
      rippleInner.setAttribute('mdw-mousedown', '');
      rippleInner.removeAttribute('mdw-keyup');
      rippleInner.removeAttribute('mdw-mouseup');
      rippleInner.removeAttribute('mdw-mouseout');
      const rect = el.getBoundingClientRect();
      const x = event.pageX - rect.left;
      const y = event.pageY - rect.top;
      Ripple.updateRipplePosition(rippleInner, x, y);
      Ripple.drawRipple(rippleInner);
    } else if (event.type === 'mouseup') {
      if (rippleInner.hasAttribute('mdw-mousedown')) {
        rippleInner.removeAttribute('mdw-mousedown');
        rippleInner.removeAttribute('mdw-touchstart');
        rippleInner.setAttribute('mdw-mouseup', '');
      }
    } else if (event.type === 'mouseout') {
      if (rippleInner.hasAttribute('mdw-mousedown')) {
        rippleInner.setAttribute('mdw-mouseout', '');
      }
    }
  }

  /**
   * @param {TouchEvent} event
   * @return {void}
   */
  static onTouchEvent(event) {
    /** @type {HTMLElement} */
    const el = (event.currentTarget);
    /** @type {HTMLElement} */
    const ripple = (getChildElementByClass(el, 'mdw-ripple'));
    /** @type {HTMLElement} */
    const rippleInner = (getChildElementByClass(ripple, 'mdw-ripple__inner'));
    if (!rippleInner) {
      return;
    }
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    if (event.type === 'touchstart') {
      rippleInner.setAttribute('mdw-touchstart', '');
      rippleInner.removeAttribute('mdw-touchend');
      rippleInner.removeAttribute('mdw-touchcancel');
      rippleInner.removeAttribute('mdw-keyup');
      rippleInner.removeAttribute('mdw-mouseup');
      rippleInner.removeAttribute('mdw-mouseout');
      const rect = el.getBoundingClientRect();
      const x = touch.pageX - rect.left;
      const y = touch.pageY - rect.top;
      Ripple.updateRipplePosition(rippleInner, x, y);
      Ripple.drawRipple(rippleInner);
    } else if (event.type === 'touchend') {
      rippleInner.setAttribute('mdw-touchend', '');
    } else if (event.type === 'touchcancel') {
      rippleInner.setAttribute('mdw-touchcancel', '');
    }
  }

  /**
   * @param {TouchEvent} event
   * @return {void}
   */
  static onKeyEvent(event) {
    /** @type {HTMLElement} */
    const el = (event.currentTarget);
    /** @type {HTMLElement} */
    const ripple = (getChildElementByClass(el, 'mdw-ripple'));
    /** @type {HTMLElement} */
    const rippleInner = (getChildElementByClass(ripple, 'mdw-ripple__inner'));
    if (!rippleInner) {
      return;
    }

    /**
     * @param {Element} element
     * @return {boolean}
     */
    function isActive(element) {
      if (element.matches) {
        return element.matches(':active');
      }
      if (element.msMatchesSelector) {
        element.msMatchesSelector(':active');
      }
      return false;
    }
    nextTick(() => {
      if (isActive(el)) {
        if (rippleInner.hasAttribute('mdw-keydown')) {
          return;
        }
        rippleInner.setAttribute('mdw-keydown', '');
        rippleInner.removeAttribute('mdw-mouseup');
        rippleInner.removeAttribute('mdw-mouseout');
        rippleInner.removeAttribute('mdw-keyup');
        Ripple.updateRipplePosition(rippleInner);
        Ripple.drawRipple(rippleInner);
      } else if (rippleInner.hasAttribute('mdw-keydown')) {
        rippleInner.removeAttribute('mdw-keydown');
        rippleInner.setAttribute('mdw-keyup', '');
      }
    });
  }

  /**
   * @param {HTMLElement} rippleInner
   * @param {number=} x
   * @param {number=} y
   * @return {void}
   */
  static updateRipplePosition(rippleInner, x, y) {
    let width;
    let height;
    let xPos = x;
    let yPos = y;
    if (x == null) {
      xPos = rippleInner.parentElement.clientWidth / 2;
      width = xPos;
    } else if (x >= rippleInner.parentElement.clientWidth / 2) {
      width = x;
      // furthest horizontal side is left
    } else {
      width = rippleInner.parentElement.clientWidth - x;
      // furthest horizontal side is right
    }
    if (y == null) {
      yPos = rippleInner.parentElement.clientHeight / 2;
      height = yPos;
    } else if (y >= rippleInner.parentElement.clientHeight / 2) {
      height = y;
      // furthest vertical side is bottom
    } else {
      height = rippleInner.parentElement.clientHeight - y;
      // furthest vertical side is top
    }
    const hypotenuse = Math.sqrt((width * width) + (height * height));
    rippleInner.style.setProperty('height', `${hypotenuse}px`);
    rippleInner.style.setProperty('width', `${hypotenuse}px`);
    rippleInner.style.setProperty('left', `${xPos - (hypotenuse / 2)}px`);
    rippleInner.style.setProperty('top', `${yPos - (hypotenuse / 2)}px`);
  }

  static drawRipple(rippleInner) {
    const timeLeftString = window.getComputedStyle(rippleInner).animationDuration;
    let timeLeft = 0;
    if (timeLeftString.indexOf('ms') !== -1) {
      timeLeft = parseFloat(timeLeftString.replace(/[^0-9.]/g, ''));
    } else if (timeLeftString.indexOf('s') !== -1) {
      timeLeft = parseFloat(timeLeftString.replace(/[^0-9.]/g, '')) * 1000;
    }
    rippleInner.setAttribute('mdw-fade-in', '');
    rippleInner.removeAttribute('mdw-fade-out');
    rippleInner.removeAttribute('mdw-fade-in-out');
    if (timeLeft) {
      setTimeout(() => {
        if (rippleInner.hasAttribute('mdw-fade-in')) {
          rippleInner.setAttribute('mdw-fade-out', '');
        }
      }, timeLeft);
    }
  }

  /**
   * @param {PointerEvent|MouseEvent} event
   * @return {void}
   */
  static onClick(event) {
    /** @type {HTMLElement} */
    const el = (event.currentTarget);
    const ripple = (getChildElementByClass(el, 'mdw-ripple'));
    /** @type {HTMLElement} */
    const rippleInner = (getChildElementByClass(ripple, 'mdw-ripple__inner'));
    if (!rippleInner) {
      return;
    }
    if (event.pointerType || event.detail) {
      return;
    }
    if (rippleInner.hasAttribute('mdw-keydown')) {
      // Already handled by keydown
      return;
    }
    rippleInner.removeAttribute('mdw-touchstart');
    rippleInner.removeAttribute('mdw-touchend');
    rippleInner.removeAttribute('mdw-touchcancel');
    rippleInner.removeAttribute('mdw-mousedown');
    rippleInner.removeAttribute('mdw-mouseup');
    rippleInner.removeAttribute('mdw-mouseout');
    rippleInner.removeAttribute('mdw-keyup');
    rippleInner.removeAttribute('mdw-fade-in');
    rippleInner.removeAttribute('mdw-fade-out');
    rippleInner.removeAttribute('mdw-fade-in-out');
    nextTick(() => {
      Ripple.updateRipplePosition(rippleInner);
      rippleInner.setAttribute('mdw-fade-in-out', '');
    });
  }

  static detach(element) {
    const ripple = getChildElementByClass(element, 'mdw-ripple');
    if (ripple) {
      element.removeChild(ripple);
    }
    element.removeAttribute('mdw-ripple');
    element.removeEventListener('click', Ripple.onClick);
    element.removeEventListener('mousedown', Ripple.onMouseEvent);
    element.removeEventListener('mouseup', Ripple.onMouseEvent);
    element.removeEventListener('mouseout', Ripple.onMouseEvent);
    element.removeEventListener('touchstart', Ripple.onTouchEvent);
    element.removeEventListener('touchend', Ripple.onTouchEvent);
    element.removeEventListener('touchcancel', Ripple.onTouchEvent);
  }
}

export {
  Ripple,
};
