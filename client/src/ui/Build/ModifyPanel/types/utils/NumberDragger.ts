import { Vector2 } from "three";

type EventHandler<E = Event, T = HTMLElement> = (
  event: E & { currentTarget: EventTarget & T }
) => any;

const noop = () => {};

export class NumberDragger {
  startValue = null;
  pointerStartCoords = new Vector2();
  pointerCurrCoords = new Vector2();
  currentValue = null;
  dragEngageDistance = 5;
  hasEverDragged = false;
  scaleFactor = 1;

  pointerdown: EventHandler<PointerEvent, Window>;
  pointerup: EventHandler<PointerEvent, Window>;
  pointermove: EventHandler<PointerEvent, Window>;

  getValue: Function;
  onDrag: Function;
  onChange: Function;
  onClick: Function;

  constructor({
    getValue,
    onDrag = noop,
    onChange = noop,
    onClick = noop,
    scaleFactor = 1,
  }: {
    getValue: Function;
    onDrag?: Function;
    onChange?: Function;
    onClick?: Function;
    scaleFactor?: number;
  }) {
    this.getValue = getValue;
    this.onDrag = onDrag;
    this.onChange = onChange;
    this.onClick = onClick;
    this.scaleFactor = scaleFactor;

    this.currentValue = null;

    this.pointerdown = ((event: MouseEvent) => {
      const target = event.target as HTMLElement;
      target.requestPointerLock();

      window.addEventListener("pointerup", this.pointerup);
      target.addEventListener("pointermove", this.pointermove);

      this.pointerStartCoords.set(0, 0);
      this.pointerCurrCoords.set(0, 0);
      this.startValue = this.getValue();
      this.currentValue = this.getValue();
      if (target.tagName !== "INPUT") {
        event.preventDefault();
      }
    }).bind(this);

    this.pointerup = ((event: MouseEvent) => {
      window.removeEventListener("pointerup", this.pointerup);
      event.target.removeEventListener("pointermove", this.pointermove);
      document.exitPointerLock();

      const delta = this.getDelta(event);
      if (!this.hasEverDragged && Math.abs(delta) <= this.dragEngageDistance) {
        this.onClick();
      } else {
        if (this.currentValue !== null) {
          this.onChange(this.currentValue);
        }
      }

      this.startValue = null;
      this.currentValue = null;
      this.hasEverDragged = false;
    }).bind(this);

    this.pointermove = ((event) => {
      const delta = this.getDelta(event);
      if (Math.abs(delta) > this.dragEngageDistance) {
        const threshold =
          this.dragEngageDistance * (delta > this.dragEngageDistance ? 1 : -1);

        this.currentValue =
          this.startValue + (delta - threshold) * this.scaleFactor;
        this.onDrag(this.currentValue);
        this.hasEverDragged = true;
      }

      event.preventDefault();
    }).bind(this);
  }

  getDelta(event) {
    this.pointerCurrCoords.x += event.movementX;
    this.pointerCurrCoords.y += event.movementY;

    const up = this.pointerStartCoords.y - this.pointerCurrCoords.y;
    const right = this.pointerCurrCoords.x - this.pointerStartCoords.x;
    const delta = right + up;

    return delta;
  }
}
