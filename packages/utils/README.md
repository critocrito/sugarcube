# `@sugarcube/utils`

Common utilities used by SugarCube.

## Installation

```
npm install --save @sugarcube/utils
```

## API

### `counter`

Create a progress counter, that calls a log function in a defined interval. Plugins use it to monitor overall progress.

**Arguments:**

- `total` (Number): The upper bound to calculate progress. When tracking progress of total units processed in a plugin, this is usually `envelope.data.length`;
- `callback` (Function): The callback function that is called if progress can be reported. The callback takes an object as an argument that contains the current count `cnt`, the total `total` and a percentage `percent`.
- `opts` (Object): Fine tune the behavior of the log counter. Takes the following configuration options:
  - `threshold`: Skip logging of any progress if the total is below this threshold. Defaults to 100.
  - `steps`: The interval to log progress. Defaults to 50.

The `counter` function returns a function that can be used to log progress. The returned function takes no arguments.

**Example:**

```
import {counter} from "@sugarcube/utils";

const logCounter = counter(
  100,
  ({cnt, total, percent}) => console.log(`${cnt}/${total} (${percent}%)`),
);

logCounter(); // Nothing happens
logCounter(); // Nothing happens
// ... Call logCounter another 97, we are now at 99 total calls.
logCounter(); // logs: 100/100 (100%)
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
