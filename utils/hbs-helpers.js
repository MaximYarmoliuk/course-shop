module.exports = {
  ifeq(a, b, opt) {
    if (a == b) {
      return opt.fn(this);
    }
    return opt.inverse(this);
  },
};
