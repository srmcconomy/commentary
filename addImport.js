const modules = [];

module.exports = {
  add: function(source) {
    modules.push(source);
  },
  get: function() { return modules },
};
