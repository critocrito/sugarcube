import {state} from "./state";

export const instrument = maybeState => {
  const s = state(maybeState);

  const fail = failure => {
    s.update("failed", failures =>
      Array.isArray(failures) ? failures.concat(failure) : [failure],
    );
  };

  return {fail, get: s.get, update: s.update};
};
