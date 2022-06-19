// Used by handlebars template
module.exports = function (obj) {
  return JSON.stringify(obj, null, 3);
};
