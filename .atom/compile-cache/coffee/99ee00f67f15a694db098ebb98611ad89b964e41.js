(function() {
  var dispatch, highlightSearch, indentGuide, lineNumbers, moveToLine, moveToLineByPercent, q, qall, showInvisible, softWrap, split, toggleConfig, vsplit, w, wq, wqall;

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  w = function(_arg) {
    var editor;
    editor = _arg.editor;
    return editor.save();
  };

  q = function(_arg) {
    var editorElement;
    editorElement = _arg.editorElement;
    return atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
  };

  qall = function() {
    var item, _i, _len, _ref, _results;
    _ref = atom.workspace.getPaneItems();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _results.push(atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow());
    }
    return _results;
  };

  wqall = function() {
    var editor, _i, _len, _ref;
    _ref = atom.workspace.getTextEditors();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      editor = _ref[_i];
      if (editor.isModified()) {
        w({
          editor: editor
        });
      }
    }
    return qall();
  };

  wq = function(_arg) {
    var editor, editorElement;
    editor = _arg.editor, editorElement = _arg.editorElement;
    editor.save();
    return atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
  };

  split = function(_arg) {
    var editor, editorElement;
    editor = _arg.editor, editorElement = _arg.editorElement;
    return dispatch(editorElement, 'pane:split-down');
  };

  vsplit = function(_arg) {
    var editor, editorElement;
    editor = _arg.editor, editorElement = _arg.editorElement;
    return dispatch(editorElement, 'pane:split-right');
  };

  toggleConfig = function(param) {
    var value;
    value = atom.config.get(param);
    return atom.config.set(param, !value);
  };

  showInvisible = function() {
    return toggleConfig('editor.showInvisibles');
  };

  highlightSearch = function() {
    return toggleConfig('vim-mode-plus.highlightSearch');
  };

  softWrap = function(_arg) {
    var editorElement;
    editorElement = _arg.editorElement;
    return dispatch(editorElement, 'editor:toggle-soft-wrap');
  };

  indentGuide = function(_arg) {
    var editorElement;
    editorElement = _arg.editorElement;
    return dispatch(editorElement, 'editor:toggle-indent-guide');
  };

  lineNumbers = function(_arg) {
    var editorElement;
    editorElement = _arg.editorElement;
    return dispatch(editorElement, 'editor:toggle-line-numbers');
  };

  moveToLine = function(vimState, count) {
    vimState.setCount(count);
    return vimState.operationStack.run('MoveToFirstLine');
  };

  moveToLineByPercent = function(vimState, count) {
    vimState.setCount(count);
    return vimState.operationStack.run('MoveToLineByPercent');
  };

  module.exports = {
    normalCommands: {
      w: w,
      wq: wq,
      wqall: wqall,
      q: q,
      qall: qall,
      split: split,
      vsplit: vsplit
    },
    toggleCommands: {
      showInvisible: showInvisible,
      softWrap: softWrap,
      indentGuide: indentGuide,
      lineNumbers: lineNumbers,
      highlightSearch: highlightSearch
    },
    numberCommands: {
      moveToLine: moveToLine,
      moveToLineByPercent: moveToLineByPercent
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMtZXgtbW9kZS9saWIvY29tbWFuZHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBRUE7QUFBQSxNQUFBLGlLQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLFNBQUMsTUFBRCxFQUFTLE9BQVQsR0FBQTtXQUNULElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixNQUF2QixFQUErQixPQUEvQixFQURTO0VBQUEsQ0FBWCxDQUFBOztBQUFBLEVBS0EsQ0FBQSxHQUFJLFNBQUMsSUFBRCxHQUFBO0FBQ0YsUUFBQSxNQUFBO0FBQUEsSUFESSxTQUFELEtBQUMsTUFDSixDQUFBO1dBQUEsTUFBTSxDQUFDLElBQVAsQ0FBQSxFQURFO0VBQUEsQ0FMSixDQUFBOztBQUFBLEVBUUEsQ0FBQSxHQUFJLFNBQUMsSUFBRCxHQUFBO0FBQ0YsUUFBQSxhQUFBO0FBQUEsSUFESSxnQkFBRCxLQUFDLGFBQ0osQ0FBQTtXQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsc0NBQWYsQ0FBQSxFQURFO0VBQUEsQ0FSSixDQUFBOztBQUFBLEVBV0EsSUFBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFFBQUEsOEJBQUE7QUFBQTtBQUFBO1NBQUEsMkNBQUE7c0JBQUE7QUFDRSxvQkFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLHNDQUFmLENBQUEsRUFBQSxDQURGO0FBQUE7b0JBREs7RUFBQSxDQVhQLENBQUE7O0FBQUEsRUFlQSxLQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sUUFBQSxzQkFBQTtBQUFBO0FBQUEsU0FBQSwyQ0FBQTt3QkFBQTtVQUFtRCxNQUFNLENBQUMsVUFBUCxDQUFBO0FBQ2pELFFBQUEsQ0FBQSxDQUFFO0FBQUEsVUFBQyxRQUFBLE1BQUQ7U0FBRixDQUFBO09BREY7QUFBQSxLQUFB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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus-ex-mode/lib/commands.coffee
