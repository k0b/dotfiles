Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _check = require('./check');

var _executor = require('./executor');

var _pathhelper = require('./pathhelper');

var _pathhelper2 = _interopRequireDefault(_pathhelper);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var Locator = (function () {
  function Locator(options) {
    var _this = this;

    _classCallCheck(this, Locator);

    this.subscriptions = new _atom.CompositeDisposable();
    this.environmentFn = null;
    this.executor = null;
    this.executableSuffix = '';
    this.pathKey = 'PATH';
    if (_os2['default'].platform() === 'win32') {
      this.executableSuffix = '.exe';
      this.pathKey = 'Path';
    }
    this.goExecutables = ['go' + this.executableSuffix, 'goapp' + this.executableSuffix];
    this.readyFn = null;
    if ((0, _check.isTruthy)(options)) {
      if ((0, _check.isTruthy)(options.environment)) {
        this.environmentFn = options.environment;
      }
      if ((0, _check.isTruthy)(options.ready)) {
        this.readyFn = options.ready;
      }
      if ((0, _check.isTruthy)(options.executor)) {
        this.executor = options.executor;
      }
    }

    if (this.executor === null) {
      this.executor = new _executor.Executor({ environmentFn: this.environment.bind(this) });
    }

    this.subscriptions.add(this.executor);
    this.goLocators = [
    // Avoid using gorootLocator / GOROOT unless you know what you're doing
    // (and assume you don't know what you're unless you have significant
    // go experience)
    function () {
      return _this.gorootLocator();
    }, function () {
      return _this.editorconfigLocator();
    }, function () {
      return _this.configLocator();
    }, function () {
      return _this.pathLocator();
    }, function () {
      return _this.defaultLocator();
    }];

    this.setKnownToolStrategies();
  }

  _createClass(Locator, [{
    key: 'dispose',
    value: function dispose() {
      this.resetRuntimes();
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }
      this.goLocators = null;
      this.executableSuffix = null;
      this.pathKey = null;
      this.goExecutables = null;
      this.subscriptions = null;
      this.environmentFn = null;
      this.executor = null;
      this.readyFn = null;
      this.toolLocations = null;
      this.toolStrategies = null;
    }

    // Public: Get the go runtime(s).
    // Returns an array of {Object} where each item contains the output from "go
    // env", or false if no runtimes are found.
  }, {
    key: 'runtimes',
    value: function runtimes() {
      var _this2 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if ((0, _check.isTruthy)(this.runtimesCache)) {
        return Promise.resolve(this.runtimesCache);
      }

      return new Promise(function (resolve, reject) {
        var candidates = _this2.runtimeCandidates(options);
        if ((0, _check.isEmpty)(candidates)) {
          return resolve([]);
        }

        var viableCandidates = [];
        for (var candidate of candidates) {
          var goversion = _this2.executor.execSync(candidate, ['version'], { cwd: _path2['default'].dirname(candidate) });
          if ((0, _check.isTruthy)(goversion) && goversion.exitcode === 0 && goversion.stdout.startsWith('go ')) {
            var v = { path: candidate, version: goversion.stdout.replace(/\r?\n|\r/g, '') };
            var versionComponents = v.version.split(' ');
            v.name = versionComponents[2];
            v.semver = versionComponents[2];
            if (v.semver.startsWith('go')) {
              v.semver = v.semver.substring(2, v.semver.length);
            }
            viableCandidates.push(v);
          }
        }

        var finalCandidates = [];
        for (var viableCandidate of viableCandidates) {
          var goenv = _this2.executor.execSync(viableCandidate.path, ['env'], { cwd: _path2['default'].dirname(viableCandidate.path) });
          if ((0, _check.isTruthy)(goenv) && goenv.exitcode === 0 && goenv.stdout.trim() !== '') {
            var items = goenv.stdout.split('\n');
            for (var item of items) {
              item = item.replace(/[\n\r]/g, '');
              if (item.includes('=')) {
                var tuple = item.split('=');
                var key = tuple[0];
                var value = tuple[1];
                if (tuple.length > 2) {
                  value = tuple.slice(1, tuple.length + 1).join('=');
                }
                if (_os2['default'].platform() === 'win32') {
                  if (key.startsWith('set ')) {
                    key = key.substring(4, key.length);
                  }
                } else {
                  if (value.length > 2) {
                    value = value.substring(1, value.length - 1);
                  } else {
                    value = '';
                  }
                }
                viableCandidate[key] = value;
              }
            }
            finalCandidates.push(viableCandidate);
          }
        }

        _this2.runtimesCache = finalCandidates;
        resolve(_this2.runtimesCache);
      });
    }

    // Deprecated: Use runtime(options) instead.
  }, {
    key: 'runtimeForProject',
    value: function runtimeForProject(project) {
      return this.runtime();
    }

    // Public: Get the go runtime.
    // Returns an {Object} which contains the output from "go env", or false if
    // no runtime is found.
  }, {
    key: 'runtime',
    value: function runtime() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.runtimes(options).then(function (r) {
        if ((0, _check.isFalsy)(r) || r.length < 1) {
          return false;
        } else {
          return r[0];
        }
      });
    }

    // Public: Get the gopath.
    // Returns the GOPATH if it exists, or false if it is not defined.
  }, {
    key: 'gopath',
    value: function gopath() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var e = this.rawEnvironment(options);
      if ((0, _check.isFalsy)(e.GOPATH) || e.GOPATH.trim() === '') {
        return false;
      }

      return _pathhelper2['default'].expand(e, e.GOPATH);
    }

    // Public: Find the specified tool.
    // Returns the path to the tool if found, or false if it cannot be found.
  }, {
    key: 'findTool',
    value: function findTool(name) {
      var _this3 = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if ((0, _check.isFalsy)(name) || name.constructor !== String || name.trim() === '') {
        return Promise.resolve(false);
      }

      if (!this.toolStrategies) {
        return Promise.resolve(false);
      }

      var strategy = false;
      return Promise.resolve(null).then(function () {
        if (_this3.toolStrategies.has(name)) {
          strategy = _this3.toolStrategies.get(name);
        }
        if ((0, _check.isFalsy)(strategy)) {
          strategy = 'DEFAULT';
        }
      }).then(function () {
        if (strategy !== 'GOROOTBIN' && strategy !== 'GOTOOLDIR') {
          return false;
        }

        return _this3.runtime(options).then(function (runtime) {
          if ((0, _check.isFalsy)(runtime)) {
            return false;
          }

          if (strategy === 'GOROOTBIN') {
            if (name === 'go' && runtime.path.endsWith('goapp' + runtime.GOEXE)) {
              return _path2['default'].join(runtime.GOROOT, 'bin', 'goapp' + runtime.GOEXE);
            }

            return _path2['default'].join(runtime.GOROOT, 'bin', name + runtime.GOEXE);
          } else if (strategy === 'GOTOOLDIR') {
            return _path2['default'].join(runtime.GOTOOLDIR, name + runtime.GOEXE);
          }
          return false;
        });
      }).then(function (specificTool) {
        if ((0, _check.isTruthy)(specificTool)) {
          return _this3.stat(specificTool).then(function (s) {
            if ((0, _check.isTruthy)(s) && s.isFile()) {
              return specificTool;
            }
          })['catch'](function (err) {
            _this3.handleError(err);
            return false;
          });
        }

        if (strategy === 'GOPATHBIN') {
          return _this3.findToolInDelimitedEnvironmentVariable(name, 'GOPATH', options);
        }

        if (strategy === 'PATH') {
          return _this3.findToolInDelimitedEnvironmentVariable(name, _this3.pathKey, options);
        }

        return _this3.findToolWithDefaultStrategy(name, options);
      });
    }
  }, {
    key: 'resetRuntimes',
    value: function resetRuntimes() {
      this.runtimesCache = null;
    }
  }, {
    key: 'statishSync',
    value: function statishSync(pathValue) {
      var stat = false;
      if ((0, _check.isTruthy)(pathValue) && !(pathValue.trim() === '')) {
        try {
          stat = _fs2['default'].statSync(pathValue);
        } catch (e) {}
      }
      return stat;
    }
  }, {
    key: 'stat',
    value: function stat(p) {
      var _this4 = this;

      if ((0, _check.isFalsy)(p) || p.constructor !== String || p.trim() === '') {
        return Promise.resolve(false);
      }

      return new Promise(function (resolve, reject) {
        _fs2['default'].stat(p, function (err, stat) {
          if ((0, _check.isTruthy)(err)) {
            _this4.handleError(err);
            resolve(false);
            return;
          }
          resolve(stat);
        });
      });
    }
  }, {
    key: 'pathExists',
    value: function pathExists(p) {
      return this.exists(p).then(function (e) {
        if ((0, _check.isFalsy)(e)) {
          return false;
        }
        return p;
      });
    }
  }, {
    key: 'fileExists',
    value: function fileExists(p) {
      return this.stat(p).then(function (s) {
        if ((0, _check.isFalsy)(s)) {
          return false;
        }

        if (s.isFile()) {
          return p;
        }

        return false;
      });
    }
  }, {
    key: 'directoryExists',
    value: function directoryExists(p) {
      return this.stat(p).then(function (s) {
        if ((0, _check.isFalsy)(s)) {
          return false;
        }

        if (s.isDirectory()) {
          return p;
        }

        return false;
      });
    }
  }, {
    key: 'exists',
    value: function exists(p) {
      return this.stat(p).then(function (s) {
        if ((0, _check.isFalsy)(s)) {
          return false;
        }

        return true;
      });
    }
  }, {
    key: 'runtimeCandidates',
    value: function runtimeCandidates() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var candidates = [];
      for (var locator of this.goLocators) {
        var c = locator(options);
        if ((0, _check.isTruthy)(c) && c.constructor === Array && c.length > 0) {
          candidates = _lodash2['default'].union(candidates, c);
        }
      }
      return candidates;
    }
  }, {
    key: 'editorconfigLocator',
    value: function editorconfigLocator() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      // TODO: .editorconfig
      return false;
    }

    // Internal: Find a go installation using your Atom config. Deliberately
    // undocumented, as this method is discouraged.
  }, {
    key: 'configLocator',
    value: function configLocator() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var goinstallation = atom.config.get('go-config.goinstallation');
      var stat = this.statishSync(goinstallation);
      if ((0, _check.isTruthy)(stat)) {
        var d = goinstallation;
        if (stat.isFile()) {
          d = _path2['default'].dirname(goinstallation);
        }
        return this.findExecutablesInPath(d, this.executables, options);
      }

      return [];
    }
  }, {
    key: 'gorootLocator',
    value: function gorootLocator() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var g = this.environment(options).GOROOT;
      if ((0, _check.isFalsy)(g) || g.trim() === '') {
        return [];
      }
      return this.findExecutablesInPath(_path2['default'].join(g, 'bin'), this.goExecutables, options);
    }
  }, {
    key: 'pathLocator',
    value: function pathLocator() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.findExecutablesInPath(this.environment(options)[this.pathKey], this.goExecutables, options);
    }
  }, {
    key: 'defaultLocator',
    value: function defaultLocator() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var installPaths = [];
      if (_os2['default'].platform() === 'win32') {
        /*
        c:\go\bin = Binary Distribution
        c:\tools\go\bin = Chocolatey
        */
        installPaths.push(_path2['default'].join('c:', 'go', 'bin'));
        installPaths.push(_path2['default'].join('c:', 'tools', 'go', 'bin'));
      } else {
        /*
        /usr/local/go/bin = Binary Distribution
        /usr/local/bin = Homebrew
        */
        installPaths.push(_path2['default'].join('/', 'usr', 'local', 'go', 'bin'));
        installPaths.push(_path2['default'].join('/', 'usr', 'local', 'bin'));
      }
      return this.findExecutablesInPath(installPaths.join(_path2['default'].delimiter), this.goExecutables, options);
    }
  }, {
    key: 'findExecutablesInPath',
    value: function findExecutablesInPath(pathValue, executables) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var candidates = [];
      if ((0, _check.isFalsy)(pathValue) || pathValue.constructor !== String || pathValue.trim() === '') {
        return candidates;
      }

      if ((0, _check.isFalsy)(executables) || executables.constructor !== Array || executables.length < 1) {
        return candidates;
      }

      var elements = _pathhelper2['default'].expand(this.environment(options), pathValue).split(_path2['default'].delimiter);
      for (var element of elements) {
        for (var executable of executables) {
          var candidate = _path2['default'].join(element, executable);
          var stat = this.statishSync(candidate);
          if ((0, _check.isTruthy)(stat) && stat.isFile() && stat.size > 0) {
            candidates.push(candidate);
          }
        }
      }
      return candidates;
    }

    // Internal: Get a copy of the environment, with the GOPATH correctly set.
    // Returns an {Object} where the key is the environment variable name and the value is the environment variable value.
  }, {
    key: 'environment',
    value: function environment() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var env = this.rawEnvironment(options);
      var g = this.gopath(options);
      if (g && g !== '') {
        env.GOPATH = g;
      }
      return env;
    }
  }, {
    key: 'rawEnvironment',
    value: function rawEnvironment() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var env = process.env;
      if ((0, _check.isTruthy)(this.environmentFn)) {
        env = this.environmentFn();
      }
      env = Object.assign({}, env);
      return env;
    }

    // Internal: Indicates that the locator is ready, or not.
    // Returns true if ready, else false.
  }, {
    key: 'ready',
    value: function ready() {
      if ((0, _check.isFalsy)(this.readyFn)) {
        return true;
      }
      return this.readyFn();
    }

    // Internal: Set the strategy for finding known or built-in tools.
    // Returns a map where the key is the tool name and the value is the strategy.
  }, {
    key: 'setKnownToolStrategies',
    value: function setKnownToolStrategies() {
      this.toolStrategies = new Map();

      // Built-In Tools
      this.toolStrategies.set('go', 'GOROOTBIN');
      this.toolStrategies.set('gofmt', 'GOROOTBIN');
      this.toolStrategies.set('godoc', 'GOROOTBIN');
      this.toolStrategies.set('addr2line', 'GOTOOLDIR');
      this.toolStrategies.set('api', 'GOTOOLDIR');
      this.toolStrategies.set('asm', 'GOTOOLDIR');
      this.toolStrategies.set('cgo', 'GOTOOLDIR');
      this.toolStrategies.set('compile', 'GOTOOLDIR');
      this.toolStrategies.set('cover', 'GOTOOLDIR');
      this.toolStrategies.set('dist', 'GOTOOLDIR');
      this.toolStrategies.set('doc', 'GOTOOLDIR');
      this.toolStrategies.set('fix', 'GOTOOLDIR');
      this.toolStrategies.set('link', 'GOTOOLDIR');
      this.toolStrategies.set('nm', 'GOTOOLDIR');
      this.toolStrategies.set('objdump', 'GOTOOLDIR');
      this.toolStrategies.set('pack', 'GOTOOLDIR');
      this.toolStrategies.set('pprof', 'GOTOOLDIR');
      this.toolStrategies.set('tour', 'GOTOOLDIR');
      this.toolStrategies.set('trace', 'GOTOOLDIR');
      this.toolStrategies.set('vet', 'GOTOOLDIR');
      this.toolStrategies.set('yacc', 'GOTOOLDIR');

      // External Tools
      this.toolStrategies.set('git', 'PATH');

      // Other Tools Are Assumed To Be In PATH or GOBIN or GOPATH/bin
      // GOPATHBIN Can Be Used In The Future As A Strategy, If Required
      // GOPATHBIN Will Understand GO15VENDOREXPERIMENT
    }

    // Internal: Handle the specified error, if needed.
  }, {
    key: 'handleError',
    value: function handleError(err) {
      if ((0, _check.isTruthy)(err.handle)) {
        err.handle();
      }
      // console.log(err)
    }

    // Internal: Try to find a tool with the default strategy (GOPATH/bin, then
    // PATH).
    // Returns the path to the tool, or false if it cannot be found.
  }, {
    key: 'findToolWithDefaultStrategy',
    value: function findToolWithDefaultStrategy(name) {
      var _this5 = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if ((0, _check.isFalsy)(name) || name.constructor !== String || name.trim() === '') {
        return Promise.resolve(false);
      }

      // Default Strategy Is: Look For The Tool In GOPATH, Then Look In PATH
      return Promise.resolve().then(function () {
        return _this5.findToolInDelimitedEnvironmentVariable(name, 'GOPATH', options);
      }).then(function (tool) {
        if ((0, _check.isTruthy)(tool)) {
          return tool;
        }
        return _this5.findToolInDelimitedEnvironmentVariable(name, _this5.pathKey, options);
      });
    }

    // Internal: Try to find a tool in a delimited environment variable (e.g.
    // PATH).
    // Returns the path to the tool, or false if it cannot be found.
  }, {
    key: 'findToolInDelimitedEnvironmentVariable',
    value: function findToolInDelimitedEnvironmentVariable(toolName, key) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if ((0, _check.isFalsy)(toolName) || toolName.constructor !== String || toolName.trim() === '') {
        return false;
      }

      var p = this.environment(options)[key];
      if ((0, _check.isFalsy)(p)) {
        return false;
      }

      var elements = p.split(_path2['default'].delimiter);
      if (key === 'GOPATH' && (0, _check.isTruthy)(this.environment(options)['GO15VENDOREXPERIMENT'])) {
        // TODO: Understand Vendor Experiment Paths Better
        // elements.unshift('vendor')
      }
      for (var element of elements) {
        var item = '';
        if (key === 'GOPATH') {
          item = _path2['default'].join(element, 'bin', toolName + this.executableSuffix);
        } else {
          item = _path2['default'].join(element, toolName + this.executableSuffix);
        }

        if (_fs2['default'].existsSync(item)) {
          var stat = _fs2['default'].statSync(item);
          if (stat && stat.isFile() && stat.size > 0) {
            return item;
          }
        }
      }

      return false;
    }
  }]);

  return Locator;
})();

