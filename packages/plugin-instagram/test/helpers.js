import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();

chai.use(chaiAsPromised);
chai.should();
