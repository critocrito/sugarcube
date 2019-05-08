# The SugarCube command line interface

A command line interface to SugarCube. See the SugarCube tutorial on how to
use it, or print the help output.

`sugarcube -h`

## Installation

    npm install -S @sugarcube/cli

## Usage

The CLI program is the primary interface to SugarCube. Use it in your project like this:

```
$(npm bin)/sugarcube -h
```

As a default SugarCube runs with a 1.4GB memory limit. This can be increased by setting the `--max_old_space_size` option using `NODE_OPTIONS`.

```
NODE_OPTIONS=--max_old_space_size=4096 $(npm bin)/sugarcube -h
```

The above example increases the memory limit to 4GB.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
