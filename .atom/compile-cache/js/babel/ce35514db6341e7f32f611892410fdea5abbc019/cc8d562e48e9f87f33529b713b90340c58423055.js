Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

'use babel';

var Builder = (function () {
  function Builder(goconfigFunc) {
    _classCallCheck(this, Builder);

    this.goconfig = goconfigFunc;
    this.subscriptions = new _atom.CompositeDisposable();

    this.name = 'go build';
    this.grammarScopes = ['source.go'];
    this.scope = 'project';
    this.lintOnFly = false;
    _temp2['default'].track();
  }

  _createClass(Builder, [{
    key: 'dispose',
    value: function dispose() {
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }
      this.subscriptions = null;
      this.goconfig = null;
      this.name = null;
      this.grammarScopes = null;
      this.lintOnFly = null;
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
      var _this = this;

      if (!this.ready() || !editor) {
        return [];
      }
      var p = editor.getPath();
      if (!p) {
        return [];
      }
      return Promise.resolve().then(function () {
        var cwd = _path2['default'].dirname(p);
        var hasTests = false;
        if (editor.getPath().endsWith('_test.go')) {
          hasTests = true;
        } else {
          var files = _fs2['default'].readdirSync(cwd);
          for (var file of files) {
            if (file.endsWith('_test.go')) {
              hasTests = true;
            }
          }
        }

        var config = _this.goconfig();
        var options = _this.getLocatorOptions(editor);
        return config.locator.findTool('go', options).then(function (cmd) {
          if (!cmd) {
            return [];
          }

          var options = _this.getExecutorOptions(editor);
          var buildArgs = ['install', '.'];
          var buildPromise = config.executor.exec(cmd, buildArgs, options).then(function (r) {
            if (r.stdout && r.stdout.trim() !== '') {
              console.log('builder-go: (stdout) ' + r.stdout);
            }
            var messages = [];
            if (r.stderr && r.stderr.trim() !== '') {
              messages = _this.mapMessages(r.stderr, options.cwd, 'build');
            }
            if (!messages || messages.length < 1) {
              return [];
            }
            return messages;
          })['catch'](function (e) {
            console.log(e);
            return [];
          });

          if (!hasTests) {
            return buildPromise;
          }

          var tempdir = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
          var testArgs = ['test', '-c', '-o', tempdir, '.'];
          var testPromise = config.executor.exec(cmd, testArgs, options).then(function (r) {
            if (r.stdout && r.stdout.trim() !== '') {
              console.log('builder-go: (stdout) ' + r.stdout);
            }
            var messages = [];
            if (r.stderr && r.stderr.trim() !== '') {
              messages = _this.mapMessages(r.stderr, options.cwd, 'test');
            }
            if (!messages || messages.length < 1) {
              return [];
            }

            (0, _rimraf2['default'])(tempdir, function (e) {
              if (e) {
                if (e.handle) {
                  e.handle();
                }
                console.log(e);
              }
            });
            return messages;
          })['catch'](function (e) {
            console.log(e);
            return [];
          });

          return Promise.all([buildPromise, testPromise]).then(function (results) {
            var messages = [];
            for (var result of results) {
              if (result && result.length) {
                messages = messages.concat(result);
              }
            }
            return messages;
          });
        });
      })['catch'](function (error) {
        if (error.handle) {
          error.handle();
        }
        console.log(error);
        return [];
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
    key: 'mapMessages',
    value: function mapMessages(data, cwd, linterName) {
      var pattern = /^((#)\s(.*)?)|((.*?):(\d*?):((\d*?):)?\s((.*)?((\n\t.*)+)?))/img;
      var messages = [];
      var extract = function extract(matchLine) {
        if (!matchLine) {
          return;
        }
        if (matchLine[2] && matchLine[2] === '#') {
          // Found A Package Indicator, Skip For Now
        } else {
            var file = undefined;
            if (matchLine[5] && matchLine[5] !== '') {
              if (_path2['default'].isAbsolute(matchLine[5])) {
                file = matchLine[5];
              } else {
                file = _path2['default'].join(cwd, matchLine[5]);
              }
            }
            var row = matchLine[6];
            var column = matchLine[8];
            var text = matchLine[9];
            var range = undefined;
            if (column && column >= 0) {
              range = [[row - 1, column - 1], [row - 1, 1000]];
            } else {
              range = [[row - 1, 0], [row - 1, 1000]];
            }
            messages.push({ name: linterName, type: 'error', row: row, column: column, text: text + ' (' + linterName + ')', filePath: file, range: range });
          }
      };
      var match = undefined;
      while ((match = pattern.exec(data)) !== null) {
        extract(match);
      }
      return messages;
    }
  }]);

  return Builder;
})();

exports.Builder = Builder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9idWlsZGVyLWdvL2xpYi9idWlsZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRWtDLE1BQU07O2tCQUN6QixJQUFJOzs7O29CQUNGLE1BQU07Ozs7c0JBQ0osUUFBUTs7OztvQkFDVixNQUFNOzs7O0FBTnZCLFdBQVcsQ0FBQTs7SUFRTCxPQUFPO0FBQ0MsV0FEUixPQUFPLENBQ0UsWUFBWSxFQUFFOzBCQUR2QixPQUFPOztBQUVULFFBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNsQyxRQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQTtBQUN0QixRQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUN0QixzQkFBSyxLQUFLLEVBQUUsQ0FBQTtHQUNiOztlQVZHLE9BQU87O1dBWUgsbUJBQUc7QUFDVCxVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUM3QjtBQUNELFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFVBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0tBQ3RCOzs7V0FFSyxpQkFBRztBQUNQLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2xCLGVBQU8sS0FBSyxDQUFBO09BQ2I7QUFDRCxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLGVBQU8sS0FBSyxDQUFBO09BQ2I7O0FBRUQsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1dBRUksY0FBQyxNQUFNLEVBQUU7OztBQUNaLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDNUIsZUFBTyxFQUFFLENBQUE7T0FDVjtBQUNELFVBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN4QixVQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ04sZUFBTyxFQUFFLENBQUE7T0FDVjtBQUNELGFBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ2xDLFlBQUksR0FBRyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6QixZQUFJLFFBQVEsR0FBRyxLQUFLLENBQUE7QUFDcEIsWUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3pDLGtCQUFRLEdBQUcsSUFBSSxDQUFBO1NBQ2hCLE1BQU07QUFDTCxjQUFJLEtBQUssR0FBRyxnQkFBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDL0IsZUFBSyxJQUFJLElBQUksSUFBSSxLQUFLLEVBQUU7QUFDdEIsZ0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUM3QixzQkFBUSxHQUFHLElBQUksQ0FBQTthQUNoQjtXQUNGO1NBQ0Y7O0FBRUQsWUFBSSxNQUFNLEdBQUcsTUFBSyxRQUFRLEVBQUUsQ0FBQTtBQUM1QixZQUFJLE9BQU8sR0FBRyxNQUFLLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzVDLGVBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUMxRCxjQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1IsbUJBQU8sRUFBRSxDQUFBO1dBQ1Y7O0FBRUQsY0FBSSxPQUFPLEdBQUcsTUFBSyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM3QyxjQUFJLFNBQVMsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNoQyxjQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBSztBQUMzRSxnQkFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ3RDLHFCQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTthQUNoRDtBQUNELGdCQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDakIsZ0JBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0QyxzQkFBUSxHQUFHLE1BQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTthQUM1RDtBQUNELGdCQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3BDLHFCQUFPLEVBQUUsQ0FBQTthQUNWO0FBQ0QsbUJBQU8sUUFBUSxDQUFBO1dBQ2hCLENBQUMsU0FBTSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2QsbUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZCxtQkFBTyxFQUFFLENBQUE7V0FDVixDQUFDLENBQUE7O0FBRUYsY0FBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLG1CQUFPLFlBQVksQ0FBQTtXQUNwQjs7QUFFRCxjQUFJLE9BQU8sR0FBRyxnQkFBRyxZQUFZLENBQUMsa0JBQUssU0FBUyxFQUFFLENBQUMsQ0FBQTtBQUMvQyxjQUFJLFFBQVEsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNqRCxjQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBSztBQUN6RSxnQkFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ3RDLHFCQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTthQUNoRDtBQUNELGdCQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDakIsZ0JBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0QyxzQkFBUSxHQUFHLE1BQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQTthQUMzRDtBQUNELGdCQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3BDLHFCQUFPLEVBQUUsQ0FBQTthQUNWOztBQUVELHFDQUFPLE9BQU8sRUFBRSxVQUFDLENBQUMsRUFBSztBQUNyQixrQkFBSSxDQUFDLEVBQUU7QUFDTCxvQkFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ1osbUJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtpQkFDWDtBQUNELHVCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO2VBQ2Y7YUFDRixDQUFDLENBQUE7QUFDRixtQkFBTyxRQUFRLENBQUE7V0FDaEIsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDZCxtQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNkLG1CQUFPLEVBQUUsQ0FBQTtXQUNWLENBQUMsQ0FBQTs7QUFFRixpQkFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQ2hFLGdCQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDakIsaUJBQUssSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFO0FBQzFCLGtCQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQzNCLHdCQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtlQUNuQzthQUNGO0FBQ0QsbUJBQU8sUUFBUSxDQUFBO1dBQ2hCLENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTtPQUNILENBQUMsU0FBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ2xCLFlBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUNoQixlQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7U0FDZjtBQUNELGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDbEIsZUFBTyxFQUFFLENBQUE7T0FDVixDQUFDLENBQUE7S0FDSDs7O1dBRWlCLDZCQUFnRDtVQUEvQyxNQUFNLHlEQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUU7O0FBQzlELFVBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtBQUNoQixVQUFJLE1BQU0sRUFBRTtBQUNWLGVBQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQy9CLGVBQU8sQ0FBQyxTQUFTLEdBQUcsa0JBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO09BQ25EO0FBQ0QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ25ELGVBQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDMUM7O0FBRUQsYUFBTyxPQUFPLENBQUE7S0FDZjs7O1dBRWtCLDhCQUFnRDtVQUEvQyxNQUFNLHlEQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUU7O0FBQy9ELFVBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN0QyxVQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDaEIsVUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ2YsZUFBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFBO09BQzFCO0FBQ0QsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQzVCLFVBQUksTUFBTSxFQUFFO0FBQ1YsZUFBTyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQ3BDO0FBQ0QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7QUFDaEIsZUFBTyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFBO09BQzFCO0FBQ0QsYUFBTyxPQUFPLENBQUE7S0FDZjs7O1dBRVcscUJBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUU7QUFDbEMsVUFBSSxPQUFPLEdBQUcsaUVBQWlFLENBQUE7QUFDL0UsVUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ2pCLFVBQUksT0FBTyxHQUFHLFNBQVYsT0FBTyxDQUFJLFNBQVMsRUFBSztBQUMzQixZQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2QsaUJBQU07U0FDUDtBQUNELFlBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7O1NBRXpDLE1BQU07QUFDTCxnQkFBSSxJQUFJLFlBQUEsQ0FBQTtBQUNSLGdCQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO0FBQ3ZDLGtCQUFJLGtCQUFLLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNqQyxvQkFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtlQUNwQixNQUFNO0FBQ0wsb0JBQUksR0FBRyxrQkFBSyxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2VBQ3BDO2FBQ0Y7QUFDRCxnQkFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3RCLGdCQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekIsZ0JBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN2QixnQkFBSSxLQUFLLFlBQUEsQ0FBQTtBQUNULGdCQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ3pCLG1CQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2FBQ2pELE1BQU07QUFDTCxtQkFBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2FBQ3hDO0FBQ0Qsb0JBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLFVBQVUsR0FBRyxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQTtXQUMvSTtPQUNGLENBQUE7QUFDRCxVQUFJLEtBQUssWUFBQSxDQUFBO0FBQ1QsYUFBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBLEtBQU0sSUFBSSxFQUFFO0FBQzVDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUNmO0FBQ0QsYUFBTyxRQUFRLENBQUE7S0FDaEI7OztTQXRNRyxPQUFPOzs7UUF3TUwsT0FBTyxHQUFQLE9BQU8iLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2J1aWxkZXItZ28vbGliL2J1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnXG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJ1xuXG5jbGFzcyBCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IgKGdvY29uZmlnRnVuYykge1xuICAgIHRoaXMuZ29jb25maWcgPSBnb2NvbmZpZ0Z1bmNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLm5hbWUgPSAnZ28gYnVpbGQnXG4gICAgdGhpcy5ncmFtbWFyU2NvcGVzID0gWydzb3VyY2UuZ28nXVxuICAgIHRoaXMuc2NvcGUgPSAncHJvamVjdCdcbiAgICB0aGlzLmxpbnRPbkZseSA9IGZhbHNlXG4gICAgdGVtcC50cmFjaygpXG4gIH1cblxuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLmdvY29uZmlnID0gbnVsbFxuICAgIHRoaXMubmFtZSA9IG51bGxcbiAgICB0aGlzLmdyYW1tYXJTY29wZXMgPSBudWxsXG4gICAgdGhpcy5saW50T25GbHkgPSBudWxsXG4gIH1cblxuICByZWFkeSAoKSB7XG4gICAgaWYgKCF0aGlzLmdvY29uZmlnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ29jb25maWcoKVxuICAgIGlmICghY29uZmlnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgbGludCAoZWRpdG9yKSB7XG4gICAgaWYgKCF0aGlzLnJlYWR5KCkgfHwgIWVkaXRvcikge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICAgIGxldCBwID0gZWRpdG9yLmdldFBhdGgoKVxuICAgIGlmICghcCkge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIGxldCBjd2QgPSBwYXRoLmRpcm5hbWUocClcbiAgICAgIGxldCBoYXNUZXN0cyA9IGZhbHNlXG4gICAgICBpZiAoZWRpdG9yLmdldFBhdGgoKS5lbmRzV2l0aCgnX3Rlc3QuZ28nKSkge1xuICAgICAgICBoYXNUZXN0cyA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGN3ZClcbiAgICAgICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCdfdGVzdC5nbycpKSB7XG4gICAgICAgICAgICBoYXNUZXN0cyA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGNvbmZpZyA9IHRoaXMuZ29jb25maWcoKVxuICAgICAgbGV0IG9wdGlvbnMgPSB0aGlzLmdldExvY2F0b3JPcHRpb25zKGVkaXRvcilcbiAgICAgIHJldHVybiBjb25maWcubG9jYXRvci5maW5kVG9vbCgnZ28nLCBvcHRpb25zKS50aGVuKChjbWQpID0+IHtcbiAgICAgICAgaWYgKCFjbWQpIHtcbiAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5nZXRFeGVjdXRvck9wdGlvbnMoZWRpdG9yKVxuICAgICAgICBsZXQgYnVpbGRBcmdzID0gWydpbnN0YWxsJywgJy4nXVxuICAgICAgICBsZXQgYnVpbGRQcm9taXNlID0gY29uZmlnLmV4ZWN1dG9yLmV4ZWMoY21kLCBidWlsZEFyZ3MsIG9wdGlvbnMpLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICBpZiAoci5zdGRvdXQgJiYgci5zdGRvdXQudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2J1aWxkZXItZ286IChzdGRvdXQpICcgKyByLnN0ZG91dClcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IG1lc3NhZ2VzID0gW11cbiAgICAgICAgICBpZiAoci5zdGRlcnIgJiYgci5zdGRlcnIudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgICAgbWVzc2FnZXMgPSB0aGlzLm1hcE1lc3NhZ2VzKHIuc3RkZXJyLCBvcHRpb25zLmN3ZCwgJ2J1aWxkJylcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFtZXNzYWdlcyB8fCBtZXNzYWdlcy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzXG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoIWhhc1Rlc3RzKSB7XG4gICAgICAgICAgcmV0dXJuIGJ1aWxkUHJvbWlzZVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRlbXBkaXIgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoKSlcbiAgICAgICAgbGV0IHRlc3RBcmdzID0gWyd0ZXN0JywgJy1jJywgJy1vJywgdGVtcGRpciwgJy4nXVxuICAgICAgICBsZXQgdGVzdFByb21pc2UgPSBjb25maWcuZXhlY3V0b3IuZXhlYyhjbWQsIHRlc3RBcmdzLCBvcHRpb25zKS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgaWYgKHIuc3Rkb3V0ICYmIHIuc3Rkb3V0LnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdidWlsZGVyLWdvOiAoc3Rkb3V0KSAnICsgci5zdGRvdXQpXG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBtZXNzYWdlcyA9IFtdXG4gICAgICAgICAgaWYgKHIuc3RkZXJyICYmIHIuc3RkZXJyLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzID0gdGhpcy5tYXBNZXNzYWdlcyhyLnN0ZGVyciwgb3B0aW9ucy5jd2QsICd0ZXN0JylcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFtZXNzYWdlcyB8fCBtZXNzYWdlcy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByaW1yYWYodGVtcGRpciwgKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICAgIGlmIChlLmhhbmRsZSkge1xuICAgICAgICAgICAgICAgIGUuaGFuZGxlKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzXG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW2J1aWxkUHJvbWlzZSwgdGVzdFByb21pc2VdKS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgbGV0IG1lc3NhZ2VzID0gW11cbiAgICAgICAgICBmb3IgKGxldCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2VzID0gbWVzc2FnZXMuY29uY2F0KHJlc3VsdClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgaWYgKGVycm9yLmhhbmRsZSkge1xuICAgICAgICBlcnJvci5oYW5kbGUoKVxuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICByZXR1cm4gW11cbiAgICB9KVxuICB9XG5cbiAgZ2V0TG9jYXRvck9wdGlvbnMgKGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSkge1xuICAgIGxldCBvcHRpb25zID0ge31cbiAgICBpZiAoZWRpdG9yKSB7XG4gICAgICBvcHRpb25zLmZpbGUgPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBvcHRpb25zLmRpcmVjdG9yeSA9IHBhdGguZGlybmFtZShlZGl0b3IuZ2V0UGF0aCgpKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuZGlyZWN0b3J5ICYmIGF0b20ucHJvamVjdC5wYXRocy5sZW5ndGgpIHtcbiAgICAgIG9wdGlvbnMuZGlyZWN0b3J5ID0gYXRvbS5wcm9qZWN0LnBhdGhzWzBdXG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIGdldEV4ZWN1dG9yT3B0aW9ucyAoZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKSB7XG4gICAgbGV0IG8gPSB0aGlzLmdldExvY2F0b3JPcHRpb25zKGVkaXRvcilcbiAgICBsZXQgb3B0aW9ucyA9IHt9XG4gICAgaWYgKG8uZGlyZWN0b3J5KSB7XG4gICAgICBvcHRpb25zLmN3ZCA9IG8uZGlyZWN0b3J5XG4gICAgfVxuICAgIGxldCBjb25maWcgPSB0aGlzLmdvY29uZmlnKClcbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICBvcHRpb25zLmVudiA9IGNvbmZpZy5lbnZpcm9ubWVudChvKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuZW52KSB7XG4gICAgICBvcHRpb25zLmVudiA9IHByb2Nlc3MuZW52XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBtYXBNZXNzYWdlcyAoZGF0YSwgY3dkLCBsaW50ZXJOYW1lKSB7XG4gICAgbGV0IHBhdHRlcm4gPSAvXigoIylcXHMoLiopPyl8KCguKj8pOihcXGQqPyk6KChcXGQqPyk6KT9cXHMoKC4qKT8oKFxcblxcdC4qKSspPykpL2ltZ1xuICAgIGxldCBtZXNzYWdlcyA9IFtdXG4gICAgbGV0IGV4dHJhY3QgPSAobWF0Y2hMaW5lKSA9PiB7XG4gICAgICBpZiAoIW1hdGNoTGluZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChtYXRjaExpbmVbMl0gJiYgbWF0Y2hMaW5lWzJdID09PSAnIycpIHtcbiAgICAgICAgLy8gRm91bmQgQSBQYWNrYWdlIEluZGljYXRvciwgU2tpcCBGb3IgTm93XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZmlsZVxuICAgICAgICBpZiAobWF0Y2hMaW5lWzVdICYmIG1hdGNoTGluZVs1XSAhPT0gJycpIHtcbiAgICAgICAgICBpZiAocGF0aC5pc0Fic29sdXRlKG1hdGNoTGluZVs1XSkpIHtcbiAgICAgICAgICAgIGZpbGUgPSBtYXRjaExpbmVbNV1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsZSA9IHBhdGguam9pbihjd2QsIG1hdGNoTGluZVs1XSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJvdyA9IG1hdGNoTGluZVs2XVxuICAgICAgICBsZXQgY29sdW1uID0gbWF0Y2hMaW5lWzhdXG4gICAgICAgIGxldCB0ZXh0ID0gbWF0Y2hMaW5lWzldXG4gICAgICAgIGxldCByYW5nZVxuICAgICAgICBpZiAoY29sdW1uICYmIGNvbHVtbiA+PSAwKSB7XG4gICAgICAgICAgcmFuZ2UgPSBbW3JvdyAtIDEsIGNvbHVtbiAtIDFdLCBbcm93IC0gMSwgMTAwMF1dXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2UgPSBbW3JvdyAtIDEsIDBdLCBbcm93IC0gMSwgMTAwMF1dXG4gICAgICAgIH1cbiAgICAgICAgbWVzc2FnZXMucHVzaCh7bmFtZTogbGludGVyTmFtZSwgdHlwZTogJ2Vycm9yJywgcm93OiByb3csIGNvbHVtbjogY29sdW1uLCB0ZXh0OiB0ZXh0ICsgJyAoJyArIGxpbnRlck5hbWUgKyAnKScsIGZpbGVQYXRoOiBmaWxlLCByYW5nZTogcmFuZ2V9KVxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgbWF0Y2hcbiAgICB3aGlsZSAoKG1hdGNoID0gcGF0dGVybi5leGVjKGRhdGEpKSAhPT0gbnVsbCkge1xuICAgICAgZXh0cmFjdChtYXRjaClcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2VzXG4gIH1cbn1cbmV4cG9ydCB7QnVpbGRlcn1cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/builder-go/lib/builder.js
