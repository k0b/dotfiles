'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  dependenciesInstalled: null,

  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('go-plus').then(function () {
      _this.dependenciesInstalled = true;
      return _this.dependenciesInstalled;
    })['catch'](function (e) {
      console.log(e);
    });
  },

  deactivate: function deactivate() {
    this.dependenciesInstalled = null;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1wbHVzL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7cUJBRUk7QUFDYix1QkFBcUIsRUFBRSxJQUFJOztBQUUzQixVQUFRLEVBQUMsb0JBQUc7OztBQUNWLFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUN6RCxZQUFLLHFCQUFxQixHQUFHLElBQUksQ0FBQTtBQUNqQyxhQUFPLE1BQUsscUJBQXFCLENBQUE7S0FDbEMsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDZCxhQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2YsQ0FBQyxDQUFBO0dBQ0g7O0FBRUQsWUFBVSxFQUFDLHNCQUFHO0FBQ1osUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQTtHQUNsQztDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1wbHVzL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkZXBlbmRlbmNpZXNJbnN0YWxsZWQ6IG51bGwsXG5cbiAgYWN0aXZhdGUgKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnZ28tcGx1cycpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5kZXBlbmRlbmNpZXNJbnN0YWxsZWQgPSB0cnVlXG4gICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXNJbnN0YWxsZWRcbiAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICB9KVxuICB9LFxuXG4gIGRlYWN0aXZhdGUgKCkge1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gbnVsbFxuICB9XG59XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/go-plus/lib/main.js
