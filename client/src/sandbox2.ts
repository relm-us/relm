export class Component {}

export class Derived extends Component {}

export function xyz(klass: typeof Component) {
  console.log("klass", klass);
}

export function callXyz() {
  xyz(Derived);
}
