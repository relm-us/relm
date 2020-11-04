import { createPlugin } from 'hecs'
import CorePlugin from 'hecs-plugin-core'

import * as Components from './components'
import * as Systems from './systems'

export * from './components'

export { Components }

// convert Components into an array
const components = []
for (const key in Components) {
  components.push(Components[key])
}

// convert Systems into an array
const systems = []
for (const key in Systems) {
  systems.push(Systems[key])
}

export default createPlugin({
  name: 'hecs-plugin-composable',
  plugins: [CorePlugin],
  systems,
  components,
})
