Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var Formatter = (function () {
  function Formatter(goconfigFunc, gogetFunc) {
    _classCallCheck(this, Formatter);

    this.goget = gogetFunc;
    this.goconfig = goconfigFunc;
    this.subscriptions = new _atom.CompositeDisposable();
    this.saveSubscriptions = new _atom.CompositeDisposable();
    this.updatingFormatterCache = false;
    this.setToolLocations();
    this.observeConfig();
    this.handleCommands();
    this.updateFormatterCache();
  }

  _createClass(Formatter, [{
    key: 'dispose',
    value: function dispose() {
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
      this.formatTool = null;
      this.toolCheckComplete = null;
      this.formatterCache = null;
      this.updatingFormatterCache = null;
      this.toolLocations = null;
    }
  }, {
    key: 'setToolLocations',
    value: function setToolLocations() {
      this.toolLocations = {
        gofmt: false,
        goimports: 'golang.org/x/tools/cmd/goimports',
        goreturns: 'sourcegraph.com/sqs/goreturns'
      };
    }
  }, {
    key: 'handleCommands',
    value: function handleCommands() {
      var _this = this;

      atom.project.onDidChangePaths(function (projectPaths) {
        _this.updateFormatterCache();
      });
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar~="go"]', 'golang:gofmt', function () {
        if (!_this.ready() || !_this.getEditor()) {
          return;
        }
        _this.format(_this.getEditor(), 'gofmt');
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar~="go"]', 'golang:goimports', function () {
        if (!_this.ready() || !_this.getEditor()) {
          return;
        }
        _this.format(_this.getEditor(), 'goimports');
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar~="go"]', 'golang:goreturns', function () {
        if (!_this.ready() || !_this.getEditor()) {
          return;
        }
        _this.format(_this.getEditor(), 'goreturns');
      }));
    }
  }, {
    key: 'observeConfig',
    value: function observeConfig() {
      var _this2 = this;

      this.subscriptions.add(atom.config.observe('gofmt.formatTool', function (formatTool) {
        _this2.formatTool = formatTool;
        if (_this2.toolCheckComplete) {
          _this2.toolCheckComplete[formatTool] = false;
        }
        _this2.checkForTool(formatTool);
      }));
      this.subscriptions.add(atom.config.observe('gofmt.formatOnSave', function (formatOnSave) {
        if (_this2.saveSubscriptions) {
          _this2.saveSubscriptions.dispose();
        }
        _this2.saveSubscriptions = new _atom.CompositeDisposable();
        if (formatOnSave) {
          _this2.subscribeToSaveEvents();
        }
      }));
    }
  }, {
    key: 'subscribeToSaveEvents',
    value: function subscribeToSaveEvents() {
      var _this3 = this;

      this.saveSubscriptions.add(atom.workspace.observeTextEditors(function (editor) {
        if (!editor || !editor.getBuffer()) {
          return;
        }

        var bufferSubscriptions = new _atom.CompositeDisposable();
        bufferSubscriptions.add(editor.getBuffer().onWillSave(function (filePath) {
          var p = editor.getPath();
          if (filePath && filePath.path) {
            p = filePath.path;
          }
          _this3.format(editor, _this3.formatTool, p);
        }));
        bufferSubscriptions.add(editor.getBuffer().onDidDestroy(function () {
          bufferSubscriptions.dispose();
        }));
        _this3.saveSubscriptions.add(bufferSubscriptions);
      }));
    }
  }, {
    key: 'ready',
    value: function ready() {
      return this.goconfig && this.goconfig() && !this.updatingFormatterCache && this.formatterCache && this.formatterCache.size > 0;
    }
  }, {
    key: 'resetFormatterCache',
    value: function resetFormatterCache() {
      this.formatterCache = null;
    }
  }, {
    key: 'updateFormatterCache',
    value: function updateFormatterCache() {
      var _this4 = this;

      if (this.updatingFormatterCache) {
        return Promise.resolve(false);
      }
      this.updatingFormatterCache = true;

      if (!this.goconfig || !this.goconfig()) {
        this.updatingFormatterCache = false;
        return Promise.resolve(false);
      }

      var config = this.goconfig();
      var cache = new Map();
      var paths = atom.project.getPaths();
      paths.push(false);
      var promises = [];
      for (var p of paths) {
        if (p && p.includes('://')) {
          continue;
        }

        var _loop = function (tool) {
          var key = tool + ':' + p;
          var options = { directory: p };
          if (!p) {
            key = tool;
            options = {};
          }

          promises.push(config.locator.findTool(tool, options).then(function (cmd) {
            if (cmd) {
              cache.set(key, cmd);
              return cmd;
            }
            return false;
          }));
        };

        for (var tool of ['gofmt', 'goimports', 'goreturns']) {
          _loop(tool);
        }
      }
      return Promise.all(promises).then(function () {
        _this4.formatterCache = cache;
        _this4.updatingFormatterCache = false;
        return _this4.formatterCache;
      })['catch'](function (e) {
        if (e.handle) {
          e.handle();
        }
        console.log(e);
        _this4.updatingFormatterCache = false;
      });
    }
  }, {
    key: 'cachedToolPath',
    value: function cachedToolPath(toolName, editor) {
      if (!this.formatterCache || !toolName) {
        return false;
      }

      var p = this.projectPath(editor);
      if (p) {
        var key = toolName + ':' + p;
        var _cmd = this.formatterCache.get(key);
        if (_cmd) {
          return _cmd;
        }
      }

      var cmd = this.formatterCache.get(toolName);
      if (cmd) {
        return cmd;
      }
      return false;
    }
  }, {
    key: 'projectPath',
    value: function projectPath(editor) {
      if (editor) {
        var result = atom.project.relativizePath(editor.getPath());
        if (result && result.projectPath) {
          return result.projectPath;
        }
      }
      var paths = atom.project.getPaths();
      if (paths && paths.length) {
        for (var p of paths) {
          if (p && !p.includes('://')) {
            return p;
          }
        }
      }

      return false;
    }
  }, {
    key: 'checkForTool',
    value: function checkForTool() {
      var _this5 = this;

      var toolName = arguments.length <= 0 || arguments[0] === undefined ? this.formatTool : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? this.getLocatorOptions() : arguments[1];

      if (!this.ready()) {
        return;
      }
      var config = this.goconfig();
      return config.locator.findTool(toolName, options).then(function (cmd) {
        if (cmd) {
          return _this5.updateFormatterCache().then(function () {
            return cmd;
          });
        }

        if (!_this5.toolCheckComplete) {
          _this5.toolCheckComplete = {};
        }

        if (!cmd && !_this5.toolCheckComplete[toolName]) {
          var goget = _this5.goget();
          if (!goget) {
            return false;
          }
          _this5.toolCheckComplete[toolName] = true;

          var packagePath = _this5.toolLocations[toolName];
          if (packagePath) {
            goget.get({
              name: 'gofmt',
              packageName: toolName,
              packagePath: packagePath,
              type: 'missing'
            }).then(function () {
              return _this5.updateFormatterCache();
            })['catch'](function (e) {
              console.log(e);
            });
          }
        }

        return false;
      });
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
    key: 'format',
    value: function format(editor, tool, filePath) {
      if (editor === undefined) editor = this.getEditor();
      if (tool === undefined) tool = this.formatTool;

      if (!this.ready() || !this.isValidEditor(editor) || !editor.getBuffer()) {
        return;
      }

      if (!filePath) {
        filePath = editor.getPath();
      }

      var formatCmd = this.cachedToolPath(tool, editor);
      if (!formatCmd) {
        this.checkForTool(tool);
        return;
      }

      var cmd = formatCmd;
      var config = this.goconfig();
      var options = this.getExecutorOptions(editor);
      options.input = editor.getText();
      var args = ['-e'];
      if (filePath) {
        if (tool === 'goimports') {
          args.push('--srcdir');
          args.push(_path2['default'].dirname(filePath));
        }
      }

      var r = config.executor.execSync(cmd, args, options);
      if (r.stderr && r.stderr.trim() !== '') {
        console.log('gofmt: (stderr) ' + r.stderr);
        return;
      }
      if (r.exitcode === 0) {
        editor.getBuffer().setTextViaDiff(r.stdout);
      }
    }
  }]);

  return Formatter;
})();

