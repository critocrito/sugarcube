# `@sugarcube/plugin-instagram`

NOTE: Instagram changed the way their website works. This means that this
package currently doesn't work. Feel free to send a merge request though.

- [Plugins](#plugins)
- [Development](#development)

## Plugins

### `instagram_feed` plugin

Fetch posts for an Instagram user feed. The `query_type` is
`instagram_user`. It has the `instagram.post_count`, which determines how many
posts are fetched. It defaults to 100.

    sugarcube -Q instagram_user:<username> \
               -p instagram_feed \
               --instagram.post_count 50

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
