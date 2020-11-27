type EventHandler<E = Event, T = HTMLElement> = (
  event: E & { currentTarget: EventTarget & T }
) => any;

const noop = () => {};

export class NumberDragger {
  mouseGrab = false;
  mouseStartValue = null;
  mouseStartCoords = null;
  dragEngageDistance = 5;
  hasEverDragged = false;

  mousedown: EventHandler<MouseEvent, Window>;
  mouseup: EventHandler<MouseEvent, Window>;
  mousemove: EventHandler<MouseEvent, Window>;

  getValue: Function;
  currentValue: number;
  onDrag: Function;
  onChange: Function;
  onClick: Function;

  constructor({
    getValue,
    onDrag = noop,
    onChange = noop,
    onClick = noop,
  }: {
    getValue: Function;
    onDrag?: Function;
    onChange?: Function;
    onClick?: Function;
  }) {
    this.getValue = getValue;
    this.onDrag = onDrag;
    this.onChange = onChange;
    this.onClick = onClick;

    this.currentValue = undefined;

    this.mousedown = ((event) => {
      this.mouseGrab = true;
      this.mouseStartValue = this.getValue();
      this.currentValue = this.getValue();
      if (event.target.tagName !== "INPUT") {
        event.preventDefault();
      }
    }).bind(this);

    this.mouseup = ((event) => {
      const delta = this.getDelta(event);
      if (
        this.mouseGrab &&
        !this.hasEverDragged &&
        Math.abs(delta) <= this.dragEngageDistance
      ) {
        this.onClick();
      } else {
        if (this.currentValue !== undefined) {
          this.onChange(this.currentValue);
        }
      }

      this.mouseGrab = false;
      this.mouseStartValue = null;
      this.mouseStartCoords = null;
    }).bind(this);

    this.mousemove = ((event) => {
      if (!this.mouseGrab) return;

      const delta = this.getDelta(event);
      if (Math.abs(delta) > this.dragEngageDistance) {
        const threshold =
          this.dragEngageDistance * (delta > this.dragEngageDistance ? 1 : -1);

        let scaleFactor = 1;
        if (this.mouseStartValue < 1) {
          scaleFactor = 1 / 100;
        } else if (this.mouseStartValue < 10) {
          scaleFactor = 1 / 10;
        } else {
          scaleFactor = 1;
        }

        this.currentValue =
          this.mouseStartValue + (delta - threshold) * scaleFactor;
        this.onDrag(this.currentValue);
        this.hasEverDragged = true;
      }

      event.preventDefault();
    }).bind(this);
  }

  getDelta(event) {
    const coords = { x: event.clientX, y: event.clientY };
    if (this.mouseStartCoords === null) this.mouseStartCoords = coords;

    const up = this.mouseStartCoords.y - coords.y;
    const right = coords.x - this.mouseStartCoords.x;
    const delta = right + up;

    return delta;
  }
}
