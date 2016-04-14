Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _navigationStack = require('./navigation-stack');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var Godef = (function () {
  function Godef(goconfigFunc, gogetFunc) {
    var _this = this;

    _classCallCheck(this, Godef);

    this.goget = gogetFunc;
    this.goconfig = goconfigFunc;
    this.subscriptions = new _atom.CompositeDisposable();
    this.godefCommand = 'golang:godef';
    this.returnCommand = 'golang:godef-return';
    this.navigationStack = new _navigationStack.NavigationStack();
    atom.commands.add('atom-workspace', 'golang:godef', function () {
      if (_this.ready()) {
        _this.gotoDefinitionForWordAtCursor();
      }
    });
    atom.commands.add('atom-workspace', 'golang:godef-return', function () {
      if (_this.navigationStack) {
        _this.navigationStack.restorePreviousLocation();
      }
    });
    this.cursorOnChangeSubscription = null;
  }

  _createClass(Godef, [{
    key: 'dispose',
    value: function dispose() {
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }
      this.subscriptions = null;
      this.goget = null;
      this.goconfig = null;
      this.toolCheckComplete = null;
    }
  }, {
    key: 'ready',
    value: function ready() {
      if (!this.goconfig || !this.goconfig()) {
        return false;
      }

      return true;
    }
  }, {
    key: 'clearReturnHistory',
    value: function clearReturnHistory() {
      this.navigationStack.reset();
    }
  }, {
    key: 'getEditor',
    value: function getEditor() {
      if (!atom || !atom.workspace) {
        return;
      }
      var editor = atom.workspace.getActiveTextEditor();
      if (!this.isValidEditor(editor)) {
        return;
      }

      return editor;
    }
  }, {
    key: 'isValidEditor',
    value: function isValidEditor(editor) {
      if (!editor || !editor.getGrammar()) {
        return false;
      }

      return editor.getGrammar().scopeName === 'source.go';
    }
  }, {
    key: 'gotoDefinitionForWordAtCursor',
    value: function gotoDefinitionForWordAtCursor() {
      var _this2 = this;

      var editor = this.getEditor();
      if (!editor) {
        return Promise.resolve(false);
      }

      if (editor.hasMultipleCursors()) {
        atom.notifications.addWarning('navigator-godef', {
          dismissable: true,
          icon: 'location',
          detail: 'godef only works with a single cursor'
        });
        return Promise.resolve(false);
      }

      return Promise.resolve().then(function () {
        var editorCursorUTF8Offset = function editorCursorUTF8Offset(e) {
          var characterOffset = e.getBuffer().characterIndexForPosition(e.getCursorBufferPosition());
          var text = e.getText().substring(0, characterOffset);
          return Buffer.byteLength(text, 'utf8');
        };

        var offset = editorCursorUTF8Offset(editor);
        if (_this2.cursorOnChangeSubscription) {
          _this2.cursorOnChangeSubscription.dispose();
          _this2.cursorOnChangeSubscription = null;
        }
        return _this2.gotoDefinitionWithParameters(['-o', offset, '-i'], editor.getText());
      });
    }
  }, {
    key: 'gotoDefinitionForWord',
    value: function gotoDefinitionForWord(word) {
      return this.gotoDefinitionWithParameters([word], undefined);
    }
  }, {
    key: 'gotoDefinitionWithParameters',
    value: function gotoDefinitionWithParameters(cmdArgs) {
      var _this3 = this;

      var cmdInput = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      var editor = this.getEditor();
      var config = this.goconfig();
      return this.checkForTool(editor).then(function (cmd) {
        if (!cmd) {
          return;
        }

        var filepath = editor.getPath();
        var args = ['-f', filepath].concat(cmdArgs);
        var options = _this3.getExecutorOptions(editor);
        if (cmdInput) {
          options.input = cmdInput;
        }
        return config.executor.exec(cmd, args, options).then(function (r) {
          if (r.exitcode !== 0) {
            // TODO: Notification?
            return false;
          }
          if (r.stderr && r.stderr.trim() !== '') {
            console.log('navigator-godef: (stderr) ' + r.stderr);
          }
          return _this3.visitLocation(_this3.parseGodefLocation(r.stdout));
        })['catch'](function (e) {
          console.log(e);
          return false;
        });
      });
    }
  }, {
    key: 'getLocatorOptions',
    value: function getLocatorOptions() {
      var editor = arguments.length <= 0 || arguments[0] === undefined ? this.getEditor() : arguments[0];

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
      var editor = arguments.length <= 0 || arguments[0] === undefined ? this.getEditor() : arguments[0];

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
    key: 'checkForTool',
    value: function checkForTool() {
      var _this4 = this;

      var editor = arguments.length <= 0 || arguments[0] === undefined ? this.getEditor() : arguments[0];

      var config = this.goconfig();
      var options = this.getLocatorOptions(editor);
      return config.locator.findTool('godef', options).then(function (cmd) {
        if (cmd) {
          return cmd;
        }

        if (!cmd && !_this4.toolCheckComplete) {
          _this4.toolCheckComplete = true;
          var goget = _this4.goget();
          if (!goget) {
            return false;
          }
          goget.get({
            name: 'navigator-godef',
            packageName: 'godef',
            packagePath: 'github.com/rogpeppe/godef',
            type: 'missing'
          }).then(function (r) {
            if (!r.success) {
              return false;
            }
            return _this4.updateTools(editor);
          })['catch'](function (e) {
            console.log(e);
          });
        }

        return false;
      });
    }
  }, {
    key: 'parseGodefLocation',
    value: function parseGodefLocation(godefStdout) {
      var outputs = godefStdout.trim().split(':');
      var colNumber = 0;
      var rowNumber = 0;
      if (outputs.length > 1) {
        colNumber = outputs.pop();
        rowNumber = outputs.pop();
      }

      var targetFilePath = outputs.join(':');

      // godef on an import returns the imported package directory with no
      // row and column information: handle this appropriately
      if (targetFilePath.length === 0 && rowNumber) {
        targetFilePath = [rowNumber, colNumber].join(':');
        rowNumber = undefined;
        colNumber = undefined;
      }

      // atom's cursors are 0-based; godef uses diff-like 1-based
      var p = function p(rawPosition) {
        return parseInt(rawPosition, 10) - 1;
      };

      var result = {
        filepath: targetFilePath,
        raw: godefStdout
      };

      if (rowNumber && colNumber) {
        result.pos = new _atom.Point(p(rowNumber), p(colNumber));
      }
      return result;
    }
  }, {
    key: 'visitLocation',
    value: function visitLocation(loc, callback) {
      var _this5 = this;

      if (!loc || !loc.filepath) {
        if (loc) {
          atom.notifications.addWarning('navigator-godef', {
            dismissable: true,
            icon: 'location',
            description: JSON.stringify(loc.raw),
            detail: 'godef returned malformed output'
          });
        } else {
          atom.notifications.addWarning('navigator-godef', {
            dismissable: true,
            icon: 'location',
            detail: 'godef returned malformed output'
          });
        }

        return false;
      }

      return _fs2['default'].stat(loc.filepath, function (err, stats) {
        if (err) {
          if (err.handle) {
            err.handle();
          }
          atom.notifications.addWarning('navigator-godef', {
            dismissable: true,
            icon: 'location',
            detail: 'godef returned invalid file path',
            description: loc.filepath
          });
          return false;
        }

        _this5.navigationStack.pushCurrentLocation();
        if (stats.isDirectory()) {
          return _this5.visitDirectory(loc, callback);
        } else {
          return _this5.visitFile(loc, callback);
        }
      });
    }
  }, {
    key: 'visitFile',
    value: function visitFile(loc, callback) {
      var _this6 = this;

      return atom.workspace.open(loc.filepath).then(function (editor) {
        if (loc.pos) {
          editor.scrollToBufferPosition(loc.pos);
          editor.setCursorBufferPosition(loc.pos);
          _this6.cursorOnChangeSubscription = _this6.highlightWordAtCursor(editor);
        }
      });
    }
  }, {
    key: 'visitDirectory',
    value: function visitDirectory(loc, callback) {
      var _this7 = this;

      return this.findFirstGoFile(loc.filepath).then(function (file) {
        return _this7.visitFile({ filepath: file, raw: loc.raw }, callback);
      })['catch'](function (err) {
        if (err.handle) {
          err.handle();
        }
        atom.notifications.addWarning('navigator-godef', {
          dismissable: true,
          icon: 'location',
          detail: 'godef return invalid directory',
          description: loc.filepath
        });
      });
    }
  }, {
    key: 'findFirstGoFile',
    value: function findFirstGoFile(dir) {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        _fs2['default'].readdir(dir, function (err, files) {
          if (err) {
            reject(err);
          }

          var filepath = _this8.firstGoFilePath(dir, files.sort());
          if (filepath) {
            resolve(filepath);
          } else {
            reject(dir + 'has no non-test .go file');
          }
        });
      });
    }
  }, {
    key: 'firstGoFilePath',
    value: function firstGoFilePath(dir, files) {
      for (var file of files) {
        if (file.endsWith('.go') && file.indexOf('_test') === -1) {
          return _path2['default'].join(dir, file);
        }
      }

      return;
    }
  }, {
    key: 'wordAtCursor',
    value: function wordAtCursor() {
      var editor = arguments.length <= 0 || arguments[0] === undefined ? this.editor : arguments[0];

      var options = {
        wordRegex: /[\w+\.]*/
      };

      var cursor = editor.getLastCursor();
      var range = cursor.getCurrentWordBufferRange(options);
      var word = editor.getTextInBufferRange(range);
      return { word: word, range: range };
    }
  }, {
    key: 'highlightWordAtCursor',
    value: function highlightWordAtCursor() {
      var editor = arguments.length <= 0 || arguments[0] === undefined ? this.editor : arguments[0];

      var _wordAtCursor = this.wordAtCursor(editor);

      var range = _wordAtCursor.range;

      var marker = editor.markBufferRange(range, { invalidate: 'inside' });
      editor.decorateMarker(marker, { type: 'highlight', 'class': 'definition' });
      var cursor = editor.getLastCursor();
      cursor.onDidChangePosition(function () {
        marker.destroy();
      });
    }
  }]);

  return Godef;
})();

