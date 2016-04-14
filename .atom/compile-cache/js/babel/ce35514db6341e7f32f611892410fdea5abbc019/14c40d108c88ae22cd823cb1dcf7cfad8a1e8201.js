Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _godef = require('./godef');

'use babel';

exports['default'] = {
  dependenciesInstalled: null,
  goconfig: null,
  goget: null,
  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    require('atom-package-deps').install('navigator-godef').then(function () {
      _this.dependenciesInstalled = true;
      return _this.dependenciesInstalled;
    })['catch'](function (e) {
      console.log(e);
    });
    this.godef = new _godef.Godef(function () {
      return _this.getGoconfig();
    }, function () {
      return _this.getGoget();
    });
    this.subscriptions.add(this.godef);
  },

  deactivate: function deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.goget = null;
    this.goconfig = null;
    this.godef = null;
    this.dependenciesInstalled = null;
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
  },

  consumeGoget: function consumeGoget(service) {
    this.goget = service;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9uYXZpZ2F0b3ItZ29kZWYvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFFa0MsTUFBTTs7cUJBQ3BCLFNBQVM7O0FBSDdCLFdBQVcsQ0FBQTs7cUJBS0k7QUFDYix1QkFBcUIsRUFBRSxJQUFJO0FBQzNCLFVBQVEsRUFBRSxJQUFJO0FBQ2QsT0FBSyxFQUFFLElBQUk7QUFDWCxlQUFhLEVBQUUsSUFBSTs7QUFFbkIsVUFBUSxFQUFDLG9CQUFHOzs7QUFDVixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ2pFLFlBQUsscUJBQXFCLEdBQUcsSUFBSSxDQUFBO0FBQ2pDLGFBQU8sTUFBSyxxQkFBcUIsQ0FBQTtLQUNsQyxDQUFDLFNBQU0sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNkLGFBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDZixDQUFDLENBQUE7QUFDRixRQUFJLENBQUMsS0FBSyxHQUFHLGlCQUNYLFlBQU07QUFBRSxhQUFPLE1BQUssV0FBVyxFQUFFLENBQUE7S0FBRSxFQUNuQyxZQUFNO0FBQUUsYUFBTyxNQUFLLFFBQVEsRUFBRSxDQUFBO0tBQUUsQ0FDakMsQ0FBQTtBQUNELFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUNuQzs7QUFFRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3QjtBQUNELFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7R0FDbEM7O0FBRUQsYUFBVyxFQUFDLHVCQUFHO0FBQ2IsUUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtLQUNyQjtBQUNELFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsVUFBUSxFQUFDLG9CQUFHO0FBQ1YsUUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2QsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQ2xCO0FBQ0QsV0FBTyxLQUFLLENBQUE7R0FDYjs7QUFFRCxpQkFBZSxFQUFDLHlCQUFDLE9BQU8sRUFBRTtBQUN4QixRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtHQUN4Qjs7QUFFRCxjQUFZLEVBQUMsc0JBQUMsT0FBTyxFQUFFO0FBQ3JCLFFBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFBO0dBQ3JCO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL25hdmlnYXRvci1nb2RlZi9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCB7R29kZWZ9IGZyb20gJy4vZ29kZWYnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZGVwZW5kZW5jaWVzSW5zdGFsbGVkOiBudWxsLFxuICBnb2NvbmZpZzogbnVsbCxcbiAgZ29nZXQ6IG51bGwsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG5cbiAgYWN0aXZhdGUgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ25hdmlnYXRvci1nb2RlZicpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5kZXBlbmRlbmNpZXNJbnN0YWxsZWQgPSB0cnVlXG4gICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXNJbnN0YWxsZWRcbiAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICB9KVxuICAgIHRoaXMuZ29kZWYgPSBuZXcgR29kZWYoXG4gICAgICAoKSA9PiB7IHJldHVybiB0aGlzLmdldEdvY29uZmlnKCkgfSxcbiAgICAgICgpID0+IHsgcmV0dXJuIHRoaXMuZ2V0R29nZXQoKSB9XG4gICAgKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5nb2RlZilcbiAgfSxcblxuICBkZWFjdGl2YXRlICgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLmdvZ2V0ID0gbnVsbFxuICAgIHRoaXMuZ29jb25maWcgPSBudWxsXG4gICAgdGhpcy5nb2RlZiA9IG51bGxcbiAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IG51bGxcbiAgfSxcblxuICBnZXRHb2NvbmZpZyAoKSB7XG4gICAgaWYgKHRoaXMuZ29jb25maWcpIHtcbiAgICAgIHJldHVybiB0aGlzLmdvY29uZmlnXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGdldEdvZ2V0ICgpIHtcbiAgICBpZiAodGhpcy5nb2dldCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ29nZXRcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0sXG5cbiAgY29uc3VtZUdvY29uZmlnIChzZXJ2aWNlKSB7XG4gICAgdGhpcy5nb2NvbmZpZyA9IHNlcnZpY2VcbiAgfSxcblxuICBjb25zdW1lR29nZXQgKHNlcnZpY2UpIHtcbiAgICB0aGlzLmdvZ2V0ID0gc2VydmljZVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/navigator-godef/lib/main.js
