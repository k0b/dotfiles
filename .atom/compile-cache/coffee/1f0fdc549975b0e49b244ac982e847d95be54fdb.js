(function() {
  var AAngleBracket, AAngleBracketAllowForwarding, AAnyPair, AAnyPairAllowForwarding, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurlyBracketAllowForwarding, ACurrentLine, ADoubleQuote, AEntire, AFold, AFunction, AIndentation, ALatestChange, AParagraph, AParenthesis, AParenthesisAllowForwarding, ASingleQuote, ASmartWord, ASquareBracket, ASquareBracketAllowForwarding, ATag, AWholeWord, AWord, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, BackTick, Base, Comment, CurlyBracket, CurrentLine, DoubleQuote, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAngleBracketAllowForwarding, InnerAnyPair, InnerAnyPairAllowForwarding, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurlyBracketAllowForwarding, InnerCurrentLine, InnerDoubleQuote, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerParenthesisAllowForwarding, InnerSingleQuote, InnerSmartWord, InnerSquareBracket, InnerSquareBracketAllowForwarding, InnerTag, InnerWholeWord, InnerWord, LatestChange, Pair, Paragraph, Parenthesis, Point, Quote, Range, SingleQuote, SmartWord, SquareBracket, Tag, TextObject, WholeWord, Word, countChar, getBufferRangeForRowRange, getCodeFoldRowRangesContainesForRow, getEndPositionForPattern, getIndentLevelForBufferRow, getStartPositionForPattern, getTextToPoint, getWordRegExpForPointWithCursor, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, pointIsSurroundedByWhitespace, sortRanges, sortRangesByEnd, swrap, tagPattern, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  Base = require('./base');

  swrap = require('./selection-wrapper');

  _ref1 = require('./utils'), sortRanges = _ref1.sortRanges, sortRangesByEnd = _ref1.sortRangesByEnd, countChar = _ref1.countChar, pointIsAtEndOfLine = _ref1.pointIsAtEndOfLine, getTextToPoint = _ref1.getTextToPoint, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, getCodeFoldRowRangesContainesForRow = _ref1.getCodeFoldRowRangesContainesForRow, getBufferRangeForRowRange = _ref1.getBufferRangeForRowRange, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, pointIsSurroundedByWhitespace = _ref1.pointIsSurroundedByWhitespace, getWordRegExpForPointWithCursor = _ref1.getWordRegExpForPointWithCursor, getStartPositionForPattern = _ref1.getStartPositionForPattern, getEndPositionForPattern = _ref1.getEndPositionForPattern;

  TextObject = (function(_super) {
    __extends(TextObject, _super);

    TextObject.extend(false);

    TextObject.prototype.allowSubmodeChange = true;

    function TextObject() {
      this.constructor.prototype.inner = this.getName().startsWith('Inner');
      TextObject.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    TextObject.prototype.isInner = function() {
      return this.inner;
    };

    TextObject.prototype.isA = function() {
      return !this.isInner();
    };

    TextObject.prototype.isAllowSubmodeChange = function() {
      return this.allowSubmodeChange;
    };

    TextObject.prototype.isLinewise = function() {
      if (this.isAllowSubmodeChange()) {
        return swrap.detectVisualModeSubmode(this.editor) === 'linewise';
      } else {
        return this.vimState.submode === 'linewise';
      }
    };

    TextObject.prototype.select = function() {
      var selection, _i, _len, _ref2;
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        this.selectTextObject(selection);
      }
      if (this.isMode('visual')) {
        return this.updateSelectionProperties();
      }
    };

    return TextObject;

  })(Base);

  Word = (function(_super) {
    __extends(Word, _super);

    function Word() {
      return Word.__super__.constructor.apply(this, arguments);
    }

    Word.extend(false);

    Word.prototype.getPattern = function(selection) {
      var point, _ref2;
      point = swrap(selection).getNormalizedBufferPosition();
      if (pointIsSurroundedByWhitespace(this.editor, point)) {
        return /[\t ]*/;
      } else {
        return (_ref2 = this.wordRegExp) != null ? _ref2 : getWordRegExpForPointWithCursor(selection.cursor, point);
      }
    };

    Word.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getRange(selection));
    };

    Word.prototype.getRange = function(selection) {
      var end, endOfSpace, from, options, pattern, start;
      pattern = this.getPattern(selection);
      from = swrap(selection).getNormalizedBufferPosition();
      options = {
        containedOnly: true
      };
      start = getStartPositionForPattern(this.editor, from, pattern, options);
      end = getEndPositionForPattern(this.editor, from, pattern, options);
      if (start == null) {
        start = from;
      }
      if (end == null) {
        end = from;
      }
      if (this.isA() && (endOfSpace = getEndPositionForPattern(this.editor, end, /\s+/, options))) {
        end = endOfSpace;
      }
      if (!start.isEqual(end)) {
        return new Range(start, end);
      } else {
        return null;
      }
    };

    return Word;

  })(TextObject);

  AWord = (function(_super) {
    __extends(AWord, _super);

    function AWord() {
      return AWord.__super__.constructor.apply(this, arguments);
    }

    AWord.extend();

    return AWord;

  })(Word);

  InnerWord = (function(_super) {
    __extends(InnerWord, _super);

    function InnerWord() {
      return InnerWord.__super__.constructor.apply(this, arguments);
    }

    InnerWord.extend();

    return InnerWord;

  })(Word);

  WholeWord = (function(_super) {
    __extends(WholeWord, _super);

    function WholeWord() {
      return WholeWord.__super__.constructor.apply(this, arguments);
    }

    WholeWord.extend(false);

    WholeWord.prototype.wordRegExp = /\S+/;

    return WholeWord;

  })(Word);

  AWholeWord = (function(_super) {
    __extends(AWholeWord, _super);

    function AWholeWord() {
      return AWholeWord.__super__.constructor.apply(this, arguments);
    }

    AWholeWord.extend();

    return AWholeWord;

  })(WholeWord);

  InnerWholeWord = (function(_super) {
    __extends(InnerWholeWord, _super);

    function InnerWholeWord() {
      return InnerWholeWord.__super__.constructor.apply(this, arguments);
    }

    InnerWholeWord.extend();

    return InnerWholeWord;

  })(WholeWord);

  SmartWord = (function(_super) {
    __extends(SmartWord, _super);

    function SmartWord() {
      return SmartWord.__super__.constructor.apply(this, arguments);
    }

    SmartWord.extend(false);

    SmartWord.prototype.wordRegExp = /[\w-]+/;

    return SmartWord;

  })(Word);

  ASmartWord = (function(_super) {
    __extends(ASmartWord, _super);

    function ASmartWord() {
      return ASmartWord.__super__.constructor.apply(this, arguments);
    }

    ASmartWord.description = "A word that consists of alphanumeric chars(`/[A-Za-z0-9_]/`) and hyphen `-`";

    ASmartWord.extend();

    return ASmartWord;

  })(SmartWord);

  InnerSmartWord = (function(_super) {
    __extends(InnerSmartWord, _super);

    function InnerSmartWord() {
      return InnerSmartWord.__super__.constructor.apply(this, arguments);
    }

    InnerSmartWord.description = "Currently No diff from `a-smart-word`";

    InnerSmartWord.extend();

    return InnerSmartWord;

  })(SmartWord);

  Pair = (function(_super) {
    var backSlashPattern;

    __extends(Pair, _super);

    function Pair() {
      return Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.extend(false);

    Pair.prototype.allowNextLine = false;

    Pair.prototype.allowSubmodeChange = false;

    Pair.prototype.adjustInnerRange = true;

    Pair.prototype.pair = null;

    Pair.prototype.getPattern = function() {
      var close, open, _ref2;
      _ref2 = this.pair, open = _ref2[0], close = _ref2[1];
      if (open === close) {
        return new RegExp("(" + (_.escapeRegExp(open)) + ")", 'g');
      } else {
        return new RegExp("(" + (_.escapeRegExp(open)) + ")|(" + (_.escapeRegExp(close)) + ")", 'g');
      }
    };

    Pair.prototype.getPairState = function(_arg) {
      var match, matchText, range;
      matchText = _arg.matchText, range = _arg.range, match = _arg.match;
      switch (match.length) {
        case 2:
          return this.pairStateInBufferRange(range, matchText);
        case 3:
          switch (false) {
            case !match[1]:
              return 'open';
            case !match[2]:
              return 'close';
          }
      }
    };

    backSlashPattern = _.escapeRegExp('\\');

    Pair.prototype.pairStateInBufferRange = function(range, char) {
      var bs, escapedChar, pattern, patterns, text;
      text = getTextToPoint(this.editor, range.end);
      escapedChar = _.escapeRegExp(char);
      bs = backSlashPattern;
      patterns = ["" + bs + bs + escapedChar, "[^" + bs + "]?" + escapedChar];
      pattern = new RegExp(patterns.join('|'));
      return ['close', 'open'][countChar(text, pattern) % 2];
    };

    Pair.prototype.isEscapedCharAtPoint = function(point) {
      var bs, found, pattern, scanRange;
      found = false;
      bs = backSlashPattern;
      pattern = new RegExp("[^" + bs + "]" + bs);
      scanRange = [[point.row, 0], point];
      this.editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
        var matchText, range, stop;
        matchText = _arg.matchText, range = _arg.range, stop = _arg.stop;
        if (range.end.isEqual(point)) {
          stop();
          return found = true;
        }
      });
      return found;
    };

    Pair.prototype.findPair = function(which, options, fn) {
      var from, pattern, scanFunc, scanRange;
      from = options.from, pattern = options.pattern, scanFunc = options.scanFunc, scanRange = options.scanRange;
      return this.editor[scanFunc](pattern, scanRange, (function(_this) {
        return function(event) {
          var matchText, range, stop;
          matchText = event.matchText, range = event.range, stop = event.stop;
          if (!(_this.allowNextLine || (from.row === range.start.row))) {
            return stop();
          }
          if (_this.isEscapedCharAtPoint(range.start)) {
            return;
          }
          return fn(event);
        };
      })(this));
    };

    Pair.prototype.findOpen = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'backwardsScanInBufferRange';
      scanRange = new Range([0, 0], from);
      stack = [];
      found = null;
      this.findPair('open', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var matchText, pairState, range, stop;
          matchText = event.matchText, range = event.range, stop = event.stop;
          pairState = _this.getPairState(event);
          if (pairState === 'close') {
            stack.push({
              pairState: pairState,
              matchText: matchText,
              range: range
            });
          } else {
            stack.pop();
            if (stack.length === 0) {
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Pair.prototype.findClose = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'scanInBufferRange';
      scanRange = new Range(from, this.editor.buffer.getEndPosition());
      stack = [];
      found = null;
      this.findPair('close', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, openStart, pairState, range, stop;
          range = event.range, stop = event.stop;
          pairState = _this.getPairState(event);
          if (pairState === 'open') {
            stack.push({
              pairState: pairState,
              range: range
            });
          } else {
            entry = stack.pop();
            if (stack.length === 0) {
              if ((openStart = entry != null ? entry.range.start : void 0)) {
                if (_this.allowForwarding) {
                  if (openStart.row > from.row) {
                    return;
                  }
                } else {
                  if (openStart.isGreaterThan(from)) {
                    return;
                  }
                }
              }
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Pair.prototype.getPairInfo = function(from) {
      var aRange, closeRange, innerEnd, innerRange, innerStart, openRange, pairInfo, pattern, targetRange, _ref2;
      pairInfo = null;
      pattern = this.getPattern();
      closeRange = this.findClose(from, pattern);
      if (closeRange != null) {
        openRange = this.findOpen(closeRange.end, pattern);
      }
      if (!((openRange != null) && (closeRange != null))) {
        return null;
      }
      aRange = new Range(openRange.start, closeRange.end);
      _ref2 = [openRange.end, closeRange.start], innerStart = _ref2[0], innerEnd = _ref2[1];
      if (this.adjustInnerRange) {
        if (pointIsAtEndOfLine(this.editor, innerStart)) {
          innerStart = new Point(innerStart.row + 1, 0);
        }
        if (getTextToPoint(this.editor, innerEnd).match(/^\s*$/)) {
          innerEnd = new Point(innerEnd.row, 0);
        }
        if ((innerEnd.column === 0) && (innerStart.column !== 0)) {
          innerEnd = new Point(innerEnd.row - 1, Infinity);
        }
      }
      innerRange = new Range(innerStart, innerEnd);
      targetRange = this.isInner() ? innerRange : aRange;
      if (this.skipEmptyPair && innerRange.isEmpty()) {
        return this.getPairInfo(aRange.end);
      } else {
        return {
          openRange: openRange,
          closeRange: closeRange,
          aRange: aRange,
          innerRange: innerRange,
          targetRange: targetRange
        };
      }
    };

    Pair.prototype.getPointToSearchFrom = function(selection, searchFrom) {
      switch (searchFrom) {
        case 'head':
          return swrap(selection).getNormalizedBufferPosition();
        case 'start':
          return swrap(selection).getBufferPositionFor('start');
      }
    };

    Pair.prototype.getRange = function(selection, options) {
      var allowForwarding, originalRange, pairInfo, searchFrom;
      if (options == null) {
        options = {};
      }
      allowForwarding = options.allowForwarding, searchFrom = options.searchFrom;
      if (searchFrom == null) {
        searchFrom = 'head';
      }
      if (allowForwarding != null) {
        this.allowForwarding = allowForwarding;
      }
      originalRange = selection.getBufferRange();
      pairInfo = this.getPairInfo(this.getPointToSearchFrom(selection, searchFrom));
      if (pairInfo != null ? pairInfo.targetRange.isEqual(originalRange) : void 0) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      return pairInfo != null ? pairInfo.targetRange : void 0;
    };

    Pair.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getRange(selection));
    };

    return Pair;

  })(TextObject);

  AnyPair = (function(_super) {
    __extends(AnyPair, _super);

    function AnyPair() {
      return AnyPair.__super__.constructor.apply(this, arguments);
    }

    AnyPair.extend(false);

    AnyPair.prototype.allowForwarding = false;

    AnyPair.prototype.skipEmptyPair = false;

    AnyPair.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'Tag', 'SquareBracket', 'Parenthesis'];

    AnyPair.prototype.getRangeBy = function(klass, selection) {
      return this["new"](klass, {
        inner: this.inner,
        skipEmptyPair: this.skipEmptyPair
      }).getRange(selection, {
        allowForwarding: this.allowForwarding,
        searchFrom: this.searchFrom
      });
    };

    AnyPair.prototype.getRanges = function(selection) {
      var klass, range, _i, _len, _ref2, _results;
      _ref2 = this.member;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        klass = _ref2[_i];
        if ((range = this.getRangeBy(klass, selection))) {
          _results.push(range);
        }
      }
      return _results;
    };

    AnyPair.prototype.getNearestRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.last(sortRanges(ranges));
      }
    };

    AnyPair.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getNearestRange(selection));
    };

    return AnyPair;

  })(Pair);

  AAnyPair = (function(_super) {
    __extends(AAnyPair, _super);

    function AAnyPair() {
      return AAnyPair.__super__.constructor.apply(this, arguments);
    }

    AAnyPair.extend();

    return AAnyPair;

  })(AnyPair);

  InnerAnyPair = (function(_super) {
    __extends(InnerAnyPair, _super);

    function InnerAnyPair() {
      return InnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPair.extend();

    return InnerAnyPair;

  })(AnyPair);

  AnyPairAllowForwarding = (function(_super) {
    __extends(AnyPairAllowForwarding, _super);

    function AnyPairAllowForwarding() {
      return AnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AnyPairAllowForwarding.extend(false);

    AnyPairAllowForwarding.description = "Range surrounded by auto-detected paired chars from enclosed and forwarding area";

    AnyPairAllowForwarding.prototype.allowForwarding = true;

    AnyPairAllowForwarding.prototype.allowNextLine = false;

    AnyPairAllowForwarding.prototype.skipEmptyPair = false;

    AnyPairAllowForwarding.prototype.searchFrom = 'start';

    AnyPairAllowForwarding.prototype.getNearestRange = function(selection) {
      var enclosingRange, enclosingRanges, forwardingRanges, from, ranges, _ref2;
      ranges = this.getRanges(selection);
      from = selection.cursor.getBufferPosition();
      _ref2 = _.partition(ranges, function(range) {
        return range.start.isGreaterThanOrEqual(from);
      }), forwardingRanges = _ref2[0], enclosingRanges = _ref2[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return forwardingRanges[0] || enclosingRange;
    };

    return AnyPairAllowForwarding;

  })(AnyPair);

  AAnyPairAllowForwarding = (function(_super) {
    __extends(AAnyPairAllowForwarding, _super);

    function AAnyPairAllowForwarding() {
      return AAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAnyPairAllowForwarding.extend();

    return AAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  InnerAnyPairAllowForwarding = (function(_super) {
    __extends(InnerAnyPairAllowForwarding, _super);

    function InnerAnyPairAllowForwarding() {
      return InnerAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPairAllowForwarding.extend();

    return InnerAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  AnyQuote = (function(_super) {
    __extends(AnyQuote, _super);

    function AnyQuote() {
      return AnyQuote.__super__.constructor.apply(this, arguments);
    }

    AnyQuote.extend(false);

    AnyQuote.prototype.allowForwarding = true;

    AnyQuote.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];

    AnyQuote.prototype.getNearestRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.first(_.sortBy(ranges, function(r) {
          return r.end.column;
        }));
      }
    };

    return AnyQuote;

  })(AnyPair);

  AAnyQuote = (function(_super) {
    __extends(AAnyQuote, _super);

    function AAnyQuote() {
      return AAnyQuote.__super__.constructor.apply(this, arguments);
    }

    AAnyQuote.extend();

    return AAnyQuote;

  })(AnyQuote);

  InnerAnyQuote = (function(_super) {
    __extends(InnerAnyQuote, _super);

    function InnerAnyQuote() {
      return InnerAnyQuote.__super__.constructor.apply(this, arguments);
    }

    InnerAnyQuote.extend();

    return InnerAnyQuote;

  })(AnyQuote);

  Quote = (function(_super) {
    __extends(Quote, _super);

    function Quote() {
      return Quote.__super__.constructor.apply(this, arguments);
    }

    Quote.extend(false);

    Quote.prototype.allowForwarding = true;

    Quote.prototype.allowNextLine = false;

    return Quote;

  })(Pair);

  DoubleQuote = (function(_super) {
    __extends(DoubleQuote, _super);

    function DoubleQuote() {
      return DoubleQuote.__super__.constructor.apply(this, arguments);
    }

    DoubleQuote.extend(false);

    DoubleQuote.prototype.pair = ['"', '"'];

    return DoubleQuote;

  })(Quote);

  ADoubleQuote = (function(_super) {
    __extends(ADoubleQuote, _super);

    function ADoubleQuote() {
      return ADoubleQuote.__super__.constructor.apply(this, arguments);
    }

    ADoubleQuote.extend();

    return ADoubleQuote;

  })(DoubleQuote);

  InnerDoubleQuote = (function(_super) {
    __extends(InnerDoubleQuote, _super);

    function InnerDoubleQuote() {
      return InnerDoubleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerDoubleQuote.extend();

    return InnerDoubleQuote;

  })(DoubleQuote);

  SingleQuote = (function(_super) {
    __extends(SingleQuote, _super);

    function SingleQuote() {
      return SingleQuote.__super__.constructor.apply(this, arguments);
    }

    SingleQuote.extend(false);

    SingleQuote.prototype.pair = ["'", "'"];

    return SingleQuote;

  })(Quote);

  ASingleQuote = (function(_super) {
    __extends(ASingleQuote, _super);

    function ASingleQuote() {
      return ASingleQuote.__super__.constructor.apply(this, arguments);
    }

    ASingleQuote.extend();

    return ASingleQuote;

  })(SingleQuote);

  InnerSingleQuote = (function(_super) {
    __extends(InnerSingleQuote, _super);

    function InnerSingleQuote() {
      return InnerSingleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerSingleQuote.extend();

    return InnerSingleQuote;

  })(SingleQuote);

  BackTick = (function(_super) {
    __extends(BackTick, _super);

    function BackTick() {
      return BackTick.__super__.constructor.apply(this, arguments);
    }

    BackTick.extend(false);

    BackTick.prototype.pair = ['`', '`'];

    return BackTick;

  })(Quote);

  ABackTick = (function(_super) {
    __extends(ABackTick, _super);

    function ABackTick() {
      return ABackTick.__super__.constructor.apply(this, arguments);
    }

    ABackTick.extend();

    return ABackTick;

  })(BackTick);

  InnerBackTick = (function(_super) {
    __extends(InnerBackTick, _super);

    function InnerBackTick() {
      return InnerBackTick.__super__.constructor.apply(this, arguments);
    }

    InnerBackTick.extend();

    return InnerBackTick;

  })(BackTick);

  CurlyBracket = (function(_super) {
    __extends(CurlyBracket, _super);

    function CurlyBracket() {
      return CurlyBracket.__super__.constructor.apply(this, arguments);
    }

    CurlyBracket.extend(false);

    CurlyBracket.prototype.pair = ['{', '}'];

    CurlyBracket.prototype.allowNextLine = true;

    return CurlyBracket;

  })(Pair);

  ACurlyBracket = (function(_super) {
    __extends(ACurlyBracket, _super);

    function ACurlyBracket() {
      return ACurlyBracket.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracket.extend();

    return ACurlyBracket;

  })(CurlyBracket);

  InnerCurlyBracket = (function(_super) {
    __extends(InnerCurlyBracket, _super);

    function InnerCurlyBracket() {
      return InnerCurlyBracket.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracket.extend();

    return InnerCurlyBracket;

  })(CurlyBracket);

  ACurlyBracketAllowForwarding = (function(_super) {
    __extends(ACurlyBracketAllowForwarding, _super);

    function ACurlyBracketAllowForwarding() {
      return ACurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracketAllowForwarding.extend();

    ACurlyBracketAllowForwarding.prototype.allowForwarding = true;

    return ACurlyBracketAllowForwarding;

  })(CurlyBracket);

  InnerCurlyBracketAllowForwarding = (function(_super) {
    __extends(InnerCurlyBracketAllowForwarding, _super);

    function InnerCurlyBracketAllowForwarding() {
      return InnerCurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracketAllowForwarding.extend();

    InnerCurlyBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerCurlyBracketAllowForwarding;

  })(CurlyBracket);

  SquareBracket = (function(_super) {
    __extends(SquareBracket, _super);

    function SquareBracket() {
      return SquareBracket.__super__.constructor.apply(this, arguments);
    }

    SquareBracket.extend(false);

    SquareBracket.prototype.pair = ['[', ']'];

    SquareBracket.prototype.allowNextLine = true;

    return SquareBracket;

  })(Pair);

  ASquareBracket = (function(_super) {
    __extends(ASquareBracket, _super);

    function ASquareBracket() {
      return ASquareBracket.__super__.constructor.apply(this, arguments);
    }

    ASquareBracket.extend();

    return ASquareBracket;

  })(SquareBracket);

  InnerSquareBracket = (function(_super) {
    __extends(InnerSquareBracket, _super);

    function InnerSquareBracket() {
      return InnerSquareBracket.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracket.extend();

    return InnerSquareBracket;

  })(SquareBracket);

  ASquareBracketAllowForwarding = (function(_super) {
    __extends(ASquareBracketAllowForwarding, _super);

    function ASquareBracketAllowForwarding() {
      return ASquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ASquareBracketAllowForwarding.extend();

    ASquareBracketAllowForwarding.prototype.allowForwarding = true;

    return ASquareBracketAllowForwarding;

  })(SquareBracket);

  InnerSquareBracketAllowForwarding = (function(_super) {
    __extends(InnerSquareBracketAllowForwarding, _super);

    function InnerSquareBracketAllowForwarding() {
      return InnerSquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracketAllowForwarding.extend();

    InnerSquareBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerSquareBracketAllowForwarding;

  })(SquareBracket);

  Parenthesis = (function(_super) {
    __extends(Parenthesis, _super);

    function Parenthesis() {
      return Parenthesis.__super__.constructor.apply(this, arguments);
    }

    Parenthesis.extend(false);

    Parenthesis.prototype.pair = ['(', ')'];

    Parenthesis.prototype.allowNextLine = true;

    return Parenthesis;

  })(Pair);

  AParenthesis = (function(_super) {
    __extends(AParenthesis, _super);

    function AParenthesis() {
      return AParenthesis.__super__.constructor.apply(this, arguments);
    }

    AParenthesis.extend();

    return AParenthesis;

  })(Parenthesis);

  InnerParenthesis = (function(_super) {
    __extends(InnerParenthesis, _super);

    function InnerParenthesis() {
      return InnerParenthesis.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesis.extend();

    return InnerParenthesis;

  })(Parenthesis);

  AParenthesisAllowForwarding = (function(_super) {
    __extends(AParenthesisAllowForwarding, _super);

    function AParenthesisAllowForwarding() {
      return AParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AParenthesisAllowForwarding.extend();

    AParenthesisAllowForwarding.prototype.allowForwarding = true;

    return AParenthesisAllowForwarding;

  })(Parenthesis);

  InnerParenthesisAllowForwarding = (function(_super) {
    __extends(InnerParenthesisAllowForwarding, _super);

    function InnerParenthesisAllowForwarding() {
      return InnerParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesisAllowForwarding.extend();

    InnerParenthesisAllowForwarding.prototype.allowForwarding = true;

    return InnerParenthesisAllowForwarding;

  })(Parenthesis);

  AngleBracket = (function(_super) {
    __extends(AngleBracket, _super);

    function AngleBracket() {
      return AngleBracket.__super__.constructor.apply(this, arguments);
    }

    AngleBracket.extend(false);

    AngleBracket.prototype.pair = ['<', '>'];

    return AngleBracket;

  })(Pair);

  AAngleBracket = (function(_super) {
    __extends(AAngleBracket, _super);

    function AAngleBracket() {
      return AAngleBracket.__super__.constructor.apply(this, arguments);
    }

    AAngleBracket.extend();

    return AAngleBracket;

  })(AngleBracket);

  InnerAngleBracket = (function(_super) {
    __extends(InnerAngleBracket, _super);

    function InnerAngleBracket() {
      return InnerAngleBracket.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracket.extend();

    return InnerAngleBracket;

  })(AngleBracket);

  AAngleBracketAllowForwarding = (function(_super) {
    __extends(AAngleBracketAllowForwarding, _super);

    function AAngleBracketAllowForwarding() {
      return AAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAngleBracketAllowForwarding.extend();

    AAngleBracketAllowForwarding.prototype.allowForwarding = true;

    return AAngleBracketAllowForwarding;

  })(AngleBracket);

  InnerAngleBracketAllowForwarding = (function(_super) {
    __extends(InnerAngleBracketAllowForwarding, _super);

    function InnerAngleBracketAllowForwarding() {
      return InnerAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracketAllowForwarding.extend();

    InnerAngleBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerAngleBracketAllowForwarding;

  })(AngleBracket);

  tagPattern = /(<(\/?))([^\s>]+)[^>]*>/g;

  Tag = (function(_super) {
    __extends(Tag, _super);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.extend(false);

    Tag.prototype.allowNextLine = true;

    Tag.prototype.allowForwarding = true;

    Tag.prototype.adjustInnerRange = false;

    Tag.prototype.getPattern = function() {
      return tagPattern;
    };

    Tag.prototype.getPairState = function(_arg) {
      var match, matchText, slash, tagName, __;
      match = _arg.match, matchText = _arg.matchText;
      __ = match[0], __ = match[1], slash = match[2], tagName = match[3];
      if (slash === '') {
        return ['open', tagName];
      } else {
        return ['close', tagName];
      }
    };

    Tag.prototype.getTagStartPoint = function(from) {
      var scanRange, tagRange, _ref2;
      tagRange = null;
      scanRange = this.editor.bufferRangeForBufferRow(from.row);
      this.editor.scanInBufferRange(tagPattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.containsPoint(from, true)) {
          tagRange = range;
          return stop();
        }
      });
      return (_ref2 = tagRange != null ? tagRange.start : void 0) != null ? _ref2 : from;
    };

    Tag.prototype.findTagState = function(stack, tagState) {
      var entry, i, _i, _ref2;
      if (stack.length === 0) {
        return null;
      }
      for (i = _i = _ref2 = stack.length - 1; _ref2 <= 0 ? _i <= 0 : _i >= 0; i = _ref2 <= 0 ? ++_i : --_i) {
        entry = stack[i];
        if (entry.tagState === tagState) {
          return entry;
        }
      }
      return null;
    };

    Tag.prototype.findOpen = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'backwardsScanInBufferRange';
      scanRange = new Range([0, 0], from);
      stack = [];
      found = null;
      this.findPair('open', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, pairState, range, stop, tagName, tagState, _ref2;
          range = event.range, stop = event.stop;
          _ref2 = _this.getPairState(event), pairState = _ref2[0], tagName = _ref2[1];
          if (pairState === 'close') {
            tagState = pairState + tagName;
            stack.push({
              tagState: tagState,
              range: range
            });
          } else {
            if (entry = _this.findTagState(stack, "close" + tagName)) {
              stack = stack.slice(0, stack.indexOf(entry));
            }
            if (stack.length === 0) {
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Tag.prototype.findClose = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'scanInBufferRange';
      from = this.getTagStartPoint(from);
      scanRange = new Range(from, this.editor.buffer.getEndPosition());
      stack = [];
      found = null;
      this.findPair('close', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, openStart, pairState, range, stop, tagName, tagState, _ref2;
          range = event.range, stop = event.stop;
          _ref2 = _this.getPairState(event), pairState = _ref2[0], tagName = _ref2[1];
          if (pairState === 'open') {
            tagState = pairState + tagName;
            stack.push({
              tagState: tagState,
              range: range
            });
          } else {
            if (entry = _this.findTagState(stack, "open" + tagName)) {
              stack = stack.slice(0, stack.indexOf(entry));
            } else {
              stack = [];
            }
            if (stack.length === 0) {
              if ((openStart = entry != null ? entry.range.start : void 0)) {
                if (_this.allowForwarding) {
                  if (openStart.row > from.row) {
                    return;
                  }
                } else {
                  if (openStart.isGreaterThan(from)) {
                    return;
                  }
                }
              }
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    return Tag;

  })(Pair);

  ATag = (function(_super) {
    __extends(ATag, _super);

    function ATag() {
      return ATag.__super__.constructor.apply(this, arguments);
    }

    ATag.extend();

    return ATag;

  })(Tag);

  InnerTag = (function(_super) {
    __extends(InnerTag, _super);

    function InnerTag() {
      return InnerTag.__super__.constructor.apply(this, arguments);
    }

    InnerTag.extend();

    return InnerTag;

  })(Tag);

  Paragraph = (function(_super) {
    __extends(Paragraph, _super);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.extend(false);

    Paragraph.prototype.getStartRow = function(startRow, fn) {
      var row, _i;
      for (row = _i = startRow; startRow <= 0 ? _i <= 0 : _i >= 0; row = startRow <= 0 ? ++_i : --_i) {
        if (fn(row)) {
          return row + 1;
        }
      }
      return 0;
    };

    Paragraph.prototype.getEndRow = function(startRow, fn) {
      var lastRow, row, _i;
      lastRow = this.editor.getLastBufferRow();
      for (row = _i = startRow; startRow <= lastRow ? _i <= lastRow : _i >= lastRow; row = startRow <= lastRow ? ++_i : --_i) {
        if (fn(row)) {
          return row - 1;
        }
      }
      return lastRow;
    };

    Paragraph.prototype.getRange = function(startRow) {
      var fn, startRowIsBlank;
      startRowIsBlank = this.editor.isBufferRowBlank(startRow);
      fn = (function(_this) {
        return function(row) {
          return _this.editor.isBufferRowBlank(row) !== startRowIsBlank;
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    Paragraph.prototype.selectParagraph = function(selection) {
      var endRow, point, startRow, _ref2, _ref3, _ref4;
      _ref2 = selection.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      if (swrap(selection).isSingleRow()) {
        return swrap(selection).setBufferRangeSafely(this.getRange(startRow));
      } else {
        point = selection.isReversed() ? (startRow = Math.max(0, startRow - 1), (_ref3 = this.getRange(startRow)) != null ? _ref3.start : void 0) : (_ref4 = this.getRange(endRow + 1)) != null ? _ref4.end : void 0;
        if (point != null) {
          return selection.selectToBufferPosition(point);
        }
      }
    };

    Paragraph.prototype.selectTextObject = function(selection) {
      return _.times(this.getCount(), (function(_this) {
        return function() {
          _this.selectParagraph(selection);
          if (_this["instanceof"]('AParagraph')) {
            return _this.selectParagraph(selection);
          }
        };
      })(this));
    };

    return Paragraph;

  })(TextObject);

  AParagraph = (function(_super) {
    __extends(AParagraph, _super);

    function AParagraph() {
      return AParagraph.__super__.constructor.apply(this, arguments);
    }

    AParagraph.extend();

    return AParagraph;

  })(Paragraph);

  InnerParagraph = (function(_super) {
    __extends(InnerParagraph, _super);

    function InnerParagraph() {
      return InnerParagraph.__super__.constructor.apply(this, arguments);
    }

    InnerParagraph.extend();

    return InnerParagraph;

  })(Paragraph);

  Comment = (function(_super) {
    __extends(Comment, _super);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.extend(false);

    Comment.prototype.getRange = function(startRow) {
      var fn;
      if (!this.editor.isBufferRowCommented(startRow)) {
        return;
      }
      fn = (function(_this) {
        return function(row) {
          var _ref2;
          if (!_this.isInner() && _this.editor.isBufferRowBlank(row)) {
            return;
          }
          return (_ref2 = _this.editor.isBufferRowCommented(row)) === false || _ref2 === (void 0);
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    return Comment;

  })(Paragraph);

  AComment = (function(_super) {
    __extends(AComment, _super);

    function AComment() {
      return AComment.__super__.constructor.apply(this, arguments);
    }

    AComment.extend();

    return AComment;

  })(Comment);

  InnerComment = (function(_super) {
    __extends(InnerComment, _super);

    function InnerComment() {
      return InnerComment.__super__.constructor.apply(this, arguments);
    }

    InnerComment.extend();

    return InnerComment;

  })(Comment);

  Indentation = (function(_super) {
    __extends(Indentation, _super);

    function Indentation() {
      return Indentation.__super__.constructor.apply(this, arguments);
    }

    Indentation.extend(false);

    Indentation.prototype.getRange = function(startRow) {
      var baseIndentLevel, fn;
      if (this.editor.isBufferRowBlank(startRow)) {
        return;
      }
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      fn = (function(_this) {
        return function(row) {
          if (_this.editor.isBufferRowBlank(row)) {
            return _this.isInner();
          } else {
            return getIndentLevelForBufferRow(_this.editor, row) < baseIndentLevel;
          }
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    return Indentation;

  })(Paragraph);

  AIndentation = (function(_super) {
    __extends(AIndentation, _super);

    function AIndentation() {
      return AIndentation.__super__.constructor.apply(this, arguments);
    }

    AIndentation.extend();

    return AIndentation;

  })(Indentation);

  InnerIndentation = (function(_super) {
    __extends(InnerIndentation, _super);

    function InnerIndentation() {
      return InnerIndentation.__super__.constructor.apply(this, arguments);
    }

    InnerIndentation.extend();

    return InnerIndentation;

  })(Indentation);

  Fold = (function(_super) {
    __extends(Fold, _super);

    function Fold() {
      return Fold.__super__.constructor.apply(this, arguments);
    }

    Fold.extend(false);

    Fold.prototype.adjustRowRange = function(_arg) {
      var endRow, endRowIndentLevel, startRow, startRowIndentLevel;
      startRow = _arg[0], endRow = _arg[1];
      if (!this.isInner()) {
        return [startRow, endRow];
      }
      startRowIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      endRowIndentLevel = getIndentLevelForBufferRow(this.editor, endRow);
      if (startRowIndentLevel === endRowIndentLevel) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    };

    Fold.prototype.getFoldRowRangesContainsForRow = function(row) {
      var _ref2;
      return (_ref2 = getCodeFoldRowRangesContainesForRow(this.editor, row, true)) != null ? _ref2.reverse() : void 0;
    };

    Fold.prototype.selectTextObject = function(selection) {
      var range, rowRange, rowRanges, targetRange;
      range = selection.getBufferRange();
      rowRanges = this.getFoldRowRangesContainsForRow(range.start.row);
      if (rowRanges == null) {
        return;
      }
      if ((rowRange = rowRanges.shift()) != null) {
        rowRange = this.adjustRowRange(rowRange);
        targetRange = getBufferRangeForRowRange(this.editor, rowRange);
        if (targetRange.isEqual(range) && rowRanges.length) {
          rowRange = this.adjustRowRange(rowRanges.shift());
        }
      }
      if (rowRange != null) {
        return swrap(selection).selectRowRange(rowRange);
      }
    };

    return Fold;

  })(TextObject);

  AFold = (function(_super) {
    __extends(AFold, _super);

    function AFold() {
      return AFold.__super__.constructor.apply(this, arguments);
    }

    AFold.extend();

    return AFold;

  })(Fold);

  InnerFold = (function(_super) {
    __extends(InnerFold, _super);

    function InnerFold() {
      return InnerFold.__super__.constructor.apply(this, arguments);
    }

    InnerFold.extend();

    return InnerFold;

  })(Fold);

  Function = (function(_super) {
    __extends(Function, _super);

    function Function() {
      return Function.__super__.constructor.apply(this, arguments);
    }

    Function.extend(false);

    Function.prototype.omittingClosingCharLanguages = ['go'];

    Function.prototype.initialize = function() {
      return this.language = this.editor.getGrammar().scopeName.replace(/^source\./, '');
    };

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      var rowRanges, _ref2;
      rowRanges = (_ref2 = getCodeFoldRowRangesContainesForRow(this.editor, row)) != null ? _ref2.reverse() : void 0;
      return rowRanges != null ? rowRanges.filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this)) : void 0;
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, startRow, _ref2, _ref3;
      _ref2 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = _ref2[0], endRow = _ref2[1];
      if (this.isA() && (_ref3 = this.language, __indexOf.call(this.omittingClosingCharLanguages, _ref3) >= 0)) {
        endRow += 1;
      }
      return [startRow, endRow];
    };

    return Function;

  })(Fold);

  AFunction = (function(_super) {
    __extends(AFunction, _super);

    function AFunction() {
      return AFunction.__super__.constructor.apply(this, arguments);
    }

    AFunction.extend();

    return AFunction;

  })(Function);

  InnerFunction = (function(_super) {
    __extends(InnerFunction, _super);

    function InnerFunction() {
      return InnerFunction.__super__.constructor.apply(this, arguments);
    }

    InnerFunction.extend();

    return InnerFunction;

  })(Function);

  CurrentLine = (function(_super) {
    __extends(CurrentLine, _super);

    function CurrentLine() {
      return CurrentLine.__super__.constructor.apply(this, arguments);
    }

    CurrentLine.extend(false);

    CurrentLine.prototype.selectTextObject = function(selection) {
      var cursor;
      cursor = selection.cursor;
      cursor.moveToBeginningOfLine();
      if (this.isInner()) {
        cursor.moveToFirstCharacterOfLine();
      }
      return selection.selectToEndOfBufferLine();
    };

    return CurrentLine;

  })(TextObject);

  ACurrentLine = (function(_super) {
    __extends(ACurrentLine, _super);

    function ACurrentLine() {
      return ACurrentLine.__super__.constructor.apply(this, arguments);
    }

    ACurrentLine.extend();

    return ACurrentLine;

  })(CurrentLine);

  InnerCurrentLine = (function(_super) {
    __extends(InnerCurrentLine, _super);

    function InnerCurrentLine() {
      return InnerCurrentLine.__super__.constructor.apply(this, arguments);
    }

    InnerCurrentLine.extend();

    return InnerCurrentLine;

  })(CurrentLine);

  Entire = (function(_super) {
    __extends(Entire, _super);

    function Entire() {
      return Entire.__super__.constructor.apply(this, arguments);
    }

    Entire.extend(false);

    Entire.prototype.selectTextObject = function(selection) {
      return this.editor.selectAll();
    };

    return Entire;

  })(TextObject);

  AEntire = (function(_super) {
    __extends(AEntire, _super);

    function AEntire() {
      return AEntire.__super__.constructor.apply(this, arguments);
    }

    AEntire.extend();

    return AEntire;

  })(Entire);

  InnerEntire = (function(_super) {
    __extends(InnerEntire, _super);

    function InnerEntire() {
      return InnerEntire.__super__.constructor.apply(this, arguments);
    }

    InnerEntire.extend();

    return InnerEntire;

  })(Entire);

  LatestChange = (function(_super) {
    __extends(LatestChange, _super);

    function LatestChange() {
      return LatestChange.__super__.constructor.apply(this, arguments);
    }

    LatestChange.extend(false);

    LatestChange.prototype.getRange = function() {
      return this.vimState.mark.getRange('[', ']');
    };

    LatestChange.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getRange());
    };

    return LatestChange;

  })(TextObject);

  ALatestChange = (function(_super) {
    __extends(ALatestChange, _super);

    function ALatestChange() {
      return ALatestChange.__super__.constructor.apply(this, arguments);
    }

    ALatestChange.extend();

    return ALatestChange;

  })(LatestChange);

  InnerLatestChange = (function(_super) {
    __extends(InnerLatestChange, _super);

    function InnerLatestChange() {
      return InnerLatestChange.__super__.constructor.apply(this, arguments);
    }

    InnerLatestChange.extend();

    return InnerLatestChange;

  })(LatestChange);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrZ0RBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFLQSxRQVdJLE9BQUEsQ0FBUSxTQUFSLENBWEosRUFDRSxtQkFBQSxVQURGLEVBQ2Msd0JBQUEsZUFEZCxFQUMrQixrQkFBQSxTQUQvQixFQUMwQywyQkFBQSxrQkFEMUMsRUFFRSx1QkFBQSxjQUZGLEVBR0UsbUNBQUEsMEJBSEYsRUFJRSw0Q0FBQSxtQ0FKRixFQUtFLGtDQUFBLHlCQUxGLEVBTUUscUNBQUEsNEJBTkYsRUFPRSxzQ0FBQSw2QkFQRixFQVFFLHdDQUFBLCtCQVJGLEVBU0UsbUNBQUEsMEJBVEYsRUFVRSxpQ0FBQSx3QkFmRixDQUFBOztBQUFBLEVBa0JNO0FBQ0osaUNBQUEsQ0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEseUJBQ0Esa0JBQUEsR0FBb0IsSUFEcEIsQ0FBQTs7QUFHYSxJQUFBLG9CQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxXQUFXLENBQUEsU0FBRSxDQUFBLEtBQWQsR0FBc0IsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsVUFBWCxD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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/lib/text-object.coffee
