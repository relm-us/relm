//events: Array<{trigger: fn}>
export default function (node, events = []) {
  const ev = Object.entries(events)
  let fns = []

  for (const [trigger, fn] of ev) {
    const f = addEvent(trigger, fn)
    fns = [...fns, f]
  }

  function _scaffold(trigger, fn) {
    return () => {
      const trig = Number.parseInt(trigger)
      if (trig) {
        if (event.keyCode === trig) {
          fn(event)
        }
      } else {
        if (event.key === trigger) {
          fn(event)
        }
      }
    }
  }

  function addEvent(trigger, fn) {
    const f = _scaffold(trigger, fn)
    node.addEventListener("keydown", f)
    return f
  }

  function removeEvents() {
    fns.forEach((f) => node.removeEventListener("keypress", f))
  }

  return {
    destroy() {
      removeEvents()
    },
  }
}
