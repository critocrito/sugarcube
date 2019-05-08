# `@sugarcube/plugin-facebook`

Query the Facebook
[GraphAPI](https://developers.facebook.com/docs/graph-api). It requires you to
register your app.

- Login to your Facebook account.
- Register as a Facebook [developer](https://developer.facebook.com).
- Register yourself an [app](https://developers.facebook.com/apps/).

You'll need the `app_id` and the `app_secret`.

- [Plugins](#plugins)
- [Development](#development)

## Plugins

### `facebook_api_user` plugin

Fetch data about a user. It uses `facebook_user` as query type.

    sugarcube -Q facebook_user:<user_id> \
               -p facebook_api_user \
               --facebook.app_id <app_id> \
               --facebook.app_secret <app_secret>

You need the `userid`, the username won't work. To get it:

- Browse to the Facebook page of that user.
- Right-click and *view source*.
- Use `CTRL-f` to search through the source and search for
  `user.php?id=`. This is your user id.

**Configuration**

- **facebook.app_id**
- **facebook.app_secret**

### `facebook_api_page` plugin

Fetch data about a Facebook page. It uses `facebook_page` as query type.

    sugarcube -Q facebook_page:<page_name> \
               -p facebook_api_page \
               --facebook.app_id <app_id> \
               --facebook.app_secret <app_secret>

**Configuration**

- **facebook.app_id**
- **facebook.app_secret**

### `facebook_api_feed` plugin

Fetch the feed of a Facebook page. It uses `facebook_page` as query type. This
works currently for pages only.

    sugarcube -Q facebook_id:filmsforaction \
              -p facebook_api_feed \
              --facebook.app_id <app_id> \
              --facebook.app_secret <app_secret>

**Configuration Options**:

- **facebook.app_id**: The app id issued by Facebook.
- **facebook.app_secret**: The secret token issued by Facebook.
- **facebook.feed_limit**: Limit the number of messages to download. When set
  to 0 download all available messages. Defaults to 0.

## Examples

The following example fetches the feed of facebook pages, downloads all
images, fetches videos using `youtube-dl`, takes screenshots of the
entries and exports a CSV file. One of the pages fails because it doesn't
exist. The `facebook_api_feed` plugin ignores missing pages, and continues
with the rest of the pipeline.

```
$(npm bin)/sugarcube -c configs/facebook.json \
                     -Q facebook_page:BATH5,facebook_page:MoqawamaSourria \
                     -p
                     facebook_api_feed,http_get,http_screenshot,media_youtubedl,csv_export
                     \
                     --csv.filename data.csv \
                     --http.data_dir data \
                     --http.headless true \
                     --http.get_types image \
                     --media.youtubedl_cmd youtube-dl \
                     --media.download_format mp4 \
                     --media.data_dir data \
                     -d
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
