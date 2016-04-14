Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _formatter = require('./formatter');

'use babel';

exports['default'] = {
  dependenciesInstalled: null,
  goget: null,
  goconfig: null,
  formatter: null,
  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    require('atom-package-deps').install('gofmt').then(function () {
      _this.dependenciesInstalled = true;
      return _this.dependenciesInstalled;
    })['catch'](function (e) {
      console.log(e);
    });
    this.getFormatter();
  },

  deactivate: function deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.goget = null;
    this.goconfig = null;
    this.formatter = null;
    this.dependenciesInstalled = null;
  },

  provide: function provide() {
    return this.getFormatter();
  },

  getFormatter: function getFormatter() {
    var _this2 = this;

    if (this.formatter) {
      return this.formatter;
    }
    this.formatter = new _formatter.Formatter(function () {
      return _this2.getGoconfig();
    }, function () {
      return _this2.getGoget();
    });
    this.subscriptions.add(this.formatter);
    return this.formatter;
  },

  getGoconfig: function getGoconfig() {
    if (this.goconfig) {
      return this.goconfig;
    }
    return false;
  },

  getGoget: function getGoget() {
    if (this.goget) {
      return this.goget;
    }
    return false;
  },

  consumeGoconfig: function consumeGoconfig(service) {
    this.goconfig = service;
    this.getFormatter().updateFormatterCache();
  },

  consumeGoget: function consumeGoget(service) {
    this.goget = service;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb2ZtdC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVrQyxNQUFNOzt5QkFDaEIsYUFBYTs7QUFIckMsV0FBVyxDQUFBOztxQkFLSTtBQUNiLHVCQUFxQixFQUFFLElBQUk7QUFDM0IsT0FBSyxFQUFFLElBQUk7QUFDWCxVQUFRLEVBQUUsSUFBSTtBQUNkLFdBQVMsRUFBRSxJQUFJO0FBQ2YsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFVBQVEsRUFBQyxvQkFBRzs7O0FBQ1YsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxXQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDdkQsWUFBSyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7QUFDakMsYUFBTyxNQUFLLHFCQUFxQixDQUFBO0tBQ2xDLENBQUMsU0FBTSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2QsYUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNmLENBQUMsQ0FBQTtBQUNGLFFBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtHQUNwQjs7QUFFRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3QjtBQUNELFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ3JCLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7R0FDbEM7O0FBRUQsU0FBTyxFQUFDLG1CQUFHO0FBQ1QsV0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7R0FDM0I7O0FBRUQsY0FBWSxFQUFDLHdCQUFHOzs7QUFDZCxRQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEIsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFBO0tBQ3RCO0FBQ0QsUUFBSSxDQUFDLFNBQVMsR0FBRyx5QkFBYyxZQUFNO0FBQ25DLGFBQU8sT0FBSyxXQUFXLEVBQUUsQ0FBQTtLQUMxQixFQUFFLFlBQU07QUFDUCxhQUFPLE9BQUssUUFBUSxFQUFFLENBQUE7S0FDdkIsQ0FBQyxDQUFBO0FBQ0YsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3RDLFdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtHQUN0Qjs7QUFFRCxhQUFXLEVBQUMsdUJBQUc7QUFDYixRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0tBQ3JCO0FBQ0QsV0FBTyxLQUFLLENBQUE7R0FDYjs7QUFFRCxVQUFRLEVBQUMsb0JBQUc7QUFDVixRQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbEI7QUFDRCxXQUFPLEtBQUssQ0FBQTtHQUNiOztBQUVELGlCQUFlLEVBQUMseUJBQUMsT0FBTyxFQUFFO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO0dBQzNDOztBQUVELGNBQVksRUFBQyxzQkFBQyxPQUFPLEVBQUU7QUFDckIsUUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUE7R0FDckI7Q0FDRiIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvZ29mbXQvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9mb3JtYXR0ZXInXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZGVwZW5kZW5jaWVzSW5zdGFsbGVkOiBudWxsLFxuICBnb2dldDogbnVsbCxcbiAgZ29jb25maWc6IG51bGwsXG4gIGZvcm1hdHRlcjogbnVsbCxcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnZ29mbXQnKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gdHJ1ZVxuICAgICAgcmV0dXJuIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkXG4gICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgfSlcbiAgICB0aGlzLmdldEZvcm1hdHRlcigpXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nb2dldCA9IG51bGxcbiAgICB0aGlzLmdvY29uZmlnID0gbnVsbFxuICAgIHRoaXMuZm9ybWF0dGVyID0gbnVsbFxuICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gbnVsbFxuICB9LFxuXG4gIHByb3ZpZGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZvcm1hdHRlcigpXG4gIH0sXG5cbiAgZ2V0Rm9ybWF0dGVyICgpIHtcbiAgICBpZiAodGhpcy5mb3JtYXR0ZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmZvcm1hdHRlclxuICAgIH1cbiAgICB0aGlzLmZvcm1hdHRlciA9IG5ldyBGb3JtYXR0ZXIoKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0R29jb25maWcoKVxuICAgIH0sICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdldEdvZ2V0KClcbiAgICB9KVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5mb3JtYXR0ZXIpXG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0dGVyXG4gIH0sXG5cbiAgZ2V0R29jb25maWcgKCkge1xuICAgIGlmICh0aGlzLmdvY29uZmlnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nb2NvbmZpZ1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBnZXRHb2dldCAoKSB7XG4gICAgaWYgKHRoaXMuZ29nZXQpIHtcbiAgICAgIHJldHVybiB0aGlzLmdvZ2V0XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGNvbnN1bWVHb2NvbmZpZyAoc2VydmljZSkge1xuICAgIHRoaXMuZ29jb25maWcgPSBzZXJ2aWNlXG4gICAgdGhpcy5nZXRGb3JtYXR0ZXIoKS51cGRhdGVGb3JtYXR0ZXJDYWNoZSgpXG4gIH0sXG5cbiAgY29uc3VtZUdvZ2V0IChzZXJ2aWNlKSB7XG4gICAgdGhpcy5nb2dldCA9IHNlcnZpY2VcbiAgfVxufVxuIl19
//# sourceURL=/Users/james/.atom/packages/gofmt/lib/main.js
