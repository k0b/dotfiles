(function() {
  var Base, CompositeDisposable, Delegato, OperationAbortedError, getEditorState, selectList, settings, vimStateMethods, _,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

  settings = require('./settings');

  selectList = null;

  getEditorState = null;

  vimStateMethods = ["onDidChangeInput", "onDidConfirmInput", "onDidCancelInput", "onDidUnfocusInput", "onDidCommandInput", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidUnfocusSearch", "onDidCommandSearch", "onWillSelectTarget", "onDidSelectTarget", "onDidSetTarget", "onDidFinishOperation", "onDidCancelSelectList", "subscribe", "isMode", "hasCount", "getBlockwiseSelections", "updateSelectionProperties"];

  Base = (function() {
    var registries;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, __slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    function Base(vimState, properties) {
      var hover, _ref, _ref1;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.vimState.hover.setPoint();
      if (hover = (_ref1 = this.hover) != null ? _ref1[settings.get('showHoverOnOperateIcon')] : void 0) {
        this.addHover(hover);
      }
      _.extend(this, properties);
    }

    Base.prototype.isComplete = function() {
      var _ref;
      if (this.isRequireInput() && !this.hasInput()) {
        return false;
      } else if (this.isRequireTarget()) {
        return (_ref = this.getTarget()) != null ? _ref.isComplete() : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.target = null;

    Base.prototype.hasTarget = function() {
      return this.target != null;
    };

    Base.prototype.getTarget = function() {
      return this.target;
    };

    Base.prototype.requireTarget = false;

    Base.prototype.isRequireTarget = function() {
      return this.requireTarget;
    };

    Base.prototype.requireInput = false;

    Base.prototype.isRequireInput = function() {
      return this.requireInput;
    };

    Base.prototype.recordable = false;

    Base.prototype.isRecordable = function() {
      return this.recordable;
    };

    Base.prototype.repeated = false;

    Base.prototype.isRepeated = function() {
      return this.repeated;
    };

    Base.prototype.setRepeated = function() {
      return this.repeated = true;
    };

    Base.prototype.operator = null;

    Base.prototype.hasOperator = function() {
      return this.operator != null;
    };

    Base.prototype.getOperator = function() {
      return this.operator;
    };

    Base.prototype.setOperator = function(operator) {
      this.operator = operator;
      return this.operator;
    };

    Base.prototype.isAsOperatorTarget = function() {
      return this.hasOperator() && !this.getOperator()["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
      throw new OperationAbortedError();
    };

    Base.prototype.defaultCount = 1;

    Base.prototype.getDefaultCount = function() {
      return this.defaultCount;
    };

    Base.prototype.getCount = function() {
      var _ref;
      return this.count != null ? this.count : this.count = (_ref = this.vimState.getCount()) != null ? _ref : this.getDefaultCount();
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.getDefaultCount();
    };

    Base.prototype.countTimes = function(fn) {
      var count;
      count = this.getCount();
      return _.times(count, function(i) {
        var isFinal, num;
        isFinal = (num = i + 1) === count;
        return fn(num, isFinal);
      });
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.addHover = function(text, _arg) {
      var replace;
      replace = (_arg != null ? _arg : {}).replace;
      if (settings.get('showHoverOnOperate')) {
        if (replace != null ? replace : false) {
          return this.vimState.hover.replaceLastSection(text);
        } else {
          return this.vimState.hover.add(text);
        }
      }
    };

    Base.prototype["new"] = function(name, properties) {
      var klass;
      if (properties == null) {
        properties = {};
      }
      klass = Base.getClass(name);
      return new klass(this.vimState, properties);
    };

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel();
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (selectList == null) {
        selectList = require('./select-list');
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.hasInput = function() {
      return this.input != null;
    };

    Base.prototype.getInput = function() {
      return this.input;
    };

    Base.prototype.focusInput = function(options) {
      var replace;
      if (options == null) {
        options = {};
      }
      if (options.charsMax == null) {
        options.charsMax = 1;
      }
      this.onDidConfirmInput((function(_this) {
        return function(input) {
          _this.input = input;
          return _this.processOperation();
        };
      })(this));
      replace = false;
      this.onDidChangeInput((function(_this) {
        return function(input) {
          _this.addHover(input, {
            replace: replace
          });
          return replace = true;
        };
      })(this));
      this.onDidCancelInput((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      return this.vimState.input.focus(options);
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this["instanceof"]('Operator');
    };

    Base.prototype.isMotion = function() {
      return this["instanceof"]('Motion');
    };

    Base.prototype.isTextObject = function() {
      return this["instanceof"]('TextObject');
    };

    Base.prototype.getName = function() {
      return this.constructor.name;
    };

    Base.prototype.toString = function() {
      var str;
      str = this.getName();
      if (this.hasTarget()) {
        str += ", target=" + (this.getTarget().toString());
      }
      return str;
    };

    Base.prototype.emitWillSelectTarget = function() {
      return this.vimState.emitter.emit('will-select-target');
    };

    Base.prototype.emitDidSelectTarget = function() {
      return this.vimState.emitter.emit('did-select-target');
    };

    Base.prototype.emitDidSetTarget = function(operator) {
      return this.vimState.emitter.emit('did-set-target', operator);
    };

    Base.init = function(service) {
      var klass, lib, __, _i, _len, _ref, _ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      _ref = ['./operator', './motion', './text-object', './insert-mode', './misc-command'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lib = _ref[_i];
        require(lib);
      }
      _ref1 = this.getRegistries();
      for (__ in _ref1) {
        klass = _ref1[__];
        if (klass.isCommand()) {
          this.subscriptions.add(klass.registerCommand());
        }
      }
      return this.subscriptions;
    };

    Base.reset = function() {
      var klass, __, _ref, _results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      _ref = this.getRegistries();
      _results = [];
      for (__ in _ref) {
        klass = _ref[__];
        if (klass.isCommand()) {
          _results.push(this.subscriptions.add(klass.registerCommand()));
        }
      }
      return _results;
    };

    registries = {
      Base: Base
    };

    Base.extend = function(command) {
      this.command = command != null ? command : true;
      if ((name in registries) && (!this.suppressWarning)) {
        console.warn("Duplicate constructor " + this.name);
      }
      return registries[this.name] = this;
    };

    Base.getClass = function(name) {
      var klass;
      if (klass = registries[name]) {
        return klass;
      } else {
        throw new Error("class '" + name + "' not found");
      }
    };

    Base.getRegistries = function() {
      return registries;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _.dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _.dasherize(this.name);
    };

    Base.commandScope = 'atom-text-editor';

    Base.getCommandScope = function() {
      return this.commandScope;
    };

    Base.description;

    Base.getDesctiption = function() {
      if (this.hasOwnProperty("description")) {
        return this.description;
      } else {
        return null;
      }
    };

    Base.registerCommand = function() {
      return atom.commands.add(this.getCommandScope(), this.getCommandName(), (function(_this) {
        return function() {
          return _this.run();
        };
      })(this));
    };

    Base.run = function() {
      var vimState;
      if (vimState = getEditorState(atom.workspace.getActiveTextEditor())) {
        return vimState.operationStack.run(this);
      }
    };

    return Base;

  })();

  OperationAbortedError = (function(_super) {
    __extends(OperationAbortedError, _super);

    OperationAbortedError.extend(false);

    function OperationAbortedError(message) {
      this.message = message;
      this.name = 'OperationAborted Error';
    }

    return OperationAbortedError;

  })(Base);

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9IQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLElBTGIsQ0FBQTs7QUFBQSxFQU1BLGNBQUEsR0FBaUIsSUFOakIsQ0FBQTs7QUFBQSxFQVFBLGVBQUEsR0FBa0IsQ0FDaEIsa0JBRGdCLEVBRWhCLG1CQUZnQixFQUdoQixrQkFIZ0IsRUFJaEIsbUJBSmdCLEVBS2hCLG1CQUxnQixFQU1oQixtQkFOZ0IsRUFPaEIsb0JBUGdCLEVBUWhCLG1CQVJnQixFQVNoQixvQkFUZ0IsRUFVaEIsb0JBVmdCLEVBV2hCLG9CQVhnQixFQVloQixtQkFaZ0IsRUFhaEIsZ0JBYmdCLEVBY2hCLHNCQWRnQixFQWVoQix1QkFmZ0IsRUFnQmhCLFdBaEJnQixFQWlCaEIsUUFqQmdCLEVBa0JoQixVQWxCZ0IsRUFtQmhCLHdCQW5CZ0IsRUFvQmhCLDJCQXBCZ0IsQ0FSbEIsQ0FBQTs7QUFBQSxFQStCTTtBQUNKLFFBQUEsVUFBQTs7QUFBQSxJQUFBLFFBQVEsQ0FBQyxXQUFULENBQXFCLElBQXJCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLElBQUMsQ0FBQSxnQkFBRCxhQUFrQixhQUFBLGVBQUEsQ0FBQSxRQUFvQixDQUFBO0FBQUEsTUFBQSxVQUFB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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/lib/base.coffee
