Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _renameDialog = require('./rename-dialog');

'use babel';

var Gorename = (function () {
  function Gorename(goconfigFunc, gogetFunc) {
    var _this = this;

    _classCallCheck(this, Gorename);

    this.goconfig = goconfigFunc;
    this.goget = gogetFunc;
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor', 'golang:gorename', function () {
      _this.commandInvoked();
    }));
  }

  _createClass(Gorename, [{
    key: 'commandInvoked',
    value: function commandInvoked() {
      var _this2 = this;

      var editor = atom.workspace.getActiveTextEditor();
      if (!this.isValidEditor(editor)) {
        return;
      }
      this.checkForTool(editor).then(function (cmd) {
        if (!cmd) {
          // TODO: Show a notification?
          return;
        }

        var info = _this2.wordAndOffset(editor);
        var cursor = editor.getCursorBufferPosition();

        var dialog = new _renameDialog.RenameDialog(info.word, function (newName) {
          _this2.saveAllEditors();
          var file = editor.getBuffer().getPath();
          var cwd = _path2['default'].dirname(file);

          // restore cursor position after gorename completes and the buffer is reloaded
          if (cursor) {
            (function () {
              var disp = editor.getBuffer().onDidReload(function () {
                editor.setCursorBufferPosition(cursor, { autoscroll: false });
                var element = atom.views.getView(editor);
                if (element) {
                  element.focus();
                }
                disp.dispose();
              });
            })();
          }
          _this2.runGorename(file, info.offset, cwd, newName, cmd);
        });
        dialog.onCancelled(function () {
          editor.setCursorBufferPosition(cursor, { autoscroll: false });
          var element = atom.views.getView(editor);
          if (element) {
            element.focus();
          }
        });
        dialog.attach();
        return;
      })['catch'](function (e) {
        if (e.handle) {
          e.handle();
        }
        console.log(e);
      });
    }
  }, {
    key: 'saveAllEditors',
    value: function saveAllEditors() {
      for (var editor of atom.workspace.getTextEditors()) {
        if (editor.isModified() && this.isValidEditor(editor)) {
          editor.save();
        }
      }
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
    key: 'wordAndOffset',
    value: function wordAndOffset(editor) {
      var cursor = editor.getLastCursor();
      var range = cursor.getCurrentWordBufferRange();
      var middle = new _atom.Point(range.start.row, Math.floor((range.start.column + range.end.column) / 2));
      var charOffset = editor.buffer.characterIndexForPosition(middle);
      var text = editor.getText().substring(0, charOffset);
      return { word: editor.getTextInBufferRange(range), offset: Buffer.byteLength(text, 'utf8') };
    }
  }, {
    key: 'runGorename',
    value: function runGorename(file, offset, cwd, newName, cmd) {
      var config = this.goconfig();
      if (!config || !config.executor) {
        return { success: false, result: null };
      }

      var args = ['-offset', file + ':#' + offset, '-to', newName];
      return config.executor.exec(cmd, args, { cwd: cwd, env: config.environment() }).then(function (r) {
        if (r.error) {
          if (r.error.code === 'ENOENT') {
            atom.notifications.addError('Missing Rename Tool', {
              detail: 'The gorename tool is required to perform a rename. Please run go get -u golang.org/x/tools/cmd/gorename to get it.',
              dismissable: true
            });
          } else {
            atom.notifications.addError('Rename Error', {
              detail: r.error.message,
              dismissable: true
            });
          }
          return { success: false, result: r };
        }

        var message = r.stderr.trim() + '\r\n' + r.stdout.trim();
        if (r.exitcode !== 0 || r.stderr && r.stderr.trim() !== '') {
          atom.notifications.addWarning('Rename Error', {
            detail: message.trim(),
            dismissable: true
          });
          return { success: false, result: r };
        }

        atom.notifications.addSuccess(message.trim());
        return { success: true, result: r };
      });
    }
  }, {
    key: 'checkForTool',
    value: function checkForTool(editor) {
      var _this3 = this;

      if (!this.goconfig || !this.goconfig()) {
        return Promise.resolve(false);
      }

      var config = this.goconfig();
      var options = {};
      if (editor && editor.getPath()) {
        options.file = editor.getPath();
        options.directory = _path2['default'].dirname(options.file);
      }

      if (!options.directory && atom.project.getPaths().length > 0) {
        options.directory = atom.project.getPaths()[0];
      }

      return config.locator.findTool('gorename', options).then(function (cmd) {
        if (cmd) {
          return cmd;
        }

        if (!_this3.goget || !_this3.goget()) {
          return false;
        }

        var get = _this3.goget();
        if (_this3.toolCheckComplete) {
          return false;
        }

        _this3.toolCheckComplete = true;
        return get.get({
          name: 'gorename',
          packageName: 'gorename',
          packagePath: 'golang.org/x/tools/cmd/gorename',
          type: 'missing'
        }).then(function (r) {
          if (r.success) {
            return config.locator.findTool('gorename', options);
          }

          console.log('gorename is not available and could not be installed via "go get -u golang.org/x/tools/cmd/gorename"; please manually install it to enable gorename behavior.');
          return false;
        })['catch'](function (e) {
          console.log(e);
          return false;
        });
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.goconfig = null;
    }
  }]);

  return Gorename;
})();

exports.Gorename = Gorename;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb3JlbmFtZS9saWIvZ29yZW5hbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7OztvQkFDa0IsTUFBTTs7NEJBQ3BCLGlCQUFpQjs7QUFKNUMsV0FBVyxDQUFBOztJQU1MLFFBQVE7QUFDQSxXQURSLFFBQVEsQ0FDQyxZQUFZLEVBQUUsU0FBUyxFQUFFOzs7MEJBRGxDLFFBQVE7O0FBRVYsUUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUE7QUFDNUIsUUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7QUFDdEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxZQUFNO0FBQ3BGLFlBQUssY0FBYyxFQUFFLENBQUE7S0FDdEIsQ0FBQyxDQUFDLENBQUE7R0FDSjs7ZUFSRyxRQUFROztXQVVHLDBCQUFHOzs7QUFDaEIsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0FBQ2pELFVBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQy9CLGVBQU07T0FDUDtBQUNELFVBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ3RDLFlBQUksQ0FBQyxHQUFHLEVBQUU7O0FBRVIsaUJBQU07U0FDUDs7QUFFRCxZQUFJLElBQUksR0FBRyxPQUFLLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNyQyxZQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQTs7QUFFN0MsWUFBSSxNQUFNLEdBQUcsK0JBQWlCLElBQUksQ0FBQyxJQUFJLEVBQUUs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UUFBUSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQTtXQUNwRDs7QUFFRCxpQkFBTyxDQUFDLEdBQUcsQ0FBQywrSkFBK0osQ0FBQyxDQUFBO0FBQzVLLGlCQUFPLEtBQUssQ0FBQTtTQUNiLENBQUMsU0FBTSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2QsaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZCxpQkFBTyxLQUFLLENBQUE7U0FDYixDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7S0FDSDs7O1dBRU8sbUJBQUc7QUFDVCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0tBQ3JCOzs7U0FoTEcsUUFBUTs7O1FBbUxOLFFBQVEsR0FBUixRQUFRIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb3JlbmFtZS9saWIvZ29yZW5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBQb2ludH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7UmVuYW1lRGlhbG9nfSBmcm9tICcuL3JlbmFtZS1kaWFsb2cnXG5cbmNsYXNzIEdvcmVuYW1lIHtcbiAgY29uc3RydWN0b3IgKGdvY29uZmlnRnVuYywgZ29nZXRGdW5jKSB7XG4gICAgdGhpcy5nb2NvbmZpZyA9IGdvY29uZmlnRnVuY1xuICAgIHRoaXMuZ29nZXQgPSBnb2dldEZ1bmNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdnb2xhbmc6Z29yZW5hbWUnLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvbW1hbmRJbnZva2VkKClcbiAgICB9KSlcbiAgfVxuXG4gIGNvbW1hbmRJbnZva2VkICgpIHtcbiAgICBsZXQgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgKCF0aGlzLmlzVmFsaWRFZGl0b3IoZWRpdG9yKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuY2hlY2tGb3JUb29sKGVkaXRvcikudGhlbigoY21kKSA9PiB7XG4gICAgICBpZiAoIWNtZCkge1xuICAgICAgICAvLyBUT0RPOiBTaG93IGEgbm90aWZpY2F0aW9uP1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IGluZm8gPSB0aGlzLndvcmRBbmRPZmZzZXQoZWRpdG9yKVxuICAgICAgbGV0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIGxldCBkaWFsb2cgPSBuZXcgUmVuYW1lRGlhbG9nKGluZm8ud29yZCwgKG5ld05hbWUpID0+IHtcbiAgICAgICAgdGhpcy5zYXZlQWxsRWRpdG9ycygpXG4gICAgICAgIGxldCBmaWxlID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldFBhdGgoKVxuICAgICAgICBsZXQgY3dkID0gcGF0aC5kaXJuYW1lKGZpbGUpXG5cbiAgICAgICAgLy8gcmVzdG9yZSBjdXJzb3IgcG9zaXRpb24gYWZ0ZXIgZ29yZW5hbWUgY29tcGxldGVzIGFuZCB0aGUgYnVmZmVyIGlzIHJlbG9hZGVkXG4gICAgICAgIGlmIChjdXJzb3IpIHtcbiAgICAgICAgICBsZXQgZGlzcCA9IGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFJlbG9hZCgoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oY3Vyc29yLCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNwLmRpc3Bvc2UoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5Hb3JlbmFtZShmaWxlLCBpbmZvLm9mZnNldCwgY3dkLCBuZXdOYW1lLCBjbWQpXG4gICAgICB9KVxuICAgICAgZGlhbG9nLm9uQ2FuY2VsbGVkKCgpID0+IHtcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGN1cnNvciwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgZGlhbG9nLmF0dGFjaCgpXG4gICAgICByZXR1cm5cbiAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgaWYgKGUuaGFuZGxlKSB7XG4gICAgICAgIGUuaGFuZGxlKClcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgfSlcbiAgfVxuXG4gIHNhdmVBbGxFZGl0b3JzICgpIHtcbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkge1xuICAgICAgaWYgKGVkaXRvci5pc01vZGlmaWVkKCkgJiYgdGhpcy5pc1ZhbGlkRWRpdG9yKGVkaXRvcikpIHtcbiAgICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzVmFsaWRFZGl0b3IgKGVkaXRvcikge1xuICAgIGlmICghZWRpdG9yIHx8ICFlZGl0b3IuZ2V0R3JhbW1hcigpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gKGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lID09PSAnc291cmNlLmdvJylcbiAgfVxuXG4gIHdvcmRBbmRPZmZzZXQgKGVkaXRvcikge1xuICAgIGxldCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgbGV0IHJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgIGxldCBtaWRkbGUgPSBuZXcgUG9pbnQocmFuZ2Uuc3RhcnQucm93LFxuICAgICAgTWF0aC5mbG9vcigocmFuZ2Uuc3RhcnQuY29sdW1uICsgcmFuZ2UuZW5kLmNvbHVtbikgLyAyKSlcbiAgICBsZXQgY2hhck9mZnNldCA9IGVkaXRvci5idWZmZXIuY2hhcmFjdGVySW5kZXhGb3JQb3NpdGlvbihtaWRkbGUpXG4gICAgbGV0IHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpLnN1YnN0cmluZygwLCBjaGFyT2Zmc2V0KVxuICAgIHJldHVybiB7d29yZDogZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSwgb2Zmc2V0OiBCdWZmZXIuYnl0ZUxlbmd0aCh0ZXh0LCAndXRmOCcpfVxuICB9XG5cbiAgcnVuR29yZW5hbWUgKGZpbGUsIG9mZnNldCwgY3dkLCBuZXdOYW1lLCBjbWQpIHtcbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgaWYgKCFjb25maWcgfHwgIWNvbmZpZy5leGVjdXRvcikge1xuICAgICAgcmV0dXJuIHtzdWNjZXNzOiBmYWxzZSwgcmVzdWx0OiBudWxsfVxuICAgIH1cblxuICAgIGxldCBhcmdzID0gWyctb2Zmc2V0JywgYCR7ZmlsZX06IyR7b2Zmc2V0fWAsICctdG8nLCBuZXdOYW1lXVxuICAgIHJldHVybiBjb25maWcuZXhlY3V0b3IuZXhlYyhjbWQsIGFyZ3MsIHtjd2Q6IGN3ZCwgZW52OiBjb25maWcuZW52aXJvbm1lbnQoKX0pLnRoZW4oKHIpID0+IHtcbiAgICAgIGlmIChyLmVycm9yKSB7XG4gICAgICAgIGlmIChyLmVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdNaXNzaW5nIFJlbmFtZSBUb29sJywge1xuICAgICAgICAgICAgZGV0YWlsOiAnVGhlIGdvcmVuYW1lIHRvb2wgaXMgcmVxdWlyZWQgdG8gcGVyZm9ybSBhIHJlbmFtZS4gUGxlYXNlIHJ1biBnbyBnZXQgLXUgZ29sYW5nLm9yZy94L3Rvb2xzL2NtZC9nb3JlbmFtZSB0byBnZXQgaXQuJyxcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1JlbmFtZSBFcnJvcicsIHtcbiAgICAgICAgICAgIGRldGFpbDogci5lcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7c3VjY2VzczogZmFsc2UsIHJlc3VsdDogcn1cbiAgICAgIH1cblxuICAgICAgbGV0IG1lc3NhZ2UgPSByLnN0ZGVyci50cmltKCkgKyAnXFxyXFxuJyArIHIuc3Rkb3V0LnRyaW0oKVxuICAgICAgaWYgKHIuZXhpdGNvZGUgIT09IDAgfHwgci5zdGRlcnIgJiYgci5zdGRlcnIudHJpbSgpICE9PSAnJykge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnUmVuYW1lIEVycm9yJywge1xuICAgICAgICAgIGRldGFpbDogbWVzc2FnZS50cmltKCksXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHtzdWNjZXNzOiBmYWxzZSwgcmVzdWx0OiByfVxuICAgICAgfVxuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhtZXNzYWdlLnRyaW0oKSlcbiAgICAgIHJldHVybiB7c3VjY2VzczogdHJ1ZSwgcmVzdWx0OiByfVxuICAgIH0pXG4gIH1cblxuICBjaGVja0ZvclRvb2wgKGVkaXRvcikge1xuICAgIGlmICghdGhpcy5nb2NvbmZpZyB8fCAhdGhpcy5nb2NvbmZpZygpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgIH1cblxuICAgIGxldCBjb25maWcgPSB0aGlzLmdvY29uZmlnKClcbiAgICBsZXQgb3B0aW9ucyA9IHt9XG4gICAgaWYgKGVkaXRvciAmJiBlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICBvcHRpb25zLmZpbGUgPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBvcHRpb25zLmRpcmVjdG9yeSA9IHBhdGguZGlybmFtZShvcHRpb25zLmZpbGUpXG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zLmRpcmVjdG9yeSAmJiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5sZW5ndGggPiAwKSB7XG4gICAgICBvcHRpb25zLmRpcmVjdG9yeSA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZy5sb2NhdG9yLmZpbmRUb29sKCdnb3JlbmFtZScsIG9wdGlvbnMpLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgaWYgKGNtZCkge1xuICAgICAgICByZXR1cm4gY21kXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5nb2dldCB8fCAhdGhpcy5nb2dldCgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBsZXQgZ2V0ID0gdGhpcy5nb2dldCgpXG4gICAgICBpZiAodGhpcy50b29sQ2hlY2tDb21wbGV0ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgdGhpcy50b29sQ2hlY2tDb21wbGV0ZSA9IHRydWVcbiAgICAgIHJldHVybiBnZXQuZ2V0KHtcbiAgICAgICAgbmFtZTogJ2dvcmVuYW1lJyxcbiAgICAgICAgcGFja2FnZU5hbWU6ICdnb3JlbmFtZScsXG4gICAgICAgIHBhY2thZ2VQYXRoOiAnZ29sYW5nLm9yZy94L3Rvb2xzL2NtZC9nb3JlbmFtZScsXG4gICAgICAgIHR5cGU6ICdtaXNzaW5nJ1xuICAgICAgfSkudGhlbigocikgPT4ge1xuICAgICAgICBpZiAoci5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5sb2NhdG9yLmZpbmRUb29sKCdnb3JlbmFtZScsIG9wdGlvbnMpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygnZ29yZW5hbWUgaXMgbm90IGF2YWlsYWJsZSBhbmQgY291bGQgbm90IGJlIGluc3RhbGxlZCB2aWEgXCJnbyBnZXQgLXUgZ29sYW5nLm9yZy94L3Rvb2xzL2NtZC9nb3JlbmFtZVwiOyBwbGVhc2UgbWFudWFsbHkgaW5zdGFsbCBpdCB0byBlbmFibGUgZ29yZW5hbWUgYmVoYXZpb3IuJylcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGRpc3Bvc2UgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nb2NvbmZpZyA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQge0dvcmVuYW1lfVxuIl19
//# sourceURL=/Users/james/.atom/packages/gorename/lib/gorename.js
