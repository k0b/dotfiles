Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var GometalinterLinter = (function () {
  function GometalinterLinter(goconfigFunc, gogetFunc) {
    var _this = this;

    _classCallCheck(this, GometalinterLinter);

    this.goget = gogetFunc;
    this.goconfig = goconfigFunc;
    this.subscriptions = new _atom.CompositeDisposable();

    this.name = 'gometalinter';
    this.grammarScopes = ['source.go'];
    this.scope = 'project';
    this.lintOnFly = false;
    this.toolCheckComplete = false;
    this.subscriptions.add(atom.commands.add('atom-workspace', 'golang:updatelinters', function () {
      _this.updateTools();
    }));
  }

  _createClass(GometalinterLinter, [{
    key: 'dispose',
    value: function dispose() {
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }
      this.subscriptions = null;
      this.goget = null;
      this.goconfig = null;
      this.name = null;
      this.grammarScopes = null;
      this.lintOnFly = null;
      this.toolCheckComplete = null;
    }
  }, {
    key: 'ready',
    value: function ready() {
      if (!this.goconfig) {
        return false;
      }
      var config = this.goconfig();
      if (!config) {
        return false;
      }

      return true;
    }
  }, {
    key: 'lint',
    value: function lint(editor) {
      var _this2 = this;

      if (!this.ready() || !editor) {
        return [];
      }
      var buffer = editor.getBuffer();
      if (!buffer) {
        return [];
      }
      var args = atom.config.get('gometalinter-linter.args');
      if (!args || args.constructor !== Array || args.indexOf('--json') === -1) {
        args = ['--vendor', '--fast', '--json', './...'];
      }
      if (args.indexOf('--json') === -1) {
        args.unshift('--json');
      }

      var config = this.goconfig();
      var options = this.getLocatorOptions(editor);
      return config.locator.findTool('gometalinter', options).then(function (cmd) {
        if (!cmd) {
          _this2.checkForTool(editor);
          return [];
        }

        var options = _this2.getExecutorOptions(editor);
        return config.executor.exec(cmd, args, options).then(function (r) {
          if (r.stderr && r.stderr.trim() !== '') {
            console.log('gometalinter-linter: (stderr) ' + r.stderr);
          }
          var messages = [];
          if (r.stdout && r.stdout.trim() !== '') {
            messages = _this2.mapMessages(r.stdout, editor, options.cwd);
          }
          if (!messages || messages.length < 1) {
            return [];
          }
          return messages;
        })['catch'](function (e) {
          console.log(e);
          return [];
        });
      });
    }
  }, {
    key: 'checkForTool',
    value: function checkForTool() {
      var _this3 = this;

      var editor = arguments.length <= 0 || arguments[0] === undefined ? atom.workspace.getActiveTextEditor() : arguments[0];

      var config = this.goconfig();
      var options = this.getLocatorOptions(editor);
      return config.locator.findTool('gometalinter', options).then(function (cmd) {
        if (!cmd && !_this3.toolCheckComplete) {
          _this3.toolCheckComplete = true;
          var goget = _this3.goget();
          if (!goget) {
            return;
          }
          goget.get({
            name: 'gometalinter-linter',
            packageName: 'gometalinter',
            packagePath: 'github.com/alecthomas/gometalinter',
            type: 'missing' // TODO check whether missing or outdated
          }).then(function (r) {
            if (!r.success) {
              return false;
            }
            return _this3.updateTools(editor);
          })['catch'](function (e) {
            console.log(e);
          });
        }
      });
    }
  }, {
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
    key: 'updateTools',
    value: function updateTools() {
      var _this4 = this;

      var editor = arguments.length <= 0 || arguments[0] === undefined ? atom.workspace.getActiveTextEditor() : arguments[0];

      if (!this.ready()) {
        return Promise.resolve(false);
      }
      var config = this.goconfig();
      var options = this.getLocatorOptions(editor);
      return config.locator.findTool('gometalinter', options).then(function (cmd) {
        if (!cmd) {
          return false;
        }

        var args = ['--install', '--update'];
        var notification = atom.notifications.addInfo('gometalinter', {
          dismissable: false,
          icon: 'cloud-download',
          description: 'Running `gometalinter --install --update` to install and update tools.'
        });
        var options = _this4.getExecutorOptions(editor);
        return config.executor.exec(cmd, args, options).then(function (r) {
          notification.dismiss();
          var detail = r.stdout + _os2['default'].EOL + r.stderr;

          if (r.exitcode !== 0) {
            atom.notifications.addWarning('gometalinter', {
              dismissable: true,
              icon: 'cloud-download',
              detail: detail.trim()
            });
            return r;
          }
          if (r.stderr && r.stderr.trim() !== '') {
            console.log('gometalinter-linter: (stderr) ' + r.stderr);
          }
          atom.notifications.addSuccess('gometalinter', {
            dismissable: true,
            icon: 'cloud-download',
            detail: detail.trim(),
            description: 'The tools were installed and updated.'
          });
          return r;
        });
      });
    }
  }, {
    key: 'mapMessages',
    value: function mapMessages(data, editor, cwd) {
      var messages = [];
      try {
        messages = JSON.parse(data);
      } catch (e) {
        console.log(e);
      }

      if (!messages || messages.length < 1) {
        return [];
      }
      messages.sort(function (a, b) {
        if (!a && !b) {
          return 0;
        }
        if (!a && b) {
          return -1;
        }
        if (a && !b) {
          return 1;
        }

        if (!a.path && b.path) {
          return -1;
        }
        if (a.path && !b.path) {
          return 1;
        }
        if (a.path === b.path) {
          if (a.line - b.line === 0) {
            return a.row - b.row;
          }
          return a.line - b.line;
        } else {
          return a.path.localeCompare(b.path);
        }
      });

      var results = [];

      for (var message of messages) {
        var range = undefined;
        if (message.col && message.col >= 0) {
          range = [[message.line - 1, message.col - 1], [message.line - 1, 1000]];
        } else {
          range = [[message.line - 1, 0], [message.line - 1, 1000]];
        }
        results.push({ name: message.linter, type: message.severity, row: message.line, column: message.col, text: message.message + ' (' + message.linter + ')', filePath: _path2['default'].join(cwd, message.path), range: range });
      }

      return results;
    }
  }]);

  return GometalinterLinter;
})();

