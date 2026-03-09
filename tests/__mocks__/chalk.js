// Mock chalk for Jest tests
const identity = (str) => str;

const createChalk = () => {
  const fn = (str) => str;
  return new Proxy(fn, {
    get: (target, prop) => {
      if (prop === 'hex' || prop === 'bgHex') {
        return () => createChalk();
      }
      return createChalk();
    },
  });
};

const chalk = createChalk();

module.exports = chalk;
module.exports.default = chalk;
