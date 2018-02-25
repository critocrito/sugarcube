import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

process.on("unhandledRejection", up => {
  throw up;
});