exports.GometalinterLinter = GometalinterLinter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb21ldGFsaW50ZXItbGludGVyL2xpYi9saW50ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFa0MsTUFBTTs7a0JBQ3pCLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztBQUp2QixXQUFXLENBQUE7O0lBTUwsa0JBQWtCO0FBQ1YsV0FEUixrQkFBa0IsQ0FDVCxZQUFZLEVBQUUsU0FBUyxFQUFFOzs7MEJBRGxDLGtCQUFrQjs7QUFFcEIsUUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLElBQUksR0FBRyxjQUFjLENBQUE7QUFDMUIsUUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2xDLFFBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUE7QUFDOUIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsWUFBTTtBQUN2RixZQUFLLFdBQVcsRUFBRSxDQUFBO0tBQ25CLENBQUMsQ0FBQyxDQUFBO0dBQ0o7O2VBZEcsa0JBQWtCOztXQWdCZCxtQkFBRztBQUNULFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQzdCO0FBQ0QsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7QUFDekIsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDakIsVUFBSSxDQUFDLFFBQVEsR0FB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LEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO1NBQ3hFLE1BQU07QUFDTCxlQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtTQUMxRDtBQUNELGVBQU8sQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUUsUUFBUSxFQUFFLGtCQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFBO09BQ2hOOztBQUVELGFBQU8sT0FBTyxDQUFBO0tBQ2Y7OztTQTVPRyxrQkFBa0I7OztRQThPaEIsa0JBQWtCLEdBQWxCLGtCQUFrQiIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvZ29tZXRhbGludGVyLWxpbnRlci9saWIvbGludGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IG9zIGZyb20gJ29zJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuY2xhc3MgR29tZXRhbGludGVyTGludGVyIHtcbiAgY29uc3RydWN0b3IgKGdvY29uZmlnRnVuYywgZ29nZXRGdW5jKSB7XG4gICAgdGhpcy5nb2dldCA9IGdvZ2V0RnVuY1xuICAgIHRoaXMuZ29jb25maWcgPSBnb2NvbmZpZ0Z1bmNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLm5hbWUgPSAnZ29tZXRhbGludGVyJ1xuICAgIHRoaXMuZ3JhbW1hclNjb3BlcyA9IFsnc291cmNlLmdvJ11cbiAgICB0aGlzLnNjb3BlID0gJ3Byb2plY3QnXG4gICAgdGhpcy5saW50T25GbHkgPSBmYWxzZVxuICAgIHRoaXMudG9vbENoZWNrQ29tcGxldGUgPSBmYWxzZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2dvbGFuZzp1cGRhdGVsaW50ZXJzJywgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVUb29scygpXG4gICAgfSkpXG4gIH1cblxuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLmdvZ2V0ID0gbnVsbFxuICAgIHRoaXMuZ29jb25maWcgPSBudWxsXG4gICAgdGhpcy5uYW1lID0gbnVsbFxuICAgIHRoaXMuZ3JhbW1hclNjb3BlcyA9IG51bGxcbiAgICB0aGlzLmxpbnRPbkZseSA9IG51bGxcbiAgICB0aGlzLnRvb2xDaGVja0NvbXBsZXRlID0gbnVsbFxuICB9XG5cbiAgcmVhZHkgKCkge1xuICAgIGlmICghdGhpcy5nb2NvbmZpZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGxldCBjb25maWcgPSB0aGlzLmdvY29uZmlnKClcbiAgICBpZiAoIWNvbmZpZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGxpbnQgKGVkaXRvcikge1xuICAgIGlmICghdGhpcy5yZWFkeSgpIHx8ICFlZGl0b3IpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICBsZXQgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgaWYgKCFidWZmZXIpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICBsZXQgYXJncyA9IGF0b20uY29uZmlnLmdldCgnZ29tZXRhbGludGVyLWxpbnRlci5hcmdzJylcbiAgICBpZiAoIWFyZ3MgfHwgYXJncy5jb25zdHJ1Y3RvciAhPT0gQXJyYXkgfHwgYXJncy5pbmRleE9mKCctLWpzb24nKSA9PT0gLTEpIHtcbiAgICAgIGFyZ3MgPSBbJy0tdmVuZG9yJywgJy0tZmFzdCcsICctLWpzb24nLCAnLi8uLi4nXVxuICAgIH1cbiAgICBpZiAoYXJncy5pbmRleE9mKCctLWpzb24nKSA9PT0gLTEpIHtcbiAgICAgIGFyZ3MudW5zaGlmdCgnLS1qc29uJylcbiAgICB9XG5cbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgbGV0IG9wdGlvbnMgPSB0aGlzLmdldExvY2F0b3JPcHRpb25zKGVkaXRvcilcbiAgICByZXR1cm4gY29uZmlnLmxvY2F0b3IuZmluZFRvb2woJ2dvbWV0YWxpbnRlcicsIG9wdGlvbnMpLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgaWYgKCFjbWQpIHtcbiAgICAgICAgdGhpcy5jaGVja0ZvclRvb2woZWRpdG9yKVxuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cblxuICAgICAgbGV0IG9wdGlvbnMgPSB0aGlzLmdldEV4ZWN1dG9yT3B0aW9ucyhlZGl0b3IpXG4gICAgICByZXR1cm4gY29uZmlnLmV4ZWN1dG9yLmV4ZWMoY21kLCBhcmdzLCBvcHRpb25zKS50aGVuKChyKSA9PiB7XG4gICAgICAgIGlmIChyLnN0ZGVyciAmJiByLnN0ZGVyci50cmltKCkgIT09ICcnKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2dvbWV0YWxpbnRlci1saW50ZXI6IChzdGRlcnIpICcgKyByLnN0ZGVycilcbiAgICAgICAgfVxuICAgICAgICBsZXQgbWVzc2FnZXMgPSBbXVxuICAgICAgICBpZiAoci5zdGRvdXQgJiYgci5zdGRvdXQudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgIG1lc3NhZ2VzID0gdGhpcy5tYXBNZXNzYWdlcyhyLnN0ZG91dCwgZWRpdG9yLCBvcHRpb25zLmN3ZClcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1lc3NhZ2VzIHx8IG1lc3NhZ2VzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZXNcbiAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgY2hlY2tGb3JUb29sIChlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpIHtcbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgbGV0IG9wdGlvbnMgPSB0aGlzLmdldExvY2F0b3JPcHRpb25zKGVkaXRvcilcbiAgICByZXR1cm4gY29uZmlnLmxvY2F0b3IuZmluZFRvb2woJ2dvbWV0YWxpbnRlcicsIG9wdGlvbnMpLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgaWYgKCFjbWQgJiYgIXRoaXMudG9vbENoZWNrQ29tcGxldGUpIHtcbiAgICAgICAgdGhpcy50b29sQ2hlY2tDb21wbGV0ZSA9IHRydWVcbiAgICAgICAgbGV0IGdvZ2V0ID0gdGhpcy5nb2dldCgpXG4gICAgICAgIGlmICghZ29nZXQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBnb2dldC5nZXQoe1xuICAgICAgICAgIG5hbWU6ICdnb21ldGFsaW50ZXItbGludGVyJyxcbiAgICAgICAgICBwYWNrYWdlTmFtZTogJ2dvbWV0YWxpbnRlcicsXG4gICAgICAgICAgcGFja2FnZVBhdGg6ICdnaXRodWIuY29tL2FsZWN0aG9tYXMvZ29tZXRhbGludGVyJyxcbiAgICAgICAgICB0eXBlOiAnbWlzc2luZycgLy8gVE9ETyBjaGVjayB3aGV0aGVyIG1pc3Npbmcgb3Igb3V0ZGF0ZWRcbiAgICAgICAgfSkudGhlbigocikgPT4ge1xuICAgICAgICAgIGlmICghci5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlVG9vbHMoZWRpdG9yKVxuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGdldExvY2F0b3JPcHRpb25zIChlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpIHtcbiAgICBsZXQgb3B0aW9ucyA9IHt9XG4gICAgaWYgKGVkaXRvcikge1xuICAgICAgb3B0aW9ucy5maWxlID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgb3B0aW9ucy5kaXJlY3RvcnkgPSBwYXRoLmRpcm5hbWUoZWRpdG9yLmdldFBhdGgoKSlcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmRpcmVjdG9yeSAmJiBhdG9tLnByb2plY3QucGF0aHMubGVuZ3RoKSB7XG4gICAgICBvcHRpb25zLmRpcmVjdG9yeSA9IGF0b20ucHJvamVjdC5wYXRoc1swXVxuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBnZXRFeGVjdXRvck9wdGlvbnMgKGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSkge1xuICAgIGxldCBvID0gdGhpcy5nZXRMb2NhdG9yT3B0aW9ucyhlZGl0b3IpXG4gICAgbGV0IG9wdGlvbnMgPSB7fVxuICAgIGlmIChvLmRpcmVjdG9yeSkge1xuICAgICAgb3B0aW9ucy5jd2QgPSBvLmRpcmVjdG9yeVxuICAgIH1cbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgb3B0aW9ucy5lbnYgPSBjb25maWcuZW52aXJvbm1lbnQobylcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmVudikge1xuICAgICAgb3B0aW9ucy5lbnYgPSBwcm9jZXNzLmVudlxuICAgIH1cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG5cbiAgdXBkYXRlVG9vbHMgKGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSkge1xuICAgIGlmICghdGhpcy5yZWFkeSgpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgIH1cbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgbGV0IG9wdGlvbnMgPSB0aGlzLmdldExvY2F0b3JPcHRpb25zKGVkaXRvcilcbiAgICByZXR1cm4gY29uZmlnLmxvY2F0b3IuZmluZFRvb2woJ2dvbWV0YWxpbnRlcicsIG9wdGlvbnMpLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgaWYgKCFjbWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGxldCBhcmdzID0gWyctLWluc3RhbGwnLCAnLS11cGRhdGUnXVxuICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdnb21ldGFsaW50ZXInLCB7XG4gICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgaWNvbjogJ2Nsb3VkLWRvd25sb2FkJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSdW5uaW5nIGBnb21ldGFsaW50ZXIgLS1pbnN0YWxsIC0tdXBkYXRlYCB0byBpbnN0YWxsIGFuZCB1cGRhdGUgdG9vbHMuJ1xuICAgICAgfSlcbiAgICAgIGxldCBvcHRpb25zID0gdGhpcy5nZXRFeGVjdXRvck9wdGlvbnMoZWRpdG9yKVxuICAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRvci5leGVjKGNtZCwgYXJncywgb3B0aW9ucykudGhlbigocikgPT4ge1xuICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgIGxldCBkZXRhaWwgPSByLnN0ZG91dCArIG9zLkVPTCArIHIuc3RkZXJyXG5cbiAgICAgICAgaWYgKHIuZXhpdGNvZGUgIT09IDApIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnZ29tZXRhbGludGVyJywge1xuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICBpY29uOiAnY2xvdWQtZG93bmxvYWQnLFxuICAgICAgICAgICAgZGV0YWlsOiBkZXRhaWwudHJpbSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gclxuICAgICAgICB9XG4gICAgICAgIGlmIChyLnN0ZGVyciAmJiByLnN0ZGVyci50cmltKCkgIT09ICcnKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2dvbWV0YWxpbnRlci1saW50ZXI6IChzdGRlcnIpICcgKyByLnN0ZGVycilcbiAgICAgICAgfVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnZ29tZXRhbGludGVyJywge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIGljb246ICdjbG91ZC1kb3dubG9hZCcsXG4gICAgICAgICAgZGV0YWlsOiBkZXRhaWwudHJpbSgpLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRvb2xzIHdlcmUgaW5zdGFsbGVkIGFuZCB1cGRhdGVkLidcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHJcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIG1hcE1lc3NhZ2VzIChkYXRhLCBlZGl0b3IsIGN3ZCkge1xuICAgIGxldCBtZXNzYWdlcyA9IFtdXG4gICAgdHJ5IHtcbiAgICAgIG1lc3NhZ2VzID0gSlNPTi5wYXJzZShkYXRhKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlcyB8fCBtZXNzYWdlcy5sZW5ndGggPCAxKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG4gICAgbWVzc2FnZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYgKCFhICYmICFiKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoIWEgJiYgYikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGlmIChhICYmICFiKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG5cbiAgICAgIGlmICghYS5wYXRoICYmIGIucGF0aCkge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGlmIChhLnBhdGggJiYgIWIucGF0aCkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKGEucGF0aCA9PT0gYi5wYXRoKSB7XG4gICAgICAgIGlmIChhLmxpbmUgLSBiLmxpbmUgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gYS5yb3cgLSBiLnJvd1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhLmxpbmUgLSBiLmxpbmVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGxldCByZXN1bHRzID0gW11cblxuICAgIGZvciAobGV0IG1lc3NhZ2Ugb2YgbWVzc2FnZXMpIHtcbiAgICAgIGxldCByYW5nZVxuICAgICAgaWYgKG1lc3NhZ2UuY29sICYmIG1lc3NhZ2UuY29sID49IDApIHtcbiAgICAgICAgcmFuZ2UgPSBbW21lc3NhZ2UubGluZSAtIDEsIG1lc3NhZ2UuY29sIC0gMV0sIFttZXNzYWdlLmxpbmUgLSAxLCAxMDAwXV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlID0gW1ttZXNzYWdlLmxpbmUgLSAxLCAwXSwgW21lc3NhZ2UubGluZSAtIDEsIDEwMDBdXVxuICAgICAgfVxuICAgICAgcmVzdWx0cy5wdXNoKHtuYW1lOiBtZXNzYWdlLmxpbnRlciwgdHlwZTogbWVzc2FnZS5zZXZlcml0eSwgcm93OiBtZXNzYWdlLmxpbmUsIGNvbHVtbjogbWVzc2FnZS5jb2wsIHRleHQ6IG1lc3NhZ2UubWVzc2FnZSArICcgKCcgKyBtZXNzYWdlLmxpbnRlciArICcpJywgZmlsZVBhdGg6IHBhdGguam9pbihjd2QsIG1lc3NhZ2UucGF0aCksIHJhbmdlOiByYW5nZX0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxufVxuZXhwb3J0IHtHb21ldGFsaW50ZXJMaW50ZXJ9XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/gometalinter-linter/lib/linter.js
