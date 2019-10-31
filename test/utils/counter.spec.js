import {range} from "lodash/fp";
import sinon from "sinon";

import {counter} from "../../packages/utils/lib";

describe("the counter utility", () => {
  it("calls a logger function with stats about the progress", () => {
    const stub = sinon.stub();
    const logCounter = counter(100, stub);

    range(0, 100).forEach(() => logCounter());

    stub.getCall(0).args[0].should.eql({total: 100, cnt: 50, percent: 50});
    stub.getCall(1).args[0].should.eql({total: 100, cnt: 100, percent: 100});
  });

  it("calls a logger function as a default every 50 steps", () => {
    const stub = sinon.stub();
    const logCounter = counter(1000, stub);

    range(0, 125).forEach(() => logCounter());

    stub.callCount.should.equal(2);
  });

  it("calls a logger function every user defined interval", () => {
    const stub = sinon.stub();
    const logCounter = counter(1000, stub, {steps: 25});

    range(0, 125).forEach(() => logCounter());

    stub.callCount.should.equal(5);
  });

  it("calls a logger function only if the total exceeds a minimum threshold", () => {
    const stub = sinon.stub();

    const logCounter = counter(9, stub, {threshold: 10});

    logCounter();

    stub.called.should.equal(false);
  });

  it("calls a logger function only if the default threshold of 100 is met", () => {
    const stub = sinon.stub();

    const logCounter = counter(101, stub);

    range(0, 101).forEach(() => logCounter());

    stub.called.should.equal(true);
  });
});
