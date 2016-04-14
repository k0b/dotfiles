Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _linter = require('./linter');

'use babel';

exports['default'] = {
  dependenciesInstalled: null,
  goget: null,
  goconfig: null,
  linter: null,
  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    require('atom-package-deps').install('gometalinter-linter').then(function () {
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
    this.goget = null;
    this.goconfig = null;
    this.linter = null;
    this.dependenciesInstalled = null;
  },

  provide: function provide() {
    var linter = this.getLinter();
    return linter;
  },

  getLinter: function getLinter() {
    var _this2 = this;

    if (this.linter) {
      return this.linter;
    }
    this.linter = new _linter.GometalinterLinter(function () {
      return _this2.getGoconfig();
    }, function () {
      return _this2.getGoget();
    });
    this.subscriptions.add(this.linter);
    return this.linter;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb21ldGFsaW50ZXItbGludGVyL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRWtDLE1BQU07O3NCQUNQLFVBQVU7O0FBSDNDLFdBQVcsQ0FBQTs7cUJBS0k7QUFDYix1QkFBcUIsRUFBRSxJQUFJO0FBQzNCLE9BQUssRUFBRSxJQUFJO0FBQ1gsVUFBUSxFQUFFLElBQUk7QUFDZCxRQUFNLEVBQUUsSUFBSTtBQUNaLGVBQWEsRUFBRSxJQUFJOztBQUVuQixVQUFRLEVBQUMsb0JBQUc7OztBQUNWLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsV0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDckUsWUFBSyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7QUFDakMsYUFBTyxNQUFLLHFCQUFxQixDQUFBO0tBQ2xDLENBQUMsU0FBTSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2QsYUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNmLENBQUMsQ0FBQTtHQUNIOztBQUVELFlBQVUsRUFBQyxzQkFBRztBQUNaLFFBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCO0FBQ0QsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7QUFDekIsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDakIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDcEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDbEIsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQTtHQUNsQzs7QUFFRCxTQUFPLEVBQUMsbUJBQUc7QUFDVCxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDN0IsV0FBTyxNQUFNLENBQUE7R0FDZDs7QUFFRCxXQUFTLEVBQUMscUJBQUc7OztBQUNYLFFBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUNuQjtBQUNELFFBQUksQ0FBQyxNQUFNLEdBQUcsK0JBQ1osWUFBTTtBQUFFLGFBQU8sT0FBSyxXQUFXLEVBQUUsQ0FBQTtLQUFFLEVBQ25DLFlBQU07QUFBRSxhQUFPLE9BQUssUUFBUSxFQUFFLENBQUE7S0FBRSxDQUNqQyxDQUFBO0FBQ0QsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ25DLFdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtHQUNuQjs7QUFFRCxhQUFXLEVBQUMsdUJBQUc7QUFDYixRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0tBQ3JCO0FBQ0QsV0FBTyxLQUFLLENBQUE7R0FDYjs7QUFFRCxVQUFRLEVBQUMsb0JBQUc7QUFDVixRQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbEI7QUFDRCxXQUFPLEtBQUssQ0FBQTtHQUNiOztBQUVELGlCQUFlLEVBQUMseUJBQUMsT0FBTyxFQUFFO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO0dBQ3hCOztBQUVELGNBQVksRUFBQyxzQkFBQyxPQUFPLEVBQUU7QUFDckIsUUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUE7R0FDckI7Q0FDRiIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvZ29tZXRhbGludGVyLWxpbnRlci9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCB7R29tZXRhbGludGVyTGludGVyfSBmcm9tICcuL2xpbnRlcidcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkZXBlbmRlbmNpZXNJbnN0YWxsZWQ6IG51bGwsXG4gIGdvZ2V0OiBudWxsLFxuICBnb2NvbmZpZzogbnVsbCxcbiAgbGludGVyOiBudWxsLFxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuXG4gIGFjdGl2YXRlICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdnb21ldGFsaW50ZXItbGludGVyJykudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IHRydWVcbiAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZFxuICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlKVxuICAgIH0pXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nb2dldCA9IG51bGxcbiAgICB0aGlzLmdvY29uZmlnID0gbnVsbFxuICAgIHRoaXMubGludGVyID0gbnVsbFxuICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gbnVsbFxuICB9LFxuXG4gIHByb3ZpZGUgKCkge1xuICAgIGxldCBsaW50ZXIgPSB0aGlzLmdldExpbnRlcigpXG4gICAgcmV0dXJuIGxpbnRlclxuICB9LFxuXG4gIGdldExpbnRlciAoKSB7XG4gICAgaWYgKHRoaXMubGludGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5saW50ZXJcbiAgICB9XG4gICAgdGhpcy5saW50ZXIgPSBuZXcgR29tZXRhbGludGVyTGludGVyKFxuICAgICAgKCkgPT4geyByZXR1cm4gdGhpcy5nZXRHb2NvbmZpZygpIH0sXG4gICAgICAoKSA9PiB7IHJldHVybiB0aGlzLmdldEdvZ2V0KCkgfVxuICAgIClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubGludGVyKVxuICAgIHJldHVybiB0aGlzLmxpbnRlclxuICB9LFxuXG4gIGdldEdvY29uZmlnICgpIHtcbiAgICBpZiAodGhpcy5nb2NvbmZpZykge1xuICAgICAgcmV0dXJuIHRoaXMuZ29jb25maWdcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0sXG5cbiAgZ2V0R29nZXQgKCkge1xuICAgIGlmICh0aGlzLmdvZ2V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5nb2dldFxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBjb25zdW1lR29jb25maWcgKHNlcnZpY2UpIHtcbiAgICB0aGlzLmdvY29uZmlnID0gc2VydmljZVxuICB9LFxuXG4gIGNvbnN1bWVHb2dldCAoc2VydmljZSkge1xuICAgIHRoaXMuZ29nZXQgPSBzZXJ2aWNlXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/gometalinter-linter/lib/main.js