exports.Locator = Locator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1jb25maWcvbGliL2xvY2F0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFa0MsTUFBTTs7cUJBQ0MsU0FBUzs7d0JBQzNCLFlBQVk7OzBCQUNaLGNBQWM7Ozs7c0JBQ3ZCLFFBQVE7Ozs7a0JBQ1AsSUFBSTs7OztrQkFDSixJQUFJOzs7O29CQUNGLE1BQU07Ozs7QUFUdkIsV0FBVyxDQUFBOztJQVdMLE9BQU87QUFDQyxXQURSLE9BQU8sQ0FDRSxPQUFPLEVBQUU7OzswQkFEbEIsT0FBTzs7QUFFVCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUE7QUFDMUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUE7QUFDckIsUUFBSSxnQkFBRyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQTtBQUM5QixVQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtLQUN0QjtBQUNELFFBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUNwRixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtBQUNuQixRQUFJLHFCQUFTLE9BQU8sQ0FBQyxFQUFFO0FBQ3JCLFVBQUkscUJBQVMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQ2pDLFlBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQTtPQUN6QztBQUNELFVBQUkscUJBQVMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFF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Q0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDM0MsVUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQy9DLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQTtBQUM3QyxVQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDNUMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQzNDLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQTtBQUMzQyxVQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDNUMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQzFDLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQTtBQUMvQyxVQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDNUMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQzdDLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQTtBQUM1QyxVQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDN0MsVUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQzNDLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQTs7O0FBRzVDLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTs7Ozs7S0FLdkM7Ozs7O1dBR1cscUJBQUMsR0FBRyxFQUFFO0FBQ2hCLFVBQUkscUJBQVMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3hCLFdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtPQUNiOztLQUVGOzs7Ozs7O1dBSzJCLHFDQUFDLElBQUksRUFBZ0I7OztVQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDN0MsVUFBSSxvQkFBUSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ3RFLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUM5Qjs7O0FBR0QsYUFBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDbEMsZUFBTyxPQUFLLHNDQUFzQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUE7T0FDNUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUNoQixZQUFJLHFCQUFTLElBQUksQ0FBQyxFQUFFO0FBQ2xCLGlCQUFPLElBQUksQ0FBQTtTQUNaO0FBQ0QsZUFBTyxPQUFLLHNDQUFzQyxDQUFDLElBQUksRUFBRSxPQUFLLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtPQUNoRixDQUFDLENBQUE7S0FDSDs7Ozs7OztXQUtzQyxnREFBQyxRQUFRLEVBQUUsR0FBRyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDakUsVUFBSSxvQkFBUSxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsV0FBVyxLQUFLLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ2xGLGVBQU8sS0FBSyxDQUFBO09BQ2I7O0FBRUQsVUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN0QyxVQUFJLG9CQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ2QsZUFBTyxLQUFLLENBQUE7T0FDYjs7QUFFRCxVQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGtCQUFLLFNBQVMsQ0FBQyxDQUFBO0FBQ3RDLFVBQUksR0FBRyxLQUFLLFFBQVEsSUFBSSxxQkFBUyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRTs7O09BR3BGO0FBQ0QsV0FBSyxJQUFJLE9BQU8sSUFBSSxRQUFRLEVBQUU7QUFDNUIsWUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ2IsWUFBSSxHQUFHLEtBQUssUUFBUSxFQUFFO0FBQ3BCLGNBQUksR0FBRyxrQkFBSyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7U0FDbkUsTUFBTTtBQUNMLGNBQUksR0FBRyxrQkFBSyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtTQUM1RDs7QUFFRCxZQUFJLGdCQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN2QixjQUFJLElBQUksR0FBRyxnQkFBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDNUIsY0FBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQzFDLG1CQUFPLElBQUksQ0FBQTtXQUNaO1NBQ0Y7T0FDRjs7QUFFRCxhQUFPLEtBQUssQ0FBQTtLQUNiOzs7U0E5ZkcsT0FBTzs7O1FBaWdCTCxPQUFPLEdBQVAsT0FBTyIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvZ28tY29uZmlnL2xpYi9sb2NhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHtpc1RydXRoeSwgaXNGYWxzeSwgaXNFbXB0eX0gZnJvbSAnLi9jaGVjaydcbmltcG9ydCB7RXhlY3V0b3J9IGZyb20gJy4vZXhlY3V0b3InXG5pbXBvcnQgcGF0aGhlbHBlciBmcm9tICcuL3BhdGhoZWxwZXInXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jbGFzcyBMb2NhdG9yIHtcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5lbnZpcm9ubWVudEZuID0gbnVsbFxuICAgIHRoaXMuZXhlY3V0b3IgPSBudWxsXG4gICAgdGhpcy5leGVjdXRhYmxlU3VmZml4ID0gJydcbiAgICB0aGlzLnBhdGhLZXkgPSAnUEFUSCdcbiAgICBpZiAob3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJykge1xuICAgICAgdGhpcy5leGVjdXRhYmxlU3VmZml4ID0gJy5leGUnXG4gICAgICB0aGlzLnBhdGhLZXkgPSAnUGF0aCdcbiAgICB9XG4gICAgdGhpcy5nb0V4ZWN1dGFibGVzID0gWydnbycgKyB0aGlzLmV4ZWN1dGFibGVTdWZmaXgsICdnb2FwcCcgKyB0aGlzLmV4ZWN1dGFibGVTdWZmaXhdXG4gICAgdGhpcy5yZWFkeUZuID0gbnVsbFxuICAgIGlmIChpc1RydXRoeShvcHRpb25zKSkge1xuICAgICAgaWYgKGlzVHJ1dGh5KG9wdGlvbnMuZW52aXJvbm1lbnQpKSB7XG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnRGbiA9IG9wdGlvbnMuZW52aXJvbm1lbnRcbiAgICAgIH1cbiAgICAgIGlmIChpc1RydXRoeShvcHRpb25zLnJlYWR5KSkge1xuICAgICAgICB0aGlzLnJlYWR5Rm4gPSBvcHRpb25zLnJlYWR5XG4gICAgICB9XG4gICAgICBpZiAoaXNUcnV0aHkob3B0aW9ucy5leGVjdXRvcikpIHtcbiAgICAgICAgdGhpcy5leGVjdXRvciA9IG9wdGlvbnMuZXhlY3V0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5leGVjdXRvciA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5leGVjdXRvciA9IG5ldyBFeGVjdXRvcih7ZW52aXJvbm1lbnRGbjogdGhpcy5lbnZpcm9ubWVudC5iaW5kKHRoaXMpfSlcbiAgICB9XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZXhlY3V0b3IpXG4gICAgdGhpcy5nb0xvY2F0b3JzID0gW1xuICAgICAgLy8gQXZvaWQgdXNpbmcgZ29yb290TG9jYXRvciAvIEdPUk9PVCB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UncmUgZG9pbmdcbiAgICAgIC8vIChhbmQgYXNzdW1lIHlvdSBkb24ndCBrbm93IHdoYXQgeW91J3JlIHVubGVzcyB5b3UgaGF2ZSBzaWduaWZpY2FudFxuICAgICAgLy8gZ28gZXhwZXJpZW5jZSlcbiAgICAgICgpID0+IHsgcmV0dXJuIHRoaXMuZ29yb290TG9jYXRvcigpIH0sXG4gICAgICAoKSA9PiB7IHJldHVybiB0aGlzLmVkaXRvcmNvbmZpZ0xvY2F0b3IoKSB9LFxuICAgICAgKCkgPT4geyByZXR1cm4gdGhpcy5jb25maWdMb2NhdG9yKCkgfSxcbiAgICAgICgpID0+IHsgcmV0dXJuIHRoaXMucGF0aExvY2F0b3IoKSB9LFxuICAgICAgKCkgPT4geyByZXR1cm4gdGhpcy5kZWZhdWx0TG9jYXRvcigpIH1cbiAgICBdXG5cbiAgICB0aGlzLnNldEtub3duVG9vbFN0cmF0ZWdpZXMoKVxuICB9XG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgdGhpcy5yZXNldFJ1bnRpbWVzKClcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuZ29Mb2NhdG9ycyA9IG51bGxcbiAgICB0aGlzLmV4ZWN1dGFibGVTdWZmaXggPSBudWxsXG4gICAgdGhpcy5wYXRoS2V5ID0gbnVsbFxuICAgIHRoaXMuZ29FeGVjdXRhYmxlcyA9IG51bGxcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5lbnZpcm9ubWVudEZuID0gbnVsbFxuICAgIHRoaXMuZXhlY3V0b3IgPSBudWxsXG4gICAgdGhpcy5yZWFkeUZuID0gbnVsbFxuICAgIHRoaXMudG9vbExvY2F0aW9ucyA9IG51bGxcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzID0gbnVsbFxuICB9XG5cbiAgLy8gUHVibGljOiBHZXQgdGhlIGdvIHJ1bnRpbWUocykuXG4gIC8vIFJldHVybnMgYW4gYXJyYXkgb2Yge09iamVjdH0gd2hlcmUgZWFjaCBpdGVtIGNvbnRhaW5zIHRoZSBvdXRwdXQgZnJvbSBcImdvXG4gIC8vIGVudlwiLCBvciBmYWxzZSBpZiBubyBydW50aW1lcyBhcmUgZm91bmQuXG4gIHJ1bnRpbWVzIChvcHRpb25zID0ge30pIHtcbiAgICBpZiAoaXNUcnV0aHkodGhpcy5ydW50aW1lc0NhY2hlKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnJ1bnRpbWVzQ2FjaGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBjYW5kaWRhdGVzID0gdGhpcy5ydW50aW1lQ2FuZGlkYXRlcyhvcHRpb25zKVxuICAgICAgaWYgKGlzRW1wdHkoY2FuZGlkYXRlcykpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pXG4gICAgICB9XG5cbiAgICAgIGxldCB2aWFibGVDYW5kaWRhdGVzID0gW11cbiAgICAgIGZvciAobGV0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgIGxldCBnb3ZlcnNpb24gPSB0aGlzLmV4ZWN1dG9yLmV4ZWNTeW5jKGNhbmRpZGF0ZSwgWyd2ZXJzaW9uJ10sIHtjd2Q6IHBhdGguZGlybmFtZShjYW5kaWRhdGUpfSlcbiAgICAgICAgaWYgKGlzVHJ1dGh5KGdvdmVyc2lvbikgJiYgZ292ZXJzaW9uLmV4aXRjb2RlID09PSAwICYmIGdvdmVyc2lvbi5zdGRvdXQuc3RhcnRzV2l0aCgnZ28gJykpIHtcbiAgICAgICAgICBsZXQgdiA9IHtwYXRoOiBjYW5kaWRhdGUsIHZlcnNpb246IGdvdmVyc2lvbi5zdGRvdXQucmVwbGFjZSgvXFxyP1xcbnxcXHIvZywgJycpfVxuICAgICAgICAgIGxldCB2ZXJzaW9uQ29tcG9uZW50cyA9IHYudmVyc2lvbi5zcGxpdCgnICcpXG4gICAgICAgICAgdi5uYW1lID0gdmVyc2lvbkNvbXBvbmVudHNbMl1cbiAgICAgICAgICB2LnNlbXZlciA9IHZlcnNpb25Db21wb25lbnRzWzJdXG4gICAgICAgICAgaWYgKHYuc2VtdmVyLnN0YXJ0c1dpdGgoJ2dvJykpIHtcbiAgICAgICAgICAgIHYuc2VtdmVyID0gdi5zZW12ZXIuc3Vic3RyaW5nKDIsIHYuc2VtdmVyLmxlbmd0aClcbiAgICAgICAgICB9XG4gICAgICAgICAgdmlhYmxlQ2FuZGlkYXRlcy5wdXNoKHYpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGZpbmFsQ2FuZGlkYXRlcyA9IFtdXG4gICAgICBmb3IgKGxldCB2aWFibGVDYW5kaWRhdGUgb2YgdmlhYmxlQ2FuZGlkYXRlcykge1xuICAgICAgICBsZXQgZ29lbnYgPSB0aGlzLmV4ZWN1dG9yLmV4ZWNTeW5jKHZpYWJsZUNhbmRpZGF0ZS5wYXRoLCBbJ2VudiddLCB7Y3dkOiBwYXRoLmRpcm5hbWUodmlhYmxlQ2FuZGlkYXRlLnBhdGgpfSlcbiAgICAgICAgaWYgKGlzVHJ1dGh5KGdvZW52KSAmJiBnb2Vudi5leGl0Y29kZSA9PT0gMCAmJiBnb2Vudi5zdGRvdXQudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgIGxldCBpdGVtcyA9IGdvZW52LnN0ZG91dC5zcGxpdCgnXFxuJylcbiAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9bXFxuXFxyXS9nLCAnJylcbiAgICAgICAgICAgIGlmIChpdGVtLmluY2x1ZGVzKCc9JykpIHtcbiAgICAgICAgICAgICAgbGV0IHR1cGxlID0gaXRlbS5zcGxpdCgnPScpXG4gICAgICAgICAgICAgIGxldCBrZXkgPSB0dXBsZVswXVxuICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0dXBsZVsxXVxuICAgICAgICAgICAgICBpZiAodHVwbGUubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdHVwbGUuc2xpY2UoMSwgdHVwbGUubGVuZ3RoICsgMSkuam9pbignPScpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ3NldCAnKSkge1xuICAgICAgICAgICAgICAgICAga2V5ID0ga2V5LnN1YnN0cmluZyg0LCBrZXkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMSwgdmFsdWUubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdmFsdWUgPSAnJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2aWFibGVDYW5kaWRhdGVba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpbmFsQ2FuZGlkYXRlcy5wdXNoKHZpYWJsZUNhbmRpZGF0ZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJ1bnRpbWVzQ2FjaGUgPSBmaW5hbENhbmRpZGF0ZXNcbiAgICAgIHJlc29sdmUodGhpcy5ydW50aW1lc0NhY2hlKVxuICAgIH0pXG4gIH1cblxuICAvLyBEZXByZWNhdGVkOiBVc2UgcnVudGltZShvcHRpb25zKSBpbnN0ZWFkLlxuICBydW50aW1lRm9yUHJvamVjdCAocHJvamVjdCkge1xuICAgIHJldHVybiB0aGlzLnJ1bnRpbWUoKVxuICB9XG5cbiAgLy8gUHVibGljOiBHZXQgdGhlIGdvIHJ1bnRpbWUuXG4gIC8vIFJldHVybnMgYW4ge09iamVjdH0gd2hpY2ggY29udGFpbnMgdGhlIG91dHB1dCBmcm9tIFwiZ28gZW52XCIsIG9yIGZhbHNlIGlmXG4gIC8vIG5vIHJ1bnRpbWUgaXMgZm91bmQuXG4gIHJ1bnRpbWUgKG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLnJ1bnRpbWVzKG9wdGlvbnMpLnRoZW4oKHIpID0+IHtcbiAgICAgIGlmIChpc0ZhbHN5KHIpIHx8IHIubGVuZ3RoIDwgMSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByWzBdXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBnb3BhdGguXG4gIC8vIFJldHVybnMgdGhlIEdPUEFUSCBpZiBpdCBleGlzdHMsIG9yIGZhbHNlIGlmIGl0IGlzIG5vdCBkZWZpbmVkLlxuICBnb3BhdGggKG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBlID0gdGhpcy5yYXdFbnZpcm9ubWVudChvcHRpb25zKVxuICAgIGlmIChpc0ZhbHN5KGUuR09QQVRIKSB8fCBlLkdPUEFUSC50cmltKCkgPT09ICcnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0aGhlbHBlci5leHBhbmQoZSwgZS5HT1BBVEgpXG4gIH1cblxuICAvLyBQdWJsaWM6IEZpbmQgdGhlIHNwZWNpZmllZCB0b29sLlxuICAvLyBSZXR1cm5zIHRoZSBwYXRoIHRvIHRoZSB0b29sIGlmIGZvdW5kLCBvciBmYWxzZSBpZiBpdCBjYW5ub3QgYmUgZm91bmQuXG4gIGZpbmRUb29sIChuYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAoaXNGYWxzeShuYW1lKSB8fCBuYW1lLmNvbnN0cnVjdG9yICE9PSBTdHJpbmcgfHwgbmFtZS50cmltKCkgPT09ICcnKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgIH1cblxuICAgIGlmICghdGhpcy50b29sU3RyYXRlZ2llcykge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSlcbiAgICB9XG5cbiAgICBsZXQgc3RyYXRlZ3kgPSBmYWxzZVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy50b29sU3RyYXRlZ2llcy5oYXMobmFtZSkpIHtcbiAgICAgICAgc3RyYXRlZ3kgPSB0aGlzLnRvb2xTdHJhdGVnaWVzLmdldChuYW1lKVxuICAgICAgfVxuICAgICAgaWYgKGlzRmFsc3koc3RyYXRlZ3kpKSB7XG4gICAgICAgIHN0cmF0ZWd5ID0gJ0RFRkFVTFQnXG4gICAgICB9XG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICBpZiAoc3RyYXRlZ3kgIT09ICdHT1JPT1RCSU4nICYmIHN0cmF0ZWd5ICE9PSAnR09UT09MRElSJykge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnVudGltZShvcHRpb25zKS50aGVuKChydW50aW1lKSA9PiB7XG4gICAgICAgIGlmIChpc0ZhbHN5KHJ1bnRpbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RyYXRlZ3kgPT09ICdHT1JPT1RCSU4nKSB7XG4gICAgICAgICAgaWYgKG5hbWUgPT09ICdnbycgJiYgcnVudGltZS5wYXRoLmVuZHNXaXRoKCdnb2FwcCcgKyBydW50aW1lLkdPRVhFKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGguam9pbihydW50aW1lLkdPUk9PVCwgJ2JpbicsICdnb2FwcCcgKyBydW50aW1lLkdPRVhFKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwYXRoLmpvaW4ocnVudGltZS5HT1JPT1QsICdiaW4nLCBuYW1lICsgcnVudGltZS5HT0VYRSlcbiAgICAgICAgfSBlbHNlIGlmIChzdHJhdGVneSA9PT0gJ0dPVE9PTERJUicpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKHJ1bnRpbWUuR09UT09MRElSLCBuYW1lICsgcnVudGltZS5HT0VYRSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0pXG4gICAgfSkudGhlbigoc3BlY2lmaWNUb29sKSA9PiB7XG4gICAgICBpZiAoaXNUcnV0aHkoc3BlY2lmaWNUb29sKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0KHNwZWNpZmljVG9vbCkudGhlbigocykgPT4ge1xuICAgICAgICAgIGlmIChpc1RydXRoeShzKSAmJiBzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gc3BlY2lmaWNUb29sXG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ0dPUEFUSEJJTicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZFRvb2xJbkRlbGltaXRlZEVudmlyb25tZW50VmFyaWFibGUobmFtZSwgJ0dPUEFUSCcsIG9wdGlvbnMpXG4gICAgICB9XG5cbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ1BBVEgnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmRUb29sSW5EZWxpbWl0ZWRFbnZpcm9ubWVudFZhcmlhYmxlKG5hbWUsIHRoaXMucGF0aEtleSwgb3B0aW9ucylcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZmluZFRvb2xXaXRoRGVmYXVsdFN0cmF0ZWd5KG5hbWUsIG9wdGlvbnMpXG4gICAgfSlcbiAgfVxuXG4gIHJlc2V0UnVudGltZXMgKCkge1xuICAgIHRoaXMucnVudGltZXNDYWNoZSA9IG51bGxcbiAgfVxuXG4gIHN0YXRpc2hTeW5jIChwYXRoVmFsdWUpIHtcbiAgICBsZXQgc3RhdCA9IGZhbHNlXG4gICAgaWYgKGlzVHJ1dGh5KHBhdGhWYWx1ZSkgJiYgIShwYXRoVmFsdWUudHJpbSgpID09PSAnJykpIHtcbiAgICAgIHRyeSB7IHN0YXQgPSBmcy5zdGF0U3luYyhwYXRoVmFsdWUpIH0gY2F0Y2ggKGUpIHsgfVxuICAgIH1cbiAgICByZXR1cm4gc3RhdFxuICB9XG5cbiAgc3RhdCAocCkge1xuICAgIGlmIChpc0ZhbHN5KHApIHx8IHAuY29uc3RydWN0b3IgIT09IFN0cmluZyB8fCBwLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZzLnN0YXQocCwgKGVyciwgc3RhdCkgPT4ge1xuICAgICAgICBpZiAoaXNUcnV0aHkoZXJyKSkge1xuICAgICAgICAgIHRoaXMuaGFuZGxlRXJyb3IoZXJyKVxuICAgICAgICAgIHJlc29sdmUoZmFsc2UpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZShzdGF0KVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgcGF0aEV4aXN0cyAocCkge1xuICAgIHJldHVybiB0aGlzLmV4aXN0cyhwKS50aGVuKChlKSA9PiB7XG4gICAgICBpZiAoaXNGYWxzeShlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIHJldHVybiBwXG4gICAgfSlcbiAgfVxuXG4gIGZpbGVFeGlzdHMgKHApIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0KHApLnRoZW4oKHMpID0+IHtcbiAgICAgIGlmIChpc0ZhbHN5KHMpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBpZiAocy5pc0ZpbGUoKSkge1xuICAgICAgICByZXR1cm4gcFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgZGlyZWN0b3J5RXhpc3RzIChwKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdChwKS50aGVuKChzKSA9PiB7XG4gICAgICBpZiAoaXNGYWxzeShzKSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgaWYgKHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICByZXR1cm4gcFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgZXhpc3RzIChwKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdChwKS50aGVuKChzKSA9PiB7XG4gICAgICBpZiAoaXNGYWxzeShzKSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICB9XG5cbiAgcnVudGltZUNhbmRpZGF0ZXMgKG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBjYW5kaWRhdGVzID0gW11cbiAgICBmb3IgKGxldCBsb2NhdG9yIG9mIHRoaXMuZ29Mb2NhdG9ycykge1xuICAgICAgbGV0IGMgPSBsb2NhdG9yKG9wdGlvbnMpXG4gICAgICBpZiAoaXNUcnV0aHkoYykgJiYgYy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgJiYgYy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNhbmRpZGF0ZXMgPSBfLnVuaW9uKGNhbmRpZGF0ZXMsIGMpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjYW5kaWRhdGVzXG4gIH1cblxuICBlZGl0b3Jjb25maWdMb2NhdG9yIChvcHRpb25zID0ge30pIHtcbiAgICAvLyBUT0RPOiAuZWRpdG9yY29uZmlnXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBJbnRlcm5hbDogRmluZCBhIGdvIGluc3RhbGxhdGlvbiB1c2luZyB5b3VyIEF0b20gY29uZmlnLiBEZWxpYmVyYXRlbHlcbiAgLy8gdW5kb2N1bWVudGVkLCBhcyB0aGlzIG1ldGhvZCBpcyBkaXNjb3VyYWdlZC5cbiAgY29uZmlnTG9jYXRvciAob3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGdvaW5zdGFsbGF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdnby1jb25maWcuZ29pbnN0YWxsYXRpb24nKVxuICAgIGxldCBzdGF0ID0gdGhpcy5zdGF0aXNoU3luYyhnb2luc3RhbGxhdGlvbilcbiAgICBpZiAoaXNUcnV0aHkoc3RhdCkpIHtcbiAgICAgIGxldCBkID0gZ29pbnN0YWxsYXRpb25cbiAgICAgIGlmIChzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgIGQgPSBwYXRoLmRpcm5hbWUoZ29pbnN0YWxsYXRpb24pXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5maW5kRXhlY3V0YWJsZXNJblBhdGgoZCwgdGhpcy5leGVjdXRhYmxlcywgb3B0aW9ucylcbiAgICB9XG5cbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIGdvcm9vdExvY2F0b3IgKG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBnID0gdGhpcy5lbnZpcm9ubWVudChvcHRpb25zKS5HT1JPT1RcbiAgICBpZiAoaXNGYWxzeShnKSB8fCBnLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5kRXhlY3V0YWJsZXNJblBhdGgocGF0aC5qb2luKGcsICdiaW4nKSwgdGhpcy5nb0V4ZWN1dGFibGVzLCBvcHRpb25zKVxuICB9XG5cbiAgcGF0aExvY2F0b3IgKG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRFeGVjdXRhYmxlc0luUGF0aCh0aGlzLmVudmlyb25tZW50KG9wdGlvbnMpW3RoaXMucGF0aEtleV0sIHRoaXMuZ29FeGVjdXRhYmxlcywgb3B0aW9ucylcbiAgfVxuXG4gIGRlZmF1bHRMb2NhdG9yIChvcHRpb25zID0ge30pIHtcbiAgICBsZXQgaW5zdGFsbFBhdGhzID0gW11cbiAgICBpZiAob3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJykge1xuICAgICAgLypcbiAgICAgIGM6XFxnb1xcYmluID0gQmluYXJ5IERpc3RyaWJ1dGlvblxuICAgICAgYzpcXHRvb2xzXFxnb1xcYmluID0gQ2hvY29sYXRleVxuICAgICAgKi9cbiAgICAgIGluc3RhbGxQYXRocy5wdXNoKHBhdGguam9pbignYzonLCAnZ28nLCAnYmluJykpXG4gICAgICBpbnN0YWxsUGF0aHMucHVzaChwYXRoLmpvaW4oJ2M6JywgJ3Rvb2xzJywgJ2dvJywgJ2JpbicpKVxuICAgIH0gZWxzZSB7XG4gICAgICAvKlxuICAgICAgL3Vzci9sb2NhbC9nby9iaW4gPSBCaW5hcnkgRGlzdHJpYnV0aW9uXG4gICAgICAvdXNyL2xvY2FsL2JpbiA9IEhvbWVicmV3XG4gICAgICAqL1xuICAgICAgaW5zdGFsbFBhdGhzLnB1c2gocGF0aC5qb2luKCcvJywgJ3VzcicsICdsb2NhbCcsICdnbycsICdiaW4nKSlcbiAgICAgIGluc3RhbGxQYXRocy5wdXNoKHBhdGguam9pbignLycsICd1c3InLCAnbG9jYWwnLCAnYmluJykpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbmRFeGVjdXRhYmxlc0luUGF0aChpbnN0YWxsUGF0aHMuam9pbihwYXRoLmRlbGltaXRlciksIHRoaXMuZ29FeGVjdXRhYmxlcywgb3B0aW9ucylcbiAgfVxuXG4gIGZpbmRFeGVjdXRhYmxlc0luUGF0aCAocGF0aFZhbHVlLCBleGVjdXRhYmxlcywgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGNhbmRpZGF0ZXMgPSBbXVxuICAgIGlmIChpc0ZhbHN5KHBhdGhWYWx1ZSkgfHwgcGF0aFZhbHVlLmNvbnN0cnVjdG9yICE9PSBTdHJpbmcgfHwgcGF0aFZhbHVlLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgIHJldHVybiBjYW5kaWRhdGVzXG4gICAgfVxuXG4gICAgaWYgKGlzRmFsc3koZXhlY3V0YWJsZXMpIHx8IGV4ZWN1dGFibGVzLmNvbnN0cnVjdG9yICE9PSBBcnJheSB8fCBleGVjdXRhYmxlcy5sZW5ndGggPCAxKSB7XG4gICAgICByZXR1cm4gY2FuZGlkYXRlc1xuICAgIH1cblxuICAgIGxldCBlbGVtZW50cyA9IHBhdGhoZWxwZXIuZXhwYW5kKHRoaXMuZW52aXJvbm1lbnQob3B0aW9ucyksIHBhdGhWYWx1ZSkuc3BsaXQocGF0aC5kZWxpbWl0ZXIpXG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgZm9yIChsZXQgZXhlY3V0YWJsZSBvZiBleGVjdXRhYmxlcykge1xuICAgICAgICBsZXQgY2FuZGlkYXRlID0gcGF0aC5qb2luKGVsZW1lbnQsIGV4ZWN1dGFibGUpXG4gICAgICAgIGxldCBzdGF0ID0gdGhpcy5zdGF0aXNoU3luYyhjYW5kaWRhdGUpXG4gICAgICAgIGlmIChpc1RydXRoeShzdGF0KSAmJiBzdGF0LmlzRmlsZSgpICYmIHN0YXQuc2l6ZSA+IDApIHtcbiAgICAgICAgICBjYW5kaWRhdGVzLnB1c2goY2FuZGlkYXRlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjYW5kaWRhdGVzXG4gIH1cblxuICAvLyBJbnRlcm5hbDogR2V0IGEgY29weSBvZiB0aGUgZW52aXJvbm1lbnQsIHdpdGggdGhlIEdPUEFUSCBjb3JyZWN0bHkgc2V0LlxuICAvLyBSZXR1cm5zIGFuIHtPYmplY3R9IHdoZXJlIHRoZSBrZXkgaXMgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIG5hbWUgYW5kIHRoZSB2YWx1ZSBpcyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgdmFsdWUuXG4gIGVudmlyb25tZW50IChvcHRpb25zID0ge30pIHtcbiAgICBsZXQgZW52ID0gdGhpcy5yYXdFbnZpcm9ubWVudChvcHRpb25zKVxuICAgIGxldCBnID0gdGhpcy5nb3BhdGgob3B0aW9ucylcbiAgICBpZiAoZyAmJiBnICE9PSAnJykge1xuICAgICAgZW52LkdPUEFUSCA9IGdcbiAgICB9XG4gICAgcmV0dXJuIGVudlxuICB9XG5cbiAgcmF3RW52aXJvbm1lbnQgKG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBlbnYgPSBwcm9jZXNzLmVudlxuICAgIGlmIChpc1RydXRoeSh0aGlzLmVudmlyb25tZW50Rm4pKSB7XG4gICAgICBlbnYgPSB0aGlzLmVudmlyb25tZW50Rm4oKVxuICAgIH1cbiAgICBlbnYgPSBPYmplY3QuYXNzaWduKHt9LCBlbnYpXG4gICAgcmV0dXJuIGVudlxuICB9XG5cbiAgLy8gSW50ZXJuYWw6IEluZGljYXRlcyB0aGF0IHRoZSBsb2NhdG9yIGlzIHJlYWR5LCBvciBub3QuXG4gIC8vIFJldHVybnMgdHJ1ZSBpZiByZWFkeSwgZWxzZSBmYWxzZS5cbiAgcmVhZHkgKCkge1xuICAgIGlmIChpc0ZhbHN5KHRoaXMucmVhZHlGbikpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlYWR5Rm4oKVxuICB9XG5cbiAgLy8gSW50ZXJuYWw6IFNldCB0aGUgc3RyYXRlZ3kgZm9yIGZpbmRpbmcga25vd24gb3IgYnVpbHQtaW4gdG9vbHMuXG4gIC8vIFJldHVybnMgYSBtYXAgd2hlcmUgdGhlIGtleSBpcyB0aGUgdG9vbCBuYW1lIGFuZCB0aGUgdmFsdWUgaXMgdGhlIHN0cmF0ZWd5LlxuICBzZXRLbm93blRvb2xTdHJhdGVnaWVzICgpIHtcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzID0gbmV3IE1hcCgpXG5cbiAgICAvLyBCdWlsdC1JbiBUb29sc1xuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdnbycsICdHT1JPT1RCSU4nKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdnb2ZtdCcsICdHT1JPT1RCSU4nKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdnb2RvYycsICdHT1JPT1RCSU4nKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdhZGRyMmxpbmUnLCAnR09UT09MRElSJylcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzLnNldCgnYXBpJywgJ0dPVE9PTERJUicpXG4gICAgdGhpcy50b29sU3RyYXRlZ2llcy5zZXQoJ2FzbScsICdHT1RPT0xESVInKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdjZ28nLCAnR09UT09MRElSJylcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzLnNldCgnY29tcGlsZScsICdHT1RPT0xESVInKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdjb3ZlcicsICdHT1RPT0xESVInKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdkaXN0JywgJ0dPVE9PTERJUicpXG4gICAgdGhpcy50b29sU3RyYXRlZ2llcy5zZXQoJ2RvYycsICdHT1RPT0xESVInKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdmaXgnLCAnR09UT09MRElSJylcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzLnNldCgnbGluaycsICdHT1RPT0xESVInKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdubScsICdHT1RPT0xESVInKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCdvYmpkdW1wJywgJ0dPVE9PTERJUicpXG4gICAgdGhpcy50b29sU3RyYXRlZ2llcy5zZXQoJ3BhY2snLCAnR09UT09MRElSJylcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzLnNldCgncHByb2YnLCAnR09UT09MRElSJylcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzLnNldCgndG91cicsICdHT1RPT0xESVInKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCd0cmFjZScsICdHT1RPT0xESVInKVxuICAgIHRoaXMudG9vbFN0cmF0ZWdpZXMuc2V0KCd2ZXQnLCAnR09UT09MRElSJylcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzLnNldCgneWFjYycsICdHT1RPT0xESVInKVxuXG4gICAgLy8gRXh0ZXJuYWwgVG9vbHNcbiAgICB0aGlzLnRvb2xTdHJhdGVnaWVzLnNldCgnZ2l0JywgJ1BBVEgnKVxuXG4gICAgLy8gT3RoZXIgVG9vbHMgQXJlIEFzc3VtZWQgVG8gQmUgSW4gUEFUSCBvciBHT0JJTiBvciBHT1BBVEgvYmluXG4gICAgLy8gR09QQVRIQklOIENhbiBCZSBVc2VkIEluIFRoZSBGdXR1cmUgQXMgQSBTdHJhdGVneSwgSWYgUmVxdWlyZWRcbiAgICAvLyBHT1BBVEhCSU4gV2lsbCBVbmRlcnN0YW5kIEdPMTVWRU5ET1JFWFBFUklNRU5UXG4gIH1cblxuICAvLyBJbnRlcm5hbDogSGFuZGxlIHRoZSBzcGVjaWZpZWQgZXJyb3IsIGlmIG5lZWRlZC5cbiAgaGFuZGxlRXJyb3IgKGVycikge1xuICAgIGlmIChpc1RydXRoeShlcnIuaGFuZGxlKSkge1xuICAgICAgZXJyLmhhbmRsZSgpXG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKGVycilcbiAgfVxuXG4gIC8vIEludGVybmFsOiBUcnkgdG8gZmluZCBhIHRvb2wgd2l0aCB0aGUgZGVmYXVsdCBzdHJhdGVneSAoR09QQVRIL2JpbiwgdGhlblxuICAvLyBQQVRIKS5cbiAgLy8gUmV0dXJucyB0aGUgcGF0aCB0byB0aGUgdG9vbCwgb3IgZmFsc2UgaWYgaXQgY2Fubm90IGJlIGZvdW5kLlxuICBmaW5kVG9vbFdpdGhEZWZhdWx0U3RyYXRlZ3kgKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmIChpc0ZhbHN5KG5hbWUpIHx8IG5hbWUuY29uc3RydWN0b3IgIT09IFN0cmluZyB8fCBuYW1lLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpXG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBTdHJhdGVneSBJczogTG9vayBGb3IgVGhlIFRvb2wgSW4gR09QQVRILCBUaGVuIExvb2sgSW4gUEFUSFxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmRUb29sSW5EZWxpbWl0ZWRFbnZpcm9ubWVudFZhcmlhYmxlKG5hbWUsICdHT1BBVEgnLCBvcHRpb25zKVxuICAgIH0pLnRoZW4oKHRvb2wpID0+IHtcbiAgICAgIGlmIChpc1RydXRoeSh0b29sKSkge1xuICAgICAgICByZXR1cm4gdG9vbFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluZFRvb2xJbkRlbGltaXRlZEVudmlyb25tZW50VmFyaWFibGUobmFtZSwgdGhpcy5wYXRoS2V5LCBvcHRpb25zKVxuICAgIH0pXG4gIH1cblxuICAvLyBJbnRlcm5hbDogVHJ5IHRvIGZpbmQgYSB0b29sIGluIGEgZGVsaW1pdGVkIGVudmlyb25tZW50IHZhcmlhYmxlIChlLmcuXG4gIC8vIFBBVEgpLlxuICAvLyBSZXR1cm5zIHRoZSBwYXRoIHRvIHRoZSB0b29sLCBvciBmYWxzZSBpZiBpdCBjYW5ub3QgYmUgZm91bmQuXG4gIGZpbmRUb29sSW5EZWxpbWl0ZWRFbnZpcm9ubWVudFZhcmlhYmxlICh0b29sTmFtZSwga2V5LCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAoaXNGYWxzeSh0b29sTmFtZSkgfHwgdG9vbE5hbWUuY29uc3RydWN0b3IgIT09IFN0cmluZyB8fCB0b29sTmFtZS50cmltKCkgPT09ICcnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBsZXQgcCA9IHRoaXMuZW52aXJvbm1lbnQob3B0aW9ucylba2V5XVxuICAgIGlmIChpc0ZhbHN5KHApKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBsZXQgZWxlbWVudHMgPSBwLnNwbGl0KHBhdGguZGVsaW1pdGVyKVxuICAgIGlmIChrZXkgPT09ICdHT1BBVEgnICYmIGlzVHJ1dGh5KHRoaXMuZW52aXJvbm1lbnQob3B0aW9ucylbJ0dPMTVWRU5ET1JFWFBFUklNRU5UJ10pKSB7XG4gICAgICAvLyBUT0RPOiBVbmRlcnN0YW5kIFZlbmRvciBFeHBlcmltZW50IFBhdGhzIEJldHRlclxuICAgICAgLy8gZWxlbWVudHMudW5zaGlmdCgndmVuZG9yJylcbiAgICB9XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgbGV0IGl0ZW0gPSAnJ1xuICAgICAgaWYgKGtleSA9PT0gJ0dPUEFUSCcpIHtcbiAgICAgICAgaXRlbSA9IHBhdGguam9pbihlbGVtZW50LCAnYmluJywgdG9vbE5hbWUgKyB0aGlzLmV4ZWN1dGFibGVTdWZmaXgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpdGVtID0gcGF0aC5qb2luKGVsZW1lbnQsIHRvb2xOYW1lICsgdGhpcy5leGVjdXRhYmxlU3VmZml4KVxuICAgICAgfVxuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhpdGVtKSkge1xuICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGl0ZW0pXG4gICAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNGaWxlKCkgJiYgc3RhdC5zaXplID4gMCkge1xuICAgICAgICAgIHJldHVybiBpdGVtXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQge0xvY2F0b3J9XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/go-config/lib/locator.js
