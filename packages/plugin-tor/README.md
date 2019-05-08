# `@sugarcube/plugin-tor`

## Plugins

### `tor_check` plugin

```
$(npm bin)/sugarcube -p tor_check
2017-03-22T20:24:28.417Z - info: Starting the tor_check plugin.
2017-03-22T20:24:28.672Z - info:

      Sorry. You are not using Tor.


2017-03-22T20:24:28.673Z - info: Finished the tor_check plugin.
2017-03-22T20:24:28.673Z - info: Finished the LSD.

torsocks $(npm bin)/sugarcube -p tor_check
1490214275 WARNING torsocks[21685]: [syscall] Unsupported syscall number 293. Denying the call (in tsocks_syscall() at syscall.c:488)
1490214275 WARNING torsocks[21685]: [syscall] Unsupported syscall number 292. Denying the call (in tsocks_syscall() at syscall.c:488)
2017-03-22T20:24:38.162Z - info: Starting the tor_check plugin.
2017-03-22T20:24:39.372Z - info:

      Congratulations. This browser is configured to use Tor.


2017-03-22T20:24:39.374Z - info: Finished the tor_check plugin.
2017-03-22T20:24:39.374Z - info: Finished the LSD.

torsocks on
Tor mode activated. Every command will be torified for this shell.

$(npm bin)/sugarcube -p tor_check
2017-03-22T20:24:50.320Z - info: Starting the tor_check plugin.
2017-03-22T20:24:50.564Z - info:

      Sorry. You are not using Tor.


2017-03-22T20:24:50.565Z - info: Finished the tor_check plugin.
2017-03-22T20:24:50.566Z - info: Finished the LSD.
```

Unfortunately, because of the way torsocks works, plugins can't make
connections to `localhost`. This affects just a few plugins, e.g. MongoDB. It
*could* work if the MongoDB server is not listening to localhost.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
