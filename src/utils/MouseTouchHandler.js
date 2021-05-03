export default class MouseTouchHandler {
  constructor (element, updateCallback) {
    this.updateCallback = updateCallback;
    this.element = element;
    this.isOn = false;
    this.mouse = {
      x: 0, y: 0
    };
    this.lastMouse = {
      x: -1, y: -1
    };
    this.addListeners();
  }

  addListeners () {    
    // ON
    this.element.addEventListener('touchstart', this.handleTouchStart, false);
    this.element.addEventListener('mousedown', this.handleMouseDown, false);

    // MOVE
    this.element.addEventListener('touchmove', this.handleTouchMove, false);
    this.element.addEventListener('mousemove', this.handleMouseMove, false);

    // OFF
    this.element.addEventListener('touchcancel', this.handleOff, false);
    this.element.addEventListener('touchend', this.handleOff, false);
    this.element.addEventListener('mouseup', this.handleOff, false);
    this.element.addEventListener('mouseout', this.handleOff, false);
  }

  removeListeners () {    
    // ON
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('mousedown', this.handleMouseDown);

    // MOVE
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('mousemove', this.handleMouseMove);

    // OFF
    this.element.removeEventListener('touchcancel', this.handleOff);
    this.element.removeEventListener('touchend', this.handleOff);
    this.element.removeEventListener('mouseup', this.handleOff);
    this.element.removeEventListener('mouseout', this.handleOff);
  }

  handleMouseMove = event => {
    this.handleOn(event.pageX, event.pageY, this.isOn);
    // if (this.isOn) {
    //   this.handleOn(event.pageX, event.pageY);
    // }
  }

  handleTouchMove = event => {
    if (this.isOn && event.changedTouches && event.changedTouches.length) {
      this.handleOn(event.changedTouches[0].pageX,  event.changedTouches[0].pageY)
    }
    event.preventEventDefault();
    event.stopImmediatePropagation();
  }

  handleMouseDown = event => {
    this.handleOn(event.pageX, event.pageY);
  }

  handleTouchStart = event => {
    if (event.changedTouches && event.changedTouches.length) {
      this.handleOn(event.changedTouches[0].pageX,  event.changedTouches[0].pageY)
    }          
  }

  handleOff = (pageX, pageY) => {
    if (this.isOn) {
      this.isOn = false;
      this.dispatchCallback();
    }
  }

  handleOn = (pageX, pageY, isOn = true) => {
    this.mouse.x = pageX - this.element.offsetLeft
    this.mouse.y = pageY - this.element.offsetTop
    this.isOn = isOn;
    this.dispatchCallback();
    // save position for next iteration
    this.lastMouse.x = this.mouse.x;
    this.lastMouse.y = this.mouse.y;
  }

  dispatchCallback () {
    const x = this.mouse.x;
    const y = this.mouse.y;
    const lastX = this.lastMouse.x;
    const lastY = this.lastMouse.y;
    this.updateCallback({
      x,
      y,
      isOn: this.isOn,
      diffX: lastX - x,
      diffY: lastY - y,
    });
  }
}
