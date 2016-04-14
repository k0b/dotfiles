Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _check = require('./check');

var _executor = require('./executor');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

'use babel';

exports['default'] = {
  environment: null,
  locator: null,
  subscriptions: null,
  dependenciesInstalled: null,

  activate: function activate() {
    var _this = this;

    this.dependenciesInstalled = false;
    this.subscriptions = new _atom.CompositeDisposable();
    if (_semver2['default'].satisfies(this.version(), '<1.7.0')) {
      require('atom-package-deps').install('go-config').then(function () {
        _this.dependenciesInstalled = true;
      })['catch'](function (e) {
        console.log(e);
      });
    } else {
      this.dependenciesInstalled = true;
    }
  },

  deactivate: function deactivate() {
    this.dispose();
  },

  dispose: function dispose() {
    if ((0, _check.isTruthy)(this.subscriptions)) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.environment = null;
    this.locator = null;
    this.dependenciesInstalled = null;
  },

  getExecutor: function getExecutor(options) {
    var e = new _executor.Executor({ environmentFn: this.getEnvironment.bind(this) });
    return e;
  },

  getLocator: function getLocator() {
    if ((0, _check.isTruthy)(this.locator)) {
      return this.locator;
    }
    var Locator = require('./locator').Locator;
    this.locator = new Locator({
      environment: this.getEnvironment.bind(this),
      executor: this.getExecutor(),
      ready: this.ready.bind(this)
    });
    this.subscriptions.add(this.locator);
    return this.locator;
  },

  ready: function ready() {
    if ((0, _check.isFalsy)(this.dependenciesInstalled)) {
      return false;
    }
    if (_semver2['default'].satisfies(this.version(), '>=1.7.0')) {
      return true;
    } else {
      if ((0, _check.isTruthy)(this.environment)) {
        return true;
      } else {
        return false;
      }
    }
  },

  getEnvironment: function getEnvironment() {
    if (_semver2['default'].satisfies(this.version(), '>=1.7.0')) {
      return process.env;
    }

    if (this.ready()) {
      return this.environment;
    }

    return process.env;
  },

  version: function version() {
    return _semver2['default'].major(atom.appVersion) + '.' + _semver2['default'].minor(atom.appVersion) + '.' + _semver2['default'].patch(atom.appVersion);
  },

  provide: function provide() {
    return this.get100Implementation();
  },

  provide010: function provide010() {
    return this.get010Implementation();
  },

  get100Implementation: function get100Implementation() {
    var executor = this.getExecutor();
    var locator = this.getLocator();
    return {
      executor: {
        exec: executor.exec.bind(executor),
        execSync: executor.execSync.bind(executor)
      },
      locator: {
        runtimes: locator.runtimes.bind(locator),
        runtime: locator.runtime.bind(locator),
        gopath: locator.gopath.bind(locator),
        findTool: locator.findTool.bind(locator)
      },
      environment: locator.environment.bind(locator)
    };
  },

  get010Implementation: function get010Implementation() {
    var executor = this.getExecutor();
    var locator = this.getLocator();
    return {
      executor: executor,
      locator: locator,
      environment: this.getEnvironment.bind(this)
    };
  },

  consumeEnvironment: function consumeEnvironment(environment) {
    this.environment = environment;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1jb25maWcvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVrQyxNQUFNOztxQkFDUixTQUFTOzt3QkFDbEIsWUFBWTs7c0JBQ2hCLFFBQVE7Ozs7QUFMM0IsV0FBVyxDQUFBOztxQkFPSTtBQUNiLGFBQVcsRUFBRSxJQUFJO0FBQ2pCLFNBQU8sRUFBRSxJQUFJO0FBQ2IsZUFBYSxFQUFFLElBQUk7QUFDbkIsdUJBQXFCLEVBQUUsSUFBSTs7QUFFM0IsVUFBUSxFQUFDLG9CQUFHOzs7QUFDVixRQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFBO0FBQ2xDLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxvQkFBTyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQzlDLGFBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUMzRCxjQUFLLHFCQUFxQixHQUFHLElBQUksQ0FBQTtPQUNsQyxDQUFDLFNBQU0sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNkLGVBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDZixDQUFDLENBQUE7S0FDSCxNQUFNO0FBQ0wsVUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQTtLQUNsQztHQUNGOztBQUVELFlBQVUsRUFBQyxzQkFBRztBQUNaLFFBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtHQUNmOztBQUVELFNBQU8sRUFBQyxtQkFBRztBQUNULFFBQUkscUJBQVMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7QUFDRCxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUN6QixRQUFJ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LENBQUMsUUFBUSxDQUFDO09BQzNDO0FBQ0QsYUFBTyxFQUFFO0FBQ1AsZ0JBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDeEMsZUFBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN0QyxjQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BDLGdCQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO09BQ3pDO0FBQ0QsaUJBQVcsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDL0MsQ0FBQTtHQUNGOztBQUVELHNCQUFvQixFQUFDLGdDQUFHO0FBQ3RCLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqQyxRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDL0IsV0FBTztBQUNMLGNBQVEsRUFBRSxRQUFRO0FBQ2xCLGFBQU8sRUFBRSxPQUFPO0FBQ2hCLGlCQUFXLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQzVDLENBQUE7R0FDRjs7QUFFRCxvQkFBa0IsRUFBQyw0QkFBQyxXQUFXLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7R0FDL0I7Q0FDRiIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvZ28tY29uZmlnL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHtpc1RydXRoeSwgaXNGYWxzeX0gZnJvbSAnLi9jaGVjaydcbmltcG9ydCB7RXhlY3V0b3J9IGZyb20gJy4vZXhlY3V0b3InXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcblxuZXhwb3J0IGRlZmF1bHQge1xuICBlbnZpcm9ubWVudDogbnVsbCxcbiAgbG9jYXRvcjogbnVsbCxcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcbiAgZGVwZW5kZW5jaWVzSW5zdGFsbGVkOiBudWxsLFxuXG4gIGFjdGl2YXRlICgpIHtcbiAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IGZhbHNlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGlmIChzZW12ZXIuc2F0aXNmaWVzKHRoaXMudmVyc2lvbigpLCAnPDEuNy4wJykpIHtcbiAgICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnZ28tY29uZmlnJykudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gdHJ1ZVxuICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gdHJ1ZVxuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlICgpIHtcbiAgICB0aGlzLmRpc3Bvc2UoKVxuICB9LFxuXG4gIGRpc3Bvc2UgKCkge1xuICAgIGlmIChpc1RydXRoeSh0aGlzLnN1YnNjcmlwdGlvbnMpKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLmVudmlyb25tZW50ID0gbnVsbFxuICAgIHRoaXMubG9jYXRvciA9IG51bGxcbiAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IG51bGxcbiAgfSxcblxuICBnZXRFeGVjdXRvciAob3B0aW9ucykge1xuICAgIGxldCBlID0gbmV3IEV4ZWN1dG9yKHtlbnZpcm9ubWVudEZuOiB0aGlzLmdldEVudmlyb25tZW50LmJpbmQodGhpcyl9KVxuICAgIHJldHVybiBlXG4gIH0sXG5cbiAgZ2V0TG9jYXRvciAoKSB7XG4gICAgaWYgKGlzVHJ1dGh5KHRoaXMubG9jYXRvcikpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0b3JcbiAgICB9XG4gICAgbGV0IExvY2F0b3IgPSByZXF1aXJlKCcuL2xvY2F0b3InKS5Mb2NhdG9yXG4gICAgdGhpcy5sb2NhdG9yID0gbmV3IExvY2F0b3Ioe1xuICAgICAgZW52aXJvbm1lbnQ6IHRoaXMuZ2V0RW52aXJvbm1lbnQuYmluZCh0aGlzKSxcbiAgICAgIGV4ZWN1dG9yOiB0aGlzLmdldEV4ZWN1dG9yKCksXG4gICAgICByZWFkeTogdGhpcy5yZWFkeS5iaW5kKHRoaXMpXG4gICAgfSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubG9jYXRvcilcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yXG4gIH0sXG5cbiAgcmVhZHkgKCkge1xuICAgIGlmIChpc0ZhbHN5KHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmIChzZW12ZXIuc2F0aXNmaWVzKHRoaXMudmVyc2lvbigpLCAnPj0xLjcuMCcpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXNUcnV0aHkodGhpcy5lbnZpcm9ubWVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRFbnZpcm9ubWVudCAoKSB7XG4gICAgaWYgKHNlbXZlci5zYXRpc2ZpZXModGhpcy52ZXJzaW9uKCksICc+PTEuNy4wJykpIHtcbiAgICAgIHJldHVybiBwcm9jZXNzLmVudlxuICAgIH1cblxuICAgIGlmICh0aGlzLnJlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVudmlyb25tZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3MuZW52XG4gIH0sXG5cbiAgdmVyc2lvbiAoKSB7XG4gICAgcmV0dXJuIHNlbXZlci5tYWpvcihhdG9tLmFwcFZlcnNpb24pICsgJy4nICsgc2VtdmVyLm1pbm9yKGF0b20uYXBwVmVyc2lvbikgKyAnLicgKyBzZW12ZXIucGF0Y2goYXRvbS5hcHBWZXJzaW9uKVxuICB9LFxuXG4gIHByb3ZpZGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldDEwMEltcGxlbWVudGF0aW9uKClcbiAgfSxcblxuICBwcm92aWRlMDEwICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQwMTBJbXBsZW1lbnRhdGlvbigpXG4gIH0sXG5cbiAgZ2V0MTAwSW1wbGVtZW50YXRpb24gKCkge1xuICAgIGxldCBleGVjdXRvciA9IHRoaXMuZ2V0RXhlY3V0b3IoKVxuICAgIGxldCBsb2NhdG9yID0gdGhpcy5nZXRMb2NhdG9yKClcbiAgICByZXR1cm4ge1xuICAgICAgZXhlY3V0b3I6IHtcbiAgICAgICAgZXhlYzogZXhlY3V0b3IuZXhlYy5iaW5kKGV4ZWN1dG9yKSxcbiAgICAgICAgZXhlY1N5bmM6IGV4ZWN1dG9yLmV4ZWNTeW5jLmJpbmQoZXhlY3V0b3IpXG4gICAgICB9LFxuICAgICAgbG9jYXRvcjoge1xuICAgICAgICBydW50aW1lczogbG9jYXRvci5ydW50aW1lcy5iaW5kKGxvY2F0b3IpLFxuICAgICAgICBydW50aW1lOiBsb2NhdG9yLnJ1bnRpbWUuYmluZChsb2NhdG9yKSxcbiAgICAgICAgZ29wYXRoOiBsb2NhdG9yLmdvcGF0aC5iaW5kKGxvY2F0b3IpLFxuICAgICAgICBmaW5kVG9vbDogbG9jYXRvci5maW5kVG9vbC5iaW5kKGxvY2F0b3IpXG4gICAgICB9LFxuICAgICAgZW52aXJvbm1lbnQ6IGxvY2F0b3IuZW52aXJvbm1lbnQuYmluZChsb2NhdG9yKVxuICAgIH1cbiAgfSxcblxuICBnZXQwMTBJbXBsZW1lbnRhdGlvbiAoKSB7XG4gICAgbGV0IGV4ZWN1dG9yID0gdGhpcy5nZXRFeGVjdXRvcigpXG4gICAgbGV0IGxvY2F0b3IgPSB0aGlzLmdldExvY2F0b3IoKVxuICAgIHJldHVybiB7XG4gICAgICBleGVjdXRvcjogZXhlY3V0b3IsXG4gICAgICBsb2NhdG9yOiBsb2NhdG9yLFxuICAgICAgZW52aXJvbm1lbnQ6IHRoaXMuZ2V0RW52aXJvbm1lbnQuYmluZCh0aGlzKVxuICAgIH1cbiAgfSxcblxuICBjb25zdW1lRW52aXJvbm1lbnQgKGVudmlyb25tZW50KSB7XG4gICAgdGhpcy5lbnZpcm9ubWVudCA9IGVudmlyb25tZW50XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/go-config/lib/main.js
