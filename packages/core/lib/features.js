import {flow, camelCase} from "lodash/fp";

const createFeatureDecisions = (features = []) => {
  createFeatureDecisions.cache = createFeatureDecisions.cache.concat(features);

  const handler = {
    get: (obj, prop) => (prop in obj ? obj[prop] : () => false),
  };
  // Add any complex or dependent decision functions to the base object.
  const base = {};
  const proxy = new Proxy(base, handler);

  return createFeatureDecisions.cache.reduce((memo, feature) => {
    const name = flow([
      camelCase,
      n => `can${n.charAt(0).toUpperCase()}${n.slice(1)}`,
    ])(feature);

    return new Proxy(Object.assign({}, {[name]: () => true}, memo), handler);
  }, proxy);
};

createFeatureDecisions.cache = [];
createFeatureDecisions.reset = () => {
  createFeatureDecisions.cache = [];
};

export default createFeatureDecisions;
