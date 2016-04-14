Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

'use babel';

var GocodeProvider = (function () {
  function GocodeProvider(goconfigFunc, gogetFunc) {
    var _this = this;

    _classCallCheck(this, GocodeProvider);

    this.goconfig = goconfigFunc;
    this.goget = gogetFunc;
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscribers = [];

    this.selector = '.source.go';
    this.inclusionPriority = 1;
    this.excludeLowerPriority = atom.config.get('autocomplete-go.suppressBuiltinAutocompleteProvider');
    this.suppressForCharacters = [];
    this.disableForSelector = atom.config.get('autocomplete-go.scopeBlacklist');
    var suppressSubscrition = atom.config.observe('autocomplete-go.suppressActivationForCharacters', function (value) {
      _this.suppressForCharacters = _lodash2['default'].map(value, function (c) {
        var char = c ? c.trim() : '';
        char = (function () {
          switch (false) {
            case char.toLowerCase() !== 'comma':
              return ',';
            case char.toLowerCase() !== 'newline':
              return '\n';
            case char.toLowerCase() !== 'space':
              return ' ';
            case char.toLowerCase() !== 'tab':
              return '\t';
            default:
              return char;
          }
        })();
        return char;
      });
      _this.suppressForCharacters = _lodash2['default'].compact(_this.suppressForCharacters);
    });
    this.subscriptions.add(suppressSubscrition);
    this.funcRegex = /^(?:func[(]{1})([^\)]*)(?:[)]{1})(?:$|(?:\s)([^\(]*$)|(?: [(]{1})([^\)]*)(?:[)]{1}))/i;
  }

  _createClass(GocodeProvider, [{
    key: 'dispose',
    value: function dispose() {
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }
      this.subscriptions = null;
      this.goconfig = null;
      this.subscribers = null;
      this.selector = null;
      this.inclusionPriority = null;
      this.excludeLowerPriority = null;
      this.suppressForCharacters = null;
      this.disableForSelector = null;
      this.funcRegex = null;
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
    key: 'isValidEditor',
    value: function isValidEditor(editor) {
      if (!editor || !editor.getGrammar) {
        return false;
      }
      var grammar = editor.getGrammar();
      if (!grammar) {
        return false;
      }
      if (grammar.scopeName === 'source.go') {
        return true;
      }
      return false;
    }
  }, {
    key: 'characterIsSuppressed',
    value: function characterIsSuppressed(char) {
      return this.suppressForCharacters.indexOf(char) !== -1;
    }
  }, {
    key: 'getSuggestions',
    value: function getSuggestions(options) {
      var _this2 = this;

      var p = new Promise(function (resolve) {
        if (!options || !_this2.ready() || !_this2.isValidEditor(options.editor)) {
          return resolve();
        }
        var config = _this2.goconfig();
        var buffer = options.editor.getBuffer();
        if (!buffer || !options.bufferPosition) {
          return resolve();
        }

        var index = buffer.characterIndexForPosition(options.bufferPosition);
        var text = options.editor.getText();
        if (index > 0 && _this2.characterIsSuppressed(text[index - 1])) {
          return resolve();
        }
        var offset = Buffer.byteLength(text.substring(0, index), 'utf8');

        var locatorOptions = {
          file: options.editor.getPath(),
          directory: _path2['default'].dirname(options.editor.getPath())
        };

        var args = ['-f=json', 'autocomplete', buffer.getPath(), offset];
        config.locator.findTool('gocode', locatorOptions).then(function (cmd) {
          if (!cmd) {
            resolve();
            return false;
          }
          var cwd = _path2['default'].dirname(buffer.getPath());
          var env = config.environment(locatorOptions);
          config.executor.exec(cmd, args, { cwd: cwd, env: env, input: text }).then(function (r) {
            if (r.stderr && r.stderr.trim() !== '') {
              console.log('autocomplete-go: (stderr) ' + r.stderr);
            }
            var messages = [];
            if (r.stdout && r.stdout.trim() !== '') {
              messages = _this2.mapMessages(r.stdout, options.editor, options.bufferPosition);
            }
            if (!messages || messages.length < 1) {
              return resolve();
            }
            resolve(messages);
          })['catch'](function (e) {
            console.log(e);
            resolve();
          });
        });
      });

      if (this.subscribers && this.subscribers.length > 0) {
        for (var subscriber of this.subscribers) {
          subscriber(p);
        }
      }
      return p;
    }
  }, {
    key: 'onDidGetSuggestions',
    value: function onDidGetSuggestions(s) {
      if (this.subscribers) {
        this.subscribers.push(s);
      }
    }
  }, {
    key: 'mapMessages',
    value: function mapMessages(data, editor, position) {
      if (!data) {
        return [];
      }
      var res = undefined;
      try {
        res = JSON.parse(data);
      } catch (e) {
        if (e && e.handle) {
          e.handle();
        }
        atom.notifications.addError('gocode error', {
          detail: data,
          dismissable: true
        });
        console.log(e);
        return [];
      }

      var numPrefix = res[0];
      var candidates = res[1];
      if (!candidates) {
        return [];
      }
      var prefix = editor.getTextInBufferRange([[position.row, position.column - numPrefix], position]);
      var suffix = false;
      try {
        suffix = editor.getTextInBufferRange([position, [position.row, position.column + 1]]);
      } catch (e) {
        console.log(e);
      }
      var suggestions = [];
      for (var c of candidates) {
        var suggestion = {
          replacementPrefix: prefix,
          leftLabel: c.type || c['class'],
          type: this.translateType(c['class'])
        };
        if (c['class'] === 'func' && (!suffix || suffix !== '(')) {
          suggestion = this.upgradeSuggestion(suggestion, c);
        } else {
          suggestion.text = c.name;
        }
        if (suggestion.type === 'package') {
          suggestion.iconHTML = '<i class="icon-package"></i>';
        }
        suggestions.push(suggestion);
      }
      return suggestions;
    }
  }, {
    key: 'translateType',
    value: function translateType(type) {
      if (type === 'func') {
        return 'function';
      }
      if (type === 'var') {
        return 'variable';
      }
      if (type === 'const') {
        return 'constant';
      }
      if (type === 'PANIC') {
        return 'panic';
      }
      return type;
    }
  }, {
    key: 'upgradeSuggestion',
    value: function upgradeSuggestion(suggestion, c) {
      if (!c || !c.type || c.type === '') {
        return suggestion;
      }
      var match = this.funcRegex.exec(c.type);
      if (!match || !match[0]) {
        // Not a function
        suggestion.snippet = c.name + '()';
        suggestion.leftLabel = '';
        return suggestion;
      }
      suggestion.leftLabel = match[2] || match[3] || '';
      suggestion.snippet = this.generateSnippet(c.name, match);
      return suggestion;
    }
  }, {
    key: 'generateSnippet',
    value: function generateSnippet(name, match) {
      var signature = name;
      if (!match || !match[1] || match[1] === '') {
        // Has no arguments, shouldn't be a snippet, for now
        return signature + '()';
      }
      var args = match[1].split(/, /);
      args = _lodash2['default'].map(args, function (a) {
        if (!a || a.length <= 2) {
          return a;
        }
        if (a.substring(a.length - 2, a.length) === '{}') {
          return a.substring(0, a.length - 1) + '\\}';
        }
        return a;
      });

      if (args.length === 1) {
        return signature + '(${1:' + args[0] + '})';
      }
      var i = 1;
      for (var arg of args) {
        if (i === 1) {
          signature = signature + '(${' + i + ':' + arg + '}';
        } else {
          signature = signature + ', ${' + i + ':' + arg + '}';
        }
        i = i + 1;
      }

      signature = signature + ')';
      return signature;
      // TODO: Emit function's result(s) in snippet, when appropriate
    }
  }]);

  return GocodeProvider;
})();

