Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _tester = require('./tester');

'use babel';

exports['default'] = {
  dependenciesInstalled: null,
  goget: null,
  goconfig: null,
  tester: null,
  subscriptions: null,
  toolCheckComplete: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    require('atom-package-deps').install('tester-go').then(function () {
      _this.dependenciesInstalled = true;
      return _this.dependenciesInstalled;
    })['catch'](function (e) {
      console.log(e);
    });
    this.getTester();
  },

  deactivate: function deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.goget = null;
    this.goconfig = null;
    this.tester = null;
    this.dependenciesInstalled = null;
    this.toolCheckComplete = null;
  },

  provide: function provide() {
    return this.getTester();
  },

  getTester: function getTester() {
    var _this2 = this;

    if (this.tester) {
      return this.tester;
    }
    this.tester = new _tester.Tester(function () {
      return _this2.getGoconfig();
    }, function () {
      return _this2.getGoget();
    });
    this.subscriptions.add(this.tester);
    return this.tester;
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
    this.checkForTools();
  },

  consumeGoget: function consumeGoget(service) {
    this.goget = service;
    this.checkForTools();
  },

  checkForTools: function checkForTools() {
    var _this3 = this;

    if (!this.toolCheckComplete && this.goconfig && this.goget) {
      var options = { env: this.goconfig.environment() };
      this.goconfig.locator.findTool('cover', options).then(function (cmd) {
        if (!cmd) {
          _this3.toolCheckComplete = true;
          _this3.goget.get({
            name: 'tester-go',
            packageName: 'cover',
            packagePath: 'golang.org/x/tools/cmd/cover',
            type: 'missing'
          }).then(function (r) {
            if (!r.success) {
              console.log('cover is not available and could not be installed via "go get -u golang.org/x/tools/cmd/cover"; please manually install it to enable display of coverage.');
            }
          })['catch'](function (e) {
            console.log(e);
          });
        }
      });
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy90ZXN0ZXItZ28vbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFFa0MsTUFBTTs7c0JBQ25CLFVBQVU7O0FBSC9CLFdBQVcsQ0FBQTs7cUJBS0k7QUFDYix1QkFBcUIsRUFBRSxJQUFJO0FBQzNCLE9BQUssRUFBRSxJQUFJO0FBQ1gsVUFBUSxFQUFFLElBQUk7QUFDZCxRQUFNLEVBQUUsSUFBSTtBQUNaLGVBQWEsRUFBRSxJQUFJO0FBQ25CLG1CQUFpQixFQUFFLElBQUk7O0FBRXZCLFVBQVEsRUFBQyxvQkFBRzs7O0FBQ1YsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxXQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDM0QsWUFBSyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7QUFDakMsYUFBTyxNQUFLLHFCQUFxQixDQUFBO0tBQ2xDLENBQUMsU0FBTSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2QsYUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNmLENBQUMsQ0FBQTtBQUNGLFFBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtHQUNqQjs7QUFFRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3QjtBQUNELFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7QUFDakMsUUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQTtHQUM5Qjs7QUFFRCxTQUFPLEVBQUMsbUJBQUc7QUFDVCxXQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtHQUN4Qjs7QUFFRCxXQUFTLEVBQUMscUJBQUc7OztBQUNYLFFBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUNuQjtBQUNELFFBQUksQ0FBQyxNQUFNLEdBQUcsbUJBQVcsWUFBTTtBQUM3QixhQUFPLE9BQUssV0FBVyxFQUFFLENBQUE7S0FDMUIsRUFBRSxZQUFNO0FBQ1AsYUFBTyxPQUFLLFFBQVEsRUFBRSxDQUFBO0tBQ3ZCLENBQUMsQ0FBQTtBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuQyxXQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7R0FDbkI7O0FBRUQsYUFBVyxFQUFDLHVCQUFHO0FBQ2IsUUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtLQUNyQjtBQUNELFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsVUFBUSxFQUFDLG9CQUFHO0FBQ1YsUUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2QsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQ2xCO0FBQ0QsV0FBTyxLQUFLLENBQUE7R0FDYjs7QUFFRCxpQkFBZSxFQUFDLHlCQUFDLE9BQU8sRUFBRTtBQUN4QixRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtBQUN2QixRQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7R0FDckI7O0FBRUQsY0FBWSxFQUFDLHNCQUFDLE9BQU8sRUFBRTtBQUNyQixRQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQTtBQUNwQixRQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7R0FDckI7O0FBRUQsZUFBYSxFQUFDLHlCQUFHOzs7QUFDZixRQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUMxRCxVQUFJLE9BQU8sR0FBRyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFDLENBQUE7QUFDaEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDN0QsWUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNSLGlCQUFLLGlCQUFpQixHQUFHLElBQUksQ0FBQTtBQUM3QixpQkFBSyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ2IsZ0JBQUksRUFBRSxXQUFXO0FBQ2pCLHVCQUFXLEVBQUUsT0FBTztBQUNwQix1QkFBVyxFQUFFLDhCQUE4QjtBQUMzQyxnQkFBSSxFQUFFLFNBQVM7V0FDaEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNiLGdCQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUNkLHFCQUFPLENBQUMsR0FBRyxDQUFDLDJKQUEySixDQUFDLENBQUE7YUFDeks7V0FDRixDQUFDLFNBQU0sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNkLG1CQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1dBQ2YsQ0FBQyxDQUFBO1NBQ0g7T0FDRixDQUFDLENBQUE7S0FDSDtHQUNGO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3Rlc3Rlci1nby9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCB7VGVzdGVyfSBmcm9tICcuL3Rlc3RlcidcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkZXBlbmRlbmNpZXNJbnN0YWxsZWQ6IG51bGwsXG4gIGdvZ2V0OiBudWxsLFxuICBnb2NvbmZpZzogbnVsbCxcbiAgdGVzdGVyOiBudWxsLFxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuICB0b29sQ2hlY2tDb21wbGV0ZTogbnVsbCxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgndGVzdGVyLWdvJykudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IHRydWVcbiAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZFxuICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlKVxuICAgIH0pXG4gICAgdGhpcy5nZXRUZXN0ZXIoKVxuICB9LFxuXG4gIGRlYWN0aXZhdGUgKCkge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIHRoaXMuZ29nZXQgPSBudWxsXG4gICAgdGhpcy5nb2NvbmZpZyA9IG51bGxcbiAgICB0aGlzLnRlc3RlciA9IG51bGxcbiAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IG51bGxcbiAgICB0aGlzLnRvb2xDaGVja0NvbXBsZXRlID0gbnVsbFxuICB9LFxuXG4gIHByb3ZpZGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFRlc3RlcigpXG4gIH0sXG5cbiAgZ2V0VGVzdGVyICgpIHtcbiAgICBpZiAodGhpcy50ZXN0ZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnRlc3RlclxuICAgIH1cbiAgICB0aGlzLnRlc3RlciA9IG5ldyBUZXN0ZXIoKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0R29jb25maWcoKVxuICAgIH0sICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdldEdvZ2V0KClcbiAgICB9KVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy50ZXN0ZXIpXG4gICAgcmV0dXJuIHRoaXMudGVzdGVyXG4gIH0sXG5cbiAgZ2V0R29jb25maWcgKCkge1xuICAgIGlmICh0aGlzLmdvY29uZmlnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nb2NvbmZpZ1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBnZXRHb2dldCAoKSB7XG4gICAgaWYgKHRoaXMuZ29nZXQpIHtcbiAgICAgIHJldHVybiB0aGlzLmdvZ2V0XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGNvbnN1bWVHb2NvbmZpZyAoc2VydmljZSkge1xuICAgIHRoaXMuZ29jb25maWcgPSBzZXJ2aWNlXG4gICAgdGhpcy5jaGVja0ZvclRvb2xzKClcbiAgfSxcblxuICBjb25zdW1lR29nZXQgKHNlcnZpY2UpIHtcbiAgICB0aGlzLmdvZ2V0ID0gc2VydmljZVxuICAgIHRoaXMuY2hlY2tGb3JUb29scygpXG4gIH0sXG5cbiAgY2hlY2tGb3JUb29scyAoKSB7XG4gICAgaWYgKCF0aGlzLnRvb2xDaGVja0NvbXBsZXRlICYmIHRoaXMuZ29jb25maWcgJiYgdGhpcy5nb2dldCkge1xuICAgICAgbGV0IG9wdGlvbnMgPSB7ZW52OiB0aGlzLmdvY29uZmlnLmVudmlyb25tZW50KCl9XG4gICAgICB0aGlzLmdvY29uZmlnLmxvY2F0b3IuZmluZFRvb2woJ2NvdmVyJywgb3B0aW9ucykudGhlbigoY21kKSA9PiB7XG4gICAgICAgIGlmICghY21kKSB7XG4gICAgICAgICAgdGhpcy50b29sQ2hlY2tDb21wbGV0ZSA9IHRydWVcbiAgICAgICAgICB0aGlzLmdvZ2V0LmdldCh7XG4gICAgICAgICAgICBuYW1lOiAndGVzdGVyLWdvJyxcbiAgICAgICAgICAgIHBhY2thZ2VOYW1lOiAnY292ZXInLFxuICAgICAgICAgICAgcGFja2FnZVBhdGg6ICdnb2xhbmcub3JnL3gvdG9vbHMvY21kL2NvdmVyJyxcbiAgICAgICAgICAgIHR5cGU6ICdtaXNzaW5nJ1xuICAgICAgICAgIH0pLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICAgIGlmICghci5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb3ZlciBpcyBub3QgYXZhaWxhYmxlIGFuZCBjb3VsZCBub3QgYmUgaW5zdGFsbGVkIHZpYSBcImdvIGdldCAtdSBnb2xhbmcub3JnL3gvdG9vbHMvY21kL2NvdmVyXCI7IHBsZWFzZSBtYW51YWxseSBpbnN0YWxsIGl0IHRvIGVuYWJsZSBkaXNwbGF5IG9mIGNvdmVyYWdlLicpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/tester-go/lib/main.js
