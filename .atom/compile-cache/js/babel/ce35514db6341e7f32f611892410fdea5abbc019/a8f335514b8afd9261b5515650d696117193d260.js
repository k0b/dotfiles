Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _getDialog = require('./get-dialog');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var Manager = (function () {
  function Manager(goconfigFunc) {
    var _this = this;

    _classCallCheck(this, Manager);

    this.goconfig = goconfigFunc;
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add(atom.views.getView(atom.workspace), 'go-get:get-package', function () {
      _this.getPackage();
    }));
  }

  _createClass(Manager, [{
    key: 'getLocatorOptions',
    value: function getLocatorOptions() {
      var editor = arguments.length <= 0 || arguments[0] === undefined ? atom.workspace.getActiveTextEditor() : arguments[0];

      var options = {};
      if (editor) {
        options.file = editor.getPath();
        options.directory = _path2['default'].dirname(editor.getPath());
      }
      if (!options.directory && atom.project.paths.length) {
        options.directory = atom.project.paths[0];
      }

      return options;
    }
  }, {
    key: 'getExecutorOptions',
    value: function getExecutorOptions() {
      var editor = arguments.length <= 0 || arguments[0] === undefined ? atom.workspace.getActiveTextEditor() : arguments[0];

      var o = this.getLocatorOptions(editor);
      var options = {};
      if (o.directory) {
        options.cwd = o.directory;
      }
      var config = this.goconfig();
      if (config) {
        options.env = config.environment(o);
      }
      if (!options.env) {
        options.env = process.env;
      }
      return options;
    }
  }, {
    key: 'getSelectedText',
    value: function getSelectedText() {
      var editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return '';
      }
      var selections = editor.getSelections();
      if (!selections || selections.length < 1) {
        return '';
      }

      return selections[0].getText();
    }

    // Shows a dialog which can be used to perform `go get -u {pack}`. Optionally
    // populates the dialog with the selected text from the active editor.
  }, {
    key: 'getPackage',
    value: function getPackage() {
      var _this2 = this;

      var selectedText = this.getSelectedText();
      var dialog = new _getDialog.GetDialog(selectedText, function (pack) {
        _this2.performGet(pack);
      });
      dialog.attach();
    }

    // Runs `go get -u {pack}`.
    // * `options` (optional) {Object} to pass to the go-config executor.
  }, {
    key: 'performGet',
    value: function performGet(pack) {
      var _this3 = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (!pack || pack.trim() === '') {
        return Promise.resolve(false);
      }
      var config = this.goconfig();
      return config.locator.findTool('go', this.getLocatorOptions()).then(function (cmd) {
        if (!cmd) {
          atom.notifications.addError('Missing Go Tool', {
            detail: 'The go tool is required to perform a get. Please ensure you have a go runtime installed: http://golang.org.',
            dismissable: true
          });
          return { success: false };
        }
        var args = ['get', '-u', pack];
        return config.executor.exec(cmd, args, _this3.getExecutorOptions()).then(function (r) {
          if (r.error) {
            if (r.error.code === 'ENOENT') {
              atom.notifications.addError('Missing Go Tool', {
                detail: 'The go tool is required to perform a get. Please ensure you have a go runtime installed: http://golang.org.',
                dismissable: true
              });
            } else {
              console.log(r.error);
              atom.notifications.addError('Error Getting Package', {
                detail: r.error.message,
                dismissable: true
              });
            }
            return { success: false, result: r };
          }

          if (r.exitcode !== 0 || r.stderr && r.stderr.trim() !== '') {
            var message = r.stderr.trim() + '\r\n' + r.stdout.trim();
            atom.notifications.addWarning('Error Getting Package', {
              detail: message.trim(),
              dismissable: true
            });
            return { success: false, result: r };
          }

          atom.notifications.addSuccess(cmd + ' ' + args.join(' '));
          return { success: true, result: r };
        });
      });
    }

    // Creates a notification that can be used to run `go get -u {options.packagePath}`.
    // * `options` (required) {Object}
    //   * `name` (required) {String} e.g. go-plus
    //   * `packageName` (required) {String} e.g. goimports
    //   * `packagePath` (required) {String} e.g. golang.org/x/tools/cmd/goimports
    //   * `type` (required) {String} one of 'missing' or 'outdated' (used to customize the prompt)
  }, {
    key: 'get',
    value: function get(options) {
      var _this4 = this;

      if (!options || !options.name || !options.packageName || !options.packagePath || !options.type) {
        return Promise.resolve(false);
      }
      if (['missing', 'outdated'].indexOf(options.type) === -1) {
        return Promise.resolve(false);
      }

      var detail = 'The ' + options.name + ' package uses the ' + options.packageName + ' tool, but it cannot be found.';
      if (options.type === 'outdated') {
        detail = 'An update is available for the ' + options.packageName + ' tool. This is used by the ' + options.name + ' package.';
      }
      return new Promise(function (resolve) {
        var wasClicked = false;
        var notification = atom.notifications.addInfo('Go Get', {
          dismissable: true,
          icon: 'cloud-download',
          detail: detail,
          description: 'Would you like to run `go get -u` [`' + options.packagePath + '`](http://' + options.packagePath + ')?',
          buttons: [{
            text: 'Run Go Get',
            onDidClick: function onDidClick() {
              wasClicked = true;
              notification.dismiss();
              resolve(_this4.performGet(options.packagePath));
            }
          }]
        });
        notification.onDidDismiss(function () {
          if (!wasClicked) {
            resolve(false);
          }
        });
      });
    }

    // Check returns true if a package is up to date, and false if a package is missing or outdated.
  }, {
    key: 'check',
    value: function check(options) {
      return Promise.resolve(true);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }
      this.subscriptions = null;
      this.goconfig = null;
    }
  }]);

  return Manager;
})();

