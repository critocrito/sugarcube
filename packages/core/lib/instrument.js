import {state} from "./state";

export const instrument = (maybeState, {events}) => {
  const s = state(maybeState);

  const fail = failure => {
    const {term, plugin, reason} = failure;
    s.update("failed", failures =>
      Array.isArray(failures) ? failures.concat(failure) : [failure],
    );
    const msg = `${plugin} ${term}: ${reason}`;
    events.emit("log", {type: "warn", msg});
  };

  return {fail, get: s.get, update: s.update};
};
