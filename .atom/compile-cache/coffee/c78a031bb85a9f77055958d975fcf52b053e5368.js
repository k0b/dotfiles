(function() {
  var ElementBuilder, Patch, Point, Range, WhiteSpaceRegExp, characterAtBufferPosition, characterAtScreenPosition, clipScreenPositionForBufferPosition, countChar, cursorIsAtEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionForScope, eachCursor, eachSelection, findIndex, fs, getAncestors, getBufferRangeForRowRange, getBufferRows, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndPositionForPattern, getEolBufferPositionForCursor, getEolBufferPositionForRow, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterColumForBufferRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getKeystrokeForEvent, getLastVisibleScreenRow, getNewTextRangeFromCheckpoint, getNonBlankCharPositionForRow, getParent, getScopesForTokenizedLine, getStartPositionForPattern, getTextAtCursor, getTextFromPointToEOL, getTextInScreenRange, getTextToPoint, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getView, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordRegExpForPointWithCursor, haveSomeSelection, highlightRanges, include, isAllWhiteSpace, isEndsWithNewLineForBufferRow, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, keystrokeToCharCode, logGoalColumnForSelection, markerOptions, mergeIntersectingRanges, moveCursor, moveCursorDown, moveCursorDownBuffer, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, moveCursorUpBuffer, normalizePatchChanges, pointIsAtEndOfLine, pointIsAtVimEndOfFile, pointIsBetweenWordAndNonWord, pointIsOnWhiteSpace, pointIsSurroundedByWhitespace, poliyFillsTextBufferHistory, registerElement, reportCursor, reportSelection, saveEditorState, scanForScopeStart, semver, settings, shouldPreventWrapLine, smartScrollToBufferPosition, sortComparable, sortRanges, sortRangesByEnd, withTrackingCursorPositionChange, withVisibleBufferRange, _, _ref;

  fs = require('fs-plus');

  semver = require('semver');

  settings = require('./settings');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  getParent = function(obj) {
    var _ref1;
    return (_ref1 = obj.__super__) != null ? _ref1.constructor : void 0;
  };

  getAncestors = function(obj) {
    var ancestors, current;
    ancestors = [];
    ancestors.push((current = obj));
    while (current = getParent(current)) {
      ancestors.push(current);
    }
    return ancestors;
  };

  getKeyBindingForCommand = function(command, _arg) {
    var keymap, keymapPath, keymaps, keystrokes, packageName, results, selector, _i, _len;
    packageName = _arg.packageName;
    results = null;
    keymaps = atom.keymaps.getKeyBindings();
    if (packageName != null) {
      keymapPath = atom.packages.getActivePackage(packageName).getKeymapPaths().pop();
      keymaps = keymaps.filter(function(_arg1) {
        var source;
        source = _arg1.source;
        return source === keymapPath;
      });
    }
    for (_i = 0, _len = keymaps.length; _i < _len; _i++) {
      keymap = keymaps[_i];
      if (!(keymap.command === command)) {
        continue;
      }
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/shift-/, '');
      (results != null ? results : results = []).push({
        keystrokes: keystrokes,
        selector: selector
      });
    }
    return results;
  };

  include = function(klass, module) {
    var key, value, _results;
    _results = [];
    for (key in module) {
      value = module[key];
      _results.push(klass.prototype[key] = value);
    }
    return _results;
  };

  debug = function(message) {
    var filePath;
    if (!settings.get('debug')) {
      return;
    }
    message += "\n";
    switch (settings.get('debugOutput')) {
      case 'console':
        return console.log(message);
      case 'file':
        filePath = fs.normalize(settings.get('debugOutputFilePath'));
        if (fs.existsSync(filePath)) {
          return fs.appendFileSync(filePath, message);
        }
    }
  };

  getNonBlankCharPositionForRow = function(editor, row) {
    var point, scanRange;
    scanRange = editor.bufferRangeForBufferRow(row);
    point = null;
    editor.scanInBufferRange(/^[ \t]*/, scanRange, function(_arg) {
      var range;
      range = _arg.range;
      return point = range.end.translate([0, +1]);
    });
    return point;
  };

  getView = function(model) {
    return atom.views.getView(model);
  };

  saveEditorState = function(editor) {
    var editorElement, foldStartRows, scrollTop;
    editorElement = getView(editor);
    scrollTop = editorElement.getScrollTop();
    foldStartRows = editor.displayBuffer.findFoldMarkers({}).map(function(m) {
      return editor.displayBuffer.foldForMarker(m).getStartRow();
    });
    return function() {
      var row, _i, _len, _ref1;
      _ref1 = foldStartRows.reverse();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (!editor.isFoldedAtBufferRow(row)) {
          editor.foldBufferRow(row);
        }
      }
      return editorElement.setScrollTop(scrollTop);
    };
  };

  getKeystrokeForEvent = function(event) {
    var keyboardEvent, _ref1;
    keyboardEvent = (_ref1 = event.originalEvent.originalEvent) != null ? _ref1 : event.originalEvent;
    return atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent);
  };

  keystrokeToCharCode = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    "delete": 127
  };

  getCharacterForEvent = function(event) {
    var charCode, keystroke;
    keystroke = getKeystrokeForEvent(event);
    if (charCode = keystrokeToCharCode[keystroke]) {
      return String.fromCharCode(charCode);
    } else {
      return keystroke;
    }
  };

  isLinewiseRange = function(_arg) {
    var end, start, _ref1;
    start = _arg.start, end = _arg.end;
    return (start.row !== end.row) && ((start.column === (_ref1 = end.column) && _ref1 === 0));
  };

  isEndsWithNewLineForBufferRow = function(editor, row) {
    var end, start, _ref1;
    _ref1 = editor.bufferRangeForBufferRow(row, {
      includeNewline: true
    }), start = _ref1.start, end = _ref1.end;
    return end.isGreaterThan(start) && end.column === 0;
  };

  haveSomeSelection = function(editor) {
    return editor.getSelections().some(function(selection) {
      return !selection.isEmpty();
    });
  };

  sortRanges = function(ranges) {
    return ranges.sort(function(a, b) {
      return a.compare(b);
    });
  };

  sortRangesByEnd = function(ranges, fn) {
    return ranges.sort(function(a, b) {
      return a.end.compare(b.end);
    });
  };

  getIndex = function(index, list) {
    var length;
    length = list.length;
    if (length === 0) {
      return -1;
    } else {
      index = index % length;
      if (index >= 0) {
        return index;
      } else {
        return length + index;
      }
    }
  };

  withVisibleBufferRange = function(editor, fn) {
    var disposable, range;
    if (range = getVisibleBufferRange(editor)) {
      return fn(range);
    } else {
      return disposable = getView(editor).onDidAttach(function() {
        disposable.dispose();
        range = getVisibleBufferRange(editor);
        return fn(range);
      });
    }
  };

  getVisibleBufferRange = function(editor) {
    var endRow, startRow, _ref1;
    _ref1 = getView(editor).getVisibleRowRange(), startRow = _ref1[0], endRow = _ref1[1];
    if (!((startRow != null) && (endRow != null))) {
      return null;
    }
    startRow = editor.bufferRowForScreenRow(startRow);
    endRow = editor.bufferRowForScreenRow(endRow);
    return new Range([startRow, 0], [endRow, Infinity]);
  };

  getVisibleEditors = function() {
    var editor, pane, _i, _len, _ref1, _results;
    _ref1 = atom.workspace.getPanes();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      pane = _ref1[_i];
      if (editor = pane.getActiveEditor()) {
        _results.push(editor);
      }
    }
    return _results;
  };

  eachSelection = function(editor, fn) {
    var selection, _i, _len, _ref1, _results;
    _ref1 = editor.getSelections();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      selection = _ref1[_i];
      _results.push(fn(selection));
    }
    return _results;
  };

  eachCursor = function(editor, fn) {
    var cursor, _i, _len, _ref1, _results;
    _ref1 = editor.getCursors();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      cursor = _ref1[_i];
      _results.push(fn(cursor));
    }
    return _results;
  };

  Patch = null;

  poliyFillsTextBufferHistory = function(history) {
    var History;
    History = history.constructor;
    return History.prototype.getChangesSinceCheckpoint = function(checkpointId) {
      var checkpointIndex, entry, i, patchesSinceCheckpoint, _i, _ref1;
      checkpointIndex = null;
      patchesSinceCheckpoint = [];
      _ref1 = this.undoStack;
      for (i = _i = _ref1.length - 1; _i >= 0; i = _i += -1) {
        entry = _ref1[i];
        if (checkpointIndex != null) {
          break;
        }
        switch (entry.constructor.name) {
          case 'Checkpoint':
            if (entry.id === checkpointId) {
              checkpointIndex = i;
            }
            break;
          case 'Transaction':
            if (Patch == null) {
              Patch = entry.patch.constructor;
            }
            patchesSinceCheckpoint.unshift(entry.patch);
            break;
          case 'Patch':
            if (Patch == null) {
              Patch = entry.constructor;
            }
            patchesSinceCheckpoint.unshift(entry);
            break;
          default:
            throw new Error("Unexpected undo stack entry type: " + entry.constructor.name);
        }
      }
      if (checkpointIndex != null) {
        return Patch != null ? Patch.compose(patchesSinceCheckpoint) : void 0;
      } else {
        return null;
      }
    };
  };

  normalizePatchChanges = function(changes) {
    return changes.map(function(change) {
      return {
        start: Point.fromObject(change.newStart),
        oldExtent: Point.fromObject(change.oldExtent),
        newExtent: Point.fromObject(change.newExtent),
        newText: change.newText
      };
    });
  };

  getNewTextRangeFromCheckpoint = function(editor, checkpoint) {
    var change, history, patch, range;
    history = editor.getBuffer().history;
    range = null;
    if (patch = history.getChangesSinceCheckpoint(checkpoint)) {
      if (change = normalizePatchChanges(patch.getChanges()).shift()) {
        range = new Range(change.start, change.start.traverse(change.newExtent));
      }
    }
    return range;
  };

  countChar = function(string, char) {
    return string.split(char).length - 1;
  };

  findIndex = function(list, fn) {
    var e, i, _i, _len;
    for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
      e = list[i];
      if (fn(e)) {
        return i;
      }
    }
    return null;
  };

  mergeIntersectingRanges = function(ranges) {
    var i, index, range, result, _i, _len;
    result = [];
    for (i = _i = 0, _len = ranges.length; _i < _len; i = ++_i) {
      range = ranges[i];
      if (index = findIndex(result, function(r) {
        return r.intersectsWith(range);
      })) {
        result[index] = result[index].union(range);
      } else {
        result.push(range);
      }
    }
    return result;
  };

  getEolBufferPositionForRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  getEolBufferPositionForCursor = function(cursor) {
    return getEolBufferPositionForRow(cursor.editor, cursor.getBufferRow());
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEolBufferPositionForRow(editor, point.row).isEqual(point);
  };

  characterAtBufferPosition = function(editor, point) {
    var range;
    range = Range.fromPointWithDelta(point, 0, 1);
    return editor.getTextInBufferRange(range);
  };

  characterAtScreenPosition = function(editor, point) {
    var range, screenRange;
    screenRange = Range.fromPointWithDelta(point, 0, 1);
    range = editor.bufferRangeForScreenRange(screenRange);
    return editor.getTextInBufferRange(range);
  };

  getTextAtCursor = function(cursor) {
    var bufferRange, editor;
    editor = cursor.editor;
    bufferRange = editor.bufferRangeForScreenRange(cursor.getScreenRange());
    return editor.getTextInBufferRange(bufferRange);
  };

  getTextInScreenRange = function(editor, screenRange) {
    var bufferRange;
    bufferRange = editor.bufferRangeForScreenRange(screenRange);
    return editor.getTextInBufferRange(bufferRange);
  };

  cursorIsOnWhiteSpace = function(cursor) {
    return isAllWhiteSpace(getTextAtCursor(cursor));
  };

  pointIsOnWhiteSpace = function(editor, point) {
    var character;
    character = characterAtBufferPosition(editor, point);
    if (character === '') {
      return false;
    } else {
      return isAllWhiteSpace(character);
    }
  };

  getWordRegExpForPointWithCursor = function(cursor, point) {
    var options;
    options = {};
    if (pointIsBetweenWordAndNonWord(cursor.editor, point, cursor.getScopeDescriptor())) {
      options.includeNonWordCharacters = false;
    }
    return cursor.wordRegExp(options);
  };

  pointIsBetweenWordAndNonWord = function(editor, point, scope) {
    var after, before, column, nonWordCharacters, range, row, _ref1;
    point = Point.fromObject(point);
    row = point.row, column = point.column;
    if ((column === 0) || (pointIsAtEndOfLine(editor, point))) {
      return false;
    }
    range = [[row, column - 1], [row, column + 1]];
    _ref1 = editor.getTextInBufferRange(range), before = _ref1[0], after = _ref1[1];
    if (/\s/.test(before) || /\s/.test(after)) {
      return false;
    } else {
      nonWordCharacters = atom.config.get('editor.nonWordCharacters', {
        scope: scope
      }).split('');
      return _.contains(nonWordCharacters, before) !== _.contains(nonWordCharacters, after);
    }
  };

  pointIsSurroundedByWhitespace = function(editor, point) {
    var column, range, row, _ref1;
    _ref1 = Point.fromObject(point), row = _ref1.row, column = _ref1.column;
    range = [[row, column - 1], [row, column + 1]];
    return /^\s+$/.test(editor.getTextInBufferRange(range));
  };

  moveCursorToNextNonWhitespace = function(cursor) {
    var originalPoint;
    originalPoint = cursor.getBufferPosition();
    while (cursorIsOnWhiteSpace(cursor) && (!cursorIsAtVimEndOfFile(cursor))) {
      cursor.moveRight();
    }
    return !originalPoint.isEqual(cursor.getBufferPosition());
  };

  getBufferRows = function(editor, _arg) {
    var direction, includeStartRow, startRow, vimLastBufferRow, _i, _j, _results, _results1;
    startRow = _arg.startRow, direction = _arg.direction, includeStartRow = _arg.includeStartRow;
    switch (direction) {
      case 'previous':
        if (!includeStartRow) {
          if (startRow === 0) {
            return [];
          }
          if (startRow > 0) {
            startRow -= 1;
          }
        }
        return (function() {
          _results = [];
          for (var _i = startRow; startRow <= 0 ? _i <= 0 : _i >= 0; startRow <= 0 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
      case 'next':
        vimLastBufferRow = getVimLastBufferRow(editor);
        if (!includeStartRow) {
          if (startRow === vimLastBufferRow) {
            return [];
          }
          if (startRow < vimLastBufferRow) {
            startRow += 1;
          }
        }
        return (function() {
          _results1 = [];
          for (var _j = startRow; startRow <= vimLastBufferRow ? _j <= vimLastBufferRow : _j >= vimLastBufferRow; startRow <= vimLastBufferRow ? _j++ : _j--){ _results1.push(_j); }
          return _results1;
        }).apply(this);
    }
  };

  getVimEofBufferPosition = function(editor) {
    var eof;
    eof = editor.getEofBufferPosition();
    if (eof.column === 0) {
      return getEolBufferPositionForRow(editor, Math.max(0, eof.row - 1));
    } else {
      return eof;
    }
  };

  getVimEofScreenPosition = function(editor) {
    return editor.screenPositionForBufferPosition(getVimEofBufferPosition(editor));
  };

  pointIsAtVimEndOfFile = function(editor, point) {
    return getVimEofBufferPosition(editor).isEqual(point);
  };

  cursorIsAtVimEndOfFile = function(cursor) {
    return pointIsAtVimEndOfFile(cursor.editor, cursor.getBufferPosition());
  };

  cursorIsAtEmptyRow = function(cursor) {
    return cursor.isAtBeginningOfLine() && cursor.isAtEndOfLine();
  };

  getVimLastBufferRow = function(editor) {
    return getVimEofBufferPosition(editor).row;
  };

  getVimLastScreenRow = function(editor) {
    return getVimEofScreenPosition(editor).row;
  };

  getFirstVisibleScreenRow = function(editor) {
    return getView(editor).getFirstVisibleScreenRow();
  };

  getLastVisibleScreenRow = function(editor) {
    return getView(editor).getLastVisibleScreenRow();
  };

  getFirstCharacterColumForBufferRow = function(editor, row) {
    var column, text;
    text = editor.lineTextForBufferRow(row);
    if ((column = text.search(/\S/)) >= 0) {
      return column;
    } else {
      return 0;
    }
  };

  getFirstCharacterPositionForBufferRow = function(editor, row) {
    var from;
    from = [row, 0];
    return getEndPositionForPattern(editor, from, /\s*/, {
      containedOnly: true
    });
  };

  getFirstCharacterBufferPositionForScreenRow = function(editor, screenRow) {
    var end, point, scanRange, start;
    start = editor.clipScreenPosition([screenRow, 0], {
      skipSoftWrapIndentation: true
    });
    end = [screenRow, Infinity];
    scanRange = editor.bufferRangeForScreenRange([start, end]);
    point = null;
    editor.scanInBufferRange(/\S/, scanRange, function(_arg) {
      var range, stop;
      range = _arg.range, stop = _arg.stop;
      point = range.start;
      return stop();
    });
    return point != null ? point : scanRange.start;
  };

  cursorIsAtFirstCharacter = function(cursor) {
    var column, editor, firstCharColumn;
    editor = cursor.editor;
    column = cursor.getBufferColumn();
    firstCharColumn = getFirstCharacterColumForBufferRow(editor, cursor.getBufferRow());
    return column === firstCharColumn;
  };

  moveCursor = function(cursor, _arg, fn) {
    var goalColumn, preserveGoalColumn;
    preserveGoalColumn = _arg.preserveGoalColumn;
    goalColumn = cursor.goalColumn;
    fn(cursor);
    if (preserveGoalColumn && goalColumn) {
      return cursor.goalColumn = goalColumn;
    }
  };

  shouldPreventWrapLine = function(cursor) {
    var column, row, tabLength, text, _ref1;
    _ref1 = cursor.getBufferPosition(), row = _ref1.row, column = _ref1.column;
    if (atom.config.get('editor.softTabs')) {
      tabLength = atom.config.get('editor.tabLength');
      if ((0 < column && column < tabLength)) {
        text = cursor.editor.getTextInBufferRange([[row, 0], [row, tabLength]]);
        return /^\s+$/.test(text);
      } else {
        return false;
      }
    }
  };

  moveCursorLeft = function(cursor, options) {
    var allowWrap, motion, needSpecialCareToPreventWrapLine;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap, needSpecialCareToPreventWrapLine = options.needSpecialCareToPreventWrapLine;
    delete options.allowWrap;
    if (needSpecialCareToPreventWrapLine) {
      if (shouldPreventWrapLine(cursor)) {
        return;
      }
    }
    if (!cursor.isAtBeginningOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveLeft();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorRight = function(cursor, options) {
    var allowWrap, motion;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap;
    delete options.allowWrap;
    if (!cursor.isAtEndOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveRight();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorUp = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (cursor.getScreenRow() !== 0) {
      motion = function(cursor) {
        return cursor.moveUp();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDown = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (getVimLastScreenRow(cursor.editor) !== cursor.getScreenRow()) {
      motion = function(cursor) {
        return cursor.moveDown();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (getVimLastBufferRow(cursor.editor) !== point.row) {
      return cursor.setBufferPosition(point.translate([+1, 0]));
    }
  };

  moveCursorUpBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (point.row !== 0) {
      return cursor.setBufferPosition(point.translate([-1, 0]));
    }
  };

  moveCursorToFirstCharacterAtRow = function(cursor, row) {
    cursor.setBufferPosition([row, 0]);
    return cursor.moveToFirstCharacterOfLine();
  };

  markerOptions = {
    ivalidate: 'never',
    persistent: false
  };

  highlightRanges = function(editor, ranges, options) {
    var marker, markers, timeout, _i, _len;
    if (!_.isArray(ranges)) {
      ranges = [ranges];
    }
    if (!ranges.length) {
      return null;
    }
    markers = ranges.map(function(range) {
      return editor.markBufferRange(range, markerOptions);
    });
    for (_i = 0, _len = markers.length; _i < _len; _i++) {
      marker = markers[_i];
      editor.decorateMarker(marker, {
        type: 'highlight',
        "class": options["class"]
      });
    }
    timeout = options.timeout;
    if (timeout != null) {
      setTimeout(function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
          marker = markers[_j];
          _results.push(marker.destroy());
        }
        return _results;
      }, timeout);
    }
    return markers;
  };

  getValidVimBufferRow = function(editor, row) {
    var vimLastBufferRow;
    vimLastBufferRow = getVimLastBufferRow(editor);
    switch (false) {
      case !(row < 0):
        return 0;
      case !(row > vimLastBufferRow):
        return vimLastBufferRow;
      default:
        return row;
    }
  };

  getValidVimScreenRow = function(editor, row) {
    var vimLastScreenRow;
    vimLastScreenRow = getVimLastScreenRow(editor);
    switch (false) {
      case !(row < 0):
        return 0;
      case !(row > vimLastScreenRow):
        return vimLastScreenRow;
      default:
        return row;
    }
  };

  clipScreenPositionForBufferPosition = function(editor, bufferPosition, options) {
    var screenPosition, translate;
    screenPosition = editor.screenPositionForBufferPosition(bufferPosition);
    translate = options.translate;
    delete options.translate;
    if (translate) {
      screenPosition = screenPosition.translate(translate);
    }
    return editor.clipScreenPosition(screenPosition, options);
  };

  getTextToPoint = function(editor, _arg, _arg1) {
    var column, exclusive, row;
    row = _arg.row, column = _arg.column;
    exclusive = (_arg1 != null ? _arg1 : {}).exclusive;
    if (exclusive == null) {
      exclusive = true;
    }
    if (exclusive) {
      return editor.lineTextForBufferRow(row).slice(0, column);
    } else {
      return editor.lineTextForBufferRow(row).slice(0, +column + 1 || 9e9);
    }
  };

  getTextFromPointToEOL = function(editor, _arg, _arg1) {
    var column, exclusive, row, start;
    row = _arg.row, column = _arg.column;
    exclusive = (_arg1 != null ? _arg1 : {}).exclusive;
    if (exclusive == null) {
      exclusive = false;
    }
    start = column;
    if (exclusive) {
      start += 1;
    }
    return editor.lineTextForBufferRow(row).slice(start);
  };

  getIndentLevelForBufferRow = function(editor, row) {
    var text;
    text = editor.lineTextForBufferRow(row);
    return editor.indentLevelForLine(text);
  };

  WhiteSpaceRegExp = /^\s*$/;

  isAllWhiteSpace = function(text) {
    return WhiteSpaceRegExp.test(text);
  };

  getCodeFoldRowRanges = function(editor) {
    var _i, _ref1, _results;
    return (function() {
      _results = [];
      for (var _i = 0, _ref1 = editor.getLastBufferRow(); 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 0 <= _ref1 ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    });
  };

  getCodeFoldRowRangesContainesForRow = function(editor, bufferRow, exclusive) {
    if (exclusive == null) {
      exclusive = false;
    }
    return getCodeFoldRowRanges(editor).filter(function(_arg) {
      var endRow, startRow;
      startRow = _arg[0], endRow = _arg[1];
      if (exclusive) {
        return (startRow < bufferRow && bufferRow <= endRow);
      } else {
        return (startRow <= bufferRow && bufferRow <= endRow);
      }
    });
  };

  getBufferRangeForRowRange = function(editor, rowRange) {
    var rangeEnd, rangeStart, _ref1;
    _ref1 = rowRange.map(function(row) {
      return editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    }), rangeStart = _ref1[0], rangeEnd = _ref1[1];
    return rangeStart.union(rangeEnd);
  };

  getTokenizedLineForRow = function(editor, row) {
    return editor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(row);
  };

  getScopesForTokenizedLine = function(line) {
    var tag, _i, _len, _ref1, _results;
    _ref1 = line.tags;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      tag = _ref1[_i];
      if (tag < 0 && (tag % 2 === -1)) {
        _results.push(atom.grammars.scopeForId(tag));
      }
    }
    return _results;
  };

  scanForScopeStart = function(editor, fromPoint, direction, fn) {
    var column, continueScan, isValidToken, position, result, results, row, scanRows, scope, stop, tag, tokenIterator, tokenizedLine, _i, _j, _k, _len, _len1, _len2, _ref1;
    fromPoint = Point.fromObject(fromPoint);
    scanRows = (function() {
      var _i, _j, _ref1, _ref2, _ref3, _results, _results1;
      switch (direction) {
        case 'forward':
          return (function() {
            _results = [];
            for (var _i = _ref1 = fromPoint.row, _ref2 = editor.getLastBufferRow(); _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; _ref1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        case 'backward':
          return (function() {
            _results1 = [];
            for (var _j = _ref3 = fromPoint.row; _ref3 <= 0 ? _j <= 0 : _j >= 0; _ref3 <= 0 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    })();
    continueScan = true;
    stop = function() {
      return continueScan = false;
    };
    isValidToken = (function() {
      switch (direction) {
        case 'forward':
          return function(_arg) {
            var position;
            position = _arg.position;
            return position.isGreaterThan(fromPoint);
          };
        case 'backward':
          return function(_arg) {
            var position;
            position = _arg.position;
            return position.isLessThan(fromPoint);
          };
      }
    })();
    for (_i = 0, _len = scanRows.length; _i < _len; _i++) {
      row = scanRows[_i];
      if (!(tokenizedLine = getTokenizedLineForRow(editor, row))) {
        continue;
      }
      column = 0;
      results = [];
      tokenIterator = tokenizedLine.getTokenIterator();
      _ref1 = tokenizedLine.tags;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        tag = _ref1[_j];
        tokenIterator.next();
        if (tag > 0) {
          column += (function() {
            switch (false) {
              case !tokenIterator.isHardTab():
                return 1;
              case !tokenIterator.isSoftWrapIndentation():
                return 0;
              default:
                return tag;
            }
          })();
        } else if (tag % 2 === -1) {
          scope = atom.grammars.scopeForId(tag);
          position = new Point(row, column);
          results.push({
            scope: scope,
            position: position,
            stop: stop
          });
        }
      }
      results = results.filter(isValidToken);
      if (direction === 'backward') {
        results.reverse();
      }
      for (_k = 0, _len2 = results.length; _k < _len2; _k++) {
        result = results[_k];
        fn(result);
        if (!continueScan) {
          return;
        }
      }
      if (!continueScan) {
        return;
      }
    }
  };

  detectScopeStartPositionForScope = function(editor, fromPoint, direction, scope) {
    var point;
    point = null;
    scanForScopeStart(editor, fromPoint, direction, function(info) {
      if (info.scope.search(scope) >= 0) {
        info.stop();
        return point = info.position;
      }
    });
    return point;
  };

  isIncludeFunctionScopeForRow = function(editor, row) {
    var tokenizedLine;
    if (tokenizedLine = getTokenizedLineForRow(editor, row)) {
      return getScopesForTokenizedLine(tokenizedLine).some(function(scope) {
        return isFunctionScope(editor, scope);
      });
    } else {
      return false;
    }
  };

  isFunctionScope = function(editor, scope) {
    var scopeName;
    scopeName = editor.getGrammar().scopeName;
    switch (scopeName) {
      case 'source.go':
        return /^entity\.name\.function/.test(scope);
      default:
        return /^meta\.function\./.test(scope);
    }
  };

  getStartPositionForPattern = function(editor, from, pattern, options) {
    var containedOnly, point, scanRange, _ref1;
    if (options == null) {
      options = {};
    }
    from = Point.fromObject(from);
    containedOnly = (_ref1 = options.containedOnly) != null ? _ref1 : false;
    scanRange = [[from.row, 0], from];
    point = null;
    editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
      var matchText, range, stop;
      range = _arg.range, matchText = _arg.matchText, stop = _arg.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if ((!containedOnly) || range.end.isGreaterThanOrEqual(from)) {
        point = range.start;
        return stop();
      }
    });
    return point;
  };

  getEndPositionForPattern = function(editor, from, pattern, options) {
    var containedOnly, point, scanRange, _ref1;
    if (options == null) {
      options = {};
    }
    from = Point.fromObject(from);
    containedOnly = (_ref1 = options.containedOnly) != null ? _ref1 : false;
    scanRange = [from, [from.row, Infinity]];
    point = null;
    editor.scanInBufferRange(pattern, scanRange, function(_arg) {
      var matchText, range, stop;
      range = _arg.range, matchText = _arg.matchText, stop = _arg.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if ((!containedOnly) || range.start.isLessThanOrEqual(from)) {
        point = range.end;
        return stop();
      }
    });
    return point;
  };

  sortComparable = function(collection) {
    return collection.sort(function(a, b) {
      return a.compare(b);
    });
  };

  smartScrollToBufferPosition = function(editor, point) {
    var center, editorAreaHeight, editorElement, onePageDown, onePageUp, target;
    editorElement = getView(editor);
    editorAreaHeight = editor.getLineHeightInPixels() * (editor.getRowsPerPage() - 1);
    onePageUp = editorElement.getScrollTop() - editorAreaHeight;
    onePageDown = editorElement.getScrollBottom() + editorAreaHeight;
    target = editorElement.pixelPositionForBufferPosition(point).top;
    center = (onePageDown < target) || (target < onePageUp);
    return editor.scrollToBufferPosition(point, {
      center: center
    });
  };

  logGoalColumnForSelection = function(subject, selection) {
    return console.log("" + subject + ": goalColumn = ", selection.cursor.goalColumn);
  };

  reportSelection = function(subject, selection) {
    return console.log(subject, selection.getBufferRange().toString());
  };

  reportCursor = function(subject, cursor) {
    return console.log(subject, cursor.getBufferPosition().toString());
  };

  withTrackingCursorPositionChange = function(cursor, fn) {
    var cursorAfter, cursorBefore;
    cursorBefore = cursor.getBufferPosition();
    fn();
    cursorAfter = cursor.getBufferPosition();
    if (!cursorBefore.isEqual(cursorAfter)) {
      return console.log("Changed: " + (cursorBefore.toString()) + " -> " + (cursorAfter.toString()));
    }
  };

  registerElement = function(name, options) {
    var Element, element;
    element = document.createElement(name);
    if (element.constructor === HTMLElement) {
      Element = document.registerElement(name, options);
    } else {
      Element = element.constructor;
      if (options.prototype != null) {
        Element.prototype = options.prototype;
      }
    }
    return Element;
  };

  ElementBuilder = {
    includeInto: function(target) {
      var name, value, _results;
      _results = [];
      for (name in this) {
        value = this[name];
        if (name !== "includeInto") {
          _results.push(target.prototype[name] = value.bind(this));
        }
      }
      return _results;
    },
    div: function(params) {
      return this.createElement('div', params);
    },
    span: function(params) {
      return this.createElement('span', params);
    },
    atomTextEditor: function(params) {
      return this.createElement('atom-text-editor', params);
    },
    createElement: function(element, _arg) {
      var attribute, classList, id, name, textContent, value, _ref1, _ref2;
      classList = _arg.classList, textContent = _arg.textContent, id = _arg.id, attribute = _arg.attribute;
      element = document.createElement(element);
      if (id != null) {
        element.id = id;
      }
      if (classList != null) {
        (_ref1 = element.classList).add.apply(_ref1, classList);
      }
      if (textContent != null) {
        element.textContent = textContent;
      }
      _ref2 = attribute != null ? attribute : {};
      for (name in _ref2) {
        value = _ref2[name];
        element.setAttribute(name, value);
      }
      return element;
    }
  };

  module.exports = {
    getParent: getParent,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    getNonBlankCharPositionForRow: getNonBlankCharPositionForRow,
    getView: getView,
    saveEditorState: saveEditorState,
    getKeystrokeForEvent: getKeystrokeForEvent,
    getCharacterForEvent: getCharacterForEvent,
    isLinewiseRange: isLinewiseRange,
    isEndsWithNewLineForBufferRow: isEndsWithNewLineForBufferRow,
    haveSomeSelection: haveSomeSelection,
    sortRanges: sortRanges,
    sortRangesByEnd: sortRangesByEnd,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    withVisibleBufferRange: withVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
    eachSelection: eachSelection,
    eachCursor: eachCursor,
    getNewTextRangeFromCheckpoint: getNewTextRangeFromCheckpoint,
    findIndex: findIndex,
    mergeIntersectingRanges: mergeIntersectingRanges,
    pointIsAtEndOfLine: pointIsAtEndOfLine,
    pointIsAtVimEndOfFile: pointIsAtVimEndOfFile,
    cursorIsAtVimEndOfFile: cursorIsAtVimEndOfFile,
    characterAtBufferPosition: characterAtBufferPosition,
    characterAtScreenPosition: characterAtScreenPosition,
    getVimEofBufferPosition: getVimEofBufferPosition,
    getVimEofScreenPosition: getVimEofScreenPosition,
    getVimLastBufferRow: getVimLastBufferRow,
    getVimLastScreenRow: getVimLastScreenRow,
    moveCursorLeft: moveCursorLeft,
    moveCursorRight: moveCursorRight,
    moveCursorUp: moveCursorUp,
    moveCursorDown: moveCursorDown,
    getEolBufferPositionForRow: getEolBufferPositionForRow,
    getEolBufferPositionForCursor: getEolBufferPositionForCursor,
    getFirstVisibleScreenRow: getFirstVisibleScreenRow,
    getLastVisibleScreenRow: getLastVisibleScreenRow,
    highlightRanges: highlightRanges,
    getValidVimBufferRow: getValidVimBufferRow,
    getValidVimScreenRow: getValidVimScreenRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    countChar: countChar,
    clipScreenPositionForBufferPosition: clipScreenPositionForBufferPosition,
    getTextToPoint: getTextToPoint,
    getTextFromPointToEOL: getTextFromPointToEOL,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    isAllWhiteSpace: isAllWhiteSpace,
    getTextAtCursor: getTextAtCursor,
    getTextInScreenRange: getTextInScreenRange,
    cursorIsOnWhiteSpace: cursorIsOnWhiteSpace,
    pointIsOnWhiteSpace: pointIsOnWhiteSpace,
    getWordRegExpForPointWithCursor: getWordRegExpForPointWithCursor,
    pointIsBetweenWordAndNonWord: pointIsBetweenWordAndNonWord,
    pointIsSurroundedByWhitespace: pointIsSurroundedByWhitespace,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    cursorIsAtEmptyRow: cursorIsAtEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    getFirstCharacterColumForBufferRow: getFirstCharacterColumForBufferRow,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    getFirstCharacterBufferPositionForScreenRow: getFirstCharacterBufferPositionForScreenRow,
    cursorIsAtFirstCharacter: cursorIsAtFirstCharacter,
    isFunctionScope: isFunctionScope,
    getStartPositionForPattern: getStartPositionForPattern,
    getEndPositionForPattern: getEndPositionForPattern,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    getTokenizedLineForRow: getTokenizedLineForRow,
    getScopesForTokenizedLine: getScopesForTokenizedLine,
    scanForScopeStart: scanForScopeStart,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
    ElementBuilder: ElementBuilder,
    registerElement: registerElement,
    sortComparable: sortComparable,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    moveCursorDownBuffer: moveCursorDownBuffer,
    moveCursorUpBuffer: moveCursorUpBuffer,
    poliyFillsTextBufferHistory: poliyFillsTextBufferHistory,
    reportSelection: reportSelection,
    reportCursor: reportCursor,
    withTrackingCursorPositionChange: withTrackingCursorPositionChange,
    logGoalColumnForSelection: logGoalColumnForSelection
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwra0VBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFJQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FKUixDQUFBOztBQUFBLEVBS0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUxKLENBQUE7O0FBQUEsRUFPQSxTQUFBLEdBQVksU0FBQyxHQUFELEdBQUE7QUFDVixRQUFBLEtBQUE7a0RBQWEsQ0FBRSxxQkFETDtFQUFBLENBUFosQ0FBQTs7QUFBQSxFQVVBLFlBQUEsR0FBZSxTQUFDLEdBQUQsR0FBQTtBQUNiLFFBQUEsa0JBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxFQUFaLENBQUE7QUFBQSxJQUNBLFNBQVMsQ0FBQyxJQUFWLENBQWUsQ0FBQyxPQUFBLEdBQVEsR0FBVCxDQUFmLENBREEsQ0FBQTtBQUVBLFdBQU0sT0FBQSxHQUFVLFNBQUEsQ0FBVSxPQUFWLENBQWhCLEdBQUE7QUFDRSxNQUFBLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBZixDQUFBLENBREY7SUFBQSxDQUZBO1dBSUEsVUFMYTtFQUFBLENBVmYsQ0FBQTs7QUFBQSxFQWlCQSx1QkFBQSxHQUEwQixTQUFDLE9BQUQsRUFBVSxJQUFWLEdBQUE7QUFDeEIsUUFBQSxpRkFBQTtBQUFBLElBRG1DLGNBQUQsS0FBQyxXQUNuQyxDQUFB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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/lib/utils.coffee