exports.Godef = Godef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9uYXZpZ2F0b3ItZ29kZWYvbGliL2dvZGVmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXlDLE1BQU07OytCQUNqQixvQkFBb0I7O29CQUNqQyxNQUFNOzs7O2tCQUNSLElBQUk7Ozs7QUFMbkIsV0FBVyxDQUFBOztJQU9MLEtBQUs7QUFDRyxXQURSLEtBQUssQ0FDSSxZQUFZLEVBQUUsU0FBUyxFQUFFOzs7MEJBRGxDLEtBQUs7O0FBRVAsUUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQTtBQUNsQyxRQUFJLENBQUMsYUFBYSxHQUFHLHFCQUFxQixDQUFBO0FBQzFDLFFBQUksQ0FBQyxlQUFlLEdBQUcsc0NBQXFCLENBQUE7QUFDNUMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFlBQU07QUFDeEQsVUFBSSxNQUFLLEtBQUssRUFBRSxFQUFFO0FBQ2hCLGNBQUssNkJBQTZCLEVBQUUsQ0FBQTtPQUNyQztLQUNGLENBQUMsQ0FBQTtBQUNGLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLHFCQUFxQixFQUFFLFlBQU07QUFDL0QsVUFBSSxNQUFLLGVBQWUsRUFBRTtBQUN4QixjQUFLLGVBQWUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFBO09BQy9DO0tBQ0YsQ0FBQyxDQUFBO0FBQ0YsUUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQTtHQUN2Qzs7ZUFuQkcsS0FBSzs7V0FxQkQsbUJBQUc7QUFDVCxVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUM3QjtBQUNELFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUE7S0FDOUI7OztXQUVLLGlCQUFHO0FBQ1AsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7QUFDdEMsZUFBTyxLQUFLLENBQUE7T0FDYjs7QUFFRCxhQUFPLElBQUksQ0FBQTtLQUNaOzs7V0FFa0IsOEJBQUc7QUFDcEIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtLQUM3Qjs7O1dBRVMscUJBQUc7QUFDWCxVQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUM1QixlQUFNO09BQ1A7QUFDRCxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUE7QUFDakQsVUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDL0IsZUFBTTtPQUNQOztBQUVELGFBQU8sTUFBTSxDQUFBO0tBQ2Q7OztXQUVhLHVCQUFDLE1BQU0sRUFBRTtBQUNyQixVQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ25DLGVBQU8sS0FBSyxDQUFBO09BQ2I7O0FBRUQsYUFBTyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQTtLQUNyRDs7O1dBRTZCLHlDQUFHOzs7QUFDL0IsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQzdCLFVBQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDOUI7O0FBRUQsVUFBSSxNQUFNLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtBQUMvQixZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRTtBQUMvQyxxQkFBVyxFQUFFLElBQUk7QUFDakIsY0FBSSxFQUFFLFVBQVU7QUFDaEIsZ0JBQU0sRUFBRSx1Q0FBdUM7U0FDaEQsQ0FBQyxDQUFBO0FBQ0YsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzlCOztBQUVELGFBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ2xDLFlBQUksc0JBQXNCLEdBQUcsU0FBekIsc0JBQXNCLENBQUksQ0FBQyxFQUFLO0FBQ2xDLGNBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO0FBQzFGLGNBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFBO0FBQ3BELGlCQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1NBQ3ZDLENBQUE7O0FBRUQsWUFBSSxNQUFNLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDM0MsWUFBSSxPQUFLLDBCQUEwQixFQUFFO0FBQ25DLGlCQUFLLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3pDLGlCQUFLLDBCQUEwQixHQUFHLElBQUksQ0FBQTtTQUN2QztBQUNELGVBQU8sT0FBSyw0QkFBNEIsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7T0FDakYsQ0FBQyxDQUFBO0tBQ0g7OztXQUVxQiwrQkFBQyxJQUFJLEVBQUU7QUFDM0IsYUFBTyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUM1RDs7O1dBRTRCLHNDQUFDLE9BQU8sRUFBd0I7OztVQUF0QixRQUFRLHlEQUFHLFNBQVM7O0FBQ3pELFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUM3QixVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDNUIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUM3QyxZQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1IsaUJBQU07U0FDUDs7QUFFRCxZQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDL0IsWUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzNDLFlBQUksT0FBTyxHQUFHLE9BQUssa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDN0MsWUFBSSxRQUFRLEVBQUU7QUFDWixpQkFBTyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUE7U0FDekI7QUFDRCxlQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQzFELGNBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxDQUFDLEVBQUU7O0FBRXBCLG1CQUFPLEtBQUssQ0FBQTtXQUNiO0FBQ0QsY0FBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ3RDLG1CQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtXQUNyRDtBQUNELGlCQUFPLE9BQUssYUFBYSxDQUFDLE9BQUssa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7U0FDN0QsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDZCxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNkLGlCQUFPLEtBQUssQ0FBQTtTQUNiLENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNIOzs7V0FFaUIsNkJBQTRCO1VBQTNCLE1BQU0seURBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRTs7QUFDMUMsVUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2hCLFVBQUksTUFBTSxFQUFFO0FBQ1YsZUFBTyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDL0IsZUFBTyxDQUFDLFNBQVMsR0FBRyxrQkFBSyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7T0FDbkQ7QUFDRCxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDbkQsZUFBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUMxQzs7QUFFRCxhQUFPLE9BQU8sQ0FBQTtLQUNmOzs7V0FFa0IsOEJBQTRCO1VBQTNCLE1BQU0seURBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRTs7QUFDM0MsVUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3RDLFVBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtBQUNoQixVQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDZixlQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUE7T0FDMUI7QUFDRCxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDNUIsVUFBSSxNQUFNLEVBQUU7QUFDVixlQUFPLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDcEM7QUFDRCxVQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNoQixlQUFPLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUE7T0FDMUI7QUFDRCxhQUFPLE9BQU8sQ0FBQTtLQUNmOzs7V0FFWSx3QkFBNEI7OztVQUEzQixNQUFNLHlEQUFHLElBQUksQ0FBQyxTQUFTLEVBQUU7O0FBQ3JDLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUM1QixVQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDNUMsYUFBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQzdELFlBQUksR0FBRyxFQUFFO0FBQ1AsaUJBQU8sR0FBRyxDQUFBO1NBQ1g7O0FBRUQsWUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQUssaUJBQWlCLEVBQUU7QUFDbkMsaUJBQUssaUJBQWlCLEdBQUcsSUFBSSxDQUFBO0FBQzdCLGNBQUksS0FBSyxHQUFHLE9BQUssS0FBSyxFQUFFLENBQUE7QUFDeEIsY0FBSSxDQUFDLEtBQUssRUFBRTtBQUNWLG1CQUFPLEtBQUssQ0FBQTtXQUNiO0FBQ0QsZUFBSyxDQUFDLEdBQUcsQ0FBQztBQUNSLGdCQUFJLEVBQUUsaUJBQWlCO0FBQ3ZCLHVCQUFXLEVBQUUsT0FBTztBQUNwQix1QkFBVyxFQUFFLDJCQUEyQjtBQUN4QyxnQkFBSSxFQUFFLFNBQVM7V0FDaEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNiLGdCQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUNkLHFCQUFPLEtBQUssQ0FBQTthQUNiO0FBQ0QsbUJBQU8sT0FBSyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7V0FDaEMsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDZCxtQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtXQUNmLENBQUMsQ0FBQTtTQUNIOztBQUVELGVBQU8sS0FBSyxDQUFBO09BQ2IsQ0FBQyxDQUFBO0tBQ0g7OztXQUVrQiw0QkFBQyxXQUFXLEVBQUU7QUFDL0IsVUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUMzQyxVQUFJLFNBQVMsR0FBRyxDQUFDLENBQUE7QUFDakIsVUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFBO0FBQ2pCLFVBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDdEIsaUJBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDekIsaUJBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUE7T0FDMUI7O0FBRUQsVUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTs7OztBQUl0QyxVQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFNBQVMsRUFBRTtBQUM1QyxzQkFBYyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNqRCxpQkFBUyxHQUFHLFNBQVMsQ0FBQTtBQUNyQixpQkFBUyxHQUFHLFNBQVMsQ0FBQTtPQUN0Qjs7O0FBR0QsVUFBSSxDQUFDLEdBQUcsU0FBSixDQUFDLENBQUksV0FBVyxFQUFLO0FBQ3ZCLGVBQU8sUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7T0FDckMsQ0FBQTs7QUFFRCxVQUFJLE1BQU0sR0FBRztBQUNYLGdCQUFRLEVBQUUsY0FBYztBQUN4QixXQUFHLEVBQUUsV0FBVztPQUNqQixDQUFBOztBQUVELFVBQUksU0FBUyxJQUFJLFNBQVMsRUFBRTtBQUMxQixjQUFNLENBQUMsR0FBRyxHQUFHLGdCQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtPQUNuRDtBQUNELGFBQU8sTUFBTSxDQUFBO0tBQ2Q7OztXQUVhLHVCQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUU7OztBQUM1QixVQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtBQUN6QixZQUFJLEdBQUcsRUFBRTtBQUNQLGNBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFO0FBQy9DLHVCQUFXLEVBQUUsSUFBSTtBQUNqQixnQkFBSSxFQUFFLFVBQVU7QUFDaEIsdUJBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7QUFDcEMsa0JBQU0sRUFBRSxpQ0FBaUM7V0FDMUMsQ0FBQyxDQUFBO1NBQ0gsTUFBTTtBQUNMLGNBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFO0FBQy9DLHVCQUFXLEVBQUUsSUFBSTtBQUNqQixnQkFBSSxFQUFFLFVBQVU7QUFDaEIsa0JBQU0sRUFBRSxpQ0FBaUM7V0FDMUMsQ0FBQyxDQUFBO1NBQ0g7O0FBRUQsZUFBTyxLQUFLLENBQUE7T0FDYjs7QUFFRCxhQUFPLGdCQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFVBQUMsR0FBRyxFQUFFLEtBQUssRUFBSztBQUMzQyxZQUFJLEdBQUcsRUFBRTtBQUNQLGNBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtBQUNkLGVBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtXQUNiO0FBQ0QsY0FBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUU7QUFDL0MsdUJBQVcsRUFBRSxJQUFJO0FBQ2pCLGdCQUFJLEVBQUUsVUFBVTtBQUNoQixrQkFBTSxFQUFFLGtDQUFrQztBQUMxQyx1QkFBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRO1dBQzFCLENBQUMsQ0FBQTtBQUNGLGlCQUFPLEtBQUssQ0FBQTtTQUNiOztBQUVELGVBQUssZUFBZSxDQUFDLG1CQUFtQixFQUFFLENBQUE7QUFDMUMsWUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDdkIsaUJBQU8sT0FBSyxjQUFjLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1NBQzFDLE1BQU07QUFDTCxpQkFBTyxPQUFLLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUE7U0FDckM7T0FDRixDQUFDLENBQUE7S0FDSDs7O1dBRVMsbUJBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRTs7O0FBQ3hCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUN4RCxZQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFDWCxnQkFBTSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN0QyxnQkFBTSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN2QyxpQkFBSywwQkFBMEIsR0FBRyxPQUFLLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3JFO09BQ0YsQ0FBQyxDQUFBO0tBQ0g7OztXQUVjLHdCQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUU7OztBQUM3QixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUN2RCxlQUFPLE9BQUssU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxFQUFFLFFBQVEsQ0FBQyxDQUFBO09BQ2hFLENBQUMsU0FBTSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ2hCLFlBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtBQUNkLGFBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtTQUNiO0FBQ0QsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUU7QUFDL0MscUJBQVcsRUFBRSxJQUFJO0FBQ2pCLGNBQUksRUFBRSxVQUFVO0FBQ2hCLGdCQUFNLEVBQUUsZ0NBQWdDO0FBQ3hDLHFCQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVE7U0FDMUIsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0g7OztXQUVlLHlCQUFDLEdBQUcsRUFBRTs7O0FBQ3BCLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLHdCQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsVUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFLO0FBQzlCLGNBQUksR0FBRyxFQUFFO0FBQ1Asa0JBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtXQUNaOztBQUVELGNBQUksUUFBUSxHQUFHLE9BQUssZUFBZSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUN0RCxjQUFJLFFBQVEsRUFBRTtBQUNaLG1CQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7V0FDbEIsTUFBTTtBQUNMLGtCQUFNLENBQUMsR0FBRyxHQUFHLDBCQUEwQixDQUFDLENBQUE7V0FDekM7U0FDRixDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7S0FDSDs7O1dBRWUseUJBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUMzQixXQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtBQUN0QixZQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQUFBQyxFQUFFO0FBQzFELGlCQUFPLGtCQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDNUI7T0FDRjs7QUFFRCxhQUFNO0tBQ1A7OztXQUVZLHdCQUF1QjtVQUF0QixNQUFNLHlEQUFHLElBQUksQ0FBQyxNQUFNOztBQUNoQyxVQUFJLE9BQU8sR0FBRztBQUNaLGlCQUFTLEVBQUUsVUFBVTtPQUN0QixDQUFBOztBQUVELFVBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQTtBQUNuQyxVQUFJLEtBQUssR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDckQsVUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzdDLGFBQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQTtLQUNsQzs7O1dBRXFCLGlDQUF1QjtVQUF0QixNQUFNLHlEQUFHLElBQUksQ0FBQyxNQUFNOzswQkFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7O1VBQWxDLEtBQUssaUJBQUwsS0FBSzs7QUFDVixVQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFBO0FBQ2xFLFlBQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFPLFlBQVksRUFBQyxDQUFDLENBQUE7QUFDdkUsVUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFBO0FBQ25DLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFNO0FBQy9CLGNBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUNqQixDQUFDLENBQUE7S0FDSDs7O1NBcFZHLEtBQUs7OztRQXVWSCxLQUFLLEdBQUwsS0FBSyIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvbmF2aWdhdG9yLWdvZGVmL2xpYi9nb2RlZi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgUG9pbnR9IGZyb20gJ2F0b20nXG5pbXBvcnQge05hdmlnYXRpb25TdGFja30gZnJvbSAnLi9uYXZpZ2F0aW9uLXN0YWNrJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcblxuY2xhc3MgR29kZWYge1xuICBjb25zdHJ1Y3RvciAoZ29jb25maWdGdW5jLCBnb2dldEZ1bmMpIHtcbiAgICB0aGlzLmdvZ2V0ID0gZ29nZXRGdW5jXG4gICAgdGhpcy5nb2NvbmZpZyA9IGdvY29uZmlnRnVuY1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmdvZGVmQ29tbWFuZCA9ICdnb2xhbmc6Z29kZWYnXG4gICAgdGhpcy5yZXR1cm5Db21tYW5kID0gJ2dvbGFuZzpnb2RlZi1yZXR1cm4nXG4gICAgdGhpcy5uYXZpZ2F0aW9uU3RhY2sgPSBuZXcgTmF2aWdhdGlvblN0YWNrKClcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnZ29sYW5nOmdvZGVmJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMucmVhZHkoKSkge1xuICAgICAgICB0aGlzLmdvdG9EZWZpbml0aW9uRm9yV29yZEF0Q3Vyc29yKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdnb2xhbmc6Z29kZWYtcmV0dXJuJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMubmF2aWdhdGlvblN0YWNrKSB7XG4gICAgICAgIHRoaXMubmF2aWdhdGlvblN0YWNrLnJlc3RvcmVQcmV2aW91c0xvY2F0aW9uKClcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuY3Vyc29yT25DaGFuZ2VTdWJzY3JpcHRpb24gPSBudWxsXG4gIH1cblxuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLmdvZ2V0ID0gbnVsbFxuICAgIHRoaXMuZ29jb25maWcgPSBudWxsXG4gICAgdGhpcy50b29sQ2hlY2tDb21wbGV0ZSA9IG51bGxcbiAgfVxuXG4gIHJlYWR5ICgpIHtcbiAgICBpZiAoIXRoaXMuZ29jb25maWcgfHwgIXRoaXMuZ29jb25maWcoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGNsZWFyUmV0dXJuSGlzdG9yeSAoKSB7XG4gICAgdGhpcy5uYXZpZ2F0aW9uU3RhY2sucmVzZXQoKVxuICB9XG5cbiAgZ2V0RWRpdG9yICgpIHtcbiAgICBpZiAoIWF0b20gfHwgIWF0b20ud29ya3NwYWNlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmICghdGhpcy5pc1ZhbGlkRWRpdG9yKGVkaXRvcikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJldHVybiBlZGl0b3JcbiAgfVxuXG4gIGlzVmFsaWRFZGl0b3IgKGVkaXRvcikge1xuICAgIGlmICghZWRpdG9yIHx8ICFlZGl0b3IuZ2V0R3JhbW1hcigpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUgPT09ICdzb3VyY2UuZ28nXG4gIH1cblxuICBnb3RvRGVmaW5pdGlvbkZvcldvcmRBdEN1cnNvciAoKSB7XG4gICAgbGV0IGVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yKClcbiAgICBpZiAoIWVkaXRvcikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSlcbiAgICB9XG5cbiAgICBpZiAoZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnbmF2aWdhdG9yLWdvZGVmJywge1xuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgaWNvbjogJ2xvY2F0aW9uJyxcbiAgICAgICAgZGV0YWlsOiAnZ29kZWYgb25seSB3b3JrcyB3aXRoIGEgc2luZ2xlIGN1cnNvcidcbiAgICAgIH0pXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIGxldCBlZGl0b3JDdXJzb3JVVEY4T2Zmc2V0ID0gKGUpID0+IHtcbiAgICAgICAgbGV0IGNoYXJhY3Rlck9mZnNldCA9IGUuZ2V0QnVmZmVyKCkuY2hhcmFjdGVySW5kZXhGb3JQb3NpdGlvbihlLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgIGxldCB0ZXh0ID0gZS5nZXRUZXh0KCkuc3Vic3RyaW5nKDAsIGNoYXJhY3Rlck9mZnNldClcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5ieXRlTGVuZ3RoKHRleHQsICd1dGY4JylcbiAgICAgIH1cblxuICAgICAgbGV0IG9mZnNldCA9IGVkaXRvckN1cnNvclVURjhPZmZzZXQoZWRpdG9yKVxuICAgICAgaWYgKHRoaXMuY3Vyc29yT25DaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy5jdXJzb3JPbkNoYW5nZVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgdGhpcy5jdXJzb3JPbkNoYW5nZVN1YnNjcmlwdGlvbiA9IG51bGxcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmdvdG9EZWZpbml0aW9uV2l0aFBhcmFtZXRlcnMoWyctbycsIG9mZnNldCwgJy1pJ10sIGVkaXRvci5nZXRUZXh0KCkpXG4gICAgfSlcbiAgfVxuXG4gIGdvdG9EZWZpbml0aW9uRm9yV29yZCAod29yZCkge1xuICAgIHJldHVybiB0aGlzLmdvdG9EZWZpbml0aW9uV2l0aFBhcmFtZXRlcnMoW3dvcmRdLCB1bmRlZmluZWQpXG4gIH1cblxuICBnb3RvRGVmaW5pdGlvbldpdGhQYXJhbWV0ZXJzIChjbWRBcmdzLCBjbWRJbnB1dCA9IHVuZGVmaW5lZCkge1xuICAgIGxldCBlZGl0b3IgPSB0aGlzLmdldEVkaXRvcigpXG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ29jb25maWcoKVxuICAgIHJldHVybiB0aGlzLmNoZWNrRm9yVG9vbChlZGl0b3IpLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgaWYgKCFjbWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGxldCBmaWxlcGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIGxldCBhcmdzID0gWyctZicsIGZpbGVwYXRoXS5jb25jYXQoY21kQXJncylcbiAgICAgIGxldCBvcHRpb25zID0gdGhpcy5nZXRFeGVjdXRvck9wdGlvbnMoZWRpdG9yKVxuICAgICAgaWYgKGNtZElucHV0KSB7XG4gICAgICAgIG9wdGlvbnMuaW5wdXQgPSBjbWRJbnB1dFxuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRvci5leGVjKGNtZCwgYXJncywgb3B0aW9ucykudGhlbigocikgPT4ge1xuICAgICAgICBpZiAoci5leGl0Y29kZSAhPT0gMCkge1xuICAgICAgICAgIC8vIFRPRE86IE5vdGlmaWNhdGlvbj9cbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICBpZiAoci5zdGRlcnIgJiYgci5zdGRlcnIudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCduYXZpZ2F0b3ItZ29kZWY6IChzdGRlcnIpICcgKyByLnN0ZGVycilcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdExvY2F0aW9uKHRoaXMucGFyc2VHb2RlZkxvY2F0aW9uKHIuc3Rkb3V0KSlcbiAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0TG9jYXRvck9wdGlvbnMgKGVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yKCkpIHtcbiAgICBsZXQgb3B0aW9ucyA9IHt9XG4gICAgaWYgKGVkaXRvcikge1xuICAgICAgb3B0aW9ucy5maWxlID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgb3B0aW9ucy5kaXJlY3RvcnkgPSBwYXRoLmRpcm5hbWUoZWRpdG9yLmdldFBhdGgoKSlcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmRpcmVjdG9yeSAmJiBhdG9tLnByb2plY3QucGF0aHMubGVuZ3RoKSB7XG4gICAgICBvcHRpb25zLmRpcmVjdG9yeSA9IGF0b20ucHJvamVjdC5wYXRoc1swXVxuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBnZXRFeGVjdXRvck9wdGlvbnMgKGVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yKCkpIHtcbiAgICBsZXQgbyA9IHRoaXMuZ2V0TG9jYXRvck9wdGlvbnMoZWRpdG9yKVxuICAgIGxldCBvcHRpb25zID0ge31cbiAgICBpZiAoby5kaXJlY3RvcnkpIHtcbiAgICAgIG9wdGlvbnMuY3dkID0gby5kaXJlY3RvcnlcbiAgICB9XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ29jb25maWcoKVxuICAgIGlmIChjb25maWcpIHtcbiAgICAgIG9wdGlvbnMuZW52ID0gY29uZmlnLmVudmlyb25tZW50KG8pXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5lbnYpIHtcbiAgICAgIG9wdGlvbnMuZW52ID0gcHJvY2Vzcy5lbnZcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIGNoZWNrRm9yVG9vbCAoZWRpdG9yID0gdGhpcy5nZXRFZGl0b3IoKSkge1xuICAgIGxldCBjb25maWcgPSB0aGlzLmdvY29uZmlnKClcbiAgICBsZXQgb3B0aW9ucyA9IHRoaXMuZ2V0TG9jYXRvck9wdGlvbnMoZWRpdG9yKVxuICAgIHJldHVybiBjb25maWcubG9jYXRvci5maW5kVG9vbCgnZ29kZWYnLCBvcHRpb25zKS50aGVuKChjbWQpID0+IHtcbiAgICAgIGlmIChjbWQpIHtcbiAgICAgICAgcmV0dXJuIGNtZFxuICAgICAgfVxuXG4gICAgICBpZiAoIWNtZCAmJiAhdGhpcy50b29sQ2hlY2tDb21wbGV0ZSkge1xuICAgICAgICB0aGlzLnRvb2xDaGVja0NvbXBsZXRlID0gdHJ1ZVxuICAgICAgICBsZXQgZ29nZXQgPSB0aGlzLmdvZ2V0KClcbiAgICAgICAgaWYgKCFnb2dldCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIGdvZ2V0LmdldCh7XG4gICAgICAgICAgbmFtZTogJ25hdmlnYXRvci1nb2RlZicsXG4gICAgICAgICAgcGFja2FnZU5hbWU6ICdnb2RlZicsXG4gICAgICAgICAgcGFja2FnZVBhdGg6ICdnaXRodWIuY29tL3JvZ3BlcHBlL2dvZGVmJyxcbiAgICAgICAgICB0eXBlOiAnbWlzc2luZydcbiAgICAgICAgfSkudGhlbigocikgPT4ge1xuICAgICAgICAgIGlmICghci5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlVG9vbHMoZWRpdG9yKVxuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0pXG4gIH1cblxuICBwYXJzZUdvZGVmTG9jYXRpb24gKGdvZGVmU3Rkb3V0KSB7XG4gICAgbGV0IG91dHB1dHMgPSBnb2RlZlN0ZG91dC50cmltKCkuc3BsaXQoJzonKVxuICAgIGxldCBjb2xOdW1iZXIgPSAwXG4gICAgbGV0IHJvd051bWJlciA9IDBcbiAgICBpZiAob3V0cHV0cy5sZW5ndGggPiAxKSB7XG4gICAgICBjb2xOdW1iZXIgPSBvdXRwdXRzLnBvcCgpXG4gICAgICByb3dOdW1iZXIgPSBvdXRwdXRzLnBvcCgpXG4gICAgfVxuXG4gICAgbGV0IHRhcmdldEZpbGVQYXRoID0gb3V0cHV0cy5qb2luKCc6JylcblxuICAgIC8vIGdvZGVmIG9uIGFuIGltcG9ydCByZXR1cm5zIHRoZSBpbXBvcnRlZCBwYWNrYWdlIGRpcmVjdG9yeSB3aXRoIG5vXG4gICAgLy8gcm93IGFuZCBjb2x1bW4gaW5mb3JtYXRpb246IGhhbmRsZSB0aGlzIGFwcHJvcHJpYXRlbHlcbiAgICBpZiAodGFyZ2V0RmlsZVBhdGgubGVuZ3RoID09PSAwICYmIHJvd051bWJlcikge1xuICAgICAgdGFyZ2V0RmlsZVBhdGggPSBbcm93TnVtYmVyLCBjb2xOdW1iZXJdLmpvaW4oJzonKVxuICAgICAgcm93TnVtYmVyID0gdW5kZWZpbmVkXG4gICAgICBjb2xOdW1iZXIgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICAvLyBhdG9tJ3MgY3Vyc29ycyBhcmUgMC1iYXNlZDsgZ29kZWYgdXNlcyBkaWZmLWxpa2UgMS1iYXNlZFxuICAgIGxldCBwID0gKHJhd1Bvc2l0aW9uKSA9PiB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocmF3UG9zaXRpb24sIDEwKSAtIDFcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgZmlsZXBhdGg6IHRhcmdldEZpbGVQYXRoLFxuICAgICAgcmF3OiBnb2RlZlN0ZG91dFxuICAgIH1cblxuICAgIGlmIChyb3dOdW1iZXIgJiYgY29sTnVtYmVyKSB7XG4gICAgICByZXN1bHQucG9zID0gbmV3IFBvaW50KHAocm93TnVtYmVyKSwgcChjb2xOdW1iZXIpKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICB2aXNpdExvY2F0aW9uIChsb2MsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFsb2MgfHwgIWxvYy5maWxlcGF0aCkge1xuICAgICAgaWYgKGxvYykge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnbmF2aWdhdG9yLWdvZGVmJywge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIGljb246ICdsb2NhdGlvbicsXG4gICAgICAgICAgZGVzY3JpcHRpb246IEpTT04uc3RyaW5naWZ5KGxvYy5yYXcpLFxuICAgICAgICAgIGRldGFpbDogJ2dvZGVmIHJldHVybmVkIG1hbGZvcm1lZCBvdXRwdXQnXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnbmF2aWdhdG9yLWdvZGVmJywge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIGljb246ICdsb2NhdGlvbicsXG4gICAgICAgICAgZGV0YWlsOiAnZ29kZWYgcmV0dXJuZWQgbWFsZm9ybWVkIG91dHB1dCdcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZzLnN0YXQobG9jLmZpbGVwYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBpZiAoZXJyLmhhbmRsZSkge1xuICAgICAgICAgIGVyci5oYW5kbGUoKVxuICAgICAgICB9XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCduYXZpZ2F0b3ItZ29kZWYnLCB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgaWNvbjogJ2xvY2F0aW9uJyxcbiAgICAgICAgICBkZXRhaWw6ICdnb2RlZiByZXR1cm5lZCBpbnZhbGlkIGZpbGUgcGF0aCcsXG4gICAgICAgICAgZGVzY3JpcHRpb246IGxvYy5maWxlcGF0aFxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgdGhpcy5uYXZpZ2F0aW9uU3RhY2sucHVzaEN1cnJlbnRMb2NhdGlvbigpXG4gICAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICByZXR1cm4gdGhpcy52aXNpdERpcmVjdG9yeShsb2MsIGNhbGxiYWNrKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRGaWxlKGxvYywgY2FsbGJhY2spXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHZpc2l0RmlsZSAobG9jLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGxvYy5maWxlcGF0aCkudGhlbigoZWRpdG9yKSA9PiB7XG4gICAgICBpZiAobG9jLnBvcykge1xuICAgICAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihsb2MucG9zKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obG9jLnBvcylcbiAgICAgICAgdGhpcy5jdXJzb3JPbkNoYW5nZVN1YnNjcmlwdGlvbiA9IHRoaXMuaGlnaGxpZ2h0V29yZEF0Q3Vyc29yKGVkaXRvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgdmlzaXREaXJlY3RvcnkgKGxvYywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5maW5kRmlyc3RHb0ZpbGUobG9jLmZpbGVwYXRoKS50aGVuKChmaWxlKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEZpbGUoe2ZpbGVwYXRoOiBmaWxlLCByYXc6IGxvYy5yYXd9LCBjYWxsYmFjaylcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyLmhhbmRsZSkge1xuICAgICAgICBlcnIuaGFuZGxlKClcbiAgICAgIH1cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCduYXZpZ2F0b3ItZ29kZWYnLCB7XG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICBpY29uOiAnbG9jYXRpb24nLFxuICAgICAgICBkZXRhaWw6ICdnb2RlZiByZXR1cm4gaW52YWxpZCBkaXJlY3RvcnknLFxuICAgICAgICBkZXNjcmlwdGlvbjogbG9jLmZpbGVwYXRoXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBmaW5kRmlyc3RHb0ZpbGUgKGRpcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmcy5yZWFkZGlyKGRpciwgKGVyciwgZmlsZXMpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZmlsZXBhdGggPSB0aGlzLmZpcnN0R29GaWxlUGF0aChkaXIsIGZpbGVzLnNvcnQoKSlcbiAgICAgICAgaWYgKGZpbGVwYXRoKSB7XG4gICAgICAgICAgcmVzb2x2ZShmaWxlcGF0aClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QoZGlyICsgJ2hhcyBubyBub24tdGVzdCAuZ28gZmlsZScpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGZpcnN0R29GaWxlUGF0aCAoZGlyLCBmaWxlcykge1xuICAgIGZvciAobGV0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuZ28nKSAmJiAoZmlsZS5pbmRleE9mKCdfdGVzdCcpID09PSAtMSkpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihkaXIsIGZpbGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuXG4gIH1cblxuICB3b3JkQXRDdXJzb3IgKGVkaXRvciA9IHRoaXMuZWRpdG9yKSB7XG4gICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICB3b3JkUmVnZXg6IC9bXFx3K1xcLl0qL1xuICAgIH1cblxuICAgIGxldCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgbGV0IHJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2Uob3B0aW9ucylcbiAgICBsZXQgd29yZCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICByZXR1cm4ge3dvcmQ6IHdvcmQsIHJhbmdlOiByYW5nZX1cbiAgfVxuXG4gIGhpZ2hsaWdodFdvcmRBdEN1cnNvciAoZWRpdG9yID0gdGhpcy5lZGl0b3IpIHtcbiAgICBsZXQge3JhbmdlfSA9IHRoaXMud29yZEF0Q3Vyc29yKGVkaXRvcilcbiAgICBsZXQgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwge2ludmFsaWRhdGU6ICdpbnNpZGUnfSlcbiAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAnZGVmaW5pdGlvbid9KVxuICAgIGxldCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY3Vyc29yLm9uRGlkQ2hhbmdlUG9zaXRpb24oKCkgPT4ge1xuICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IHtHb2RlZn1cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/navigator-godef/lib/godef.js