exports.Manager = Manager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1nZXQvbGliL21hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFa0MsTUFBTTs7eUJBQ2hCLGNBQWM7O29CQUNyQixNQUFNOzs7O0FBSnZCLFdBQVcsQ0FBQTs7SUFNTCxPQUFPO0FBQ0MsV0FEUixPQUFPLENBQ0UsWUFBWSxFQUFFOzs7MEJBRHZCLE9BQU87O0FBRVQsUUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsb0JBQW9CLEVBQUUsWUFBTTtBQUN2RyxZQUFLLFVBQVUsRUFBRSxDQUFBO0tBQ2xCLENBQUMsQ0FBQyxDQUFBO0dBQ0o7O2VBUEcsT0FBTzs7V0FTTyw2QkFBZ0Q7VUFBL0MsTUFBTSx5REFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFOztBQUM5RCxVQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDaEIsVUFBSSxNQUFNLEVBQUU7QUFDVixlQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUMvQixlQUFPLENBQUMsU0FBUyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtPQUNuRDtBQUNELFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUNuRCxlQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQzFDOztBQUVELGFB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QU8sRUFBRSxDQUFDO0FBQ1IsZ0JBQUksRUFBRSxZQUFZO0FBQ2xCLHNCQUFVLEVBQUUsc0JBQU07QUFDaEIsd0JBQVUsR0FBRyxJQUFJLENBQUE7QUFDakIsMEJBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN0QixxQkFBTyxDQUFDLE9BQUssVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO2FBQzlDO1dBQ0YsQ0FBQztTQUNILENBQUMsQ0FBQTtBQUNGLG9CQUFZLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDOUIsY0FBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLG1CQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7V0FDZjtTQUNGLENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNIOzs7OztXQUdLLGVBQUMsT0FBTyxFQUFFO0FBQ2QsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzdCOzs7V0FFTyxtQkFBRztBQUNULFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQzdCO0FBQ0QsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7QUFDekIsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7S0FDckI7OztTQWxLRyxPQUFPOzs7UUFvS0wsT0FBTyxHQUFQLE9BQU8iLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dvLWdldC9saWIvbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCB7R2V0RGlhbG9nfSBmcm9tICcuL2dldC1kaWFsb2cnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jbGFzcyBNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IgKGdvY29uZmlnRnVuYykge1xuICAgIHRoaXMuZ29jb25maWcgPSBnb2NvbmZpZ0Z1bmNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnZ28tZ2V0OmdldC1wYWNrYWdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5nZXRQYWNrYWdlKClcbiAgICB9KSlcbiAgfVxuXG4gIGdldExvY2F0b3JPcHRpb25zIChlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpIHtcbiAgICBsZXQgb3B0aW9ucyA9IHt9XG4gICAgaWYgKGVkaXRvcikge1xuICAgICAgb3B0aW9ucy5maWxlID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgb3B0aW9ucy5kaXJlY3RvcnkgPSBwYXRoLmRpcm5hbWUoZWRpdG9yLmdldFBhdGgoKSlcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmRpcmVjdG9yeSAmJiBhdG9tLnByb2plY3QucGF0aHMubGVuZ3RoKSB7XG4gICAgICBvcHRpb25zLmRpcmVjdG9yeSA9IGF0b20ucHJvamVjdC5wYXRoc1swXVxuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBnZXRFeGVjdXRvck9wdGlvbnMgKGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSkge1xuICAgIGxldCBvID0gdGhpcy5nZXRMb2NhdG9yT3B0aW9ucyhlZGl0b3IpXG4gICAgbGV0IG9wdGlvbnMgPSB7fVxuICAgIGlmIChvLmRpcmVjdG9yeSkge1xuICAgICAgb3B0aW9ucy5jd2QgPSBvLmRpcmVjdG9yeVxuICAgIH1cbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgb3B0aW9ucy5lbnYgPSBjb25maWcuZW52aXJvbm1lbnQobylcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmVudikge1xuICAgICAgb3B0aW9ucy5lbnYgPSBwcm9jZXNzLmVudlxuICAgIH1cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWRUZXh0ICgpIHtcbiAgICBsZXQgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgICBsZXQgc2VsZWN0aW9ucyA9IGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBpZiAoIXNlbGVjdGlvbnMgfHwgc2VsZWN0aW9ucy5sZW5ndGggPCAxKSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0aW9uc1swXS5nZXRUZXh0KClcbiAgfVxuXG4gIC8vIFNob3dzIGEgZGlhbG9nIHdoaWNoIGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gYGdvIGdldCAtdSB7cGFja31gLiBPcHRpb25hbGx5XG4gIC8vIHBvcHVsYXRlcyB0aGUgZGlhbG9nIHdpdGggdGhlIHNlbGVjdGVkIHRleHQgZnJvbSB0aGUgYWN0aXZlIGVkaXRvci5cbiAgZ2V0UGFja2FnZSAoKSB7XG4gICAgbGV0IHNlbGVjdGVkVGV4dCA9IHRoaXMuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICBsZXQgZGlhbG9nID0gbmV3IEdldERpYWxvZyhzZWxlY3RlZFRleHQsIChwYWNrKSA9PiB7XG4gICAgICB0aGlzLnBlcmZvcm1HZXQocGFjaylcbiAgICB9KVxuICAgIGRpYWxvZy5hdHRhY2goKVxuICB9XG5cbiAgLy8gUnVucyBgZ28gZ2V0IC11IHtwYWNrfWAuXG4gIC8vICogYG9wdGlvbnNgIChvcHRpb25hbCkge09iamVjdH0gdG8gcGFzcyB0byB0aGUgZ28tY29uZmlnIGV4ZWN1dG9yLlxuICBwZXJmb3JtR2V0IChwYWNrLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAoIXBhY2sgfHwgcGFjay50cmltKCkgPT09ICcnKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgIH1cbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgcmV0dXJuIGNvbmZpZy5sb2NhdG9yLmZpbmRUb29sKCdnbycsIHRoaXMuZ2V0TG9jYXRvck9wdGlvbnMoKSkudGhlbigoY21kKSA9PiB7XG4gICAgICBpZiAoIWNtZCkge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ01pc3NpbmcgR28gVG9vbCcsIHtcbiAgICAgICAgICBkZXRhaWw6ICdUaGUgZ28gdG9vbCBpcyByZXF1aXJlZCB0byBwZXJmb3JtIGEgZ2V0LiBQbGVhc2UgZW5zdXJlIHlvdSBoYXZlIGEgZ28gcnVudGltZSBpbnN0YWxsZWQ6IGh0dHA6Ly9nb2xhbmcub3JnLicsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHtzdWNjZXNzOiBmYWxzZX1cbiAgICAgIH1cbiAgICAgIGxldCBhcmdzID0gWydnZXQnLCAnLXUnLCBwYWNrXVxuICAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRvci5leGVjKGNtZCwgYXJncywgdGhpcy5nZXRFeGVjdXRvck9wdGlvbnMoKSkudGhlbigocikgPT4ge1xuICAgICAgICBpZiAoci5lcnJvcikge1xuICAgICAgICAgIGlmIChyLmVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ01pc3NpbmcgR28gVG9vbCcsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiAnVGhlIGdvIHRvb2wgaXMgcmVxdWlyZWQgdG8gcGVyZm9ybSBhIGdldC4gUGxlYXNlIGVuc3VyZSB5b3UgaGF2ZSBhIGdvIHJ1bnRpbWUgaW5zdGFsbGVkOiBodHRwOi8vZ29sYW5nLm9yZy4nLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coci5lcnJvcilcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRXJyb3IgR2V0dGluZyBQYWNrYWdlJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IHIuZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7c3VjY2VzczogZmFsc2UsIHJlc3VsdDogcn1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyLmV4aXRjb2RlICE9PSAwIHx8IHIuc3RkZXJyICYmIHIuc3RkZXJyLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICBsZXQgbWVzc2FnZSA9IHIuc3RkZXJyLnRyaW0oKSArICdcXHJcXG4nICsgci5zdGRvdXQudHJpbSgpXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ0Vycm9yIEdldHRpbmcgUGFja2FnZScsIHtcbiAgICAgICAgICAgIGRldGFpbDogbWVzc2FnZS50cmltKCksXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuIHtzdWNjZXNzOiBmYWxzZSwgcmVzdWx0OiByfVxuICAgICAgICB9XG5cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoY21kICsgJyAnICsgYXJncy5qb2luKCcgJykpXG4gICAgICAgIHJldHVybiB7c3VjY2VzczogdHJ1ZSwgcmVzdWx0OiByfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLy8gQ3JlYXRlcyBhIG5vdGlmaWNhdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJ1biBgZ28gZ2V0IC11IHtvcHRpb25zLnBhY2thZ2VQYXRofWAuXG4gIC8vICogYG9wdGlvbnNgIChyZXF1aXJlZCkge09iamVjdH1cbiAgLy8gICAqIGBuYW1lYCAocmVxdWlyZWQpIHtTdHJpbmd9IGUuZy4gZ28tcGx1c1xuICAvLyAgICogYHBhY2thZ2VOYW1lYCAocmVxdWlyZWQpIHtTdHJpbmd9IGUuZy4gZ29pbXBvcnRzXG4gIC8vICAgKiBgcGFja2FnZVBhdGhgIChyZXF1aXJlZCkge1N0cmluZ30gZS5nLiBnb2xhbmcub3JnL3gvdG9vbHMvY21kL2dvaW1wb3J0c1xuICAvLyAgICogYHR5cGVgIChyZXF1aXJlZCkge1N0cmluZ30gb25lIG9mICdtaXNzaW5nJyBvciAnb3V0ZGF0ZWQnICh1c2VkIHRvIGN1c3RvbWl6ZSB0aGUgcHJvbXB0KVxuICBnZXQgKG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMubmFtZSB8fCAhb3B0aW9ucy5wYWNrYWdlTmFtZSB8fCAhb3B0aW9ucy5wYWNrYWdlUGF0aCB8fCAhb3B0aW9ucy50eXBlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgIH1cbiAgICBpZiAoWydtaXNzaW5nJywgJ291dGRhdGVkJ10uaW5kZXhPZihvcHRpb25zLnR5cGUpID09PSAtMSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSlcbiAgICB9XG5cbiAgICBsZXQgZGV0YWlsID0gJ1RoZSAnICsgb3B0aW9ucy5uYW1lICsgJyBwYWNrYWdlIHVzZXMgdGhlICcgKyBvcHRpb25zLnBhY2thZ2VOYW1lICsgJyB0b29sLCBidXQgaXQgY2Fubm90IGJlIGZvdW5kLidcbiAgICBpZiAob3B0aW9ucy50eXBlID09PSAnb3V0ZGF0ZWQnKSB7XG4gICAgICBkZXRhaWwgPSAnQW4gdXBkYXRlIGlzIGF2YWlsYWJsZSBmb3IgdGhlICcgKyBvcHRpb25zLnBhY2thZ2VOYW1lICsgJyB0b29sLiBUaGlzIGlzIHVzZWQgYnkgdGhlICcgKyBvcHRpb25zLm5hbWUgKyAnIHBhY2thZ2UuJ1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGxldCB3YXNDbGlja2VkID0gZmFsc2VcbiAgICAgIGxldCBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnR28gR2V0Jywge1xuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgaWNvbjogJ2Nsb3VkLWRvd25sb2FkJyxcbiAgICAgICAgZGV0YWlsOiBkZXRhaWwsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnV291bGQgeW91IGxpa2UgdG8gcnVuIGBnbyBnZXQgLXVgIFtgJyArIG9wdGlvbnMucGFja2FnZVBhdGggKyAnYF0oaHR0cDovLycgKyBvcHRpb25zLnBhY2thZ2VQYXRoICsgJyk/JyxcbiAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICB0ZXh0OiAnUnVuIEdvIEdldCcsXG4gICAgICAgICAgb25EaWRDbGljazogKCkgPT4ge1xuICAgICAgICAgICAgd2FzQ2xpY2tlZCA9IHRydWVcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5wZXJmb3JtR2V0KG9wdGlvbnMucGFja2FnZVBhdGgpKVxuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIH0pXG4gICAgICBub3RpZmljYXRpb24ub25EaWREaXNtaXNzKCgpID0+IHtcbiAgICAgICAgaWYgKCF3YXNDbGlja2VkKSB7XG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLy8gQ2hlY2sgcmV0dXJucyB0cnVlIGlmIGEgcGFja2FnZSBpcyB1cCB0byBkYXRlLCBhbmQgZmFsc2UgaWYgYSBwYWNrYWdlIGlzIG1pc3Npbmcgb3Igb3V0ZGF0ZWQuXG4gIGNoZWNrIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKVxuICB9XG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nb2NvbmZpZyA9IG51bGxcbiAgfVxufVxuZXhwb3J0IHtNYW5hZ2VyfVxuIl19
//# sourceURL=/Users/james/.atom/packages/go-get/lib/manager.js
