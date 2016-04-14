Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _gocodeprovider = require('./gocodeprovider');

'use babel';

exports['default'] = {
  goconfig: null,
  goget: null,
  provider: null,
  subscriptions: null,
  dependenciesInstalled: null,
  toolCheckComplete: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    require('atom-package-deps').install('autocomplete-go').then(function () {
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
    this.goget = null;
    this.provider = null;
    this.dependenciesInstalled = null;
    this.toolCheckComplete = null;
  },

  provide: function provide() {
    return this.getProvider();
  },

  getProvider: function getProvider() {
    var _this2 = this;

    if (this.provider) {
      return this.provider;
    }
    this.provider = new _gocodeprovider.GocodeProvider(function () {
      return _this2.getGoconfig();
    }, function () {
      return _this2.getGoget();
    });
    this.subscriptions.add(this.provider);
    return this.provider;
  },

  getGoconfig: function getGoconfig() {
    if (this.goconfig) {
      return this.goconfig;
    }
    return false;
  },

  consumeGoconfig: function consumeGoconfig(service) {
    this.goconfig = service;
    this.checkForGocode();
  },

  getGoget: function getGoget() {
    if (this.goget) {
      return this.goget;
    }
    return false;
  },

  consumeGoget: function consumeGoget(service) {
    this.goget = service;
    this.checkForGocode();
  },

  checkForGocode: function checkForGocode() {
    var _this3 = this;

    if (!this.toolCheckComplete && this.goconfig && this.goget) {
      this.goconfig.locator.findTool('gocode').then(function (cmd) {
        if (!cmd) {
          _this3.toolCheckComplete = true;
          _this3.goget.get({
            name: 'autocomplete-go',
            packageName: 'gocode',
            packagePath: 'github.com/nsf/gocode',
            type: 'missing'
          }).then(function (r) {
            if (!r.success) {
              console.log('gocode is not available and could not be installed via "go get -u github.com/nsf/gocode"; please manually install it to enable autocomplete behavior.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtZ28vbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFFa0MsTUFBTTs7OEJBQ1gsa0JBQWtCOztBQUgvQyxXQUFXLENBQUE7O3FCQUtJO0FBQ2IsVUFBUSxFQUFFLElBQUk7QUFDZCxPQUFLLEVBQUUsSUFBSTtBQUNYLFVBQVEsRUFBRSxJQUFJO0FBQ2QsZUFBYSxFQUFFLElBQUk7QUFDbkIsdUJBQXFCLEVBQUUsSUFBSTtBQUMzQixtQkFBaUIsRUFBRSxJQUFJOztBQUV2QixVQUFRLEVBQUMsb0JBQUc7OztBQUNWLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsV0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDakUsWUFBSyxxQkFBcUIsR0FBRyxJQUFJLENBQUE7S0FDbEMsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDZCxhQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2YsQ0FBQyxDQUFBO0dBQ0g7O0FBRUQsWUFBVSxFQUFDLHNCQUFHO0FBQ1osUUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7QUFDRCxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUN6QixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUNwQixRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtBQUNqQixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUNwQixRQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFBO0FBQ2pDLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUE7R0FDOUI7O0FBRUQsU0FBTyxFQUFDLG1CQUFHO0FBQ1QsV0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7R0FDMUI7O0FBRUQsYUFBVyxFQUFDLHVCQUFHOzs7QUFDYixRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0tBQ3JCO0FBQ0QsUUFBSSxDQUFDLFFBQVEsR0FBRyxtQ0FDZCxZQUFNO0FBQUUsYUFBTyxPQUFLLFdBQVcsRUFBRSxDQUFBO0tBQUUsRUFDbkMsWUFBTTtBQUFFLGFBQU8sT0FBSyxRQUFRLEVBQUUsQ0FBQTtLQUFFLENBQ2pDLENBQUE7QUFDRCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDckMsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0dBQ3JCOztBQUVELGFBQVcsRUFBQyx1QkFBRztBQUNiLFFBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7S0FDckI7QUFDRCxXQUFPLEtBQUssQ0FBQTtHQUNiOztBQUVELGlCQUFlLEVBQUMseUJBQUMsT0FBTyxFQUFFO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtHQUN0Qjs7QUFFRCxVQUFRLEVBQUMsb0JBQUc7QUFDVixRQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbEI7QUFDRCxXQUFPLEtBQUssQ0FBQTtHQUNiOztBQUVELGNBQVksRUFBQyxzQkFBQyxPQUFPLEVBQUU7QUFDckIsUUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUE7QUFDcEIsUUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO0dBQ3RCOztBQUVELGdCQUFjLEVBQUMsMEJBQUc7OztBQUNoQixRQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUMxRCxVQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ3JELFlBQUksQ0FBQyxHQUFHLEVBQUU7QUFDUixpQkFBSyxpQkFBaUIsR0FBRyxJQUFJLENBQUE7QUFDN0IsaUJBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNiLGdCQUFJLEVBQUUsaUJBQWlCO0FBQ3ZCLHVCQUFXLEVBQUUsUUFBUTtBQUNyQix1QkFBVyxFQUFFLHVCQUF1QjtBQUNwQyxnQkFBSSxFQUFFLFNBQVM7V0FDaEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNiLGdCQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUNkLHFCQUFPLENBQUMsR0FBRyxDQUFDLHVKQUF1SixDQUFDLENBQUE7YUFDcks7V0FDRixDQUFDLFNBQU0sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNkLG1CQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1dBQ2YsQ0FBQyxDQUFBO1NBQ0g7T0FDRixDQUFDLENBQUE7S0FDSDtHQUNGO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1nby9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCB7R29jb2RlUHJvdmlkZXJ9IGZyb20gJy4vZ29jb2RlcHJvdmlkZXInXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZ29jb25maWc6IG51bGwsXG4gIGdvZ2V0OiBudWxsLFxuICBwcm92aWRlcjogbnVsbCxcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcbiAgZGVwZW5kZW5jaWVzSW5zdGFsbGVkOiBudWxsLFxuICB0b29sQ2hlY2tDb21wbGV0ZTogbnVsbCxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnYXV0b2NvbXBsZXRlLWdvJykudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmRlcGVuZGVuY2llc0luc3RhbGxlZCA9IHRydWVcbiAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICB9KVxuICB9LFxuXG4gIGRlYWN0aXZhdGUgKCkge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIHRoaXMuZ29jb25maWcgPSBudWxsXG4gICAgdGhpcy5nb2dldCA9IG51bGxcbiAgICB0aGlzLnByb3ZpZGVyID0gbnVsbFxuICAgIHRoaXMuZGVwZW5kZW5jaWVzSW5zdGFsbGVkID0gbnVsbFxuICAgIHRoaXMudG9vbENoZWNrQ29tcGxldGUgPSBudWxsXG4gIH0sXG5cbiAgcHJvdmlkZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXIoKVxuICB9LFxuXG4gIGdldFByb3ZpZGVyICgpIHtcbiAgICBpZiAodGhpcy5wcm92aWRlcikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvdmlkZXJcbiAgICB9XG4gICAgdGhpcy5wcm92aWRlciA9IG5ldyBHb2NvZGVQcm92aWRlcihcbiAgICAgICgpID0+IHsgcmV0dXJuIHRoaXMuZ2V0R29jb25maWcoKSB9LFxuICAgICAgKCkgPT4geyByZXR1cm4gdGhpcy5nZXRHb2dldCgpIH1cbiAgICApXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnByb3ZpZGVyKVxuICAgIHJldHVybiB0aGlzLnByb3ZpZGVyXG4gIH0sXG5cbiAgZ2V0R29jb25maWcgKCkge1xuICAgIGlmICh0aGlzLmdvY29uZmlnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nb2NvbmZpZ1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBjb25zdW1lR29jb25maWcgKHNlcnZpY2UpIHtcbiAgICB0aGlzLmdvY29uZmlnID0gc2VydmljZVxuICAgIHRoaXMuY2hlY2tGb3JHb2NvZGUoKVxuICB9LFxuXG4gIGdldEdvZ2V0ICgpIHtcbiAgICBpZiAodGhpcy5nb2dldCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ29nZXRcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0sXG5cbiAgY29uc3VtZUdvZ2V0IChzZXJ2aWNlKSB7XG4gICAgdGhpcy5nb2dldCA9IHNlcnZpY2VcbiAgICB0aGlzLmNoZWNrRm9yR29jb2RlKClcbiAgfSxcblxuICBjaGVja0ZvckdvY29kZSAoKSB7XG4gICAgaWYgKCF0aGlzLnRvb2xDaGVja0NvbXBsZXRlICYmIHRoaXMuZ29jb25maWcgJiYgdGhpcy5nb2dldCkge1xuICAgICAgdGhpcy5nb2NvbmZpZy5sb2NhdG9yLmZpbmRUb29sKCdnb2NvZGUnKS50aGVuKChjbWQpID0+IHtcbiAgICAgICAgaWYgKCFjbWQpIHtcbiAgICAgICAgICB0aGlzLnRvb2xDaGVja0NvbXBsZXRlID0gdHJ1ZVxuICAgICAgICAgIHRoaXMuZ29nZXQuZ2V0KHtcbiAgICAgICAgICAgIG5hbWU6ICdhdXRvY29tcGxldGUtZ28nLFxuICAgICAgICAgICAgcGFja2FnZU5hbWU6ICdnb2NvZGUnLFxuICAgICAgICAgICAgcGFja2FnZVBhdGg6ICdnaXRodWIuY29tL25zZi9nb2NvZGUnLFxuICAgICAgICAgICAgdHlwZTogJ21pc3NpbmcnXG4gICAgICAgICAgfSkudGhlbigocikgPT4ge1xuICAgICAgICAgICAgaWYgKCFyLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvY29kZSBpcyBub3QgYXZhaWxhYmxlIGFuZCBjb3VsZCBub3QgYmUgaW5zdGFsbGVkIHZpYSBcImdvIGdldCAtdSBnaXRodWIuY29tL25zZi9nb2NvZGVcIjsgcGxlYXNlIG1hbnVhbGx5IGluc3RhbGwgaXQgdG8gZW5hYmxlIGF1dG9jb21wbGV0ZSBiZWhhdmlvci4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/autocomplete-go/lib/main.js
