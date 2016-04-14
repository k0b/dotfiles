(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, Hover, InputElement, MarkManager, ModeManager, OperationStack, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, getVisibleBufferRange, globalState, haveSomeSelection, highlightRanges, packageScope, settings, swrap, _, _ref, _ref1, _ref2,
    __slice = [].slice;

  Delegato = require('delegato');

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  settings = require('./settings');

  globalState = require('./global-state');

  Hover = require('./hover').Hover;

  _ref1 = require('./input'), InputElement = _ref1.InputElement, SearchInputElement = _ref1.SearchInputElement;

  _ref2 = require('./utils'), haveSomeSelection = _ref2.haveSomeSelection, highlightRanges = _ref2.highlightRanges, getVisibleBufferRange = _ref2.getVisibleBufferRange;

  swrap = require('./selection-wrapper');

  OperationStack = require('./operation-stack');

  MarkManager = require('./mark-manager');

  ModeManager = require('./mode-manager');

  RegisterManager = require('./register-manager');

  SearchHistoryManager = require('./search-history-manager');

  CursorStyleManager = require('./cursor-style-manager');

  BlockwiseSelection = null;

  packageScope = 'vim-mode-plus';

  module.exports = VimState = (function() {
    Delegato.includeInto(VimState);

    VimState.prototype.destroyed = false;

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    function VimState(main, editor, statusBarManager) {
      this.main = main;
      this.editor = editor;
      this.statusBarManager = statusBarManager;
      this.editorElement = atom.views.getView(this.editor);
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.mark = new MarkManager(this);
      this.register = new RegisterManager(this);
      this.hover = new Hover(this);
      this.hoverSearchCounter = new Hover(this);
      this.searchHistory = new SearchHistoryManager(this);
      this.input = new InputElement().initialize(this);
      this.searchInput = new SearchInputElement().initialize(this);
      this.operationStack = new OperationStack(this);
      this.cursorStyleManager = new CursorStyleManager(this);
      this.blockwiseSelections = [];
      this.observeSelection();
      this.highlightSearchSubscription = this.editorElement.onDidChangeScrollTop((function(_this) {
        return function() {
          return _this.refreshHighlightSearch();
        };
      })(this));
      this.editorElement.classList.add(packageScope);
      if (settings.get('startInInsertMode')) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
    }

    VimState.prototype.subscribe = function() {
      var args, _ref3;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref3 = this.operationStack).subscribe.apply(_ref3, args);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return this.blockwiseSelections;
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return _.last(this.blockwiseSelections);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return this.getBlockwiseSelections().sort(function(a, b) {
        return a.getStartSelection().compare(b.getStartSelection());
      });
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      return this.blockwiseSelections = [];
    };

    VimState.prototype.addBlockwiseSelectionFromSelection = function(selection) {
      if (BlockwiseSelection == null) {
        BlockwiseSelection = require('./blockwise-selection');
      }
      return this.blockwiseSelections.push(new BlockwiseSelection(selection));
    };

    VimState.prototype.selectBlockwise = function() {
      var selection, _i, _len, _ref3;
      _ref3 = this.editor.getSelections();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        selection = _ref3[_i];
        this.addBlockwiseSelectionFromSelection(selection);
      }
      return this.updateSelectionProperties();
    };

    VimState.prototype.selectLinewise = function() {
      return swrap.expandOverLine(this.editor, {
        preserveGoalColumn: true
      });
    };

    VimState.prototype.count = null;

    VimState.prototype.hasCount = function() {
      return this.count != null;
    };

    VimState.prototype.getCount = function() {
      return this.count;
    };

    VimState.prototype.setCount = function(number) {
      if (this.count == null) {
        this.count = 0;
      }
      this.count = (this.count * 10) + number;
      this.hover.add(number);
      return this.updateEditorElement();
    };

    VimState.prototype.resetCount = function() {
      this.count = null;
      return this.updateEditorElement();
    };

    VimState.prototype.updateEditorElement = function() {
      this.editorElement.classList.toggle('with-count', this.hasCount());
      return this.editorElement.classList.toggle('with-register', this.register.hasName());
    };

    VimState.prototype.onDidChangeInput = function(fn) {
      return this.subscribe(this.input.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmInput = function(fn) {
      return this.subscribe(this.input.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelInput = function(fn) {
      return this.subscribe(this.input.onDidCancel(fn));
    };

    VimState.prototype.onDidUnfocusInput = function(fn) {
      return this.subscribe(this.input.onDidUnfocus(fn));
    };

    VimState.prototype.onDidCommandInput = function(fn) {
      return this.subscribe(this.input.onDidCommand(fn));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidUnfocusSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidUnfocus(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.onDidFailToSetTarget = function(fn) {
      return this.emitter.on('did-fail-to-set-target', fn);
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.destroy = function() {
      var _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.activate('normal');
        if ((_ref3 = this.editorElement.component) != null) {
          _ref3.setInputEnabled(true);
        }
        this.editorElement.classList.remove(packageScope, 'normal-mode');
      }
      if ((_ref4 = this.hover) != null) {
        if (typeof _ref4.destroy === "function") {
          _ref4.destroy();
        }
      }
      if ((_ref5 = this.hoverSearchCounter) != null) {
        if (typeof _ref5.destroy === "function") {
          _ref5.destroy();
        }
      }
      if ((_ref6 = this.operationStack) != null) {
        if (typeof _ref6.destroy === "function") {
          _ref6.destroy();
        }
      }
      if ((_ref7 = this.searchHistory) != null) {
        if (typeof _ref7.destroy === "function") {
          _ref7.destroy();
        }
      }
      if ((_ref8 = this.cursorStyleManager) != null) {
        if (typeof _ref8.destroy === "function") {
          _ref8.destroy();
        }
      }
      if ((_ref9 = this.input) != null) {
        if (typeof _ref9.destroy === "function") {
          _ref9.destroy();
        }
      }
      if ((_ref10 = this.search) != null) {
        if (typeof _ref10.destroy === "function") {
          _ref10.destroy();
        }
      }
      if ((_ref11 = this.modeManager) != null) {
        if (typeof _ref11.destroy === "function") {
          _ref11.destroy();
        }
      }
      if ((_ref12 = this.operationRecords) != null) {
        if (typeof _ref12.destroy === "function") {
          _ref12.destroy();
        }
      }
      ((_ref13 = this.register) != null ? _ref13.destroy : void 0) != null;
      this.clearHighlightSearch();
      if ((_ref14 = this.highlightSearchSubscription) != null) {
        _ref14.dispose();
      }
      _ref15 = {}, this.hover = _ref15.hover, this.hoverSearchCounter = _ref15.hoverSearchCounter, this.operationStack = _ref15.operationStack, this.searchHistory = _ref15.searchHistory, this.cursorStyleManager = _ref15.cursorStyleManager, this.input = _ref15.input, this.search = _ref15.search, this.modeManager = _ref15.modeManager, this.operationRecords = _ref15.operationRecords, this.register = _ref15.register, this.count = _ref15.count, this.editor = _ref15.editor, this.editorElement = _ref15.editorElement, this.subscriptions = _ref15.subscriptions, this.highlightSearchSubscription = _ref15.highlightSearchSubscription;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.observeSelection = function() {
      var handleMouseDown, handleMouseUp, handleSelectionChange, selectionWatcher;
      handleSelectionChange = (function(_this) {
        return function() {
          if (_this.editor == null) {
            return;
          }
          if (_this.operationStack.isProcessing()) {
            return;
          }
          if (haveSomeSelection(_this.editor)) {
            if (_this.isMode('normal')) {
              return _this.activate('visual', 'characterwise');
            }
          } else {
            if (_this.isMode('visual')) {
              return _this.activate('normal');
            }
          }
        };
      })(this);
      selectionWatcher = null;
      handleMouseDown = (function(_this) {
        return function() {
          var point, tailRange;
          if (selectionWatcher != null) {
            selectionWatcher.dispose();
          }
          point = _this.editor.getLastCursor().getBufferPosition();
          tailRange = Range.fromPointWithDelta(point, 0, +1);
          return selectionWatcher = _this.editor.onDidChangeSelectionRange(function(_arg) {
            var selection;
            selection = _arg.selection;
            handleSelectionChange();
            selection.setBufferRange(selection.getBufferRange().union(tailRange));
            return _this.updateCursorsVisibility();
          });
        };
      })(this);
      handleMouseUp = function() {
        if (selectionWatcher != null) {
          selectionWatcher.dispose();
        }
        return selectionWatcher = null;
      };
      this.editorElement.addEventListener('mousedown', handleMouseDown);
      this.editorElement.addEventListener('mouseup', handleMouseUp);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          _this.editorElement.removeEventListener('mousedown', handleMouseDown);
          return _this.editorElement.removeEventListener('mouseup', handleMouseUp);
        };
      })(this)));
      return this.subscriptions.add(atom.commands.onDidDispatch((function(_this) {
        return function(_arg) {
          var target, type;
          target = _arg.target, type = _arg.type;
          if (target === _this.editorElement && !type.startsWith('vim-mode-plus:')) {
            if (selectionWatcher == null) {
              return handleSelectionChange();
            }
          }
        };
      })(this)));
    };

    VimState.prototype.resetNormalMode = function() {
      this.editor.clearSelections();
      return this.activate('normal');
    };

    VimState.prototype.reset = function() {
      this.resetCount();
      this.register.reset();
      this.searchHistory.reset();
      this.hover.reset();
      return this.operationStack.reset();
    };

    VimState.prototype.updateCursorsVisibility = function() {
      return this.cursorStyleManager.refresh();
    };

    VimState.prototype.updateSelectionProperties = function() {
      var selection, _i, _len, _ref3, _results;
      _ref3 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        selection = _ref3[_i];
        _results.push(swrap(selection).preserveCharacterwise(this.editor));
      }
      return _results;
    };

    VimState.prototype.clearHighlightSearch = function() {
      var marker, _i, _len, _ref3, _ref4;
      _ref4 = (_ref3 = this.highlightSearchMarkers) != null ? _ref3 : [];
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        marker = _ref4[_i];
        marker.destroy();
      }
      return this.highlightSearchMarkers = null;
    };

    VimState.prototype.highlightSearch = function() {
      var pattern, ranges, scanRange;
      scanRange = getVisibleBufferRange(this.editor);
      pattern = globalState.highlightSearchPattern;
      ranges = [];
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range;
        range = _arg.range;
        return ranges.push(range);
      });
      return highlightRanges(this.editor, ranges, {
        "class": 'vim-mode-plus-highlight-search'
      });
    };

    VimState.prototype.refreshHighlightSearch = function() {
      var endRow, startRow, _ref3;
      _ref3 = this.editorElement.getVisibleRowRange(), startRow = _ref3[0], endRow = _ref3[1];
      if (!((startRow != null) && (endRow != null))) {
        return;
      }
      if (this.highlightSearchMarkers) {
        this.clearHighlightSearch();
      }
      if (settings.get('highlightSearch') && (globalState.highlightSearchPattern != null)) {
        return this.highlightSearchMarkers = this.highlightSearch();
      }
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbVdBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLE9BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMsZUFBQSxPQUFELEVBQVUsa0JBQUEsVUFBVixFQUFzQiwyQkFBQSxtQkFBdEIsRUFBMkMsYUFBQSxLQUYzQyxDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSlgsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FMZCxDQUFBOztBQUFBLEVBTUMsUUFBUyxPQUFBLENBQVEsU0FBUixFQUFULEtBTkQsQ0FBQTs7QUFBQSxFQU9BLFFBQXFDLE9BQUEsQ0FBUSxTQUFSLENBQXJDLEVBQUMscUJBQUEsWUFBRCxFQUFlLDJCQUFBLGtCQVBmLENBQUE7O0FBQUEsRUFRQSxRQUE4RCxPQUFBLENBQVEsU0FBUixDQUE5RCxFQUFDLDBCQUFBLGlCQUFELEVBQW9CLHdCQUFBLGVBQXBCLEVBQXFDLDhCQUFBLHFCQVJyQyxDQUFBOztBQUFBLEVBU0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQVRSLENBQUE7O0FBQUEsRUFXQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUixDQVhqQixDQUFBOztBQUFBLEVBWUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQVpkLENBQUE7O0FBQUEsRUFhQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENB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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/lib/vim-state.coffee
