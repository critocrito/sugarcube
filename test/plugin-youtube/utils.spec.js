import {
  parseVideoQuery,
  parseChannelQuery,
} from "../../packages/plugin-youtube/lib/utils";

describe("query format parsing", () => {
  it("can parse the video id from a video id", () => {
    const videoId = "gui_SE8rJUM";

    const expected = videoId;
    const result = parseVideoQuery(videoId);

    result.should.equal(expected);
  });

  it("can parse the video id from a video url", () => {
    const videoUrl = "https://www.youtube.com/watch?v=gui_SE8rJUM";
    const videoId = "gui_SE8rJUM";

    const expected = videoId;
    const result = parseVideoQuery(videoUrl);

    result.should.equal(expected);
  });

  it("can parse the channel id from a channel id", () => {
    const channelId = "UC_QIfHvN9auy2CoOdSfMWDw";

    const expected = channelId;
    const result = parseChannelQuery(channelId);

    result.should.equal(expected);
  });

  it("can parse the channel id from a channel url", () => {
    const channelUrl =
      "https://www.youtube.com/channel/UC_QIfHvN9auy2CoOdSfMWDw";
    const channelId = "UC_QIfHvN9auy2CoOdSfMWDw";

    const expected = channelId;
    const result = parseChannelQuery(channelUrl);

    result.should.equal(expected);
  });

  ["featured", "videos", "playlists", "community", "channels", "about"].forEach(
    segment =>
      it("can parse the channel id from a channel url with a special segment", () => {
        const channelUrl = `https://www.youtube.com/channel/UC_QIfHvN9auy2CoOdSfMWDw/${segment}`;
        const channelId = "UC_QIfHvN9auy2CoOdSfMWDw";

        const expected = channelId;
        const result = parseChannelQuery(channelUrl);

        result.should.equal(expected);
      }),
  );
});
