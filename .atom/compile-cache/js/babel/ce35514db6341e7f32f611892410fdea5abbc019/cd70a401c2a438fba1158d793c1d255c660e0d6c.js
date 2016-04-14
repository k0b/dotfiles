Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _manager = require('./manager');

'use babel';

exports['default'] = {
  dependenciesInstalled: null,
  goconfig: null,
  manager: null,
  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    require('atom-package-deps').install('go-get').then(function () {
      _this.dependenciesInstalled = true;
    })['catch'](function (e) {
      console.log(e);
    });
    this.getManager();
  },

  deactivate: function deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.goconfig = null;
    this.manager = null;
    this.dependenciesInstalled = null;
  },

  provide: function provide() {
    return this.getProvider();
  },

  getManager: function getManager() {
    var _this2 = this;

    if (this.manager) {
      return this.manager;
    }
    this.manager = new _manager.Manager(function () {
      return _this2.getGoconfig();
    });
    this.subscriptions.add(this.manager);
    return this.manager;
  },

  getProvider: function getProvider() {
    var _this3 = this;

    return {
      get: function get(options) {
        return _this3.getManager().get(options);
      },
      check: function check(options) {
        return _this3.getManager().check(options);
      }
    };
  },

  getGoconfig: function getGoconfig() {
    if (this.goconfig) {
      return this.goconfig;
    }
    return false;
  },

  consumeGoconfig: function consumeGoconfig(service) {
    this.goconfig = service;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1nZXQvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFFa0MsTUFBTTs7dUJBQ2xCLFdBQVc7O0FBSGpDLFdBQVcsQ0FBQTs7cUJBS0k7QUFDYix1QkFBcUIsRUFBRSxJQUFJO0FBQzNCLFVBQVEsRUFBRSxJQUFJO0FBQ2QsU0FBTyxFQUFFLElBQUk7QUFDYixlQUFhLEVBQUUsSUFBSTs7QUFFbkIsVUFBUSxFQUFDLG9CQUFHOzs7QUFDVixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUN4RCxZQUFLLHFCQUFxQixHQUFHLElBQUksQ0FBQTtLQUNsQyxDQUFDLFNBQU0sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNkLGFBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDZixDQUFDLENBQUE7QUFDRixRQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7R0FDbEI7O0FBRUQsWUFBVSxFQUFDLHNCQUFHO0FBQ1osUUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7QUFDRCxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUN6QixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtBQUNuQixRQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFBO0dBQ2xDOztBQUVELFNBQU8sRUFBQyxtQkFBRztBQUNULFdBQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0dBQzFCOztBQUVELFlBQVUsRUFBQyxzQkFBRzs7O0FBQ1osUUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtLQUNwQjtBQUNELFFBQUksQ0FBQyxPQUFPLEdBQUcscUJBQVksWUFBTTtBQUFFLGFBQU8sT0FBSyxXQUFXLEVBQUUsQ0FBQTtLQUFFLENBQUMsQ0FBQTtBQUMvRCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0dBQ3BCOztBQUVELGFBQVcsRUFBQyx1QkFBRzs7O0FBQ2IsV0FBTztBQUNMLFNBQUcsRUFBRSxhQUFDLE9BQU8sRUFBSztBQUNoQixlQUFPLE9BQUssVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQ3RDO0FBQ0QsV0FBSyxFQUFFLGVBQUMsT0FBTyxFQUFLO0FBQ2xCLGVBQU8sT0FBSyxVQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7T0FDeEM7S0FDRixDQUFBO0dBQ0Y7O0FBRUQsYUFBVyxFQUFDLHVCQUFHO0FBQ2IsUUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtLQUNyQjtBQUNELFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsaUJBQWUsRUFBQyx5QkFBQyxPQUFPLEVBQUU7QUFDeEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7R0FDeEI7Q0FDRiIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvZ28tZ2V0L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHtNYW5hZ2VyfSBmcm9tICcuL21hbmFnZXInXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZGVwZW5kZW5jaWVzSW5zdGFsbGVkOiBudWxsLFxuICBnb2NvbmZpZzogbnVsbCxcbiAgbWFuYWdlcjogbnVsbCxcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnZ28tZ2V0JykudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IHRydWVcbiAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICB9KVxuICAgIHRoaXMuZ2V0TWFuYWdlcigpXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nb2NvbmZpZyA9IG51bGxcbiAgICB0aGlzLm1hbmFnZXIgPSBudWxsXG4gICAgdGhpcy5kZXBlbmRlbmNpZXNJbnN0YWxsZWQgPSBudWxsXG4gIH0sXG5cbiAgcHJvdmlkZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXIoKVxuICB9LFxuXG4gIGdldE1hbmFnZXIgKCkge1xuICAgIGlmICh0aGlzLm1hbmFnZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hbmFnZXJcbiAgICB9XG4gICAgdGhpcy5tYW5hZ2VyID0gbmV3IE1hbmFnZXIoKCkgPT4geyByZXR1cm4gdGhpcy5nZXRHb2NvbmZpZygpIH0pXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1hbmFnZXIpXG4gICAgcmV0dXJuIHRoaXMubWFuYWdlclxuICB9LFxuXG4gIGdldFByb3ZpZGVyICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0OiAob3B0aW9ucykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRNYW5hZ2VyKCkuZ2V0KG9wdGlvbnMpXG4gICAgICB9LFxuICAgICAgY2hlY2s6IChvcHRpb25zKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE1hbmFnZXIoKS5jaGVjayhvcHRpb25zKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRHb2NvbmZpZyAoKSB7XG4gICAgaWYgKHRoaXMuZ29jb25maWcpIHtcbiAgICAgIHJldHVybiB0aGlzLmdvY29uZmlnXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGNvbnN1bWVHb2NvbmZpZyAoc2VydmljZSkge1xuICAgIHRoaXMuZ29jb25maWcgPSBzZXJ2aWNlXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/go-get/lib/main.js
