(function() {
  var Base, CurrentSelection, Find, FindBackwards, IsKeywordDefault, MatchList, Motion, MoveDown, MoveDownToEdge, MoveLeft, MoveRight, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextParagraph, MoveToNextSmartWord, MoveToNextString, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousParagraph, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineWithMinimum, MoveToTopOfScreen, MoveUp, MoveUpToEdge, Point, RepeatFind, RepeatFindReverse, RepeatSearch, RepeatSearchReverse, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, Till, TillBackwards, characterAtScreenPosition, cursorIsAtEmptyRow, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, detectScopeStartPositionForScope, getBufferRows, getCodeFoldRowRanges, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getLastVisibleScreenRow, getStartPositionForPattern, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, globalState, highlightRanges, isIncludeFunctionScopeForRow, moveCursorDown, moveCursorDownBuffer, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, moveCursorUpBuffer, saveEditorState, settings, sortRanges, swrap, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  Point = require('atom').Point;

  globalState = require('./global-state');

  _ref = require('./utils'), saveEditorState = _ref.saveEditorState, getVisibleBufferRange = _ref.getVisibleBufferRange, moveCursorLeft = _ref.moveCursorLeft, moveCursorRight = _ref.moveCursorRight, moveCursorUp = _ref.moveCursorUp, moveCursorDown = _ref.moveCursorDown, moveCursorDownBuffer = _ref.moveCursorDownBuffer, moveCursorUpBuffer = _ref.moveCursorUpBuffer, cursorIsAtVimEndOfFile = _ref.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = _ref.getFirstVisibleScreenRow, getLastVisibleScreenRow = _ref.getLastVisibleScreenRow, getVimEofBufferPosition = _ref.getVimEofBufferPosition, getVimLastBufferRow = _ref.getVimLastBufferRow, getVimLastScreenRow = _ref.getVimLastScreenRow, getValidVimScreenRow = _ref.getValidVimScreenRow, getValidVimBufferRow = _ref.getValidVimBufferRow, characterAtScreenPosition = _ref.characterAtScreenPosition, highlightRanges = _ref.highlightRanges, moveCursorToFirstCharacterAtRow = _ref.moveCursorToFirstCharacterAtRow, sortRanges = _ref.sortRanges, getIndentLevelForBufferRow = _ref.getIndentLevelForBufferRow, cursorIsOnWhiteSpace = _ref.cursorIsOnWhiteSpace, moveCursorToNextNonWhitespace = _ref.moveCursorToNextNonWhitespace, cursorIsAtEmptyRow = _ref.cursorIsAtEmptyRow, getCodeFoldRowRanges = _ref.getCodeFoldRowRanges, isIncludeFunctionScopeForRow = _ref.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = _ref.detectScopeStartPositionForScope, getTextInScreenRange = _ref.getTextInScreenRange, getBufferRows = _ref.getBufferRows, getStartPositionForPattern = _ref.getStartPositionForPattern, getFirstCharacterPositionForBufferRow = _ref.getFirstCharacterPositionForBufferRow, getFirstCharacterBufferPositionForScreenRow = _ref.getFirstCharacterBufferPositionForScreenRow;

  swrap = require('./selection-wrapper');

  MatchList = require('./match').MatchList;

  settings = require('./settings');

  Base = require('./base');

  IsKeywordDefault = "[@a-zA-Z0-9_\-]+";

  Motion = (function(_super) {
    __extends(Motion, _super);

    Motion.extend(false);

    Motion.prototype.inclusive = false;

    Motion.prototype.linewise = false;

    function Motion() {
      Motion.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    Motion.prototype.isLinewise = function() {
      if (this.isMode('visual')) {
        return this.isMode('visual', 'linewise');
      } else {
        return this.linewise;
      }
    };

    Motion.prototype.isBlockwise = function() {
      return this.isMode('visual', 'blockwise');
    };

    Motion.prototype.isInclusive = function() {
      if (this.isMode('visual')) {
        return this.isMode('visual', ['characterwise', 'blockwise']);
      } else {
        return this.inclusive;
      }
    };

    Motion.prototype.setBufferPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setBufferPosition(point);
      }
    };

    Motion.prototype.setScreenPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setScreenPosition(point);
      }
    };

    Motion.prototype.execute = function() {
      return this.editor.moveCursors((function(_this) {
        return function(cursor) {
          return _this.moveCursor(cursor);
        };
      })(this));
    };

    Motion.prototype.select = function() {
      var selection, _i, _len, _ref1;
      if (this.isMode('visual')) {
        this.vimState.modeManager.normalizeSelections();
      }
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (this.isInclusive() || this.isLinewise()) {
          this.selectInclusively(selection);
        } else {
          selection.modifySelection((function(_this) {
            return function() {
              return _this.moveCursor(selection.cursor);
            };
          })(this));
        }
      }
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
      if (this.isMode('visual')) {
        this.updateSelectionProperties();
      }
      switch (false) {
        case !this.isLinewise():
          return this.vimState.selectLinewise();
        case !this.isBlockwise():
          return this.vimState.selectBlockwise();
      }
    };

    Motion.prototype.selectInclusively = function(selection) {
      var cursor, originalPoint, tailRange;
      cursor = selection.cursor;
      originalPoint = cursor.getBufferPosition();
      tailRange = swrap(selection).getTailBufferRange();
      return selection.modifySelection((function(_this) {
        return function() {
          var allowWrap;
          _this.moveCursor(cursor);
          if (_this.isMode('visual')) {
            if (cursor.isAtEndOfLine()) {
              moveCursorLeft(cursor, {
                preserveGoalColumn: true
              });
            }
          } else {
            if (cursor.getBufferPosition().isEqual(originalPoint)) {
              return;
            }
          }
          if (!selection.isReversed()) {
            allowWrap = cursorIsAtEmptyRow(cursor);
            moveCursorRight(cursor, {
              allowWrap: allowWrap,
              preserveGoalColumn: true
            });
          }
          return swrap(selection).mergeBufferRange(tailRange, {
            preserveFolds: true
          });
        };
      })(this));
    };

    return Motion;

  })(Base);

  CurrentSelection = (function(_super) {
    __extends(CurrentSelection, _super);

    function CurrentSelection() {
      return CurrentSelection.__super__.constructor.apply(this, arguments);
    }

    CurrentSelection.extend(false);

    CurrentSelection.prototype.selectionExtent = null;

    CurrentSelection.prototype.inclusive = true;

    CurrentSelection.prototype.execute = function() {
      throw new Error("" + (this.getName()) + " should not be executed");
    };

    CurrentSelection.prototype.moveCursor = function(cursor) {
      var point;
      if (this.isMode('visual')) {
        this.selectionExtent = this.editor.getSelectedBufferRange().getExtent();
        return this.linewise = this.isLinewise();
      } else {
        point = cursor.getBufferPosition().traverse(this.selectionExtent);
        return cursor.setBufferPosition(point);
      }
    };

    return CurrentSelection;

  })(Motion);

  MoveLeft = (function(_super) {
    __extends(MoveLeft, _super);

    function MoveLeft() {
      return MoveLeft.__super__.constructor.apply(this, arguments);
    }

    MoveLeft.extend();

    MoveLeft.prototype.moveCursor = function(cursor) {
      var allowWrap;
      allowWrap = settings.get('wrapLeftRightMotion');
      return this.countTimes(function() {
        return moveCursorLeft(cursor, {
          allowWrap: allowWrap
        });
      });
    };

    return MoveLeft;

  })(Motion);

  MoveRight = (function(_super) {
    __extends(MoveRight, _super);

    function MoveRight() {
      return MoveRight.__super__.constructor.apply(this, arguments);
    }

    MoveRight.extend();

    MoveRight.prototype.canWrapToNextLine = function(cursor) {
      if (!this.isMode('visual') && this.isAsOperatorTarget() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return settings.get('wrapLeftRightMotion');
      }
    };

    MoveRight.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var allowWrap;
          _this.editor.unfoldBufferRow(cursor.getBufferRow());
          allowWrap = _this.canWrapToNextLine(cursor);
          moveCursorRight(cursor);
          if (cursor.isAtEndOfLine() && allowWrap && !cursorIsAtVimEndOfFile(cursor)) {
            return moveCursorRight(cursor, {
              allowWrap: allowWrap
            });
          }
        };
      })(this));
    };

    return MoveRight;

  })(Motion);

  MoveUp = (function(_super) {
    __extends(MoveUp, _super);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.extend();

    MoveUp.prototype.linewise = true;

    MoveUp.prototype.direction = 'up';

    MoveUp.prototype.move = function(cursor) {
      return moveCursorUp(cursor);
    };

    MoveUp.prototype.moveCursor = function(cursor) {
      var isBufferRowWise, vimLastBufferRow;
      isBufferRowWise = this.editor.isSoftWrapped() && this.isMode('visual', 'linewise');
      vimLastBufferRow = null;
      return this.countTimes((function(_this) {
        return function() {
          var amount, column, row;
          if (isBufferRowWise) {
            if (vimLastBufferRow == null) {
              vimLastBufferRow = getVimLastBufferRow(_this.editor);
            }
            amount = _this.direction === 'up' ? -1 : +1;
            row = cursor.getBufferRow() + amount;
            if (row <= vimLastBufferRow) {
              column = cursor.goalColumn || cursor.getBufferColumn();
              cursor.setBufferPosition([row, column]);
              return cursor.goalColumn = column;
            }
          } else {
            return _this.move(cursor);
          }
        };
      })(this));
    };

    return MoveUp;

  })(Motion);

  MoveDown = (function(_super) {
    __extends(MoveDown, _super);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.extend();

    MoveDown.prototype.linewise = true;

    MoveDown.prototype.direction = 'down';

    MoveDown.prototype.move = function(cursor) {
      return moveCursorDown(cursor);
    };

    return MoveDown;

  })(MoveUp);

  MoveUpToEdge = (function(_super) {
    __extends(MoveUpToEdge, _super);

    function MoveUpToEdge() {
      return MoveUpToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveUpToEdge.extend();

    MoveUpToEdge.prototype.linewise = true;

    MoveUpToEdge.prototype.direction = 'up';

    MoveUpToEdge.description = "Move cursor up to **edge** char at same-column";

    MoveUpToEdge.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          return _this.setScreenPositionSafely(cursor, _this.getPoint(cursor));
        };
      })(this));
    };

    MoveUpToEdge.prototype.getPoint = function(cursor) {
      var column, point, row, _i, _len, _ref1;
      column = cursor.getScreenColumn();
      _ref1 = this.getScanRows(cursor);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (this.isMovablePoint(point = new Point(row, column))) {
          return point;
        }
      }
    };

    MoveUpToEdge.prototype.getScanRows = function(cursor) {
      var cursorRow, validRow, _i, _j, _ref1, _ref2, _ref3, _results, _results1;
      cursorRow = cursor.getScreenRow();
      validRow = getValidVimScreenRow.bind(null, this.editor);
      switch (this.direction) {
        case 'up':
          return (function() {
            _results = [];
            for (var _i = _ref1 = validRow(cursorRow - 1); _ref1 <= 0 ? _i <= 0 : _i >= 0; _ref1 <= 0 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        case 'down':
          return (function() {
            _results1 = [];
            for (var _j = _ref2 = validRow(cursorRow + 1), _ref3 = getVimLastScreenRow(this.editor); _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; _ref2 <= _ref3 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    };

    MoveUpToEdge.prototype.isMovablePoint = function(point) {
      var above, below, _ref1;
      if (this.isStoppablePoint(point)) {
        if ((_ref1 = point.row) === 0 || _ref1 === getVimLastScreenRow(this.editor)) {
          return true;
        } else {
          above = point.translate([-1, 0]);
          below = point.translate([+1, 0]);
          return (!this.isStoppablePoint(above)) || (!this.isStoppablePoint(below));
        }
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isValidStoppablePoint = function(point) {
      var column, firstChar, lastChar, match, row, softTabText, text;
      row = point.row, column = point.column;
      text = getTextInScreenRange(this.editor, [[row, 0], [row, Infinity]]);
      softTabText = _.multiplyString(' ', this.editor.getTabLength());
      text = text.replace(/\t/g, softTabText);
      if ((match = text.match(/\S/g)) != null) {
        firstChar = match[0], lastChar = match[match.length - 1];
        return (text.indexOf(firstChar) <= column && column <= text.lastIndexOf(lastChar));
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isStoppablePoint = function(point) {
      var left, right;
      if (this.isNonBlankPoint(point)) {
        return true;
      } else if (this.isValidStoppablePoint(point)) {
        left = point.translate([0, -1]);
        right = point.translate([0, +1]);
        return this.isNonBlankPoint(left) && this.isNonBlankPoint(right);
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isBlankPoint = function(point) {
      var char;
      char = characterAtScreenPosition(this.editor, point);
      if (char.length > 0) {
        return /\s/.test(char);
      } else {
        return true;
      }
    };

    MoveUpToEdge.prototype.isNonBlankPoint = function(point) {
      return !this.isBlankPoint(point);
    };

    return MoveUpToEdge;

  })(Motion);

  MoveDownToEdge = (function(_super) {
    __extends(MoveDownToEdge, _super);

    function MoveDownToEdge() {
      return MoveDownToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveDownToEdge.extend();

    MoveDownToEdge.description = "Move cursor down to **edge** char at same-column";

    MoveDownToEdge.prototype.direction = 'down';

    return MoveDownToEdge;

  })(MoveUpToEdge);

  MoveToNextWord = (function(_super) {
    __extends(MoveToNextWord, _super);

    function MoveToNextWord() {
      return MoveToNextWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWord.extend();

    MoveToNextWord.prototype.wordRegex = null;

    MoveToNextWord.prototype.getPoint = function(cursor) {
      var cursorPoint, pattern, point, scanRange, _ref1;
      cursorPoint = cursor.getBufferPosition();
      pattern = (_ref1 = this.wordRegex) != null ? _ref1 : cursor.wordRegExp();
      scanRange = [[cursorPoint.row, 0], this.vimEof];
      point = null;
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range, stop;
        stop = _arg.stop, range = _arg.range;
        if (range.end.isGreaterThan(cursorPoint)) {
          point = range.end;
        }
        if (range.start.isGreaterThan(cursorPoint)) {
          point = range.start;
          return stop();
        }
      });
      return point != null ? point : cursorPoint;
    };

    MoveToNextWord.prototype.moveCursor = function(cursor) {
      var lastCount, wasOnWhiteSpace;
      if (cursorIsAtVimEndOfFile(cursor)) {
        return;
      }
      this.vimEof = getVimEofBufferPosition(this.editor);
      lastCount = this.getCount();
      wasOnWhiteSpace = cursorIsOnWhiteSpace(cursor);
      return this.countTimes((function(_this) {
        return function(num, isFinal) {
          var cursorRow, point;
          cursorRow = cursor.getBufferRow();
          if (cursorIsAtEmptyRow(cursor) && _this.isAsOperatorTarget()) {
            point = [cursorRow + 1, 0];
          } else {
            point = _this.getPoint(cursor);
            if (isFinal && _this.isAsOperatorTarget()) {
              if (_this.getOperator().getName() === 'Change' && (!wasOnWhiteSpace)) {
                point = cursor.getEndOfCurrentWordBufferPosition({
                  wordRegex: _this.wordRegex
                });
              } else if (point.row > cursorRow) {
                point = [cursorRow, Infinity];
              }
            }
          }
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToNextWord;

  })(Motion);

  MoveToPreviousWord = (function(_super) {
    __extends(MoveToPreviousWord, _super);

    function MoveToPreviousWord() {
      return MoveToPreviousWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWord.extend();

    MoveToPreviousWord.prototype.wordRegex = null;

    MoveToPreviousWord.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var point;
          point = cursor.getBeginningOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToPreviousWord;

  })(Motion);

  MoveToEndOfWord = (function(_super) {
    __extends(MoveToEndOfWord, _super);

    function MoveToEndOfWord() {
      return MoveToEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWord.extend();

    MoveToEndOfWord.prototype.wordRegex = null;

    MoveToEndOfWord.prototype.inclusive = true;

    MoveToEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      moveCursorToNextNonWhitespace(cursor);
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, getVimEofBufferPosition(this.editor));
      return cursor.setBufferPosition(point);
    };

    MoveToEndOfWord.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var originalPoint;
          originalPoint = cursor.getBufferPosition();
          _this.moveToNextEndOfWord(cursor);
          if (originalPoint.isEqual(cursor.getBufferPosition())) {
            cursor.moveRight();
            return _this.moveToNextEndOfWord(cursor);
          }
        };
      })(this));
    };

    return MoveToEndOfWord;

  })(Motion);

  MoveToNextWholeWord = (function(_super) {
    __extends(MoveToNextWholeWord, _super);

    function MoveToNextWholeWord() {
      return MoveToNextWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWholeWord.extend();

    MoveToNextWholeWord.prototype.wordRegex = /^\s*$|\S+/g;

    return MoveToNextWholeWord;

  })(MoveToNextWord);

  MoveToPreviousWholeWord = (function(_super) {
    __extends(MoveToPreviousWholeWord, _super);

    function MoveToPreviousWholeWord() {
      return MoveToPreviousWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWholeWord.extend();

    MoveToPreviousWholeWord.prototype.wordRegex = /^\s*$|\S+/;

    return MoveToPreviousWholeWord;

  })(MoveToPreviousWord);

  MoveToEndOfWholeWord = (function(_super) {
    __extends(MoveToEndOfWholeWord, _super);

    function MoveToEndOfWholeWord() {
      return MoveToEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWholeWord.extend();

    MoveToEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToEndOfWholeWord;

  })(MoveToEndOfWord);

  MoveToNextAlphanumericWord = (function(_super) {
    __extends(MoveToNextAlphanumericWord, _super);

    function MoveToNextAlphanumericWord() {
      return MoveToNextAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextAlphanumericWord.extend();

    MoveToNextAlphanumericWord.description = "Move to next alphanumeric(`/\w+/`) word";

    MoveToNextAlphanumericWord.prototype.wordRegex = /\w+/g;

    return MoveToNextAlphanumericWord;

  })(MoveToNextWord);

  MoveToPreviousAlphanumericWord = (function(_super) {
    __extends(MoveToPreviousAlphanumericWord, _super);

    function MoveToPreviousAlphanumericWord() {
      return MoveToPreviousAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousAlphanumericWord.extend();

    MoveToPreviousAlphanumericWord.description = "Move to previous alphanumeric(`/\w+/`) word";

    MoveToPreviousAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToPreviousAlphanumericWord;

  })(MoveToPreviousWord);

  MoveToEndOfAlphanumericWord = (function(_super) {
    __extends(MoveToEndOfAlphanumericWord, _super);

    function MoveToEndOfAlphanumericWord() {
      return MoveToEndOfAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfAlphanumericWord.extend();

    MoveToEndOfAlphanumericWord.description = "Move to end of alphanumeric(`/\w+/`) word";

    MoveToEndOfAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToEndOfAlphanumericWord;

  })(MoveToEndOfWord);

  MoveToNextSmartWord = (function(_super) {
    __extends(MoveToNextSmartWord, _super);

    function MoveToNextSmartWord() {
      return MoveToNextSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSmartWord.extend();

    MoveToNextSmartWord.description = "Move to next smart word (`/[\w-]+/`) word";

    MoveToNextSmartWord.prototype.wordRegex = /[\w-]+/g;

    return MoveToNextSmartWord;

  })(MoveToNextWord);

  MoveToPreviousSmartWord = (function(_super) {
    __extends(MoveToPreviousSmartWord, _super);

    function MoveToPreviousSmartWord() {
      return MoveToPreviousSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSmartWord.extend();

    MoveToPreviousSmartWord.description = "Move to previous smart word (`/[\w-]+/`) word";

    MoveToPreviousSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToPreviousSmartWord;

  })(MoveToPreviousWord);

  MoveToEndOfSmartWord = (function(_super) {
    __extends(MoveToEndOfSmartWord, _super);

    function MoveToEndOfSmartWord() {
      return MoveToEndOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfSmartWord.extend();

    MoveToEndOfSmartWord.description = "Move to end of smart word (`/[\w-]+/`) word";

    MoveToEndOfSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToEndOfSmartWord;

  })(MoveToEndOfWord);

  MoveToNextParagraph = (function(_super) {
    __extends(MoveToNextParagraph, _super);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.extend();

    MoveToNextParagraph.prototype.direction = 'next';

    MoveToNextParagraph.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          return cursor.setBufferPosition(_this.getPoint(cursor));
        };
      })(this));
    };

    MoveToNextParagraph.prototype.getPoint = function(cursor) {
      var cursorRow, options, row, wasAtNonBlankRow, _i, _len, _ref1;
      cursorRow = cursor.getBufferRow();
      wasAtNonBlankRow = !this.editor.isBufferRowBlank(cursorRow);
      options = {
        startRow: cursorRow,
        direction: this.direction,
        includeStartRow: false
      };
      _ref1 = getBufferRows(this.editor, options);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (this.editor.isBufferRowBlank(row)) {
          if (wasAtNonBlankRow) {
            return [row, 0];
          }
        } else {
          wasAtNonBlankRow = true;
        }
      }
      switch (this.direction) {
        case 'previous':
          return [0, 0];
        case 'next':
          return getVimEofBufferPosition(this.editor);
      }
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(_super) {
    __extends(MoveToPreviousParagraph, _super);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.extend();

    MoveToPreviousParagraph.prototype.direction = 'previous';

    return MoveToPreviousParagraph;

  })(MoveToNextParagraph);

  MoveToBeginningOfLine = (function(_super) {
    __extends(MoveToBeginningOfLine, _super);

    function MoveToBeginningOfLine() {
      return MoveToBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfLine.extend();

    MoveToBeginningOfLine.prototype.defaultCount = null;

    MoveToBeginningOfLine.prototype.getPoint = function(cursor) {
      return new Point(cursor.getBufferRow(), 0);
    };

    MoveToBeginningOfLine.prototype.moveCursor = function(cursor) {
      return cursor.setBufferPosition(this.getPoint(cursor));
    };

    return MoveToBeginningOfLine;

  })(Motion);

  MoveToLastCharacterOfLine = (function(_super) {
    __extends(MoveToLastCharacterOfLine, _super);

    function MoveToLastCharacterOfLine() {
      return MoveToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfLine.extend();

    MoveToLastCharacterOfLine.prototype.getCount = function() {
      return MoveToLastCharacterOfLine.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToLastCharacterOfLine.prototype.getPoint = function(cursor) {
      var row;
      row = getValidVimBufferRow(this.editor, cursor.getBufferRow() + this.getCount());
      return new Point(row, Infinity);
    };

    MoveToLastCharacterOfLine.prototype.moveCursor = function(cursor) {
      cursor.setBufferPosition(this.getPoint(cursor));
      return cursor.goalColumn = Infinity;
    };

    return MoveToLastCharacterOfLine;

  })(Motion);

  MoveToLastNonblankCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToLastNonblankCharacterOfLineAndDown, _super);

    function MoveToLastNonblankCharacterOfLineAndDown() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToLastNonblankCharacterOfLineAndDown.extend();

    MoveToLastNonblankCharacterOfLineAndDown.prototype.inclusive = true;

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.moveCursor = function(cursor) {
      return cursor.setBufferPosition(this.getPoint(cursor));
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getPoint = function(cursor) {
      var from, point, row;
      row = cursor.getBufferRow() + this.getCount();
      row = Math.min(row, getVimLastBufferRow(this.editor));
      from = new Point(row, Infinity);
      point = getStartPositionForPattern(this.editor, from, /\s*$/);
      return (point != null ? point : from).translate([0, -1]);
    };

    return MoveToLastNonblankCharacterOfLineAndDown;

  })(Motion);

  MoveToFirstCharacterOfLine = (function(_super) {
    __extends(MoveToFirstCharacterOfLine, _super);

    function MoveToFirstCharacterOfLine() {
      return MoveToFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLine.extend();

    MoveToFirstCharacterOfLine.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    MoveToFirstCharacterOfLine.prototype.getPoint = function(cursor) {
      return getFirstCharacterPositionForBufferRow(this.editor, cursor.getBufferRow());
    };

    return MoveToFirstCharacterOfLine;

  })(Motion);

  MoveToFirstCharacterOfLineUp = (function(_super) {
    __extends(MoveToFirstCharacterOfLineUp, _super);

    function MoveToFirstCharacterOfLineUp() {
      return MoveToFirstCharacterOfLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineUp.extend();

    MoveToFirstCharacterOfLineUp.prototype.linewise = true;

    MoveToFirstCharacterOfLineUp.prototype.moveCursor = function(cursor) {
      this.countTimes(function() {
        return moveCursorUpBuffer(cursor);
      });
      return MoveToFirstCharacterOfLineUp.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineUp;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineDown, _super);

    function MoveToFirstCharacterOfLineDown() {
      return MoveToFirstCharacterOfLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineDown.extend();

    MoveToFirstCharacterOfLineDown.prototype.linewise = true;

    MoveToFirstCharacterOfLineDown.prototype.moveCursor = function(cursor) {
      this.countTimes(function() {
        return moveCursorDownBuffer(cursor);
      });
      return MoveToFirstCharacterOfLineDown.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineDown;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineAndDown, _super);

    function MoveToFirstCharacterOfLineAndDown() {
      return MoveToFirstCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineAndDown.extend();

    MoveToFirstCharacterOfLineAndDown.prototype.defaultCount = 0;

    MoveToFirstCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToFirstCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    return MoveToFirstCharacterOfLineAndDown;

  })(MoveToFirstCharacterOfLineDown);

  MoveToFirstLine = (function(_super) {
    __extends(MoveToFirstLine, _super);

    function MoveToFirstLine() {
      return MoveToFirstLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstLine.extend();

    MoveToFirstLine.prototype.linewise = true;

    MoveToFirstLine.prototype.defaultCount = null;

    MoveToFirstLine.prototype.moveCursor = function(cursor) {
      cursor.setBufferPosition(this.getPoint(cursor));
      return cursor.autoscroll({
        center: true
      });
    };

    MoveToFirstLine.prototype.getPoint = function(cursor) {
      return getFirstCharacterPositionForBufferRow(this.editor, this.getRow());
    };

    MoveToFirstLine.prototype.getRow = function() {
      var count;
      if ((count = this.getCount())) {
        return count - 1;
      } else {
        return this.getDefaultRow();
      }
    };

    MoveToFirstLine.prototype.getDefaultRow = function() {
      return 0;
    };

    return MoveToFirstLine;

  })(Motion);

  MoveToLastLine = (function(_super) {
    __extends(MoveToLastLine, _super);

    function MoveToLastLine() {
      return MoveToLastLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastLine.extend();

    MoveToLastLine.prototype.getDefaultRow = function() {
      return getVimLastBufferRow(this.editor);
    };

    return MoveToLastLine;

  })(MoveToFirstLine);

  MoveToLineByPercent = (function(_super) {
    __extends(MoveToLineByPercent, _super);

    function MoveToLineByPercent() {
      return MoveToLineByPercent.__super__.constructor.apply(this, arguments);
    }

    MoveToLineByPercent.extend();

    MoveToLineByPercent.prototype.getRow = function() {
      var percent;
      percent = Math.min(100, this.getCount());
      return Math.floor(getVimLastScreenRow(this.editor) * (percent / 100));
    };

    return MoveToLineByPercent;

  })(MoveToFirstLine);

  MoveToRelativeLine = (function(_super) {
    __extends(MoveToRelativeLine, _super);

    function MoveToRelativeLine() {
      return MoveToRelativeLine.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLine.extend(false);

    MoveToRelativeLine.prototype.linewise = true;

    MoveToRelativeLine.prototype.moveCursor = function(cursor) {
      return cursor.setBufferPosition(this.getPoint(cursor));
    };

    MoveToRelativeLine.prototype.getCount = function() {
      return MoveToRelativeLine.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToRelativeLine.prototype.getPoint = function(cursor) {
      var row;
      row = cursor.getBufferRow() + this.getCount();
      return [row, 0];
    };

    return MoveToRelativeLine;

  })(Motion);

  MoveToRelativeLineWithMinimum = (function(_super) {
    __extends(MoveToRelativeLineWithMinimum, _super);

    function MoveToRelativeLineWithMinimum() {
      return MoveToRelativeLineWithMinimum.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLineWithMinimum.extend(false);

    MoveToRelativeLineWithMinimum.prototype.min = 0;

    MoveToRelativeLineWithMinimum.prototype.getCount = function() {
      return Math.max(this.min, MoveToRelativeLineWithMinimum.__super__.getCount.apply(this, arguments));
    };

    return MoveToRelativeLineWithMinimum;

  })(MoveToRelativeLine);

  MoveToTopOfScreen = (function(_super) {
    __extends(MoveToTopOfScreen, _super);

    function MoveToTopOfScreen() {
      return MoveToTopOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToTopOfScreen.extend();

    MoveToTopOfScreen.prototype.linewise = true;

    MoveToTopOfScreen.prototype.scrolloff = 2;

    MoveToTopOfScreen.prototype.defaultCount = 0;

    MoveToTopOfScreen.prototype.getCount = function() {
      return MoveToTopOfScreen.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToTopOfScreen.prototype.moveCursor = function(cursor) {
      return cursor.setBufferPosition(this.getPoint(cursor));
    };

    MoveToTopOfScreen.prototype.getPoint = function(cursor) {
      return getFirstCharacterBufferPositionForScreenRow(this.editor, this.getRow());
    };

    MoveToTopOfScreen.prototype.getRow = function() {
      var offset, row;
      row = getFirstVisibleScreenRow(this.editor);
      offset = this.scrolloff;
      if (row === 0) {
        offset = 0;
      }
      return row + Math.max(this.getCount(), offset);
    };

    return MoveToTopOfScreen;

  })(Motion);

  MoveToMiddleOfScreen = (function(_super) {
    __extends(MoveToMiddleOfScreen, _super);

    function MoveToMiddleOfScreen() {
      return MoveToMiddleOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToMiddleOfScreen.extend();

    MoveToMiddleOfScreen.prototype.getRow = function() {
      var endRow, startRow, vimLastScreenRow;
      startRow = getFirstVisibleScreenRow(this.editor);
      vimLastScreenRow = getVimLastScreenRow(this.editor);
      endRow = Math.min(this.editor.getLastVisibleScreenRow(), vimLastScreenRow);
      return startRow + Math.floor((endRow - startRow) / 2);
    };

    return MoveToMiddleOfScreen;

  })(MoveToTopOfScreen);

  MoveToBottomOfScreen = (function(_super) {
    __extends(MoveToBottomOfScreen, _super);

    function MoveToBottomOfScreen() {
      return MoveToBottomOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToBottomOfScreen.extend();

    MoveToBottomOfScreen.prototype.getRow = function() {
      var offset, row, vimLastScreenRow;
      vimLastScreenRow = getVimLastScreenRow(this.editor);
      row = Math.min(this.editor.getLastVisibleScreenRow(), vimLastScreenRow);
      offset = this.scrolloff + 1;
      if (row === vimLastScreenRow) {
        offset = 0;
      }
      return row - Math.max(this.getCount(), offset);
    };

    return MoveToBottomOfScreen;

  })(MoveToTopOfScreen);

  ScrollFullScreenDown = (function(_super) {
    __extends(ScrollFullScreenDown, _super);

    function ScrollFullScreenDown() {
      return ScrollFullScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenDown.extend();

    ScrollFullScreenDown.prototype.coefficient = +1;

    ScrollFullScreenDown.prototype.initialize = function() {
      var amountInPixel;
      this.rowsToScroll = this.editor.getRowsPerPage() * this.coefficient;
      amountInPixel = this.rowsToScroll * this.editor.getLineHeightInPixels();
      return this.newScrollTop = this.editorElement.getScrollTop() + amountInPixel;
    };

    ScrollFullScreenDown.prototype.scroll = function() {
      return this.editorElement.setScrollTop(this.newScrollTop);
    };

    ScrollFullScreenDown.prototype.select = function() {
      ScrollFullScreenDown.__super__.select.apply(this, arguments);
      return this.scroll();
    };

    ScrollFullScreenDown.prototype.execute = function() {
      ScrollFullScreenDown.__super__.execute.apply(this, arguments);
      return this.scroll();
    };

    ScrollFullScreenDown.prototype.moveCursor = function(cursor) {
      var row;
      row = Math.floor(this.editor.getCursorScreenPosition().row + this.rowsToScroll);
      row = Math.min(getVimLastScreenRow(this.editor), row);
      return cursor.setScreenPosition([row, 0], {
        autoscroll: false
      });
    };

    return ScrollFullScreenDown;

  })(Motion);

  ScrollFullScreenUp = (function(_super) {
    __extends(ScrollFullScreenUp, _super);

    function ScrollFullScreenUp() {
      return ScrollFullScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenUp.extend();

    ScrollFullScreenUp.prototype.coefficient = -1;

    return ScrollFullScreenUp;

  })(ScrollFullScreenDown);

  ScrollHalfScreenDown = (function(_super) {
    __extends(ScrollHalfScreenDown, _super);

    function ScrollHalfScreenDown() {
      return ScrollHalfScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenDown.extend();

    ScrollHalfScreenDown.prototype.coefficient = +1 / 2;

    return ScrollHalfScreenDown;

  })(ScrollFullScreenDown);

  ScrollHalfScreenUp = (function(_super) {
    __extends(ScrollHalfScreenUp, _super);

    function ScrollHalfScreenUp() {
      return ScrollHalfScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenUp.extend();

    ScrollHalfScreenUp.prototype.coefficient = -1 / 2;

    return ScrollHalfScreenUp;

  })(ScrollHalfScreenDown);

  Find = (function(_super) {
    __extends(Find, _super);

    function Find() {
      return Find.__super__.constructor.apply(this, arguments);
    }

    Find.extend();

    Find.prototype.backwards = false;

    Find.prototype.inclusive = true;

    Find.prototype.hover = {
      icon: ':find:',
      emoji: ':mag_right:'
    };

    Find.prototype.offset = 0;

    Find.prototype.requireInput = true;

    Find.prototype.initialize = function() {
      if (!this.isRepeated()) {
        return this.focusInput();
      }
    };

    Find.prototype.isBackwards = function() {
      return this.backwards;
    };

    Find.prototype.getPoint = function(cursor) {
      var cursorPoint, end, method, offset, points, scanRange, start, unOffset, _ref1, _ref2;
      cursorPoint = cursor.getBufferPosition();
      _ref1 = this.editor.bufferRangeForBufferRow(cursorPoint.row), start = _ref1.start, end = _ref1.end;
      offset = this.isBackwards() ? this.offset : -this.offset;
      unOffset = -offset * this.isRepeated();
      if (this.isBackwards()) {
        scanRange = [start, cursorPoint.translate([0, unOffset])];
        method = 'backwardsScanInBufferRange';
      } else {
        scanRange = [cursorPoint.translate([0, 1 + unOffset]), end];
        method = 'scanInBufferRange';
      }
      points = [];
      this.editor[method](RegExp("" + (_.escapeRegExp(this.input)), "g"), scanRange, function(_arg) {
        var range;
        range = _arg.range;
        return points.push(range.start);
      });
      return (_ref2 = points[this.getCount()]) != null ? _ref2.translate([0, offset]) : void 0;
    };

    Find.prototype.getCount = function() {
      return Find.__super__.getCount.apply(this, arguments) - 1;
    };

    Find.prototype.moveCursor = function(cursor) {
      this.setBufferPositionSafely(cursor, this.getPoint(cursor));
      if (!this.isRepeated()) {
        return globalState.currentFind = this;
      }
    };

    return Find;

  })(Motion);

  FindBackwards = (function(_super) {
    __extends(FindBackwards, _super);

    function FindBackwards() {
      return FindBackwards.__super__.constructor.apply(this, arguments);
    }

    FindBackwards.extend();

    FindBackwards.prototype.inclusive = false;

    FindBackwards.prototype.backwards = true;

    FindBackwards.prototype.hover = {
      icon: ':find:',
      emoji: ':mag:'
    };

    return FindBackwards;

  })(Find);

  Till = (function(_super) {
    __extends(Till, _super);

    function Till() {
      return Till.__super__.constructor.apply(this, arguments);
    }

    Till.extend();

    Till.prototype.offset = 1;

    Till.prototype.getPoint = function() {
      return this.point = Till.__super__.getPoint.apply(this, arguments);
    };

    Till.prototype.selectInclusively = function(selection) {
      Till.__super__.selectInclusively.apply(this, arguments);
      if (selection.isEmpty() && ((this.point != null) && !this.backwards)) {
        return selection.selectRight();
      }
    };

    return Till;

  })(Find);

  TillBackwards = (function(_super) {
    __extends(TillBackwards, _super);

    function TillBackwards() {
      return TillBackwards.__super__.constructor.apply(this, arguments);
    }

    TillBackwards.extend();

    TillBackwards.prototype.inclusive = false;

    TillBackwards.prototype.backwards = true;

    return TillBackwards;

  })(Till);

  RepeatFind = (function(_super) {
    __extends(RepeatFind, _super);

    function RepeatFind() {
      return RepeatFind.__super__.constructor.apply(this, arguments);
    }

    RepeatFind.extend();

    RepeatFind.prototype.repeated = true;

    RepeatFind.prototype.initialize = function() {
      var findObj;
      if (!(findObj = globalState.currentFind)) {
        this.abort();
      }
      return this.offset = findObj.offset, this.backwards = findObj.backwards, this.input = findObj.input, findObj;
    };

    return RepeatFind;

  })(Find);

  RepeatFindReverse = (function(_super) {
    __extends(RepeatFindReverse, _super);

    function RepeatFindReverse() {
      return RepeatFindReverse.__super__.constructor.apply(this, arguments);
    }

    RepeatFindReverse.extend();

    RepeatFindReverse.prototype.isBackwards = function() {
      return !this.backwards;
    };

    return RepeatFindReverse;

  })(RepeatFind);

  MoveToMark = (function(_super) {
    __extends(MoveToMark, _super);

    function MoveToMark() {
      return MoveToMark.__super__.constructor.apply(this, arguments);
    }

    MoveToMark.extend();

    MoveToMark.prototype.requireInput = true;

    MoveToMark.prototype.hover = {
      icon: ":move-to-mark:`",
      emoji: ":round_pushpin:`"
    };

    MoveToMark.prototype.initialize = function() {
      return this.focusInput();
    };

    MoveToMark.prototype.getPoint = function(cursor) {
      var input, point;
      input = this.getInput();
      point = null;
      point = this.vimState.mark.get(input);
      if (input === '`') {
        if (point == null) {
          point = [0, 0];
        }
        this.vimState.mark.set('`', cursor.getBufferPosition());
      }
      if ((point != null) && this.linewise) {
        point = getFirstCharacterPositionForBufferRow(this.editor, point.row);
      }
      return point;
    };

    MoveToMark.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    return MoveToMark;

  })(Motion);

  MoveToMarkLine = (function(_super) {
    __extends(MoveToMarkLine, _super);

    function MoveToMarkLine() {
      return MoveToMarkLine.__super__.constructor.apply(this, arguments);
    }

    MoveToMarkLine.extend();

    MoveToMarkLine.prototype.linewise = true;

    MoveToMarkLine.prototype.hover = {
      icon: ":move-to-mark:'",
      emoji: ":round_pushpin:'"
    };

    return MoveToMarkLine;

  })(MoveToMark);

  SearchBase = (function(_super) {
    __extends(SearchBase, _super);

    function SearchBase() {
      return SearchBase.__super__.constructor.apply(this, arguments);
    }

    SearchBase.extend(false);

    SearchBase.prototype.backwards = false;

    SearchBase.prototype.useRegexp = true;

    SearchBase.prototype.configScope = null;

    SearchBase.prototype.getCount = function() {
      var count;
      count = SearchBase.__super__.getCount.apply(this, arguments) - 1;
      if (this.isBackwards()) {
        count = -count;
      }
      return count;
    };

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.isCaseSensitive = function(term) {
      switch (this.getCaseSensitivity()) {
        case 'smartcase':
          return term.search('[A-Z]') !== -1;
        case 'insensitive':
          return false;
        case 'sensitive':
          return true;
      }
    };

    SearchBase.prototype.getCaseSensitivity = function() {
      if (settings.get("useSmartcaseFor" + this.configScope)) {
        return 'smartcase';
      } else if (settings.get("ignoreCaseFor" + this.configScope)) {
        return 'insensitive';
      } else {
        return 'sensitive';
      }
    };

    SearchBase.prototype.finish = function() {
      var _ref1;
      if ((typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0) && settings.get('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      if ((_ref1 = this.matches) != null) {
        _ref1.destroy();
      }
      return this.matches = null;
    };

    SearchBase.prototype.flashScreen = function() {
      highlightRanges(this.editor, getVisibleBufferRange(this.editor), {
        "class": 'vim-mode-plus-flash',
        timeout: 100
      });
      return atom.beep();
    };

    SearchBase.prototype.getPoint = function(cursor) {
      var input;
      input = this.getInput();
      if (this.matches == null) {
        this.matches = this.getMatchList(cursor, input);
      }
      if (this.matches.isEmpty()) {
        return null;
      } else {
        return this.matches.getCurrentStartPosition();
      }
    };

    SearchBase.prototype.moveCursor = function(cursor) {
      var input, point;
      input = this.getInput();
      if (input === '') {
        this.finish();
        return;
      }
      if (point = this.getPoint(cursor)) {
        this.visitMatch("current", {
          timeout: settings.get('showHoverSearchCounterDuration'),
          landing: true
        });
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
      } else {
        if (settings.get('flashScreenOnSearchHasNoMatch')) {
          this.flashScreen();
        }
      }
      globalState.currentSearch = this;
      this.vimState.searchHistory.save(input);
      globalState.highlightSearchPattern = this.getPattern(input);
      this.vimState.main.emitDidSetHighlightSearchPattern();
      return this.finish();
    };

    SearchBase.prototype.getFromPoint = function(cursor) {
      if (this.isMode('visual', 'linewise') && (typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0)) {
        return swrap(cursor.selection).getCharacterwiseHeadPosition();
      } else {
        return cursor.getBufferPosition();
      }
    };

    SearchBase.prototype.getMatchList = function(cursor, input) {
      return MatchList.fromScan(this.editor, {
        fromPoint: this.getFromPoint(cursor),
        pattern: this.getPattern(input),
        direction: (this.isBackwards() ? 'backward' : 'forward'),
        countOffset: this.getCount()
      });
    };

    SearchBase.prototype.visitMatch = function(direction, options) {
      var flashOptions, landing, match, timeout;
      if (direction == null) {
        direction = null;
      }
      if (options == null) {
        options = {};
      }
      timeout = options.timeout, landing = options.landing;
      if (landing == null) {
        landing = false;
      }
      match = this.matches.get(direction);
      match.scrollToStartPoint();
      flashOptions = {
        "class": 'vim-mode-plus-flash',
        timeout: settings.get('flashOnSearchDuration')
      };
      if (landing) {
        if (settings.get('flashOnSearch') && !(typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0)) {
          match.flash(flashOptions);
        }
      } else {
        this.matches.refresh();
        if (settings.get('flashOnSearch')) {
          match.flash(flashOptions);
        }
      }
      if (settings.get('showHoverSearchCounter')) {
        return this.vimState.hoverSearchCounter.withTimeout(match.getStartPoint(), {
          text: this.matches.getCounterText(),
          classList: match.getClassList(),
          timeout: timeout
        });
      }
    };

    return SearchBase;

  })(Motion);

  Search = (function(_super) {
    __extends(Search, _super);

    function Search() {
      return Search.__super__.constructor.apply(this, arguments);
    }

    Search.extend();

    Search.prototype.configScope = "Search";

    Search.prototype.requireInput = true;

    Search.prototype.isIncrementalSearch = function() {
      return settings.get('incrementalSearch');
    };

    Search.prototype.initialize = function() {
      if (this.isIncrementalSearch()) {
        this.setIncrementalSearch();
      }
      this.onDidConfirmSearch((function(_this) {
        return function(input) {
          var searchChar, _ref1;
          _this.input = input;
          if (!_this.isIncrementalSearch()) {
            searchChar = _this.isBackwards() ? '?' : '/';
            if ((_ref1 = _this.input) === '' || _ref1 === searchChar) {
              _this.input = _this.vimState.searchHistory.get('prev');
              if (!_this.input) {
                atom.beep();
              }
            }
          }
          return _this.processOperation();
        };
      })(this));
      this.onDidCancelSearch((function(_this) {
        return function() {
          if (!(_this.isMode('visual') || _this.isMode('insert'))) {
            _this.vimState.resetNormalMode();
          }
          if (typeof _this.restoreEditorState === "function") {
            _this.restoreEditorState();
          }
          _this.vimState.reset();
          return _this.finish();
        };
      })(this));
      this.onDidChangeSearch((function(_this) {
        return function(input) {
          _this.input = input;
          if (_this.input.startsWith(' ')) {
            _this.useRegexp = false;
            _this.input = input.replace(/^ /, '');
          } else {
            _this.useRegexp = true;
          }
          _this.vimState.searchInput.updateOptionSettings({
            useRegexp: _this.useRegexp
          });
          if (_this.isIncrementalSearch()) {
            return _this.visitCursors();
          }
        };
      })(this));
      return this.vimState.searchInput.focus({
        backwards: this.backwards
      });
    };

    Search.prototype.setIncrementalSearch = function() {
      this.restoreEditorState = saveEditorState(this.editor);
      this.subscribe(this.editorElement.onDidChangeScrollTop((function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.matches) != null ? _ref1.refresh() : void 0;
        };
      })(this)));
      this.subscribe(this.editorElement.onDidChangeScrollLeft((function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.matches) != null ? _ref1.refresh() : void 0;
        };
      })(this)));
      return this.onDidCommandSearch((function(_this) {
        return function(command) {
          if (!_this.input) {
            return;
          }
          if (_this.matches.isEmpty()) {
            return;
          }
          switch (command) {
            case 'visit-next':
              return _this.visitMatch('next');
            case 'visit-prev':
              return _this.visitMatch('prev');
          }
        };
      })(this));
    };

    Search.prototype.visitCursors = function() {
      var cursor, input, visitCursor, _i, _len, _ref1, _ref2, _results;
      visitCursor = (function(_this) {
        return function(cursor) {
          if (_this.matches == null) {
            _this.matches = _this.getMatchList(cursor, input);
          }
          if (_this.matches.isEmpty()) {
            if (settings.get('flashScreenOnSearchHasNoMatch')) {
              return _this.flashScreen();
            }
          } else {
            return _this.visitMatch();
          }
        };
      })(this);
      if ((_ref1 = this.matches) != null) {
        _ref1.destroy();
      }
      this.matches = null;
      if (settings.get('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      input = this.getInput();
      if (input !== '') {
        _ref2 = this.editor.getCursors();
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          cursor = _ref2[_i];
          _results.push(visitCursor(cursor));
        }
        return _results;
      }
    };

    Search.prototype.getPattern = function(term) {
      var modifiers;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (__indexOf.call(modifiers, 'i') < 0) {
          modifiers += 'i';
        }
      }
      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (_error) {
          return new RegExp(_.escapeRegExp(term), modifiers);
        }
      } else {
        return new RegExp(_.escapeRegExp(term), modifiers);
      }
    };

    return Search;

  })(SearchBase);

  SearchBackwards = (function(_super) {
    __extends(SearchBackwards, _super);

    function SearchBackwards() {
      return SearchBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchBackwards.extend();

    SearchBackwards.prototype.backwards = true;

    return SearchBackwards;

  })(Search);

  SearchCurrentWord = (function(_super) {
    __extends(SearchCurrentWord, _super);

    function SearchCurrentWord() {
      return SearchCurrentWord.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWord.extend();

    SearchCurrentWord.prototype.configScope = "SearchCurrentWord";

    SearchCurrentWord.prototype.getInput = function() {
      var wordRange;
      return this.input != null ? this.input : this.input = (wordRange = this.getCurrentWordBufferRange(), wordRange != null ? (this.editor.setCursorBufferPosition(wordRange.start), this.editor.getTextInBufferRange(wordRange)) : '');
    };

    SearchCurrentWord.prototype.getPattern = function(term) {
      var modifiers, pattern;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      pattern = _.escapeRegExp(term);
      if (/\W/.test(term)) {
        return new RegExp("" + pattern + "\\b", modifiers);
      } else {
        return new RegExp("\\b" + pattern + "\\b", modifiers);
      }
    };

    SearchCurrentWord.prototype.getCurrentWordBufferRange = function() {
      var cursorPosition, pattern, scanRange, wordRange, _ref1;
      wordRange = null;
      cursorPosition = this.editor.getCursorBufferPosition();
      scanRange = this.editor.bufferRangeForBufferRow(cursorPosition.row);
      pattern = new RegExp((_ref1 = settings.get('iskeyword')) != null ? _ref1 : IsKeywordDefault, 'g');
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.end.isGreaterThan(cursorPosition)) {
          wordRange = range;
          return stop();
        }
      });
      return wordRange;
    };

    return SearchCurrentWord;

  })(SearchBase);

  SearchCurrentWordBackwards = (function(_super) {
    __extends(SearchCurrentWordBackwards, _super);

    function SearchCurrentWordBackwards() {
      return SearchCurrentWordBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWordBackwards.extend();

    SearchCurrentWordBackwards.prototype.backwards = true;

    return SearchCurrentWordBackwards;

  })(SearchCurrentWord);

  RepeatSearch = (function(_super) {
    __extends(RepeatSearch, _super);

    function RepeatSearch() {
      return RepeatSearch.__super__.constructor.apply(this, arguments);
    }

    RepeatSearch.extend();

    RepeatSearch.prototype.initialize = function() {
      var search;
      if (!(search = globalState.currentSearch)) {
        this.abort();
      }
      return this.input = search.input, this.backwards = search.backwards, this.getPattern = search.getPattern, this.getCaseSensitivity = search.getCaseSensitivity, this.configScope = search.configScope, search;
    };

    return RepeatSearch;

  })(SearchBase);

  RepeatSearchReverse = (function(_super) {
    __extends(RepeatSearchReverse, _super);

    function RepeatSearchReverse() {
      return RepeatSearchReverse.__super__.constructor.apply(this, arguments);
    }

    RepeatSearchReverse.extend();

    RepeatSearchReverse.prototype.isBackwards = function() {
      return !this.backwards;
    };

    return RepeatSearchReverse;

  })(RepeatSearch);

  MoveToPreviousFoldStart = (function(_super) {
    __extends(MoveToPreviousFoldStart, _super);

    function MoveToPreviousFoldStart() {
      return MoveToPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStart.extend();

    MoveToPreviousFoldStart.description = "Move to previous fold start";

    MoveToPreviousFoldStart.prototype.linewise = true;

    MoveToPreviousFoldStart.prototype.which = 'start';

    MoveToPreviousFoldStart.prototype.direction = 'prev';

    MoveToPreviousFoldStart.prototype.initialize = function() {
      this.rows = this.getFoldRow(this.which);
      if (this.direction === 'prev') {
        return this.rows.reverse();
      }
    };

    MoveToPreviousFoldStart.prototype.getFoldRow = function(which) {
      var index, rows;
      index = which === 'start' ? 0 : 1;
      rows = getCodeFoldRowRanges(this.editor).map(function(rowRange) {
        return rowRange[index];
      });
      return _.sortBy(_.uniq(rows), function(row) {
        return row;
      });
    };

    MoveToPreviousFoldStart.prototype.getScanRows = function(cursor) {
      var cursorRow, isValidRow;
      cursorRow = cursor.getBufferRow();
      isValidRow = (function() {
        switch (this.direction) {
          case 'prev':
            return function(row) {
              return row < cursorRow;
            };
          case 'next':
            return function(row) {
              return row > cursorRow;
            };
        }
      }).call(this);
      return this.rows.filter(isValidRow);
    };

    MoveToPreviousFoldStart.prototype.detectRow = function(cursor) {
      return this.getScanRows(cursor)[0];
    };

    MoveToPreviousFoldStart.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var row;
          if ((row = _this.detectRow(cursor)) != null) {
            return moveCursorToFirstCharacterAtRow(cursor, row);
          }
        };
      })(this));
    };

    return MoveToPreviousFoldStart;

  })(Motion);

  MoveToNextFoldStart = (function(_super) {
    __extends(MoveToNextFoldStart, _super);

    function MoveToNextFoldStart() {
      return MoveToNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStart.extend();

    MoveToNextFoldStart.description = "Move to next fold start";

    MoveToNextFoldStart.prototype.direction = 'next';

    return MoveToNextFoldStart;

  })(MoveToPreviousFoldStart);

  MoveToPreviousFoldStartWithSameIndent = (function(_super) {
    __extends(MoveToPreviousFoldStartWithSameIndent, _super);

    function MoveToPreviousFoldStartWithSameIndent() {
      return MoveToPreviousFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStartWithSameIndent.extend();

    MoveToPreviousFoldStartWithSameIndent.description = "Move to previous same-indented fold start";

    MoveToPreviousFoldStartWithSameIndent.prototype.detectRow = function(cursor) {
      var baseIndentLevel, row, _i, _len, _ref1;
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, cursor.getBufferRow());
      _ref1 = this.getScanRows(cursor);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (getIndentLevelForBufferRow(this.editor, row) === baseIndentLevel) {
          return row;
        }
      }
      return null;
    };

    return MoveToPreviousFoldStartWithSameIndent;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldStartWithSameIndent = (function(_super) {
    __extends(MoveToNextFoldStartWithSameIndent, _super);

    function MoveToNextFoldStartWithSameIndent() {
      return MoveToNextFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStartWithSameIndent.extend();

    MoveToNextFoldStartWithSameIndent.description = "Move to next same-indented fold start";

    MoveToNextFoldStartWithSameIndent.prototype.direction = 'next';

    return MoveToNextFoldStartWithSameIndent;

  })(MoveToPreviousFoldStartWithSameIndent);

  MoveToPreviousFoldEnd = (function(_super) {
    __extends(MoveToPreviousFoldEnd, _super);

    function MoveToPreviousFoldEnd() {
      return MoveToPreviousFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldEnd.extend();

    MoveToPreviousFoldEnd.description = "Move to previous fold end";

    MoveToPreviousFoldEnd.prototype.which = 'end';

    return MoveToPreviousFoldEnd;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldEnd = (function(_super) {
    __extends(MoveToNextFoldEnd, _super);

    function MoveToNextFoldEnd() {
      return MoveToNextFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldEnd.extend();

    MoveToNextFoldEnd.description = "Move to next fold end";

    MoveToNextFoldEnd.prototype.direction = 'next';

    return MoveToNextFoldEnd;

  })(MoveToPreviousFoldEnd);

  MoveToPreviousFunction = (function(_super) {
    __extends(MoveToPreviousFunction, _super);

    function MoveToPreviousFunction() {
      return MoveToPreviousFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFunction.extend();

    MoveToPreviousFunction.description = "Move to previous function";

    MoveToPreviousFunction.prototype.direction = 'prev';

    MoveToPreviousFunction.prototype.detectRow = function(cursor) {
      return _.detect(this.getScanRows(cursor), (function(_this) {
        return function(row) {
          return isIncludeFunctionScopeForRow(_this.editor, row);
        };
      })(this));
    };

    return MoveToPreviousFunction;

  })(MoveToPreviousFoldStart);

  MoveToNextFunction = (function(_super) {
    __extends(MoveToNextFunction, _super);

    function MoveToNextFunction() {
      return MoveToNextFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFunction.extend();

    MoveToNextFunction.description = "Move to next function";

    MoveToNextFunction.prototype.direction = 'next';

    return MoveToNextFunction;

  })(MoveToPreviousFunction);

  MoveToPositionByScope = (function(_super) {
    __extends(MoveToPositionByScope, _super);

    function MoveToPositionByScope() {
      return MoveToPositionByScope.__super__.constructor.apply(this, arguments);
    }

    MoveToPositionByScope.extend(false);

    MoveToPositionByScope.prototype.direction = 'backward';

    MoveToPositionByScope.prototype.scope = '.';

    MoveToPositionByScope.prototype.getPoint = function(from) {
      return detectScopeStartPositionForScope(this.editor, from, this.direction, this.scope);
    };

    MoveToPositionByScope.prototype.moveCursor = function(cursor) {
      var finalPoint, point;
      point = cursor.getBufferPosition();
      finalPoint = null;
      this.countTimes((function(_this) {
        return function() {
          if ((point != null) && (point = _this.getPoint(point))) {
            return finalPoint = point;
          }
        };
      })(this));
      return this.setBufferPositionSafely(cursor, finalPoint);
    };

    return MoveToPositionByScope;

  })(Motion);

  MoveToPreviousString = (function(_super) {
    __extends(MoveToPreviousString, _super);

    function MoveToPreviousString() {
      return MoveToPreviousString.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousString.extend();

    MoveToPreviousString.description = "Move to previous string(searched by `string.begin` scope)";

    MoveToPreviousString.prototype.direction = 'backward';

    MoveToPreviousString.prototype.scope = 'string.begin';

    return MoveToPreviousString;

  })(MoveToPositionByScope);

  MoveToNextString = (function(_super) {
    __extends(MoveToNextString, _super);

    function MoveToNextString() {
      return MoveToNextString.__super__.constructor.apply(this, arguments);
    }

    MoveToNextString.extend();

    MoveToNextString.description = "Move to next string(searched by `string.begin` scope)";

    MoveToNextString.prototype.direction = 'forward';

    return MoveToNextString;

  })(MoveToPreviousString);

  MoveToPreviousNumber = (function(_super) {
    __extends(MoveToPreviousNumber, _super);

    function MoveToPreviousNumber() {
      return MoveToPreviousNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousNumber.extend();

    MoveToPreviousNumber.prototype.direction = 'backward';

    MoveToPreviousNumber.description = "Move to previous number(searched by `constant.numeric` scope)";

    MoveToPreviousNumber.prototype.scope = 'constant.numeric';

    return MoveToPreviousNumber;

  })(MoveToPositionByScope);

  MoveToNextNumber = (function(_super) {
    __extends(MoveToNextNumber, _super);

    function MoveToNextNumber() {
      return MoveToNextNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToNextNumber.extend();

    MoveToNextNumber.description = "Move to next number(searched by `constant.numeric` scope)";

    MoveToNextNumber.prototype.direction = 'forward';

    return MoveToNextNumber;

  })(MoveToPreviousNumber);

  MoveToPair = (function(_super) {
    __extends(MoveToPair, _super);

    function MoveToPair() {
      return MoveToPair.__super__.constructor.apply(this, arguments);
    }

    MoveToPair.extend();

    MoveToPair.prototype.inclusive = true;

    MoveToPair.prototype.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket'];

    MoveToPair.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    MoveToPair.prototype.getPoint = function(cursor) {
      var cursorPosition, cursorRow, enclosingRange, enclosingRanges, forwardingRanges, ranges, _ref1, _ref2;
      ranges = this["new"]("AAnyPair", {
        allowForwarding: true,
        member: this.member
      }).getRanges(cursor.selection);
      cursorPosition = cursor.getBufferPosition();
      cursorRow = cursorPosition.row;
      ranges = ranges.filter(function(_arg) {
        var end, start;
        start = _arg.start, end = _arg.end;
        if ((cursorRow === start.row) && start.isGreaterThanOrEqual(cursorPosition)) {
          return true;
        }
        if ((cursorRow === end.row) && end.isGreaterThanOrEqual(cursorPosition)) {
          return true;
        }
      });
      if (!ranges.length) {
        return null;
      }
      _ref1 = _.partition(ranges, function(range) {
        return range.containsPoint(cursorPosition, true);
      }), enclosingRanges = _ref1[0], forwardingRanges = _ref1[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return ((_ref2 = forwardingRanges[0]) != null ? _ref2.end.translate([0, -1]) : void 0) || (enclosingRange != null ? enclosingRange.start : void 0);
    };

    return MoveToPair;

  })(Motion);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd3RFQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FERCxDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUhkLENBQUE7O0FBQUEsRUFJQSxPQTJCSSxPQUFBLENBQVEsU0FBUixDQTNCSixFQUNFLHVCQUFBLGVBREYsRUFDbUIsNkJBQUEscUJBRG5CLEVBRUUsc0JBQUEsY0FGRixFQUVrQix1QkFBQSxlQUZsQixFQUdFLG9CQUFBLFlBSEYsRUFHZ0Isc0JBQUEsY0FIaEIsRUFJRSw0QkFBQSxvQkFKRixFQUtFLDBCQUFBLGtCQUxGLEVBTUUsOEJBQUEsc0JBTkYsRUFPRSxnQ0FBQSx3QkFQRixFQU80QiwrQkFBQSx1QkFQNUIsRUFRRSwrQkFBQSx1QkFSRixFQVNFLDJCQUFBLG1CQVRGLEVBU3VCLDJCQUFBLG1CQVR2QixFQVVFLDRCQUFBLG9CQVZGLEVBVXdCLDRCQUFBLG9CQVZ4QixFQVdFLGlDQUFBLHlCQVhGLEVBWUUsdUJBQUEsZUFaRixFQWFFLHVDQUFBLCtCQWJGLEVBY0Usa0JBQUEsVUFkRixFQWVFLGtDQUFBLDBCQWZGLEVBZ0JFLDRCQUFBLG9CQWhCRixFQWlCRSxxQ0FBQSw2QkFqQkYsRUFrQkUsMEJBQUEsa0JBbEJGLEVBbUJFLDRCQUFBLG9CQW5CRixFQW9CRSxvQ0FBQSw0QkFwQkYsRUFxQkUsd0NBQUEsZ0NBckJGLEVBc0JFLDRCQUFBLG9CQXRCRixFQXVCRSxxQkFBQSxhQXZCRixFQXdCRSxr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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/lib/motion.coffee
