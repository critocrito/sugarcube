// This plugin is just a dummy, it's used to signal where the multiplexing
// should end.
const plugin = (envelope) => envelope;

plugin.desc = "Signal the end of the multiplex.";
plugin.argv = {};

export default plugin;