exports.Formatter = Formatter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb2ZtdC9saWIvZm9ybWF0dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRWtDLE1BQU07O29CQUN2QixNQUFNOzs7O0FBSHZCLFdBQVcsQ0FBQTs7SUFLTCxTQUFTO0FBQ0QsV0FEUixTQUFTLENBQ0EsWUFBWSxFQUFFLFNBQVMsRUFBRTswQkFEbEMsU0FBUzs7QUFFWCxRQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQTtBQUN0QixRQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQTtBQUM1QixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxpQkFBaUIsR0FBRywrQkFBeUIsQ0FBQTtBQUNsRCxRQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFBO0FBQ25DLFFBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtBQUNwQixRQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDckIsUUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUE7R0FDNUI7O2VBWEcsU0FBUzs7V0FhTCxtQkFBRztBQUNULFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQzdCO0FBQ0QsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7QUFDekIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7QUFDMUIsWUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ2pDO0FBQ0QsVUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQTtBQUM3QixVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtBQUNqQixVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUNwQixVQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FB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R0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ3BELFVBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0QyxlQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMxQyxlQUFNO09BQ1A7QUFDRCxVQUFJLENBQUMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO0FBQ3BCLGNBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO09BQzVDO0tBQ0Y7OztTQXBVRyxTQUFTOzs7UUFzVVAsU0FBUyxHQUFULFNBQVMiLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dvZm10L2xpYi9mb3JtYXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jbGFzcyBGb3JtYXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoZ29jb25maWdGdW5jLCBnb2dldEZ1bmMpIHtcbiAgICB0aGlzLmdvZ2V0ID0gZ29nZXRGdW5jXG4gICAgdGhpcy5nb2NvbmZpZyA9IGdvY29uZmlnRnVuY1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMudXBkYXRpbmdGb3JtYXR0ZXJDYWNoZSA9IGZhbHNlXG4gICAgdGhpcy5zZXRUb29sTG9jYXRpb25zKClcbiAgICB0aGlzLm9ic2VydmVDb25maWcoKVxuICAgIHRoaXMuaGFuZGxlQ29tbWFuZHMoKVxuICAgIHRoaXMudXBkYXRlRm9ybWF0dGVyQ2FjaGUoKVxuICB9XG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgaWYgKHRoaXMuc2F2ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuc2F2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc2F2ZVN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nb2dldCA9IG51bGxcbiAgICB0aGlzLmdvY29uZmlnID0gbnVsbFxuICAgIHRoaXMuZm9ybWF0VG9vbCA9IG51bGxcbiAgICB0aGlzLnRvb2xDaGVja0NvbXBsZXRlID0gbnVsbFxuICAgIHRoaXMuZm9ybWF0dGVyQ2FjaGUgPSBudWxsXG4gICAgdGhpcy51cGRhdGluZ0Zvcm1hdHRlckNhY2hlID0gbnVsbFxuICAgIHRoaXMudG9vbExvY2F0aW9ucyA9IG51bGxcbiAgfVxuXG4gIHNldFRvb2xMb2NhdGlvbnMgKCkge1xuICAgIHRoaXMudG9vbExvY2F0aW9ucyA9IHtcbiAgICAgIGdvZm10OiBmYWxzZSxcbiAgICAgIGdvaW1wb3J0czogJ2dvbGFuZy5vcmcveC90b29scy9jbWQvZ29pbXBvcnRzJyxcbiAgICAgIGdvcmV0dXJuczogJ3NvdXJjZWdyYXBoLmNvbS9zcXMvZ29yZXR1cm5zJ1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUNvbW1hbmRzICgpIHtcbiAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygocHJvamVjdFBhdGhzKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUZvcm1hdHRlckNhY2hlKClcbiAgICB9KVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyfj1cImdvXCJdJywgJ2dvbGFuZzpnb2ZtdCcsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5yZWFkeSgpIHx8ICF0aGlzLmdldEVkaXRvcigpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5mb3JtYXQodGhpcy5nZXRFZGl0b3IoKSwgJ2dvZm10JylcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcn49XCJnb1wiXScsICdnb2xhbmc6Z29pbXBvcnRzJywgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnJlYWR5KCkgfHwgIXRoaXMuZ2V0RWRpdG9yKCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLmZvcm1hdCh0aGlzLmdldEVkaXRvcigpLCAnZ29pbXBvcnRzJylcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcn49XCJnb1wiXScsICdnb2xhbmc6Z29yZXR1cm5zJywgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnJlYWR5KCkgfHwgIXRoaXMuZ2V0RWRpdG9yKCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLmZvcm1hdCh0aGlzLmdldEVkaXRvcigpLCAnZ29yZXR1cm5zJylcbiAgICB9KSlcbiAgfVxuXG4gIG9ic2VydmVDb25maWcgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnZ29mbXQuZm9ybWF0VG9vbCcsIChmb3JtYXRUb29sKSA9PiB7XG4gICAgICB0aGlzLmZvcm1hdFRvb2wgPSBmb3JtYXRUb29sXG4gICAgICBpZiAodGhpcy50b29sQ2hlY2tDb21wbGV0ZSkge1xuICAgICAgICB0aGlzLnRvb2xDaGVja0NvbXBsZXRlW2Zvcm1hdFRvb2xdID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hlY2tGb3JUb29sKGZvcm1hdFRvb2wpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdnb2ZtdC5mb3JtYXRPblNhdmUnLCAoZm9ybWF0T25TYXZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5zYXZlU3Vic2NyaXB0aW9ucykge1xuICAgICAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgICAgdGhpcy5zYXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIGlmIChmb3JtYXRPblNhdmUpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb1NhdmVFdmVudHMoKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgc3Vic2NyaWJlVG9TYXZlRXZlbnRzICgpIHtcbiAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgaWYgKCFlZGl0b3IgfHwgIWVkaXRvci5nZXRCdWZmZXIoKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IGJ1ZmZlclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBidWZmZXJTdWJzY3JpcHRpb25zLmFkZChlZGl0b3IuZ2V0QnVmZmVyKCkub25XaWxsU2F2ZSgoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgbGV0IHAgPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGlmIChmaWxlUGF0aCAmJiBmaWxlUGF0aC5wYXRoKSB7XG4gICAgICAgICAgcCA9IGZpbGVQYXRoLnBhdGhcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvcm1hdChlZGl0b3IsIHRoaXMuZm9ybWF0VG9vbCwgcClcbiAgICAgIH0pKVxuICAgICAgYnVmZmVyU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIGJ1ZmZlclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICB9KSlcbiAgICAgIHRoaXMuc2F2ZVN1YnNjcmlwdGlvbnMuYWRkKGJ1ZmZlclN1YnNjcmlwdGlvbnMpXG4gICAgfSkpXG4gIH1cblxuICByZWFkeSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ29jb25maWcgJiYgdGhpcy5nb2NvbmZpZygpICYmICF0aGlzLnVwZGF0aW5nRm9ybWF0dGVyQ2FjaGUgJiYgdGhpcy5mb3JtYXR0ZXJDYWNoZSAmJiB0aGlzLmZvcm1hdHRlckNhY2hlLnNpemUgPiAwXG4gIH1cblxuICByZXNldEZvcm1hdHRlckNhY2hlICgpIHtcbiAgICB0aGlzLmZvcm1hdHRlckNhY2hlID0gbnVsbFxuICB9XG5cbiAgdXBkYXRlRm9ybWF0dGVyQ2FjaGUgKCkge1xuICAgIGlmICh0aGlzLnVwZGF0aW5nRm9ybWF0dGVyQ2FjaGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpXG4gICAgfVxuICAgIHRoaXMudXBkYXRpbmdGb3JtYXR0ZXJDYWNoZSA9IHRydWVcblxuICAgIGlmICghdGhpcy5nb2NvbmZpZyB8fCAhdGhpcy5nb2NvbmZpZygpKSB7XG4gICAgICB0aGlzLnVwZGF0aW5nRm9ybWF0dGVyQ2FjaGUgPSBmYWxzZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSlcbiAgICB9XG5cbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgbGV0IGNhY2hlID0gbmV3IE1hcCgpXG4gICAgbGV0IHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICBwYXRocy5wdXNoKGZhbHNlKVxuICAgIGxldCBwcm9taXNlcyA9IFtdXG4gICAgZm9yIChsZXQgcCBvZiBwYXRocykge1xuICAgICAgaWYgKHAgJiYgcC5pbmNsdWRlcygnOi8vJykpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IHRvb2wgb2YgWydnb2ZtdCcsICdnb2ltcG9ydHMnLCAnZ29yZXR1cm5zJ10pIHtcbiAgICAgICAgbGV0IGtleSA9IHRvb2wgKyAnOicgKyBwXG4gICAgICAgIGxldCBvcHRpb25zID0geyBkaXJlY3Rvcnk6IHAgfVxuICAgICAgICBpZiAoIXApIHtcbiAgICAgICAgICBrZXkgPSB0b29sXG4gICAgICAgICAgb3B0aW9ucyA9IHt9XG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlcy5wdXNoKGNvbmZpZy5sb2NhdG9yLmZpbmRUb29sKHRvb2wsIG9wdGlvbnMpLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgICAgIGlmIChjbWQpIHtcbiAgICAgICAgICAgIGNhY2hlLnNldChrZXksIGNtZClcbiAgICAgICAgICAgIHJldHVybiBjbWRcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5mb3JtYXR0ZXJDYWNoZSA9IGNhY2hlXG4gICAgICB0aGlzLnVwZGF0aW5nRm9ybWF0dGVyQ2FjaGUgPSBmYWxzZVxuICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0dGVyQ2FjaGVcbiAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgaWYgKGUuaGFuZGxlKSB7XG4gICAgICAgIGUuaGFuZGxlKClcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICB0aGlzLnVwZGF0aW5nRm9ybWF0dGVyQ2FjaGUgPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICBjYWNoZWRUb29sUGF0aCAodG9vbE5hbWUsIGVkaXRvcikge1xuICAgIGlmICghdGhpcy5mb3JtYXR0ZXJDYWNoZSB8fCAhdG9vbE5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGxldCBwID0gdGhpcy5wcm9qZWN0UGF0aChlZGl0b3IpXG4gICAgaWYgKHApIHtcbiAgICAgIGxldCBrZXkgPSB0b29sTmFtZSArICc6JyArIHBcbiAgICAgIGxldCBjbWQgPSB0aGlzLmZvcm1hdHRlckNhY2hlLmdldChrZXkpXG4gICAgICBpZiAoY21kKSB7XG4gICAgICAgIHJldHVybiBjbWRcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgY21kID0gdGhpcy5mb3JtYXR0ZXJDYWNoZS5nZXQodG9vbE5hbWUpXG4gICAgaWYgKGNtZCkge1xuICAgICAgcmV0dXJuIGNtZFxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHByb2plY3RQYXRoIChlZGl0b3IpIHtcbiAgICBpZiAoZWRpdG9yKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5wcm9qZWN0UGF0aCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0LnByb2plY3RQYXRoXG4gICAgICB9XG4gICAgfVxuICAgIGxldCBwYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgaWYgKHBhdGhzICYmIHBhdGhzLmxlbmd0aCkge1xuICAgICAgZm9yIChsZXQgcCBvZiBwYXRocykge1xuICAgICAgICBpZiAocCAmJiAhcC5pbmNsdWRlcygnOi8vJykpIHtcbiAgICAgICAgICByZXR1cm4gcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjaGVja0ZvclRvb2wgKHRvb2xOYW1lID0gdGhpcy5mb3JtYXRUb29sLCBvcHRpb25zID0gdGhpcy5nZXRMb2NhdG9yT3B0aW9ucygpKSB7XG4gICAgaWYgKCF0aGlzLnJlYWR5KCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgcmV0dXJuIGNvbmZpZy5sb2NhdG9yLmZpbmRUb29sKHRvb2xOYW1lLCBvcHRpb25zKS50aGVuKChjbWQpID0+IHtcbiAgICAgIGlmIChjbWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlRm9ybWF0dGVyQ2FjaGUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gY21kXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy50b29sQ2hlY2tDb21wbGV0ZSkge1xuICAgICAgICB0aGlzLnRvb2xDaGVja0NvbXBsZXRlID0geyB9XG4gICAgICB9XG5cbiAgICAgIGlmICghY21kICYmICF0aGlzLnRvb2xDaGVja0NvbXBsZXRlW3Rvb2xOYW1lXSkge1xuICAgICAgICBsZXQgZ29nZXQgPSB0aGlzLmdvZ2V0KClcbiAgICAgICAgaWYgKCFnb2dldCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudG9vbENoZWNrQ29tcGxldGVbdG9vbE5hbWVdID0gdHJ1ZVxuXG4gICAgICAgIGxldCBwYWNrYWdlUGF0aCA9IHRoaXMudG9vbExvY2F0aW9uc1t0b29sTmFtZV1cbiAgICAgICAgaWYgKHBhY2thZ2VQYXRoKSB7XG4gICAgICAgICAgZ29nZXQuZ2V0KHtcbiAgICAgICAgICAgIG5hbWU6ICdnb2ZtdCcsXG4gICAgICAgICAgICBwYWNrYWdlTmFtZTogdG9vbE5hbWUsXG4gICAgICAgICAgICBwYWNrYWdlUGF0aDogcGFja2FnZVBhdGgsXG4gICAgICAgICAgICB0eXBlOiAnbWlzc2luZydcbiAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUZvcm1hdHRlckNhY2hlKClcbiAgICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0pXG4gIH1cblxuICBnZXRFZGl0b3IgKCkge1xuICAgIGlmICghYXRvbSB8fCAhYXRvbS53b3Jrc3BhY2UpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgKCF0aGlzLmlzVmFsaWRFZGl0b3IoZWRpdG9yKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmV0dXJuIGVkaXRvclxuICB9XG5cbiAgaXNWYWxpZEVkaXRvciAoZWRpdG9yKSB7XG4gICAgaWYgKCFlZGl0b3IgfHwgIWVkaXRvci5nZXRHcmFtbWFyKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSA9PT0gJ3NvdXJjZS5nbydcbiAgfVxuXG4gIGdldExvY2F0b3JPcHRpb25zIChlZGl0b3IgPSB0aGlzLmdldEVkaXRvcigpKSB7XG4gICAgbGV0IG9wdGlvbnMgPSB7fVxuICAgIGxldCBwID0gdGhpcy5wcm9qZWN0UGF0aChlZGl0b3IpXG4gICAgaWYgKHApIHtcbiAgICAgIG9wdGlvbnMuZGlyZWN0b3J5ID0gcFxuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBnZXRFeGVjdXRvck9wdGlvbnMgKGVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yKCkpIHtcbiAgICBsZXQgbyA9IHRoaXMuZ2V0TG9jYXRvck9wdGlvbnMoZWRpdG9yKVxuICAgIGxldCBvcHRpb25zID0ge31cbiAgICBpZiAoby5kaXJlY3RvcnkpIHtcbiAgICAgIG9wdGlvbnMuY3dkID0gby5kaXJlY3RvcnlcbiAgICB9XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ29jb25maWcoKVxuICAgIGlmIChjb25maWcpIHtcbiAgICAgIG9wdGlvbnMuZW52ID0gY29uZmlnLmVudmlyb25tZW50KG8pXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5lbnYpIHtcbiAgICAgIG9wdGlvbnMuZW52ID0gcHJvY2Vzcy5lbnZcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIGZvcm1hdCAoZWRpdG9yID0gdGhpcy5nZXRFZGl0b3IoKSwgdG9vbCA9IHRoaXMuZm9ybWF0VG9vbCwgZmlsZVBhdGgpIHtcbiAgICBpZiAoIXRoaXMucmVhZHkoKSB8fCAhdGhpcy5pc1ZhbGlkRWRpdG9yKGVkaXRvcikgfHwgIWVkaXRvci5nZXRCdWZmZXIoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgfVxuXG4gICAgbGV0IGZvcm1hdENtZCA9IHRoaXMuY2FjaGVkVG9vbFBhdGgodG9vbCwgZWRpdG9yKVxuICAgIGlmICghZm9ybWF0Q21kKSB7XG4gICAgICB0aGlzLmNoZWNrRm9yVG9vbCh0b29sKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IGNtZCA9IGZvcm1hdENtZFxuICAgIGxldCBjb25maWcgPSB0aGlzLmdvY29uZmlnKClcbiAgICBsZXQgb3B0aW9ucyA9IHRoaXMuZ2V0RXhlY3V0b3JPcHRpb25zKGVkaXRvcilcbiAgICBvcHRpb25zLmlucHV0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgIGxldCBhcmdzID0gWyctZSddXG4gICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICBpZiAodG9vbCA9PT0gJ2dvaW1wb3J0cycpIHtcbiAgICAgICAgYXJncy5wdXNoKCctLXNyY2RpcicpXG4gICAgICAgIGFyZ3MucHVzaChwYXRoLmRpcm5hbWUoZmlsZVBhdGgpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCByID0gY29uZmlnLmV4ZWN1dG9yLmV4ZWNTeW5jKGNtZCwgYXJncywgb3B0aW9ucylcbiAgICBpZiAoci5zdGRlcnIgJiYgci5zdGRlcnIudHJpbSgpICE9PSAnJykge1xuICAgICAgY29uc29sZS5sb2coJ2dvZm10OiAoc3RkZXJyKSAnICsgci5zdGRlcnIpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHIuZXhpdGNvZGUgPT09IDApIHtcbiAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0VmlhRGlmZihyLnN0ZG91dClcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCB7Rm9ybWF0dGVyfVxuIl19
//# sourceURL=/Users/james/.atom/packages/gofmt/lib/formatter.js
