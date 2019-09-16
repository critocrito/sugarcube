import plugin from "./plugins/plugin";
import instrument from "./instruments/instrument";

export const plugins = {
  boilerplate_plugin: plugin,
};

export const instruments = {
  boilerplate_instrument: instrument,
};

export default {plugins, instruments};
