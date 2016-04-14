Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _builder = require('./builder');

'use babel';

exports['default'] = {
  dependenciesInstalled: null,
  goconfig: null,
  builder: null,
  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    require('atom-package-deps').install('builder-go').then(function () {
      _this.dependenciesInstalled = true;
      return _this.dependenciesInstalled;
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
    this.builder = null;
    this.dependenciesInstalled = null;
  },

  provide: function provide() {
    var builder = this.getBuilder();
    return builder;
  },

  getBuilder: function getBuilder() {
    var _this2 = this;

    if (this.builder) {
      return this.builder;
    }
    this.builder = new _builder.Builder(function () {
      return _this2.getGoconfig();
    });
    this.subscriptions.add(this.builder);
    return this.builder;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9idWlsZGVyLWdvL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRWtDLE1BQU07O3VCQUNsQixXQUFXOztBQUhqQyxXQUFXLENBQUE7O3FCQUtJO0FBQ2IsdUJBQXFCLEVBQUUsSUFBSTtBQUMzQixVQUFRLEVBQUUsSUFBSTtBQUNkLFNBQU8sRUFBRSxJQUFJO0FBQ2IsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFVBQVEsRUFBQyxvQkFBRzs7O0FBQ1YsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxXQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDNUQsWUFBSyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7QUFDakMsYUFBTyxNQUFLLHFCQUFxQixDQUFBO0tBQ2xDLENBQUMsU0FBTSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2QsYUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNmLENBQUMsQ0FBQTtHQUNIOztBQUVELFlBQVUsRUFBQyxzQkFBRztBQUNaLFFBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCO0FBQ0QsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7QUFDekIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDbkIsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQTtHQUNsQzs7QUFFRCxTQUFPLEVBQUMsbUJBQUc7QUFDVCxRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDL0IsV0FBTyxPQUFPLENBQUE7R0FDZjs7QUFFRCxZQUFVLEVBQUMsc0JBQUc7OztBQUNaLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7S0FDcEI7QUFDRCxRQUFJLENBQUMsT0FBTyxHQUFHLHFCQUNiLFlBQU07QUFBRSxhQUFPLE9BQUssV0FBVyxFQUFFLENBQUE7S0FBRSxDQUNwQyxDQUFBO0FBQ0QsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtHQUNwQjs7QUFFRCxhQUFXLEVBQUMsdUJBQUc7QUFDYixRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0tBQ3JCO0FBQ0QsV0FBTyxLQUFLLENBQUE7R0FDYjs7QUFFRCxpQkFBZSxFQUFDLHlCQUFDLE9BQU8sRUFBRTtBQUN4QixRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtHQUN4QjtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9idWlsZGVyLWdvL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHtCdWlsZGVyfSBmcm9tICcuL2J1aWxkZXInXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZGVwZW5kZW5jaWVzSW5zdGFsbGVkOiBudWxsLFxuICBnb2NvbmZpZzogbnVsbCxcbiAgYnVpbGRlcjogbnVsbCxcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnYnVpbGRlci1nbycpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5kZXBlbmRlbmNpZXNJbnN0YWxsZWQgPSB0cnVlXG4gICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXNJbnN0YWxsZWRcbiAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICB9KVxuICB9LFxuXG4gIGRlYWN0aXZhdGUgKCkge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIHRoaXMuZ29jb25maWcgPSBudWxsXG4gICAgdGhpcy5idWlsZGVyID0gbnVsbFxuICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gbnVsbFxuICB9LFxuXG4gIHByb3ZpZGUgKCkge1xuICAgIGxldCBidWlsZGVyID0gdGhpcy5nZXRCdWlsZGVyKClcbiAgICByZXR1cm4gYnVpbGRlclxuICB9LFxuXG4gIGdldEJ1aWxkZXIgKCkge1xuICAgIGlmICh0aGlzLmJ1aWxkZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmJ1aWxkZXJcbiAgICB9XG4gICAgdGhpcy5idWlsZGVyID0gbmV3IEJ1aWxkZXIoXG4gICAgICAoKSA9PiB7IHJldHVybiB0aGlzLmdldEdvY29uZmlnKCkgfVxuICAgIClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuYnVpbGRlcilcbiAgICByZXR1cm4gdGhpcy5idWlsZGVyXG4gIH0sXG5cbiAgZ2V0R29jb25maWcgKCkge1xuICAgIGlmICh0aGlzLmdvY29uZmlnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nb2NvbmZpZ1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBjb25zdW1lR29jb25maWcgKHNlcnZpY2UpIHtcbiAgICB0aGlzLmdvY29uZmlnID0gc2VydmljZVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/builder-go/lib/main.js
