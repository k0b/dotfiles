(function() {
  var CompositeDisposable, CursorStyleManager, Disposable, Point, getCursorNode, getOffset, isSpecMode, lineHeight, setStyle, settings, swrap, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Point = _ref.Point, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  settings = require('./settings');

  swrap = require('./selection-wrapper');

  isSpecMode = atom.inSpecMode();

  lineHeight = null;

  getCursorNode = function(editorElement, cursor) {
    var cursorsComponent;
    cursorsComponent = editorElement.component.linesComponent.cursorsComponent;
    return cursorsComponent.cursorNodesById[cursor.id];
  };

  getOffset = function(submode, cursor, isSoftWrapped) {
    var bufferPoint, editor, endRow, screenPoint, selection, startRow, traversal, _ref1;
    selection = cursor.selection, editor = cursor.editor;
    traversal = new Point(0, 0);
    switch (submode) {
      case 'characterwise':
      case 'blockwise':
        if (!selection.isReversed() && !cursor.isAtBeginningOfLine()) {
          traversal.column -= 1;
        }
        break;
      case 'linewise':
        bufferPoint = swrap(selection).getCharacterwiseHeadPosition();
        _ref1 = selection.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
        if (selection.isReversed()) {
          bufferPoint.row = startRow;
        }
        traversal = isSoftWrapped ? (screenPoint = editor.screenPositionForBufferPosition(bufferPoint), screenPoint.traversalFrom(cursor.getScreenPosition())) : bufferPoint.traversalFrom(cursor.getBufferPosition());
    }
    if (!selection.isReversed() && cursor.isAtBeginningOfLine() && submode !== 'blockwise') {
      traversal.row = -1;
    }
    return traversal;
  };

  setStyle = function(style, _arg) {
    var column, row;
    row = _arg.row, column = _arg.column;
    if (row !== 0) {
      style.setProperty('top', "" + (row * lineHeight) + "em");
    }
    if (column !== 0) {
      style.setProperty('left', "" + column + "ch");
    }
    return new Disposable(function() {
      style.removeProperty('top');
      return style.removeProperty('left');
    });
  };

  CursorStyleManager = (function() {
    function CursorStyleManager(vimState) {
      var _ref1;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editorElement = _ref1.editorElement, this.editor = _ref1.editor;
      this.lineHeightObserver = atom.config.observe('editor.lineHeight', (function(_this) {
        return function(newValue) {
          lineHeight = newValue;
          return _this.refresh();
        };
      })(this));
    }

    CursorStyleManager.prototype.destroy = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      this.lineHeightObserver.dispose();
      return _ref2 = {}, this.subscriptions = _ref2.subscriptions, this.lineHeightObserver = _ref2.lineHeightObserver, _ref2;
    };

    CursorStyleManager.prototype.refresh = function() {
      var cursor, cursorNode, cursors, cursorsToShow, isSoftWrapped, submode, _i, _j, _len, _len1, _ref1, _results;
      submode = this.vimState.submode;
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      this.subscriptions = new CompositeDisposable;
      if (!(this.vimState.isMode('visual') && settings.get('showCursorInVisualMode'))) {
        return;
      }
      cursors = cursorsToShow = this.editor.getCursors();
      if (submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      }
      for (_i = 0, _len = cursors.length; _i < _len; _i++) {
        cursor = cursors[_i];
        if (__indexOf.call(cursorsToShow, cursor) >= 0) {
          if (!cursor.isVisible()) {
            cursor.setVisible(true);
          }
        } else {
          if (cursor.isVisible()) {
            cursor.setVisible(false);
          }
        }
      }
      this.editorElement.component.updateSync();
      if (isSpecMode) {
        return;
      }
      isSoftWrapped = this.editor.isSoftWrapped();
      _results = [];
      for (_j = 0, _len1 = cursorsToShow.length; _j < _len1; _j++) {
        cursor = cursorsToShow[_j];
        if (cursorNode = getCursorNode(this.editorElement, cursor)) {
          _results.push(this.subscriptions.add(setStyle(cursorNode.style, getOffset(submode, cursor, isSoftWrapped))));
        }
      }
      return _results;
    };

    return CursorStyleManager;

  })();

  module.exports = CursorStyleManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2SUFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsT0FBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxhQUFBLEtBQUQsRUFBUSxrQkFBQSxVQUFSLEVBQW9CLDJCQUFBLG1CQUFwQixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FIUixDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FKYixDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLElBTGIsQ0FBQTs7QUFBQSxFQU9BLGFBQUEsR0FBZ0IsU0FBQyxhQUFELEVBQWdCLE1BQWhCLEdBQUE7QUFDZCxRQUFBLGdCQUFBO0FBQUEsSUFBQSxnQkFBQSxHQUFtQixhQUFhLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxnQkFBMUQsQ0FBQTtXQUNBLGdCQUFnQixDQUFDLGVBQWdCLENBQUEsTUFBTSxDQUFDLEVBQVAsRUFGbkI7RUFBQSxDQVBoQixDQUFBOztBQUFBLEVBYUEsU0FBQSxHQUFZLFNBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsYUFBbEIsR0FBQTtBQUNWLFFBQUEsK0VBQUE7QUFBQSxJQUFDLG1CQUFBLFNBQUQsRUFBWSxnQkFBQSxNQUFaLENBQUE7QUFBQSxJQUNBLFNBQUEsR0FBZ0IsSUFBQSxLQUFBLENBQU0sQ0FBTixFQUFTLENBQVQsQ0FEaEIsQ0FBQTtBQUVBLFlBQU8sT0FBUDtBQUFBLFdBQ08sZUFEUDtBQUFBLFdBQ3dCLFdBRHhC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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/lib/cursor-style-manager.coffee
