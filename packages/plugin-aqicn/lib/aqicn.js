import {isNil} from "lodash/fp";
import rp from "request-promise";
import cheerio from "cheerio";

const field = s => {
  if (isNil(s) || s === "-" || s === "") return null;
  // eslint-disable-next-line prefer-template
  return parseInt(s + "", 10);
};

export const station = name => {
  const opts = {
    uri: `http://aqicn.org/city/${name}`,
  };

  return rp(opts).then(html => {
    const $ = cheerio.load(html);
    const info = $("#aqiwgtinfo").text();
    return {
      info,
      station: $("#aqiwgttitle1 b").text(),
      value: field($("#aqiwgtvalue").text()),
      time_value: $("#aqiwgtutime").attr("val"),
      time_text: $("#aqiwgtutime").text(),
      pm25: field($("#cur_pm25").text()),
      pm10: field($("#cur_pm10").text()),
      o3: field($("#cur_o3").text()),
      no2: field($("#cur_no2").text()),
      so2: field($("#cur_so2").text()),
      co: field($("#cur_co").text()),
      temperature: field($("#cur_t > span").text()),
      pressure: field($("#cur_p").text()),
      humidity: field($("#cur_h").text()),
      wind: field($("#cur_w").text()),
      dew: field($("#cur_d").text()),
      _sc_id_fields: ["station", "time_value"],
      _sc_content_fields: [
        "pm25",
        "pm10",
        "o3",
        "no2",
        "so2",
        "co",
        "temperature",
        "pressure",
        "humidity",
        "wind",
        "dew",
      ],
      _sc_relations: [{type: "label", term: info}],
      _sc_query: name,
    };
  });
};

export default {station};
