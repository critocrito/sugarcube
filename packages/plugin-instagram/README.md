# `@sugarcube/plugin-instagram`

- [Plugins](#plugins)
- [Development](#development)

## Plugins

### `instagram_feed`

Fetch posts for an Instagram user feed. The `query_type` is
`instagram_user`. It has the `instagram.post_count`, which determines how many
posts are fetched. It defaults to 100.

    sugarcube -Q instagram_user:<username> \
               -p instagram_feed \
               --instagram.post_count 50
