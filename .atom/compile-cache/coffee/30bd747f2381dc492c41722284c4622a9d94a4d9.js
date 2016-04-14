(function() {
  var Base, CompositeDisposable, Disposable, Emitter, Hover, HoverElement, StatusBarManager, VimState, getVisibleEditors, globalState, poliyFillsTextBufferHistory, settings, _, _ref, _ref1, _ref2;

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  StatusBarManager = require('./status-bar-manager');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  _ref1 = require('./hover'), Hover = _ref1.Hover, HoverElement = _ref1.HoverElement;

  _ref2 = require('./utils'), getVisibleEditors = _ref2.getVisibleEditors, poliyFillsTextBufferHistory = _ref2.poliyFillsTextBufferHistory;

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var developer, workspaceElement;
      this.subscriptions = new CompositeDisposable;
      this.statusBarManager = new StatusBarManager;
      this.vimStatesByEditor = new Map;
      this.emitter = new Emitter;
      this.registerViewProviders();
      this.subscribe(Base.init(this.provideVimModePlus()));
      this.registerCommands();
      this.registerVimStateCommands();
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(this.provideVimModePlus()));
      }
      this.subscribe(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorSubscriptions, vimState;
          if (editor.isMini()) {
            return;
          }
          if (history.getChangesSinceCheckpoint == null) {
            poliyFillsTextBufferHistory(editor.getBuffer().history);
          }
          vimState = new VimState(_this, editor, _this.statusBarManager);
          _this.vimStatesByEditor.set(editor, vimState);
          editorSubscriptions = new CompositeDisposable;
          editorSubscriptions.add(editor.onDidDestroy(function() {
            _this.unsubscribe(editorSubscriptions);
            vimState.destroy();
            return _this.vimStatesByEditor["delete"](editor);
          }));
          editorSubscriptions.add(editor.onDidStopChanging(function() {
            return vimState.refreshHighlightSearch();
          }));
          return _this.subscribe(editorSubscriptions);
        };
      })(this)));
      workspaceElement = atom.views.getView(atom.workspace);
      this.subscribe(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var selector, _base, _ref3;
          selector = 'vim-mode-plus-pane-maximized';
          workspaceElement.classList.remove(selector);
          if (typeof (_base = atom.workspace).isTextEditor === "function" ? _base.isTextEditor(item) : void 0) {
            return (_ref3 = _this.getEditorState(item)) != null ? _ref3.refreshHighlightSearch() : void 0;
          }
        };
      })(this)));
      this.onDidSetHighlightSearchPattern((function(_this) {
        return function() {
          return _this.refreshHighlightSearchForVisibleEditors();
        };
      })(this));
      return this.subscribe(settings.observe('highlightSearch', (function(_this) {
        return function(newValue) {
          if (newValue) {
            return _this.refreshHighlightSearchForVisibleEditors();
          } else {
            return _this.clearHighlightSearchForEditors();
          }
        };
      })(this)));
    },
    onDidSetHighlightSearchPattern: function(fn) {
      return this.emitter.on('did-set-highlight-search-pattern', fn);
    },
    emitDidSetHighlightSearchPattern: function(fn) {
      return this.emitter.emit('did-set-highlight-search-pattern');
    },
    refreshHighlightSearchForVisibleEditors: function() {
      var editor, _i, _len, _ref3, _results;
      _ref3 = getVisibleEditors();
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        _results.push(this.getEditorState(editor).refreshHighlightSearch());
      }
      return _results;
    },
    clearHighlightSearchForEditors: function() {
      var editor, _i, _len, _ref3, _results;
      _ref3 = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        _results.push(this.getEditorState(editor).clearHighlightSearch());
      }
      return _results;
    },
    deactivate: function() {
      this.subscriptions.dispose();
      return this.vimStatesByEditor.forEach(function(vimState) {
        return vimState.destroy();
      });
    },
    subscribe: function(arg) {
      return this.subscriptions.add(arg);
    },
    unsubscribe: function(arg) {
      if (typeof arg.dispose === "function") {
        arg.dispose();
      }
      return this.subscriptions.remove(arg);
    },
    registerCommands: function() {
      return this.subscribe(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus:clear-highlight-search': (function(_this) {
          return function() {
            _this.clearHighlightSearchForEditors();
            return globalState.highlightSearchPattern = null;
          };
        })(this),
        'vim-mode-plus:toggle-highlight-search': function() {
          return settings.toggle('highlightSearch');
        }
      }));
    },
    registerVimStateCommands: function() {
      var commands, fn, name, scope, _results;
      commands = {
        'activate-normal-mode': function() {
          return this.activate('normal');
        },
        'activate-linewise-visual-mode': function() {
          return this.activate('visual', 'linewise');
        },
        'activate-characterwise-visual-mode': function() {
          return this.activate('visual', 'characterwise');
        },
        'activate-blockwise-visual-mode': function() {
          return this.activate('visual', 'blockwise');
        },
        'reset-normal-mode': function() {
          return this.resetNormalMode();
        },
        'set-register-name': function() {
          return this.register.setName();
        },
        'set-count-0': function() {
          return this.setCount(0);
        },
        'set-count-1': function() {
          return this.setCount(1);
        },
        'set-count-2': function() {
          return this.setCount(2);
        },
        'set-count-3': function() {
          return this.setCount(3);
        },
        'set-count-4': function() {
          return this.setCount(4);
        },
        'set-count-5': function() {
          return this.setCount(5);
        },
        'set-count-6': function() {
          return this.setCount(6);
        },
        'set-count-7': function() {
          return this.setCount(7);
        },
        'set-count-8': function() {
          return this.setCount(8);
        },
        'set-count-9': function() {
          return this.setCount(9);
        }
      };
      scope = 'atom-text-editor:not([mini])';
      _results = [];
      for (name in commands) {
        fn = commands[name];
        _results.push((function(_this) {
          return function(fn) {
            return _this.subscribe(atom.commands.add(scope, "vim-mode-plus:" + name, function(event) {
              var editor;
              if (editor = atom.workspace.getActiveTextEditor()) {
                return fn.call(_this.getEditorState(editor));
              }
            }));
          };
        })(this)(fn));
      }
      return _results;
    },
    registerViewProviders: function() {
      var addView;
      addView = atom.views.addViewProvider.bind(atom.views);
      return addView(Hover, function(model) {
        return new HoverElement().initialize(model);
      });
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    },
    getGlobalState: function() {
      return globalState;
    },
    getEditorState: function(editor) {
      return this.vimStatesByEditor.get(editor);
    },
    provideVimModePlus: function() {
      return {
        Base: Base,
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZMQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxPQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLGtCQUFBLFVBQUQsRUFBYSxlQUFBLE9BQWIsRUFBc0IsMkJBQUEsbUJBRnRCLENBQUE7O0FBQUEsRUFJQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FKUCxDQUFBOztBQUFBLEVBS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSLENBTG5CLENBQUE7O0FBQUEsRUFNQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBTmQsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVBYLENBQUE7O0FBQUEsRUFRQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FSWCxDQUFBOztBQUFBLEVBU0EsUUFBd0IsT0FBQSxDQUFRLFNBQVIsQ0FBeEIsRUFBQyxjQUFBLEtBQUQsRUFBUSxxQkFBQSxZQVRSLENBQUE7O0FBQUEsRUFVQSxRQUFtRCxPQUFBLENBQVEsU0FBUixDQUFuRCxFQUFDLDBCQUFBLGlCQUFELEVBQW9CLG9DQUFBLDJCQVZwQixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLFFBQVEsQ0FBQyxNQUFqQjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFD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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/lib/main.coffee
