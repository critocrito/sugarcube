import {isEqual, isNil} from "lodash/fp";
import jsc, {property} from "jsverify";
import moment from "moment";
import {maybeDate} from "../../packages/plugin-google/lib/utils";

const date = jsc.datetime.smap((d) => {
  d.setUTCHours(0, 0, 0, 0);
  return d;
}, jsc.shrink.noop);

describe("maybeDate", () => {
  property("returns null on falsy value", jsc.falsy, (x) =>
    isNil(maybeDate(x)),
  );

  property("returns null on unknown format", date, (d) => {
    const str = moment(d).format("MM DD YYYY");
    return isNil(maybeDate(str));
  });

  property("parses string in German format", date, (d) => {
    const str = moment(d).format("DD.MM.YYYY");
    return isEqual(maybeDate(str), d);
  });

  property("parses string in US format", date, (d) => {
    const str = moment(d).format("MMM DD, YYYY");
    return isEqual(maybeDate(str), d);
  });

  property("parses string in ISO8601 format", date, (d) => {
    const str = moment(d).format("YYYY-MM-DD");
    return isEqual(maybeDate(str), d);
  });

  property("parses string in little endian hyphened format", date, (d) => {
    const str = moment(d).format("DD-MM-YYYY");
    return isEqual(maybeDate(str), d);
  });
});
