import {merge, getOr} from "lodash/fp";
import {state} from "./state";

export const instrument = (maybeState, {events}) => {
  const s = maybeState == null ? state(maybeState) : maybeState;
  let curPlugin;

  const fail = failure => {
    const {term, reason} = failure;
    const msg = `${curPlugin || "unknown plugin"} ${term}: ${reason}`;
    const marker = s.get("pipeline.marker");

    s.update("failed", failures =>
      Array.isArray(failures) ? failures.concat(failure) : [failure],
    );

    if (curPlugin != null)
      s.update("plugins", plugins => {
        const currentFail = getOr(0, `${curPlugin}.counts.fail`, plugins);

        return merge(plugins, {
          [curPlugin]: {counts: {fail: currentFail + 1}},
        });
      });

    if (events != null) {
      events.emit("log", {type: "warn", msg});
      events.emit(
        "fail",
        Object.assign({}, failure, {marker, plugin: curPlugin}),
      );
    }
  };

  const count = (type, term) => {
    const marker = s.get("pipeline.marker");
    const [measurement, field] = /\./.test(type)
      ? type.split(".")
      : [curPlugin, type];

    if (curPlugin != null)
      s.update("plugins", plugins => {
        const curCount = getOr(0, `${curPlugin}.counts.${type}`, plugins);
        const increment = term == null ? 1 : term;

        return merge(plugins, {
          [curPlugin]: {counts: {[type]: curCount + increment}},
        });
      });

    if (events != null)
      events.emit("count", {type: `${measurement}.${field}`, term, marker});
  };

  const timing = ({term, type}) => {
    const marker = s.get("pipeline.marker");
    const [measurement, field] = /\./.test(type)
      ? type.split(".")
      : [curPlugin, type];

    if (curPlugin != null)
      s.update("plugins", plugins => {
        const curDuration = getOr(0, `${curPlugin}.durations.${type}`, plugins);
        const increment = term == null ? 0 : term;

        return merge(plugins, {
          [curPlugin]: {durations: {[type]: curDuration + increment}},
        });
      });

    if (events != null)
      events.emit("duration", {type: `${measurement}.${field}`, term, marker});
  };

  const pipelineStart = ({pipeline, project, name, ts, marker}) => {
    s.update("pipeline", p => {
      const plugins = pipeline.map(([plugin]) => plugin);
      return merge(p, {
        project: getOr(project || "Unnamed Project", "project", p),
        name: getOr(name || "Unnamed Pipeline", "name", p),
        start: getOr(ts, "start", p),
        marker: getOr(marker, "marker", p),
        plugins: getOr(plugins, "plugins", p),
      });
    });
  };

  const pipelineEnd = ({ts}) => {
    const startDate = s.get(`pipeline.start`);
    const marker = s.get("pipeline.marker");
    const took = ts - startDate;

    s.update("pipeline", p => {
      return merge(p, {
        end: ts,
        took,
      });
    });
    events.emit("duration", {type: `pipeline.took`, term: took, marker});
  };

  const pluginStart = ({plugin, ts}) => {
    curPlugin = plugin;
    s.update("plugins", plugins => {
      return merge(plugins, {[plugin]: {start: ts}});
    });
  };

  const pluginEnd = ({plugin, ts}) => {
    const start = s.get(`plugins.${plugin}.start`);
    s.update("plugins", plugins => {
      return merge(plugins, {[plugin]: {end: ts}});
    });
    timing({type: "took", term: ts - start});
    // Make sure to unset curPlugin last.
    curPlugin = null;
  };

  return {
    fail,
    count,
    timing,
    pipelineStart,
    pipelineEnd,
    pluginStart,
    pluginEnd,
    get: s.get,
    update: s.update,
  };
};
