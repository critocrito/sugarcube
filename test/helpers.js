import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sourceMapSupport from "source-map-support";

chai.use(chaiAsPromised);
chai.should();
sourceMapSupport.install();

process.on("unhandledRejection", up => {
  throw up;
});
