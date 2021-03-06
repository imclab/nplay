var fs = require('fs'),
    path = require('path');

function Group() {
  this.paths = [];
  this.excluded = [];
  this.watchTimer = null;
}

Group.prototype.include = function(filepath){
  if(!filepath) return this;
  var self = this,
      paths = (Array.isArray(filepath) ? filepath : [ filepath ]);

  paths.forEach(function(p) {
    var isDirectory = fs.statSync(p).isDirectory();

    if (isDirectory) {
//      p += (p[p.length-1] !== '/' ? '/' : '');
      return fs.readdirSync(p).forEach(function (f) {
        self.include(path.join(p, f));
      });
    }
    self.paths.push(p);
  });
  return this;
};

Group.prototype.exclude = function(module) {
  this.excluded.push(module);
  return this;
};

// Exclude paths based on expressions (done just before rendering)
Group.prototype._exclude = function() {
  var self = this;
  this.excluded.forEach(function(expr) {
    self.paths = self.paths.filter(function(p){
      if(expr.test && expr.test(p)) {
        return false;
      } else if(p.substr(expr.length) == expr) {
        return false;
      }
      return true;
    })
  });
};

Group.prototype.resolve = function() {
  this._exclude();
  this.paths.sort();
  return this.paths;
};

module.exports = Group;
