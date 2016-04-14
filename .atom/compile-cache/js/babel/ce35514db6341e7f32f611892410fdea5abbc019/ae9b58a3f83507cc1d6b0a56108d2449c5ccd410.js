Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _gorename = require('./gorename');

'use babel';

exports['default'] = {
  golangconfig: null,
  subscriptions: null,
  dependenciesInstalled: null,

  activate: function activate() {
    var _this = this;

    this.gorename = new _gorename.Gorename(function () {
      return _this.getGoconfig();
    }, function () {
      return _this.getGoget();
    });
    this.subscriptions = new _atom.CompositeDisposable();
    require('atom-package-deps').install('gorename').then(function () {
      _this.dependenciesInstalled = true;
    })['catch'](function (e) {
      console.log(e);
    });
  },

  deactivate: function deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.goconfig = null;
    this.dependenciesInstalled = null;
  },

  getGoconfig: function getGoconfig() {
    if (this.goconfig) {
      return this.goconfig;
    }
    return false;
  },

  consumeGoconfig: function consumeGoconfig(service) {
    this.goconfig = service;
  },

  getGoget: function getGoget() {
    if (this.goget) {
      return this.goget;
    }
    return false;
  },

  consumeGoget: function consumeGoget(service) {
    this.goget = service;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb3JlbmFtZS9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVrQyxNQUFNOzt3QkFDakIsWUFBWTs7QUFIbkMsV0FBVyxDQUFBOztxQkFLSTtBQUNiLGNBQVksRUFBRSxJQUFJO0FBQ2xCLGVBQWEsRUFBRSxJQUFJO0FBQ25CLHVCQUFxQixFQUFFLElBQUk7O0FBRTNCLFVBQVEsRUFBQyxvQkFBRzs7O0FBQ1YsUUFBSSxDQUFDLFFBQVEsR0FBRyx1QkFDZCxZQUFNO0FBQUUsYUFBTyxNQUFLLFdBQVcsRUFBRSxDQUFBO0tBQUUsRUFDbkMsWUFBTTtBQUFFLGFBQU8sTUFBSyxRQUFRLEVBQUUsQ0FBQTtLQUFFLENBQ2pDLENBQUE7QUFDRCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUMxRCxZQUFLLHFCQUFxQixHQUFHLElBQUksQ0FBQTtLQUNsQyxDQUFDLFNBQU0sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNkLGFBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDZixDQUFDLENBQUE7R0FDSDs7QUFFRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3QjtBQUNELFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7R0FDbEM7O0FBRUQsYUFBVyxFQUFDLHVCQUFHO0FBQ2IsUUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtLQUNyQjtBQUNELFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsaUJBQWUsRUFBQyx5QkFBQyxPQUFPLEVBQUU7QUFDeEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7R0FDeEI7O0FBRUQsVUFBUSxFQUFDLG9CQUFHO0FBQ1YsUUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2QsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQ2xCO0FBQ0QsV0FBTyxLQUFLLENBQUE7R0FDYjs7QUFFRCxjQUFZLEVBQUMsc0JBQUMsT0FBTyxFQUFFO0FBQ3JCLFFBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFBO0dBQ3JCO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dvcmVuYW1lL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHtHb3JlbmFtZX0gZnJvbSAnLi9nb3JlbmFtZSdcblxuZXhwb3J0IGRlZmF1bHQge1xuICBnb2xhbmdjb25maWc6IG51bGwsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG4gIGRlcGVuZGVuY2llc0luc3RhbGxlZDogbnVsbCxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5nb3JlbmFtZSA9IG5ldyBHb3JlbmFtZShcbiAgICAgICgpID0+IHsgcmV0dXJuIHRoaXMuZ2V0R29jb25maWcoKSB9LFxuICAgICAgKCkgPT4geyByZXR1cm4gdGhpcy5nZXRHb2dldCgpIH1cbiAgICApXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnZ29yZW5hbWUnKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gdHJ1ZVxuICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlKVxuICAgIH0pXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nb2NvbmZpZyA9IG51bGxcbiAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IG51bGxcbiAgfSxcblxuICBnZXRHb2NvbmZpZyAoKSB7XG4gICAgaWYgKHRoaXMuZ29jb25maWcpIHtcbiAgICAgIHJldHVybiB0aGlzLmdvY29uZmlnXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGNvbnN1bWVHb2NvbmZpZyAoc2VydmljZSkge1xuICAgIHRoaXMuZ29jb25maWcgPSBzZXJ2aWNlXG4gIH0sXG5cbiAgZ2V0R29nZXQgKCkge1xuICAgIGlmICh0aGlzLmdvZ2V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5nb2dldFxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBjb25zdW1lR29nZXQgKHNlcnZpY2UpIHtcbiAgICB0aGlzLmdvZ2V0ID0gc2VydmljZVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/gorename/lib/main.js