exports.GocodeProvider = GocodeProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtZ28vbGliL2dvY29kZXByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRWtDLE1BQU07O29CQUN2QixNQUFNOzs7O3NCQUNULFFBQVE7Ozs7QUFKdEIsV0FBVyxDQUFBOztJQU1MLGNBQWM7QUFDTixXQURSLGNBQWMsQ0FDTCxZQUFZLEVBQUUsU0FBUyxFQUFFOzs7MEJBRGxDLGNBQWM7O0FBRWhCLFFBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUE7O0FBRXJCLFFBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUE7QUFDMUIsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFEQUFxRCxDQUFDLENBQUE7QUFDbEcsUUFBSSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQTtBQUMvQixRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRSxRQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlEQUFpRCxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzFHLFlBQUsscUJBQXFCLEdBQUcsb0JBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFDLENBQUMsRUFBSztBQUMvQyxZQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQTtBQUM1QixZQUFJLEdBQUcsQ0FBQyxZQUFNO0FBQ1os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QUcsQ0FBQTtTQUNwRCxNQUFNO0FBQ0wsbUJBQVMsR0FBRyxTQUFTLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtTQUNyRDtBQUNELFNBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO09BQ1Y7O0FBRUQsZUFBUyxHQUFHLFNBQVMsR0FBRyxHQUFHLENBQUE7QUFDM0IsYUFBTyxTQUFTLENBQUE7O0tBRWpCOzs7U0FwUUcsY0FBYzs7O1FBc1FaLGNBQWMsR0FBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtZ28vbGliL2dvY29kZXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCdcblxuY2xhc3MgR29jb2RlUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvciAoZ29jb25maWdGdW5jLCBnb2dldEZ1bmMpIHtcbiAgICB0aGlzLmdvY29uZmlnID0gZ29jb25maWdGdW5jXG4gICAgdGhpcy5nb2dldCA9IGdvZ2V0RnVuY1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLnN1YnNjcmliZXJzID0gW11cblxuICAgIHRoaXMuc2VsZWN0b3IgPSAnLnNvdXJjZS5nbydcbiAgICB0aGlzLmluY2x1c2lvblByaW9yaXR5ID0gMVxuICAgIHRoaXMuZXhjbHVkZUxvd2VyUHJpb3JpdHkgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1nby5zdXBwcmVzc0J1aWx0aW5BdXRvY29tcGxldGVQcm92aWRlcicpXG4gICAgdGhpcy5zdXBwcmVzc0ZvckNoYXJhY3RlcnMgPSBbXVxuICAgIHRoaXMuZGlzYWJsZUZvclNlbGVjdG9yID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtZ28uc2NvcGVCbGFja2xpc3QnKVxuICAgIGxldCBzdXBwcmVzc1N1YnNjcml0aW9uID0gYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLWdvLnN1cHByZXNzQWN0aXZhdGlvbkZvckNoYXJhY3RlcnMnLCAodmFsdWUpID0+IHtcbiAgICAgIHRoaXMuc3VwcHJlc3NGb3JDaGFyYWN0ZXJzID0gXy5tYXAodmFsdWUsIChjKSA9PiB7XG4gICAgICAgIGxldCBjaGFyID0gYyA/IGMudHJpbSgpIDogJydcbiAgICAgICAgY2hhciA9ICgoKSA9PiB7XG4gICAgICAgICAgc3dpdGNoIChmYWxzZSkge1xuICAgICAgICAgICAgY2FzZSBjaGFyLnRvTG93ZXJDYXNlKCkgIT09ICdjb21tYSc6XG4gICAgICAgICAgICAgIHJldHVybiAnLCdcbiAgICAgICAgICAgIGNhc2UgY2hhci50b0xvd2VyQ2FzZSgpICE9PSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgIHJldHVybiAnXFxuJ1xuICAgICAgICAgICAgY2FzZSBjaGFyLnRvTG93ZXJDYXNlKCkgIT09ICdzcGFjZSc6XG4gICAgICAgICAgICAgIHJldHVybiAnICdcbiAgICAgICAgICAgIGNhc2UgY2hhci50b0xvd2VyQ2FzZSgpICE9PSAndGFiJzpcbiAgICAgICAgICAgICAgcmV0dXJuICdcXHQnXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gY2hhclxuICAgICAgICAgIH1cbiAgICAgICAgfSkoKVxuICAgICAgICByZXR1cm4gY2hhclxuICAgICAgfSlcbiAgICAgIHRoaXMuc3VwcHJlc3NGb3JDaGFyYWN0ZXJzID0gXy5jb21wYWN0KHRoaXMuc3VwcHJlc3NGb3JDaGFyYWN0ZXJzKVxuICAgIH0pXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChzdXBwcmVzc1N1YnNjcml0aW9uKVxuICAgIHRoaXMuZnVuY1JlZ2V4ID0gL14oPzpmdW5jWyhdezF9KShbXlxcKV0qKSg/OlspXXsxfSkoPzokfCg/OlxccykoW15cXChdKiQpfCg/OiBbKF17MX0pKFteXFwpXSopKD86WyldezF9KSkvaVxuICB9XG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nb2NvbmZpZyA9IG51bGxcbiAgICB0aGlzLnN1YnNjcmliZXJzID0gbnVsbFxuICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXG4gICAgdGhpcy5pbmNsdXNpb25Qcmlvcml0eSA9IG51bGxcbiAgICB0aGlzLmV4Y2x1ZGVMb3dlclByaW9yaXR5ID0gbnVsbFxuICAgIHRoaXMuc3VwcHJlc3NGb3JDaGFyYWN0ZXJzID0gbnVsbFxuICAgIHRoaXMuZGlzYWJsZUZvclNlbGVjdG9yID0gbnVsbFxuICAgIHRoaXMuZnVuY1JlZ2V4ID0gbnVsbFxuICB9XG5cbiAgcmVhZHkgKCkge1xuICAgIGlmICghdGhpcy5nb2NvbmZpZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGxldCBjb25maWcgPSB0aGlzLmdvY29uZmlnKClcbiAgICBpZiAoIWNvbmZpZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpc1ZhbGlkRWRpdG9yIChlZGl0b3IpIHtcbiAgICBpZiAoIWVkaXRvciB8fCAhZWRpdG9yLmdldEdyYW1tYXIpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBsZXQgZ3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKClcbiAgICBpZiAoIWdyYW1tYXIpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAoZ3JhbW1hci5zY29wZU5hbWUgPT09ICdzb3VyY2UuZ28nKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNoYXJhY3RlcklzU3VwcHJlc3NlZCAoY2hhcikge1xuICAgIHJldHVybiB0aGlzLnN1cHByZXNzRm9yQ2hhcmFjdGVycy5pbmRleE9mKGNoYXIpICE9PSAtMVxuICB9XG5cbiAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHtcbiAgICBsZXQgcCA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoIW9wdGlvbnMgfHwgIXRoaXMucmVhZHkoKSB8fCAhdGhpcy5pc1ZhbGlkRWRpdG9yKG9wdGlvbnMuZWRpdG9yKSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgICBsZXQgY29uZmlnID0gdGhpcy5nb2NvbmZpZygpXG4gICAgICBsZXQgYnVmZmVyID0gb3B0aW9ucy5lZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgIGlmICghYnVmZmVyIHx8ICFvcHRpb25zLmJ1ZmZlclBvc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgIH1cblxuICAgICAgbGV0IGluZGV4ID0gYnVmZmVyLmNoYXJhY3RlckluZGV4Rm9yUG9zaXRpb24ob3B0aW9ucy5idWZmZXJQb3NpdGlvbilcbiAgICAgIGxldCB0ZXh0ID0gb3B0aW9ucy5lZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBpZiAoaW5kZXggPiAwICYmIHRoaXMuY2hhcmFjdGVySXNTdXBwcmVzc2VkKHRleHRbaW5kZXggLSAxXSkpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoKVxuICAgICAgfVxuICAgICAgbGV0IG9mZnNldCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHRleHQuc3Vic3RyaW5nKDAsIGluZGV4KSwgJ3V0ZjgnKVxuXG4gICAgICBsZXQgbG9jYXRvck9wdGlvbnMgPSB7XG4gICAgICAgIGZpbGU6IG9wdGlvbnMuZWRpdG9yLmdldFBhdGgoKSxcbiAgICAgICAgZGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUob3B0aW9ucy5lZGl0b3IuZ2V0UGF0aCgpKVxuICAgICAgfVxuXG4gICAgICBsZXQgYXJncyA9IFsnLWY9anNvbicsICdhdXRvY29tcGxldGUnLCBidWZmZXIuZ2V0UGF0aCgpLCBvZmZzZXRdXG4gICAgICBjb25maWcubG9jYXRvci5maW5kVG9vbCgnZ29jb2RlJywgbG9jYXRvck9wdGlvbnMpLnRoZW4oKGNtZCkgPT4ge1xuICAgICAgICBpZiAoIWNtZCkge1xuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIGxldCBjd2QgPSBwYXRoLmRpcm5hbWUoYnVmZmVyLmdldFBhdGgoKSlcbiAgICAgICAgbGV0IGVudiA9IGNvbmZpZy5lbnZpcm9ubWVudChsb2NhdG9yT3B0aW9ucylcbiAgICAgICAgY29uZmlnLmV4ZWN1dG9yLmV4ZWMoY21kLCBhcmdzLCB7Y3dkOiBjd2QsIGVudjogZW52LCBpbnB1dDogdGV4dH0pLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICBpZiAoci5zdGRlcnIgJiYgci5zdGRlcnIudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2F1dG9jb21wbGV0ZS1nbzogKHN0ZGVycikgJyArIHIuc3RkZXJyKVxuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgbWVzc2FnZXMgPSBbXVxuICAgICAgICAgIGlmIChyLnN0ZG91dCAmJiByLnN0ZG91dC50cmltKCkgIT09ICcnKSB7XG4gICAgICAgICAgICBtZXNzYWdlcyA9IHRoaXMubWFwTWVzc2FnZXMoci5zdGRvdXQsIG9wdGlvbnMuZWRpdG9yLCBvcHRpb25zLmJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIW1lc3NhZ2VzIHx8IG1lc3NhZ2VzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZShtZXNzYWdlcylcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaWYgKHRoaXMuc3Vic2NyaWJlcnMgJiYgdGhpcy5zdWJzY3JpYmVycy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGxldCBzdWJzY3JpYmVyIG9mIHRoaXMuc3Vic2NyaWJlcnMpIHtcbiAgICAgICAgc3Vic2NyaWJlcihwKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcFxuICB9XG5cbiAgb25EaWRHZXRTdWdnZXN0aW9ucyAocykge1xuICAgIGlmICh0aGlzLnN1YnNjcmliZXJzKSB7XG4gICAgICB0aGlzLnN1YnNjcmliZXJzLnB1c2gocylcbiAgICB9XG4gIH1cblxuICBtYXBNZXNzYWdlcyAoZGF0YSwgZWRpdG9yLCBwb3NpdGlvbikge1xuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICAgIGxldCByZXNcbiAgICB0cnkge1xuICAgICAgcmVzID0gSlNPTi5wYXJzZShkYXRhKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlICYmIGUuaGFuZGxlKSB7XG4gICAgICAgIGUuaGFuZGxlKClcbiAgICAgIH1cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignZ29jb2RlIGVycm9yJywge1xuICAgICAgICBkZXRhaWw6IGRhdGEsXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIHJldHVybiBbXVxuICAgIH1cblxuICAgIGxldCBudW1QcmVmaXggPSByZXNbMF1cbiAgICBsZXQgY2FuZGlkYXRlcyA9IHJlc1sxXVxuICAgIGlmICghY2FuZGlkYXRlcykge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICAgIGxldCBwcmVmaXggPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1twb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbiAtIG51bVByZWZpeF0sIHBvc2l0aW9uXSlcbiAgICBsZXQgc3VmZml4ID0gZmFsc2VcbiAgICB0cnkge1xuICAgICAgc3VmZml4ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtwb3NpdGlvbiwgW3Bvc2l0aW9uLnJvdywgcG9zaXRpb24uY29sdW1uICsgMV1dKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgfVxuICAgIGxldCBzdWdnZXN0aW9ucyA9IFtdXG4gICAgZm9yIChsZXQgYyBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICBsZXQgc3VnZ2VzdGlvbiA9IHtcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeCxcbiAgICAgICAgbGVmdExhYmVsOiBjLnR5cGUgfHwgYy5jbGFzcyxcbiAgICAgICAgdHlwZTogdGhpcy50cmFuc2xhdGVUeXBlKGMuY2xhc3MpXG4gICAgICB9XG4gICAgICBpZiAoYy5jbGFzcyA9PT0gJ2Z1bmMnICYmICghc3VmZml4IHx8IHN1ZmZpeCAhPT0gJygnKSkge1xuICAgICAgICBzdWdnZXN0aW9uID0gdGhpcy51cGdyYWRlU3VnZ2VzdGlvbihzdWdnZXN0aW9uLCBjKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3VnZ2VzdGlvbi50ZXh0ID0gYy5uYW1lXG4gICAgICB9XG4gICAgICBpZiAoc3VnZ2VzdGlvbi50eXBlID09PSAncGFja2FnZScpIHtcbiAgICAgICAgc3VnZ2VzdGlvbi5pY29uSFRNTCA9ICc8aSBjbGFzcz1cImljb24tcGFja2FnZVwiPjwvaT4nXG4gICAgICB9XG4gICAgICBzdWdnZXN0aW9ucy5wdXNoKHN1Z2dlc3Rpb24pXG4gICAgfVxuICAgIHJldHVybiBzdWdnZXN0aW9uc1xuICB9XG5cbiAgdHJhbnNsYXRlVHlwZSAodHlwZSkge1xuICAgIGlmICh0eXBlID09PSAnZnVuYycpIHtcbiAgICAgIHJldHVybiAnZnVuY3Rpb24nXG4gICAgfVxuICAgIGlmICh0eXBlID09PSAndmFyJykge1xuICAgICAgcmV0dXJuICd2YXJpYWJsZSdcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09ICdjb25zdCcpIHtcbiAgICAgIHJldHVybiAnY29uc3RhbnQnXG4gICAgfVxuICAgIGlmICh0eXBlID09PSAnUEFOSUMnKSB7XG4gICAgICByZXR1cm4gJ3BhbmljJ1xuICAgIH1cbiAgICByZXR1cm4gdHlwZVxuICB9XG5cbiAgdXBncmFkZVN1Z2dlc3Rpb24gKHN1Z2dlc3Rpb24sIGMpIHtcbiAgICBpZiAoIWMgfHwgIWMudHlwZSB8fCBjLnR5cGUgPT09ICcnKSB7XG4gICAgICByZXR1cm4gc3VnZ2VzdGlvblxuICAgIH1cbiAgICBsZXQgbWF0Y2ggPSB0aGlzLmZ1bmNSZWdleC5leGVjKGMudHlwZSlcbiAgICBpZiAoIW1hdGNoIHx8ICFtYXRjaFswXSkgeyAvLyBOb3QgYSBmdW5jdGlvblxuICAgICAgc3VnZ2VzdGlvbi5zbmlwcGV0ID0gYy5uYW1lICsgJygpJ1xuICAgICAgc3VnZ2VzdGlvbi5sZWZ0TGFiZWwgPSAnJ1xuICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25cbiAgICB9XG4gICAgc3VnZ2VzdGlvbi5sZWZ0TGFiZWwgPSBtYXRjaFsyXSB8fCBtYXRjaFszXSB8fCAnJ1xuICAgIHN1Z2dlc3Rpb24uc25pcHBldCA9IHRoaXMuZ2VuZXJhdGVTbmlwcGV0KGMubmFtZSwgbWF0Y2gpXG4gICAgcmV0dXJuIHN1Z2dlc3Rpb25cbiAgfVxuXG4gIGdlbmVyYXRlU25pcHBldCAobmFtZSwgbWF0Y2gpIHtcbiAgICBsZXQgc2lnbmF0dXJlID0gbmFtZVxuICAgIGlmICghbWF0Y2ggfHwgIW1hdGNoWzFdIHx8IG1hdGNoWzFdID09PSAnJykge1xuICAgICAgLy8gSGFzIG5vIGFyZ3VtZW50cywgc2hvdWxkbid0IGJlIGEgc25pcHBldCwgZm9yIG5vd1xuICAgICAgcmV0dXJuIHNpZ25hdHVyZSArICcoKSdcbiAgICB9XG4gICAgbGV0IGFyZ3MgPSBtYXRjaFsxXS5zcGxpdCgvLCAvKVxuICAgIGFyZ3MgPSBfLm1hcChhcmdzLCAoYSkgPT4ge1xuICAgICAgaWYgKCFhIHx8IGEubGVuZ3RoIDw9IDIpIHtcbiAgICAgICAgcmV0dXJuIGFcbiAgICAgIH1cbiAgICAgIGlmIChhLnN1YnN0cmluZyhhLmxlbmd0aCAtIDIsIGEubGVuZ3RoKSA9PT0gJ3t9Jykge1xuICAgICAgICByZXR1cm4gYS5zdWJzdHJpbmcoMCwgYS5sZW5ndGggLSAxKSArICdcXFxcfSdcbiAgICAgIH1cbiAgICAgIHJldHVybiBhXG4gICAgfSlcblxuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIHNpZ25hdHVyZSArICcoJHsxOicgKyBhcmdzWzBdICsgJ30pJ1xuICAgIH1cbiAgICBsZXQgaSA9IDFcbiAgICBmb3IgKGxldCBhcmcgb2YgYXJncykge1xuICAgICAgaWYgKGkgPT09IDEpIHtcbiAgICAgICAgc2lnbmF0dXJlID0gc2lnbmF0dXJlICsgJygkeycgKyBpICsgJzonICsgYXJnICsgJ30nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWduYXR1cmUgPSBzaWduYXR1cmUgKyAnLCAkeycgKyBpICsgJzonICsgYXJnICsgJ30nXG4gICAgICB9XG4gICAgICBpID0gaSArIDFcbiAgICB9XG5cbiAgICBzaWduYXR1cmUgPSBzaWduYXR1cmUgKyAnKSdcbiAgICByZXR1cm4gc2lnbmF0dXJlXG4gICAgLy8gVE9ETzogRW1pdCBmdW5jdGlvbidzIHJlc3VsdChzKSBpbiBzbmlwcGV0LCB3aGVuIGFwcHJvcHJpYXRlXG4gIH1cbn1cbmV4cG9ydCB7R29jb2RlUHJvdmlkZXJ9XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/autocomplete-go/lib/gocodeprovider.js
