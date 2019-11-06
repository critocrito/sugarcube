import EventEmitter from "events";
import sinon from "sinon";

import {instrument} from "../../packages/core/lib/instrument";

const events = new EventEmitter();

describe("instrumentation", () => {
  let spy;

  beforeEach(() => {
    spy = sinon.spy();
  });

  it("collects failures", () => {
    const ins = instrument(null, {events});
    const failure = {term: "source", reason: "reason"};

    ins.fail(failure);
    ins.fail(failure);

    // The instrument sets the run marker and current plugin. Since we call
    // the instrument outside of a pipeline run we have to add those keys.
    const expected = {plugin: null, marker: null, ...failure};

    ins.get("failed").should.eql([expected, expected]);
  });

  it("registers failure for a plugin", () => {
    const ins = instrument(null, {events});
    const plugin = {plugin: "myplugin", ts: 100};
    const failure = {term: "source", reason: "reason"};
    ins.pluginStart(plugin);

    ins.fail(failure);

    ins.get("plugins.myplugin.counts.fail").should.eql(1);
  });

  it("emits a `log` event on fail", () => {
    const ev = new EventEmitter();
    ev.on("log", spy);
    const ins = instrument(null, {events: ev});
    const failure = {term: "source", reason: "reason"};

    ins.fail(failure);

    spy.calledOnce.should.equal(true);

    const args = spy.firstCall.args[0];
    // eslint-disable-next-line no-unused-expressions
    args.type.should.exist;
    // eslint-disable-next-line no-unused-expressions
    args.msg.should.exist;
  });

  it("emits a `fail` event on fail", () => {
    const ev = new EventEmitter();
    ev.on("fail", spy);
    const ins = instrument(null, {events: ev});
    const failure = {term: "source", reason: "reason"};

    ins.fail(failure);

    spy.calledOnce.should.equal(true);

    const args = spy.firstCall.args[0];
    // eslint-disable-next-line no-unused-expressions
    args.term.should.exist;
    // eslint-disable-next-line no-unused-expressions
    args.reason.should.exist;
  });

  it("collects metric counters for plugins", () => {
    const ins = instrument(null, {events});
    const plugin = {plugin: "myplugin", ts: 100};
    ins.pluginStart(plugin);

    ins.count("field");
    ins.count("field2", 5);

    ins.get("plugins.myplugin.counts.field").should.eql(1);
    ins.get("plugins.myplugin.counts.field2").should.eql(5);
  });

  it("can emit non plugin measurements for counters", () => {
    const ev = new EventEmitter();
    ev.on("count", spy);
    const ins = instrument(null, {events: ev});
    const plugin = {plugin: "myplugin", ts: 100};
    ins.pluginStart(plugin);

    ins.count("other.field");

    spy.calledOnce.should.equal(true);

    const args = spy.firstCall.args[0];

    args.should.eql({type: "other.field", term: 1, marker: {}});
  });

  it("emits a `count` event on when incrementing a counter", () => {
    const ev = new EventEmitter();
    ev.on("count", spy);
    const ins = instrument(null, {events: ev});
    const plugin = {plugin: "myplugin", ts: 100};
    ins.pluginStart(plugin);

    ins.count("field");

    spy.calledOnce.should.equal(true);

    const args = spy.firstCall.args[0];

    args.should.eql({type: "myplugin.field", term: 1, marker: {}});
  });

  it("emits a `count` event on when incrementing a counter by a fixed number", () => {
    const ev = new EventEmitter();
    ev.on("count", spy);
    const ins = instrument(null, {events: ev});
    const plugin = {plugin: "myplugin", ts: 100};
    ins.pluginStart(plugin);

    ins.count("field", 5);

    spy.calledOnce.should.equal(true);

    const args = spy.firstCall.args[0];

    args.should.eql({type: "myplugin.field", term: 5, marker: {}});
  });

  it("collects accumulative timings for plugins", () => {
    const ins = instrument(null, {events});
    const plugin = {plugin: "myplugin", ts: 100};
    ins.pluginStart(plugin);

    ins.timing({type: "t", term: 10});

    ins.get("plugins.myplugin.durations.t").should.eql(10);

    ins.timing({type: "t", term: 20});

    ins.get("plugins.myplugin.durations.t").should.eql(30);
  });

  it("emits a `duration` event on when timing a metric", () => {
    const ev = new EventEmitter();
    ev.on("duration", spy);
    const ins = instrument(null, {events: ev});
    const plugin = {plugin: "myplugin", ts: 100};
    ins.pluginStart(plugin);

    ins.timing({type: "t", term: 10});

    spy.calledOnce.should.equal(true);

    const args = spy.firstCall.args[0];

    args.should.eql({type: "myplugin.t", term: 10, marker: {}});
  });

  it("can emit non plugin measurements durations", () => {
    const ev = new EventEmitter();
    ev.on("duration", spy);
    const ins = instrument(null, {events: ev});
    const plugin = {plugin: "myplugin", ts: 100};
    ins.pluginStart(plugin);

    ins.timing({type: "other.t", term: 10});

    spy.calledOnce.should.equal(true);

    const args = spy.firstCall.args[0];

    args.should.eql({type: "other.t", term: 10, marker: {}});
  });

  it("instruments plugin start and end", () => {
    const ins = instrument(null, {events});
    const pluginStart = {plugin: "myplugin", ts: 0};
    const pluginEnd = {plugin: "myplugin", ts: 100};

    ins.pluginStart(pluginStart);
    ins.pluginEnd(pluginEnd);

    const result = ins.get("plugins.myplugin");

    result.should.eql({start: 0, end: 100, durations: {took: 100}});
  });

  it("instruments a pipeline start and end", () => {
    const ins = instrument(null, {events});
    const pipelineStart = {
      pipeline: [["p1"], ["p2"]],
      ts: 100,
      marker: "marker",
    };
    const pipelineEnd = {ts: 1000};

    ins.pipelineStart(pipelineStart);
    ins.pipelineEnd(pipelineEnd);

    ins.get("pipeline").should.eql({
      project: "Unnamed Project",
      name: "Unnamed Pipeline",
      plugins: ["p1", "p2"],
      start: 100,
      end: 1000,
      took: 900,
      marker: "marker",
    });
  });

  it("ending a pipeline emits a duration event", () => {
    const ev = new EventEmitter();
    ev.on("duration", spy);
    const ins = instrument(null, {events: ev});
    const pipelineStart = {
      pipeline: [["p1"], ["p2"]],
      ts: 100,
      marker: "marker",
    };
    const pipelineEnd = {ts: 1000};

    ins.pipelineStart(pipelineStart);
    ins.pipelineEnd(pipelineEnd);

    spy.calledOnce.should.equal(true);

    const args = spy.firstCall.args[0];

    args.should.eql({type: "pipeline.took", term: 900, marker: "marker"});
  });
});
