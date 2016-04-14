Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _gocoverParser = require('./gocover-parser');

var _gocoverParser2 = _interopRequireDefault(_gocoverParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

'use babel';

var Tester = (function () {
  function Tester(goconfigFunc, gogetFunc) {
    _classCallCheck(this, Tester);

    this.goget = gogetFunc;
    this.goconfig = goconfigFunc;
    this.subscriptions = new _atom.CompositeDisposable();
    this.saveSubscriptions = new _atom.CompositeDisposable();
    this.observeConfig();
    this.observeTextEditors();
    this.handleCommands();
    this.subscribeToSaveEvents();
    this.running = false;
    _temp2['default'].track();
  }

  _createClass(Tester, [{
    key: 'dispose',
    value: function dispose() {
      this.running = true;
      this.removeTempDir();
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }
      this.subscriptions = null;
      if (this.saveSubscriptions) {
        this.saveSubscriptions.dispose();
      }
      this.saveSubscriptions = null;
      this.goget = null;
      this.goconfig = null;
      this.running = null;
    }
  }, {
    key: 'handleCommands',
    value: function handleCommands() {
      var _this = this;

      this.subscriptions.add(atom.commands.add('atom-workspace', 'golang:gocover', function () {
        if (!_this.ready() || !_this.getEditor()) {
          return;
        }
        _this.runCoverage();
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'golang:cleargocover', function () {
        if (!_this.ready() || !_this.getEditor()) {
          return;
        }
        _this.clearMarkersFromEditors();
      }));
    }
  }, {
    key: 'observeTextEditors',
    value: function observeTextEditors() {
      var _this2 = this;

      this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
        _this2.addMarkersToEditor(editor);
      }));
    }
  }, {
    key: 'observeConfig',
    value: function observeConfig() {
      var _this3 = this;

      this.subscriptions.add(atom.config.observe('tester-go.runCoverageOnSave', function (runCoverageOnSave) {
        if (_this3.saveSubscriptions) {
          _this3.saveSubscriptions.dispose();
        }
        _this3.saveSubscriptions = new _atom.CompositeDisposable();
        if (runCoverageOnSave) {
          _this3.subscribeToSaveEvents();
        }
      }));
    }
  }, {
    key: 'subscribeToSaveEvents',
    value: function subscribeToSaveEvents() {
      var _this4 = this;

      this.saveSubscriptions.add(atom.workspace.observeTextEditors(function (editor) {
        if (!editor || !editor.getBuffer()) {
          return;
        }

        var bufferSubscriptions = new _atom.CompositeDisposable();
        bufferSubscriptions.add(editor.getBuffer().onDidSave(function (filePath) {
          if (atom.config.get('tester-go.runCoverageOnSave')) {
            _this4.runCoverage(editor);
            return;
          }
        }));
        bufferSubscriptions.add(editor.getBuffer().onDidDestroy(function () {
          bufferSubscriptions.dispose();
        }));
        _this4.saveSubscriptions.add(bufferSubscriptions);
      }));
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
    key: 'addMarkersToEditors',
    value: function addMarkersToEditors() {
      var editors = atom.workspace.getTextEditors();
      for (var editor of editors) {
        this.addMarkersToEditor(editor);
      }
    }
  }, {
    key: 'clearMarkersFromEditors',
    value: function clearMarkersFromEditors() {
      var editors = atom.workspace.getTextEditors();
      for (var editor of editors) {
        this.clearMarkers(editor);
      }
    }
  }, {
    key: 'addMarkersToEditor',
    value: function addMarkersToEditor(editor) {
      if (!this.isValidEditor(editor)) {
        return;
      }
      var file = editor.getPath();
      var buffer = editor.getBuffer();
      if (!file || !buffer) {
        return;
      }
      this.clearMarkers(editor);
      if (!this.ranges || this.ranges.length <= 0) {
        return;
      }

      var editorRanges = _lodash2['default'].filter(this.ranges, function (r) {
        return _lodash2['default'].endsWith(file, r.file);
      });

      if (!editorRanges || editorRanges.length <= 0) {
        return;
      }

      try {
        for (var range of editorRanges) {
          var marker = buffer.markRange(range.range, { 'class': 'gocover', gocovercount: range.count, invalidate: 'touch' });
          var c = 'uncovered';
          if (range.count > 0) {
            c = 'covered';
          }
          editor.decorateMarker(marker, { type: 'highlight', 'class': c, onlyNonEmpty: true });
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'clearMarkers',
    value: function clearMarkers(editor) {
      if (!editor || !editor.getBuffer()) {
        return;
      }

      try {
        var markers = editor.getBuffer().findMarkers({ 'class': 'gocover' });
        if (!markers || markers.length <= 0) {
          return;
        }
        for (var marker of markers) {
          marker.destroy();
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'removeTempDir',
    value: function removeTempDir() {
      if (this.tempDir) {
        (0, _rimraf2['default'])(this.tempDir, function (e) {
          if (e) {
            if (e.handle) {
              e.handle();
            }
            console.log(e);
          }
        });
        this.tempDir = null;
      }
    }
  }, {
    key: 'createCoverageFile',
    value: function createCoverageFile() {
      this.removeTempDir();
      if (!this.tempDir) {
        this.tempDir = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
      }
      this.coverageFile = _path2['default'].join(this.tempDir, 'coverage.out');
    }
  }, {
    key: 'projectPath',
    value: function projectPath(editor) {
      if (editor && editor.getPath()) {
        return editor.getPath();
      }

      if (atom.project.getPaths().length) {
        return atom.project.getPaths()[0];
      }

      return false;
    }
  }, {
    key: 'getLocatorOptions',
    value: function getLocatorOptions() {
      var editor = arguments.length <= 0 || arguments[0] === undefined ? this.getEditor() : arguments[0];

      var options = {};
      var p = this.projectPath(editor);
      if (p) {
        options.directory = p;
      }

      return options;
    }
  }, {
    key: 'getExecutorOptions',
    value: function getExecutorOptions() {
      var editor = arguments.length <= 0 || arguments[0] === undefined ? this.getEditor() : arguments[0];

      var o = this.getLocatorOptions(editor);
      var options = {};
      options.cwd = _path2['default'].dirname(editor.getPath());
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
    key: 'ready',
    value: function ready() {
      return this.goconfig && this.goconfig();
    }
  }, {
    key: 'runCoverage',
    value: function runCoverage() {
      var _this5 = this;

      var editor = arguments.length <= 0 || arguments[0] === undefined ? this.getEditor() : arguments[0];

      if (!this.isValidEditor(editor)) {
        return Promise.resolve();
      }
      var buffer = editor.getBuffer();
      if (!buffer) {
        return Promise.resolve();
      }
      if (this.running) {
        return Promise.resolve();
      }

      return Promise.resolve().then(function () {
        _this5.running = true;
        _this5.clearMarkersFromEditors();
        _this5.createCoverageFile();
        var config = _this5.goconfig();
        var go = false;
        var cover = false;
        var locatorOptions = _this5.getLocatorOptions(editor);
        return config.locator.findTool('go', locatorOptions).then(function (cmd) {
          if (!cmd) {
            return false;
          }
          go = cmd;
          return config.locator.findTool('cover', locatorOptions);
        }).then(function (cmd) {
          if (!cmd) {
            return false;
          }
          cover = cmd;
        }).then(function () {
          if (!go || !cover) {
            _this5.running = false;
            return;
          }

          var cmd = go;
          var args = ['test', '-coverprofile=' + _this5.coverageFile];
          if (atom.config.get('tester-go.runCoverageWithShortFlag')) {
            args.push('-short');
          }
          var executorOptions = _this5.getExecutorOptions(editor);
          return config.executor.exec(cmd, args, executorOptions).then(function (r) {
            if (r.stderr && r.stderr.trim() !== '') {
              console.log('tester-go: (stderr) ' + r.stderr);
            }

            if (r.exitcode === 0) {
              _this5.ranges = _gocoverParser2['default'].ranges(_this5.coverageFile);
              _this5.addMarkersToEditors();
            }

            _this5.running = false;
          });
        })['catch'](function (e) {
          if (e.handle) {
            e.handle();
          }
          console.log(e);
          _this5.running = false;
          return Promise.resolve();
        });
      });
    }
  }]);

  return Tester;
})();

exports.Tester = Tester;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy90ZXN0ZXItZ28vbGliL3Rlc3Rlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVrQyxNQUFNOztzQkFDMUIsUUFBUTs7OztrQkFDUCxJQUFJOzs7OzZCQUNBLGtCQUFrQjs7OztvQkFDcEIsTUFBTTs7OztzQkFDSixRQUFROzs7O29CQUNWLE1BQU07Ozs7QUFSdkIsV0FBVyxDQUFBOztJQVVMLE1BQU07QUFDRSxXQURSLE1BQU0sQ0FDRyxZQUFZLEVBQUUsU0FBUyxFQUFFOzBCQURsQyxNQUFNOztBQUVSLFFBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGlCQUFpQixHQUFHLCtCQUF5QixDQUFBO0FBQ2xELFFBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtBQUNwQixRQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtBQUN6QixRQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDckIsUUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUE7QUFDNUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7QUFDcEIsc0JBQUssS0FBSyxFQUFFLENBQUE7R0FDYjs7ZUFaRyxNQUFNOztXQWNGLG1CQUFHO0FBQ1QsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDbkIsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO0FBQ3BCLFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQzdCO0FBQ0QsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7QUFDekIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7QUFDMUIsWUFBSSxDQUFDLGlCQUFpQixDQUFD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RyxLQUFLLENBQUE7V0FDckIsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDZCxjQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDWixhQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7V0FDWDtBQUNELGlCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2QsaUJBQUssT0FBTyxHQUFHLEtBQUssQ0FBQTtBQUNwQixpQkFBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7U0FDekIsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0g7OztTQXZTRyxNQUFNOzs7UUF5U0osTUFBTSxHQUFOLE1BQU0iLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3Rlc3Rlci1nby9saWIvdGVzdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhcnNlciBmcm9tICcuL2dvY292ZXItcGFyc2VyJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCByaW1yYWYgZnJvbSAncmltcmFmJ1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCdcblxuY2xhc3MgVGVzdGVyIHtcbiAgY29uc3RydWN0b3IgKGdvY29uZmlnRnVuYywgZ29nZXRGdW5jKSB7XG4gICAgdGhpcy5nb2dldCA9IGdvZ2V0RnVuY1xuICAgIHRoaXMuZ29jb25maWcgPSBnb2NvbmZpZ0Z1bmNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zYXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLm9ic2VydmVDb25maWcoKVxuICAgIHRoaXMub2JzZXJ2ZVRleHRFZGl0b3JzKClcbiAgICB0aGlzLmhhbmRsZUNvbW1hbmRzKClcbiAgICB0aGlzLnN1YnNjcmliZVRvU2F2ZUV2ZW50cygpXG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2VcbiAgICB0ZW1wLnRyYWNrKClcbiAgfVxuXG4gIGRpc3Bvc2UgKCkge1xuICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICB0aGlzLnJlbW92ZVRlbXBEaXIoKVxuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIGlmICh0aGlzLnNhdmVTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIHRoaXMuZ29nZXQgPSBudWxsXG4gICAgdGhpcy5nb2NvbmZpZyA9IG51bGxcbiAgICB0aGlzLnJ1bm5pbmcgPSBudWxsXG4gIH1cblxuICBoYW5kbGVDb21tYW5kcyAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnZ29sYW5nOmdvY292ZXInLCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucmVhZHkoKSB8fCAhdGhpcy5nZXRFZGl0b3IoKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMucnVuQ292ZXJhZ2UoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2dvbGFuZzpjbGVhcmdvY292ZXInLCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucmVhZHkoKSB8fCAhdGhpcy5nZXRFZGl0b3IoKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuY2xlYXJNYXJrZXJzRnJvbUVkaXRvcnMoKVxuICAgIH0pKVxuICB9XG5cbiAgb2JzZXJ2ZVRleHRFZGl0b3JzICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygoZWRpdG9yKSA9PiB7XG4gICAgICB0aGlzLmFkZE1hcmtlcnNUb0VkaXRvcihlZGl0b3IpXG4gICAgfSkpXG4gIH1cblxuICBvYnNlcnZlQ29uZmlnICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ3Rlc3Rlci1nby5ydW5Db3ZlcmFnZU9uU2F2ZScsIChydW5Db3ZlcmFnZU9uU2F2ZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2F2ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zYXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIH1cbiAgICAgIHRoaXMuc2F2ZVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBpZiAocnVuQ292ZXJhZ2VPblNhdmUpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb1NhdmVFdmVudHMoKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgc3Vic2NyaWJlVG9TYXZlRXZlbnRzICgpIHtcbiAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgaWYgKCFlZGl0b3IgfHwgIWVkaXRvci5nZXRCdWZmZXIoKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IGJ1ZmZlclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBidWZmZXJTdWJzY3JpcHRpb25zLmFkZChlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTYXZlKChmaWxlUGF0aCkgPT4ge1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCd0ZXN0ZXItZ28ucnVuQ292ZXJhZ2VPblNhdmUnKSkge1xuICAgICAgICAgIHRoaXMucnVuQ292ZXJhZ2UoZWRpdG9yKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9KSlcbiAgICAgIGJ1ZmZlclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICBidWZmZXJTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgfSkpXG4gICAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zLmFkZChidWZmZXJTdWJzY3JpcHRpb25zKVxuICAgIH0pKVxuICB9XG5cbiAgZ2V0RWRpdG9yICgpIHtcbiAgICBpZiAoIWF0b20gfHwgIWF0b20ud29ya3NwYWNlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmICghdGhpcy5pc1ZhbGlkRWRpdG9yKGVkaXRvcikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJldHVybiBlZGl0b3JcbiAgfVxuXG4gIGlzVmFsaWRFZGl0b3IgKGVkaXRvcikge1xuICAgIGlmICghZWRpdG9yIHx8ICFlZGl0b3IuZ2V0R3JhbW1hcigpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUgPT09ICdzb3VyY2UuZ28nXG4gIH1cblxuICBhZGRNYXJrZXJzVG9FZGl0b3JzICgpIHtcbiAgICBsZXQgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgZWRpdG9ycykge1xuICAgICAgdGhpcy5hZGRNYXJrZXJzVG9FZGl0b3IoZWRpdG9yKVxuICAgIH1cbiAgfVxuXG4gIGNsZWFyTWFya2Vyc0Zyb21FZGl0b3JzICgpIHtcbiAgICBsZXQgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgZWRpdG9ycykge1xuICAgICAgdGhpcy5jbGVhck1hcmtlcnMoZWRpdG9yKVxuICAgIH1cbiAgfVxuXG4gIGFkZE1hcmtlcnNUb0VkaXRvciAoZWRpdG9yKSB7XG4gICAgaWYgKCF0aGlzLmlzVmFsaWRFZGl0b3IoZWRpdG9yKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBmaWxlID0gZWRpdG9yLmdldFBhdGgoKVxuICAgIGxldCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICBpZiAoIWZpbGUgfHwgIWJ1ZmZlcikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuY2xlYXJNYXJrZXJzKGVkaXRvcilcbiAgICBpZiAoIXRoaXMucmFuZ2VzIHx8IHRoaXMucmFuZ2VzLmxlbmd0aCA8PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgZWRpdG9yUmFuZ2VzID0gXy5maWx0ZXIodGhpcy5yYW5nZXMsIChyKSA9PiB7IHJldHVybiBfLmVuZHNXaXRoKGZpbGUsIHIuZmlsZSkgfSlcblxuICAgIGlmICghZWRpdG9yUmFuZ2VzIHx8IGVkaXRvclJhbmdlcy5sZW5ndGggPD0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAobGV0IHJhbmdlIG9mIGVkaXRvclJhbmdlcykge1xuICAgICAgICBsZXQgbWFya2VyID0gYnVmZmVyLm1hcmtSYW5nZShyYW5nZS5yYW5nZSwge2NsYXNzOiAnZ29jb3ZlcicsIGdvY292ZXJjb3VudDogcmFuZ2UuY291bnQsIGludmFsaWRhdGU6ICd0b3VjaCd9KVxuICAgICAgICBsZXQgYyA9ICd1bmNvdmVyZWQnXG4gICAgICAgIGlmIChyYW5nZS5jb3VudCA+IDApIHtcbiAgICAgICAgICBjID0gJ2NvdmVyZWQnXG4gICAgICAgIH1cbiAgICAgICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogYywgb25seU5vbkVtcHR5OiB0cnVlfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKVxuICAgIH1cbiAgfVxuXG4gIGNsZWFyTWFya2VycyAoZWRpdG9yKSB7XG4gICAgaWYgKCFlZGl0b3IgfHwgIWVkaXRvci5nZXRCdWZmZXIoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGxldCBtYXJrZXJzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmZpbmRNYXJrZXJzKHtjbGFzczogJ2dvY292ZXInfSlcbiAgICAgIGlmICghbWFya2VycyB8fCBtYXJrZXJzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZm9yIChsZXQgbWFya2VyIG9mIG1hcmtlcnMpIHtcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlVGVtcERpciAoKSB7XG4gICAgaWYgKHRoaXMudGVtcERpcikge1xuICAgICAgcmltcmFmKHRoaXMudGVtcERpciwgKGUpID0+IHtcbiAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICBpZiAoZS5oYW5kbGUpIHtcbiAgICAgICAgICAgIGUuaGFuZGxlKClcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMudGVtcERpciA9IG51bGxcbiAgICB9XG4gIH1cblxuICBjcmVhdGVDb3ZlcmFnZUZpbGUgKCkge1xuICAgIHRoaXMucmVtb3ZlVGVtcERpcigpXG4gICAgaWYgKCF0aGlzLnRlbXBEaXIpIHtcbiAgICAgIHRoaXMudGVtcERpciA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYygpKVxuICAgIH1cbiAgICB0aGlzLmNvdmVyYWdlRmlsZSA9IHBhdGguam9pbih0aGlzLnRlbXBEaXIsICdjb3ZlcmFnZS5vdXQnKVxuICB9XG5cbiAgcHJvamVjdFBhdGggKGVkaXRvcikge1xuICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgcmV0dXJuIGVkaXRvci5nZXRQYXRoKClcbiAgICB9XG5cbiAgICBpZiAoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGdldExvY2F0b3JPcHRpb25zIChlZGl0b3IgPSB0aGlzLmdldEVkaXRvcigpKSB7XG4gICAgbGV0IG9wdGlvbnMgPSB7fVxuICAgIGxldCBwID0gdGhpcy5wcm9qZWN0UGF0aChlZGl0b3IpXG4gICAgaWYgKHApIHtcbiAgICAgIG9wdGlvbnMuZGlyZWN0b3J5ID0gcFxuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBnZXRFeGVjdXRvck9wdGlvbnMgKGVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yKCkpIHtcbiAgICBsZXQgbyA9IHRoaXMuZ2V0TG9jYXRvck9wdGlvbnMoZWRpdG9yKVxuICAgIGxldCBvcHRpb25zID0ge31cbiAgICBvcHRpb25zLmN3ZCA9IHBhdGguZGlybmFtZShlZGl0b3IuZ2V0UGF0aCgpKVxuICAgIGxldCBjb25maWcgPSB0aGlzLmdvY29uZmlnKClcbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICBvcHRpb25zLmVudiA9IGNvbmZpZy5lbnZpcm9ubWVudChvKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuZW52KSB7XG4gICAgICBvcHRpb25zLmVudiA9IHByb2Nlc3MuZW52XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICByZWFkeSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ29jb25maWcgJiYgdGhpcy5nb2NvbmZpZygpXG4gIH1cblxuICBydW5Db3ZlcmFnZSAoZWRpdG9yID0gdGhpcy5nZXRFZGl0b3IoKSkge1xuICAgIGlmICghdGhpcy5pc1ZhbGlkRWRpdG9yKGVkaXRvcikpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH1cbiAgICBsZXQgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgaWYgKCFidWZmZXIpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH1cbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlXG4gICAgICB0aGlzLmNsZWFyTWFya2Vyc0Zyb21FZGl0b3JzKClcbiAgICAgIHRoaXMuY3JlYXRlQ292ZXJhZ2VGaWxlKClcbiAgICAgIGxldCBjb25maWcgPSB0aGlzLmdvY29uZmlnKClcbiAgICAgIGxldCBnbyA9IGZhbHNlXG4gICAgICBsZXQgY292ZXIgPSBmYWxzZVxuICAgICAgbGV0IGxvY2F0b3JPcHRpb25zID0gdGhpcy5nZXRMb2NhdG9yT3B0aW9ucyhlZGl0b3IpXG4gICAgICByZXR1cm4gY29uZmlnLmxvY2F0b3IuZmluZFRvb2woJ2dvJywgbG9jYXRvck9wdGlvbnMpLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgICBpZiAoIWNtZCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIGdvID0gY21kXG4gICAgICAgIHJldHVybiBjb25maWcubG9jYXRvci5maW5kVG9vbCgnY292ZXInLCBsb2NhdG9yT3B0aW9ucylcbiAgICAgIH0pLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgICBpZiAoIWNtZCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIGNvdmVyID0gY21kXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFnbyB8fCAhY292ZXIpIHtcbiAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNtZCA9IGdvXG4gICAgICAgIGxldCBhcmdzID0gWyd0ZXN0JywgJy1jb3ZlcnByb2ZpbGU9JyArIHRoaXMuY292ZXJhZ2VGaWxlXVxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCd0ZXN0ZXItZ28ucnVuQ292ZXJhZ2VXaXRoU2hvcnRGbGFnJykpIHtcbiAgICAgICAgICBhcmdzLnB1c2goJy1zaG9ydCcpXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGV4ZWN1dG9yT3B0aW9ucyA9IHRoaXMuZ2V0RXhlY3V0b3JPcHRpb25zKGVkaXRvcilcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRvci5leGVjKGNtZCwgYXJncywgZXhlY3V0b3JPcHRpb25zKS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgaWYgKHIuc3RkZXJyICYmIHIuc3RkZXJyLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0ZXN0ZXItZ286IChzdGRlcnIpICcgKyByLnN0ZGVycilcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoci5leGl0Y29kZSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5yYW5nZXMgPSBwYXJzZXIucmFuZ2VzKHRoaXMuY292ZXJhZ2VGaWxlKVxuICAgICAgICAgICAgdGhpcy5hZGRNYXJrZXJzVG9FZGl0b3JzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgaWYgKGUuaGFuZGxlKSB7XG4gICAgICAgICAgZS5oYW5kbGUoKVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG5leHBvcnQge1Rlc3Rlcn1cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/tester-go/lib/tester.js
