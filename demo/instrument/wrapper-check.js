const Acorn = require("acorn");
const Aran = require("aran");
const Astring = require("astring");
const AranAccessControl = require("aran-access-control");

const aran = Aran({namespace:"ADVICE", sandbox:true});
const instrument = (script, scope) =>
    Astring.generate(aran.weave(Acorn.parse(script), pointcut, scope));
let wrappers = new WeakSet();
const access = AranAccessControl({
  instrument: instrument,
  enter: (value) => {
    const wrapper = {inner:value};
    wrappers.add(wrapper);
    return wrapper;
  },
  leave: (wrapper) => {
    if (!wrappers.has(wrapper))
      throw new Error("Unwrapped value", wrapper);
    return wrapper.inner;
  }
});
global.ADVICE = access.advice;
const pointcut = Object.keys(ADVICE);
global.eval(Astring.generate(aran.setup()));
module.exports = (script, source) => instrument(script);