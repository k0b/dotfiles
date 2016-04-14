(function() {
  var TextData, dispatch, getVimState, globalState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  settings = require('../lib/settings');

  globalState = require('../lib/global-state');

  describe("Motion general", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("simple motions", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = new TextData("12345\nabcd\nABCDE\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      describe("the h keybinding", function() {
        describe("as a motion", function() {
          it("moves the cursor left, but not to the previous line", function() {
            ensure('h', {
              cursor: [1, 0]
            });
            return ensure('h', {
              cursor: [1, 0]
            });
          });
          return it("moves the cursor to the previous line if wrapLeftRightMotion is true", function() {
            settings.set('wrapLeftRightMotion', true);
            return ensure('hh', {
              cursor: [0, 4]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects the character to the left", function() {
            return ensure('yh', {
              cursor: [1, 0],
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
      });
      describe("the j keybinding", function() {
        it("moves the cursor down, but not to the end of the last line", function() {
          ensure('j', {
            cursor: [2, 1]
          });
          return ensure('j', {
            cursor: [2, 1]
          });
        });
        it("moves the cursor to the end of the line, not past it", function() {
          set({
            cursor: [0, 4]
          });
          return ensure('j', {
            cursor: [1, 3]
          });
        });
        it("remembers the column it was in after moving to shorter line", function() {
          set({
            cursor: [0, 4]
          });
          ensure('j', {
            cursor: [1, 3]
          });
          return ensure('j', {
            cursor: [2, 4]
          });
        });
        it("never go past last newline", function() {
          return ensure('10j', {
            cursor: [2, 1]
          });
        });
        return describe("when visual mode", function() {
          beforeEach(function() {
            return ensure('v', {
              cursor: [1, 2],
              selectedText: 'b'
            });
          });
          it("moves the cursor down", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("doesn't go over after the last line", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("keep same column(goalColumn) even after across the empty line", function() {
            keystroke('escape');
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [0, 3]
            });
            ensure('v', {
              cursor: [0, 4]
            });
            return ensure('jj', {
              cursor: [2, 4],
              selectedText: "defg\n\nabcd"
            });
          });
          return it("original visual line remains when jk across orignal selection", function() {
            text = new TextData("line0\nline1\nline2\n");
            set({
              text: text.getRaw(),
              cursor: [1, 1]
            });
            ensure('V', {
              selectedText: text.getLines([1])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([1])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([1])
            });
            return ensure('j', {
              selectedText: text.getLines([1, 2])
            });
          });
        });
      });
      describe("the k keybinding", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 1]
          });
        });
        it("moves the cursor up", function() {
          return ensure('k', {
            cursor: [1, 1]
          });
        });
        it("moves the cursor up and remember column it was in", function() {
          set({
            cursor: [2, 4]
          });
          ensure('k', {
            cursor: [1, 3]
          });
          return ensure('k', {
            cursor: [0, 4]
          });
        });
        it("moves the cursor up, but not to the beginning of the first line", function() {
          return ensure('10k', {
            cursor: [0, 1]
          });
        });
        return describe("when visual mode", function() {
          return it("keep same column(goalColumn) even after across the empty line", function() {
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [2, 3]
            });
            ensure('v', {
              cursor: [2, 4],
              selectedText: 'd'
            });
            return ensure('kk', {
              cursor: [0, 3],
              selectedText: "defg\n\nabcd"
            });
          });
        });
      });
      describe("jk in softwrap", function() {
        text = [][0];
        beforeEach(function() {
          editor.setSoftWrapped(true);
          editor.setEditorWidthInChars(10);
          editor.setDefaultCharWidth(1);
          text = new TextData("1st line of buffer\n2nd line of buffer, Very long line\n3rd line of buffer\n\n5th line of buffer\n");
          return set({
            text: text.getRaw(),
            cursor: [0, 0]
          });
        });
        describe("selection is not reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('j', {
              cursor: [1, 0],
              cursorBuffer: [0, 9]
            });
            ensure('j', {
              cursor: [2, 0],
              cursorBuffer: [1, 0]
            });
            ensure('j', {
              cursor: [3, 0],
              cursorBuffer: [1, 9]
            });
            return ensure('j', {
              cursor: [4, 0],
              cursorBuffer: [1, 20]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            ensure('V', {
              selectedText: text.getLines([0])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('k', {
              selectedText: text.getLines([0])
            });
            return ensure('k', {
              selectedText: text.getLines([0])
            });
          });
        });
        return describe("selection is reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('j', {
              cursor: [1, 0],
              cursorBuffer: [0, 9]
            });
            ensure('j', {
              cursor: [2, 0],
              cursorBuffer: [1, 0]
            });
            ensure('j', {
              cursor: [3, 0],
              cursorBuffer: [1, 9]
            });
            return ensure('j', {
              cursor: [4, 0],
              cursorBuffer: [1, 20]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            set({
              cursorBuffer: [4, 0]
            });
            ensure('V', {
              selectedText: text.getLines([4])
            });
            ensure('k', {
              selectedText: text.getLines([3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([4])
            });
            return ensure('j', {
              selectedText: text.getLines([4])
            });
          });
        });
      });
      describe("the l keybinding", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 2]
          });
        });
        it("moves the cursor right, but not to the next line", function() {
          ensure('l', {
            cursor: [1, 3]
          });
          return ensure('l', {
            cursor: [1, 3]
          });
        });
        it("moves the cursor to the next line if wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('ll', {
            cursor: [2, 0]
          });
        });
        return describe("on a blank line", function() {
          return it("doesn't move the cursor", function() {
            set({
              text: "\n\n\n",
              cursor: [1, 0]
            });
            return ensure('l', {
              cursor: [1, 0]
            });
          });
        });
      });
      return describe("move-(up/down)-to-edge", function() {
        text = null;
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g k': 'vim-mode-plus:move-up-to-edge',
              'g j': 'vim-mode-plus:move-down-to-edge'
            }
          });
          text = new TextData("0:  4 67  01234567890123456789\n1:         1234567890123456789\n2:    6 890         0123456789\n3:    6 890         0123456789\n4:   56 890         0123456789\n5:                  0123456789\n6:                  0123456789\n7:  4 67            0123456789\n");
          return set({
            text: text.getRaw(),
            cursor: [4, 3]
          });
        });
        it("desn't move if it can't find edge", function() {
          ensure('gk', {
            cursor: [4, 3]
          });
          return ensure('gj', {
            cursor: [4, 3]
          });
        });
        it("move to non-blank-char on both first and last row", function() {
          set({
            cursor: [4, 4]
          });
          ensure('gk', {
            cursor: [0, 4]
          });
          return ensure('gj', {
            cursor: [7, 4]
          });
        });
        it("move to white space char when both side column is non-blank char", function() {
          set({
            cursor: [4, 5]
          });
          ensure('gk', {
            cursor: [0, 5]
          });
          ensure('gj', {
            cursor: [4, 5]
          });
          return ensure('gj', {
            cursor: [7, 5]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-1", function() {
          set({
            cursor: [4, 6]
          });
          ensure('gk', {
            cursor: [2, 6]
          });
          ensure('gk', {
            cursor: [0, 6]
          });
          ensure('gj', {
            cursor: [2, 6]
          });
          ensure('gj', {
            cursor: [4, 6]
          });
          return ensure('gj', {
            cursor: [7, 6]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-2", function() {
          set({
            cursor: [4, 7]
          });
          ensure('gk', {
            cursor: [2, 7]
          });
          ensure('gk', {
            cursor: [0, 7]
          });
          ensure('gj', {
            cursor: [2, 7]
          });
          ensure('gj', {
            cursor: [4, 7]
          });
          return ensure('gj', {
            cursor: [7, 7]
          });
        });
        it("support count", function() {
          set({
            cursor: [4, 6]
          });
          ensure('2gk', {
            cursor: [0, 6]
          });
          return ensure('3gj', {
            cursor: [7, 6]
          });
        });
        return describe('editor for hardTab', function() {
          var pack;
          pack = 'language-go';
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage(pack);
            });
            getVimState('sample.go', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
            });
            return runs(function() {
              set({
                cursor: [8, 2]
              });
              return ensure({
                cursorBuffer: [8, 1]
              });
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage(pack);
          });
          return it("move up/down to next edge of same *screen* column", function() {
            ensure('gk', {
              cursor: [5, 2]
            });
            ensure('gk', {
              cursor: [3, 2]
            });
            ensure('gk', {
              cursor: [2, 2]
            });
            ensure('gk', {
              cursor: [0, 2]
            });
            ensure('gj', {
              cursor: [2, 2]
            });
            ensure('gj', {
              cursor: [3, 2]
            });
            ensure('gj', {
              cursor: [5, 2]
            });
            ensure('gj', {
              cursor: [9, 2]
            });
            ensure('gj', {
              cursor: [11, 2]
            });
            ensure('gj', {
              cursor: [14, 2]
            });
            ensure('gj', {
              cursor: [17, 2]
            });
            ensure('gk', {
              cursor: [14, 2]
            });
            ensure('gk', {
              cursor: [11, 2]
            });
            ensure('gk', {
              cursor: [9, 2]
            });
            ensure('gk', {
              cursor: [5, 2]
            });
            ensure('gk', {
              cursor: [3, 2]
            });
            ensure('gk', {
              cursor: [2, 2]
            });
            return ensure('gk', {
              cursor: [0, 2]
            });
          });
        });
      });
    });
    describe("the w keybinding", function() {
      beforeEach(function() {
        return set({
          text: "ab cde1+-\n xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the beginning of the next word", function() {
          ensure('w', {
            cursor: [0, 3]
          });
          ensure('w', {
            cursor: [0, 7]
          });
          ensure('w', {
            cursor: [1, 1]
          });
          ensure('w', {
            cursor: [2, 0]
          });
          ensure('w', {
            cursor: [3, 0]
          });
          ensure('w', {
            cursor: [3, 2]
          });
          return ensure('w', {
            cursor: [3, 2]
          });
        });
        it("moves the cursor to the end of the word if last word in file", function() {
          set({
            text: 'abc',
            cursor: [0, 0]
          });
          return ensure('w', {
            cursor: [0, 2]
          });
        });
        it("moves the cursor to beginning of the next word of next line when all remaining text is white space.", function() {
          set({
            text: "012   \n  234",
            cursor: [0, 3]
          });
          return ensure('w', {
            cursor: [1, 2]
          });
        });
        return it("moves the cursor to beginning of the next word of next line when cursor is at EOL.", function() {
          set({
            text: "\n  234",
            cursor: [0, 0]
          });
          return ensure('w', {
            cursor: [1, 2]
          });
        });
      });
      describe("when used by Change operator", function() {
        beforeEach(function() {
          return set({
            text: "  var1 = 1\n  var2 = 2\n"
          });
        });
        describe("when cursor is on word", function() {
          return it("not eat whitespace", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('cw', {
              text: "  v = 1\n  var2 = 2\n",
              cursor: [0, 3]
            });
          });
        });
        describe("when cursor is on white space", function() {
          return it("only eat white space", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('cw', {
              text: "var1 = 1\n  var2 = 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("when text to EOL is all white space", function() {
          it("wont eat new line character", function() {
            set({
              text: "abc  \ndef\n",
              cursor: [0, 3]
            });
            return ensure('cw', {
              text: "abc\ndef\n",
              cursor: [0, 3]
            });
          });
          return it("cant eat new line when count is specified", function() {
            set({
              text: "\n\n\n\n\nline6\n",
              cursor: [0, 0]
            });
            return ensure('5cw', {
              text: "\nline6\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('yw', {
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects the whitespace", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('yw', {
              register: {
                '"': {
                  text: ' '
                }
              }
            });
          });
        });
      });
    });
    describe("the W keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab \n xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the beginning of the next word", function() {
          ensure('W', {
            cursor: [0, 7]
          });
          ensure('W', {
            cursor: [1, 1]
          });
          ensure('W', {
            cursor: [2, 0]
          });
          return ensure('W', {
            cursor: [3, 0]
          });
        });
        it("moves the cursor to beginning of the next word of next line when all remaining text is white space.", function() {
          set({
            text: "012   \n  234",
            cursor: [0, 3]
          });
          return ensure('W', {
            cursor: [1, 2]
          });
        });
        return it("moves the cursor to beginning of the next word of next line when cursor is at EOL.", function() {
          set({
            text: "\n  234",
            cursor: [0, 0]
          });
          return ensure('W', {
            cursor: [1, 2]
          });
        });
      });
      describe("when used by Change operator", function() {
        beforeEach(function() {
          return set({
            text: "  var1 = 1\n  var2 = 2\n"
          });
        });
        describe("when cursor is on word", function() {
          return it("not eat whitespace", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('cW', {
              text: "  v = 1\n  var2 = 2\n",
              cursor: [0, 3]
            });
          });
        });
        describe("when cursor is on white space", function() {
          return it("only eat white space", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('cW', {
              text: "var1 = 1\n  var2 = 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("when text to EOL is all white space", function() {
          it("wont eat new line character", function() {
            set({
              text: "abc  \ndef\n",
              cursor: [0, 3]
            });
            return ensure('cW', {
              text: "abc\ndef\n",
              cursor: [0, 3]
            });
          });
          return it("cant eat new line when count is specified", function() {
            set({
              text: "\n\n\n\n\nline6\n",
              cursor: [0, 0]
            });
            return ensure('5cW', {
              text: "\nline6\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the whole word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('yW', {
              register: {
                '"': {
                  text: 'cde1+- '
                }
              }
            });
          });
        });
        it("continues past blank lines", function() {
          set({
            cursor: [2, 0]
          });
          return ensure('dW', {
            text: "cde1+- ab \n xyz\nzip",
            register: {
              '"': {
                text: "\n"
              }
            }
          });
        });
        return it("doesn't go past the end of the file", function() {
          set({
            cursor: [3, 0]
          });
          return ensure('dW', {
            text: "cde1+- ab \n xyz\n\n",
            register: {
              '"': {
                text: 'zip'
              }
            }
          });
        });
      });
    });
    describe("the e keybinding", function() {
      beforeEach(function() {
        return set({
          text: "ab cde1+- \n xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the end of the current word", function() {
          ensure('e', {
            cursor: [0, 1]
          });
          ensure('e', {
            cursor: [0, 6]
          });
          ensure('e', {
            cursor: [0, 8]
          });
          ensure('e', {
            cursor: [1, 3]
          });
          return ensure('e', {
            cursor: [3, 2]
          });
        });
        return it("skips whitespace until EOF", function() {
          set({
            text: "012\n\n\n012\n\n",
            cursor: [0, 0]
          });
          ensure('e', {
            cursor: [0, 2]
          });
          ensure('e', {
            cursor: [3, 2]
          });
          return ensure('e', {
            cursor: [4, 0]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('ye', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('ye', {
              register: {
                '"': {
                  text: ' cde1'
                }
              }
            });
          });
        });
      });
    });
    describe("the E keybinding", function() {
      beforeEach(function() {
        return set({
          text: "ab  cde1+- \n xyz \n\nzip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("moves the cursor to the end of the current word", function() {
          ensure('E', {
            cursor: [0, 1]
          });
          ensure('E', {
            cursor: [0, 9]
          });
          ensure('E', {
            cursor: [1, 3]
          });
          ensure('E', {
            cursor: [3, 2]
          });
          return ensure('E', {
            cursor: [3, 2]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('yE', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('yE', {
              register: {
                '"': {
                  text: '  cde1+-'
                }
              }
            });
          });
        });
        return describe("press more than once", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('vEEy', {
              register: {
                '"': {
                  text: 'ab  cde1+-'
                }
              }
            });
          });
        });
      });
    });
    describe("the {,} keybinding", function() {
      beforeEach(function() {
        return set({
          text: "\n\n\n3: paragraph-1\n4: paragraph-1\n\n\n\n8: paragraph-2\n\n\n\n12: paragraph-3\n13: paragraph-3\n\n\n16: paragprah-4\n",
          cursor: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the paragraph", function() {
          set({
            cursor: [0, 0]
          });
          ensure('}', {
            cursor: [5, 0]
          });
          ensure('}', {
            cursor: [9, 0]
          });
          ensure('}', {
            cursor: [14, 0]
          });
          ensure('{', {
            cursor: [11, 0]
          });
          ensure('{', {
            cursor: [7, 0]
          });
          return ensure('{', {
            cursor: [2, 0]
          });
        });
        it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3}', {
            cursor: [14, 0]
          });
          return ensure('3{', {
            cursor: [2, 0]
          });
        });
        return it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('10}', {
            cursor: [16, 14]
          });
          return ensure('10{', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it('selects to the end of the current paragraph', function() {
          set({
            cursor: [3, 3]
          });
          return ensure('y}', {
            register: {
              '"': {
                text: "paragraph-1\n4: paragraph-1\n"
              }
            }
          });
        });
        return it('selects to the end of the current paragraph', function() {
          set({
            cursor: [4, 3]
          });
          return ensure('y{', {
            register: {
              '"': {
                text: "\n3: paragraph-1\n4: "
              }
            }
          });
        });
      });
    });
    describe("the b keybinding", function() {
      beforeEach(function() {
        return set({
          text: " ab cde1+- \n xyz\n\nzip }\n last"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [4, 1]
          });
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('b', {
            cursor: [3, 4]
          });
          ensure('b', {
            cursor: [3, 0]
          });
          ensure('b', {
            cursor: [2, 0]
          });
          ensure('b', {
            cursor: [1, 1]
          });
          ensure('b', {
            cursor: [0, 8]
          });
          ensure('b', {
            cursor: [0, 4]
          });
          ensure('b', {
            cursor: [0, 1]
          });
          ensure('b', {
            cursor: [0, 0]
          });
          return ensure('b', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the beginning of the current word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('yb', {
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the beginning of the last word", function() {
            set({
              cursor: [0, 4]
            });
            return ensure('yb', {
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
      });
    });
    describe("the B keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab\n\t xyz-123\n\n zip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [4, 1]
          });
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('B', {
            cursor: [3, 1]
          });
          ensure('B', {
            cursor: [2, 0]
          });
          ensure('B', {
            cursor: [1, 3]
          });
          ensure('B', {
            cursor: [0, 7]
          });
          return ensure('B', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it("selects to the beginning of the whole word", function() {
          set({
            cursor: [1, 9]
          });
          return ensure('yB', {
            register: {
              '"': {
                text: 'xyz-12'
              }
            }
          });
        });
        return it("doesn't go past the beginning of the file", function() {
          set({
            cursor: [0, 0],
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
          return ensure('yB', {
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
        });
      });
    });
    describe("the ^ keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde"
        });
      });
      describe("from the beginning of the line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it('selects to the first character of the line', function() {
            return ensure('d^', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
        });
      });
      describe("from the first character of the line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("stays put", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("does nothing", function() {
            return ensure('d^', {
              text: '  abcde',
              cursor: [0, 2]
            });
          });
        });
      });
      return describe("from the middle of a word", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 4]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it('selects to the first character of the line', function() {
            return ensure('d^', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde",
          cursor: [0, 4]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the first column", function() {
          return ensure('0', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        return it('selects to the first column of the line', function() {
          return ensure('d0', {
            text: 'cde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the $ keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde\n\n1234567890",
          cursor: [0, 4]
        });
      });
      describe("as a motion from empty line", function() {
        return it("moves the cursor to the end of the line", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('$', {
            cursor: [1, 0]
          });
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the line", function() {
          return ensure('$', {
            cursor: [0, 6]
          });
        });
        it("set goalColumn Infinity", function() {
          expect(editor.getLastCursor().goalColumn).toBe(null);
          ensure('$', {
            cursor: [0, 6]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(Infinity);
        });
        it("should remain in the last column when moving down", function() {
          ensure('$j', {
            cursor: [1, 0]
          });
          return ensure('j', {
            cursor: [2, 9]
          });
        });
        return it("support count", function() {
          return ensure('3$', {
            cursor: [2, 9]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the end of the lines", function() {
          return ensure('d$', {
            text: "  ab\n\n1234567890",
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  a\n",
          cursor: [0, 2]
        });
      });
      return describe("as a motion", function() {
        return it("moves the cursor to the beginning of the line", function() {
          return ensure('0', {
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the - keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abcdefg\n  abc\n  abc\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the last character of the previous line", function() {
            return ensure('-', {
              cursor: [0, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and previous line", function() {
            return ensure('d-', {
              text: "  abc\n",
              cursor: [0, 2]
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the previous one", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the previous line (directly above)", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line (directly above)", function() {
            return ensure('d-', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line preceded by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the previous line", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line", function() {
            return ensure('d-', {
              text: "abcdefg\n"
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [4, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines previous", function() {
            return ensure('3-', {
              cursor: [1, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many previous lines", function() {
            return ensure('d3-', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the + keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abc\n  abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [2, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and next line", function() {
            return ensure('d+', {
              text: "  abc\n"
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the next one", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the next line (directly below)", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line (directly below)", function() {
            return ensure('d+', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line followed by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line", function() {
            return ensure('d+', {
              text: "abcdefg\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3+', {
              cursor: [4, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d3+', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the _ keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abc\n  abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the current line", function() {
            return ensure('_', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line", function() {
            return ensure('d_', {
              text: "  abc\nabcdefg\n",
              cursor: [1, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3_', {
              cursor: [3, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d3_', {
              text: "1\n5\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the enter keybinding", function() {
      var keydownCodeForEnter, startingText;
      keydownCodeForEnter = '\r';
      startingText = "  abc\n  abc\nabcdefg\n";
      return describe("from the middle of a line", function() {
        var startingCursorPosition;
        startingCursorPosition = [1, 3];
        describe("as a motion", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            keystroke('+');
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure(keydownCodeForEnter, {
              cursor: referenceCursorPosition
            });
          });
        });
        return describe("as a selection", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition, referenceText;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            keystroke('d+');
            referenceText = editor.getText();
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure(['d', keydownCodeForEnter], {
              text: referenceText,
              cursor: referenceCursorPosition
            });
          });
        });
      });
    });
    describe("the gg keybinding", function() {
      beforeEach(function() {
        return set({
          text: " 1abc\n 2\n3\n",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        describe("in normal mode", function() {
          it("moves the cursor to the beginning of the first line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('gg', {
              cursor: [0, 1]
            });
          });
          return it("move to same position if its on first line and first char", function() {
            return ensure('gg', {
              cursor: [0, 1]
            });
          });
        });
        describe("in linewise visual mode", function() {
          return it("selects to the first line in the file", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('Vgg', {
              selectedText: " 1abc\n 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("in characterwise visual mode", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 1]
            });
          });
          return it("selects to the first line in the file", function() {
            return ensure('vgg', {
              selectedText: "1abc\n 2",
              cursor: [0, 1]
            });
          });
        });
      });
      return describe("when count specified", function() {
        describe("in normal mode", function() {
          return it("moves the cursor to first char of a specified line", function() {
            return ensure('2gg', {
              cursor: [1, 1]
            });
          });
        });
        describe("in linewise visual motion", function() {
          return it("selects to a specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('V2gg', {
              selectedText: " 2\n3\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("in characterwise visual motion", function() {
          return it("selects to a first character of specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('v2gg', {
              selectedText: "2\n3",
              cursor: [1, 1]
            });
          });
        });
      });
    });
    describe("the g_ keybinding", function() {
      beforeEach(function() {
        return set({
          text: "1  \n    2  \n 3abc\n "
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the last nonblank character", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('g_', {
            cursor: [1, 4]
          });
        });
        return it("will move the cursor to the beginning of the line if necessary", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('g_', {
            cursor: [0, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor downward and outward", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('2g_', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects the current line excluding whitespace", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('v2g_', {
            selectedText: "  2  \n 3abc"
          });
        });
      });
    });
    describe("the G keybinding", function() {
      beforeEach(function() {
        return set({
          text: "1\n    2\n 3abc\n ",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the last line after whitespace", function() {
          return ensure('G', {
            cursor: [3, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor to a specified line", function() {
          return ensure('2G', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the last line in the file", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('vG', {
            selectedText: "    2\n 3abc\n ",
            cursor: [3, 1]
          });
        });
      });
    });
    describe("the N% keybinding", function() {
      beforeEach(function() {
        var _i, _results;
        return set({
          text: (function() {
            _results = [];
            for (_i = 0; _i <= 99; _i++){ _results.push(_i); }
            return _results;
          }).apply(this).join("\n"),
          cursor: [0, 0]
        });
      });
      return describe("put cursor on line specified by percent", function() {
        it("50%", function() {
          return ensure('50%', {
            cursor: [49, 0]
          });
        });
        it("30%", function() {
          return ensure('30%', {
            cursor: [29, 0]
          });
        });
        it("100%", function() {
          return ensure('100%', {
            cursor: [99, 0]
          });
        });
        return it("120%", function() {
          return ensure('120%', {
            cursor: [99, 0]
          });
        });
      });
    });
    describe("the H, M, L keybinding", function() {
      var eel;
      eel = [][0];
      beforeEach(function() {
        eel = editorElement;
        return set({
          text: "  1\n2\n3\n4\n  5\n6\n7\n8\n9\n  10",
          cursor: [8, 0]
        });
      });
      describe("the H keybinding", function() {
        it("moves the cursor to the non-blank-char on first row if visible", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('H', {
            cursor: [0, 2]
          });
        });
        it("moves the cursor to the non-blank-char on first visible row plus scroll offset", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(2);
          return ensure('H', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('4H', {
            cursor: [3, 0]
          });
        });
      });
      describe("the L keybinding", function() {
        it("moves the cursor to non-blank-char on last row if visible", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('L', {
            cursor: [9, 2]
          });
        });
        it("moves the cursor to the first visible row plus offset", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(7);
          return ensure('L', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('3L', {
            cursor: [7, 0]
          });
        });
      });
      return describe("the M keybinding", function() {
        beforeEach(function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(10);
        });
        return it("moves the cursor to the non-blank-char of middle of screen", function() {
          return ensure('M', {
            cursor: [4, 2]
          });
        });
      });
    });
    describe('the mark keybindings', function() {
      beforeEach(function() {
        return set({
          text: '  12\n    34\n56\n',
          cursor: [0, 1]
        });
      });
      it('moves to the beginning of the line of a mark', function() {
        set({
          cursor: [1, 1]
        });
        keystroke([
          'm', {
            char: 'a'
          }
        ]);
        set({
          cursor: [0, 0]
        });
        return ensure([
          "'", {
            char: 'a'
          }
        ], {
          cursor: [1, 4]
        });
      });
      it('moves literally to a mark', function() {
        set({
          cursorBuffer: [1, 1]
        });
        keystroke([
          'm', {
            char: 'a'
          }
        ]);
        set({
          cursorBuffer: [0, 0]
        });
        return ensure([
          '`', {
            char: 'a'
          }
        ], {
          cursorBuffer: [1, 1]
        });
      });
      it('deletes to a mark by line', function() {
        set({
          cursorBuffer: [1, 5]
        });
        keystroke([
          'm', {
            char: 'a'
          }
        ]);
        set({
          cursorBuffer: [0, 0]
        });
        return ensure([
          "d'", {
            char: 'a'
          }
        ], {
          text: '56\n'
        });
      });
      it('deletes before to a mark literally', function() {
        set({
          cursorBuffer: [1, 5]
        });
        keystroke([
          'm', {
            char: 'a'
          }
        ]);
        set({
          cursorBuffer: [0, 1]
        });
        return ensure([
          'd`', {
            char: 'a'
          }
        ], {
          text: ' 4\n56\n'
        });
      });
      it('deletes after to a mark literally', function() {
        set({
          cursorBuffer: [1, 5]
        });
        keystroke([
          'm', {
            char: 'a'
          }
        ]);
        set({
          cursorBuffer: [2, 1]
        });
        return ensure([
          'd`', {
            char: 'a'
          }
        ], {
          text: '  12\n    36\n'
        });
      });
      return it('moves back to previous', function() {
        set({
          cursorBuffer: [1, 5]
        });
        keystroke([
          '`', {
            char: '`'
          }
        ]);
        set({
          cursorBuffer: [2, 1]
        });
        return ensure([
          '`', {
            char: '`'
          }
        ], {
          cursorBuffer: [1, 5]
        });
      });
    });
    describe('the V keybinding', function() {
      var text;
      text = [][0];
      beforeEach(function() {
        text = new TextData("01\n002\n0003\n00004\n000005\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      it("selects down a line", function() {
        return ensure('Vjj', {
          selectedText: text.getLines([1, 2, 3])
        });
      });
      return it("selects up a line", function() {
        return ensure('Vk', {
          selectedText: text.getLines([0, 1])
        });
      });
    });
    describe('MoveTo(Previous|Next)Fold(Start|End)', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              '[ [': 'vim-mode-plus:move-to-previous-fold-start',
              '] [': 'vim-mode-plus:move-to-next-fold-start',
              '[ ]': 'vim-mode-plus:move-to-previous-fold-end',
              '] ]': 'vim-mode-plus:move-to-next-fold-end'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("MoveToPreviousFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold start row", function() {
          ensure('[[', {
            cursor: [22, 6]
          });
          ensure('[[', {
            cursor: [20, 6]
          });
          ensure('[[', {
            cursor: [18, 4]
          });
          ensure('[[', {
            cursor: [9, 2]
          });
          return ensure('[[', {
            cursor: [8, 0]
          });
        });
      });
      describe("MoveToNextFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold start row", function() {
          ensure('][', {
            cursor: [8, 0]
          });
          ensure('][', {
            cursor: [9, 2]
          });
          ensure('][', {
            cursor: [18, 4]
          });
          ensure('][', {
            cursor: [20, 6]
          });
          return ensure('][', {
            cursor: [22, 6]
          });
        });
      });
      describe("MoveToPrevisFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold end row", function() {
          ensure('[]', {
            cursor: [28, 2]
          });
          ensure('[]', {
            cursor: [25, 4]
          });
          ensure('[]', {
            cursor: [23, 8]
          });
          return ensure('[]', {
            cursor: [21, 8]
          });
        });
      });
      return describe("MoveToNextFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold end row", function() {
          ensure(']]', {
            cursor: [21, 8]
          });
          ensure(']]', {
            cursor: [23, 8]
          });
          ensure(']]', {
            cursor: [25, 4]
          });
          return ensure(']]', {
            cursor: [28, 2]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)String', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g s': 'vim-mode-plus:move-to-next-string',
            'g S': 'vim-mode-plus:move-to-previous-string'
          }
        });
      });
      describe('editor for softTab', function() {
        var pack;
        pack = 'language-coffee-script';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return runs(function() {
            return set({
              text: "disposable?.dispose()\ndisposable = atom.commands.add 'atom-workspace',\n  'check-up': -> fun('backward')\n  'check-down': -> fun('forward')\n\n",
              grammar: 'source.coffee'
            });
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursor: [0, 0]
          });
          ensure('gs', {
            cursor: [1, 31]
          });
          ensure('gs', {
            cursor: [2, 2]
          });
          ensure('gs', {
            cursor: [2, 21]
          });
          ensure('gs', {
            cursor: [3, 2]
          });
          return ensure('gs', {
            cursor: [3, 23]
          });
        });
        it("move to previous string", function() {
          set({
            cursor: [4, 0]
          });
          ensure('gS', {
            cursor: [3, 23]
          });
          ensure('gS', {
            cursor: [3, 2]
          });
          ensure('gS', {
            cursor: [2, 21]
          });
          ensure('gS', {
            cursor: [2, 2]
          });
          return ensure('gS', {
            cursor: [1, 31]
          });
        });
        return it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3gs', {
            cursor: [2, 21]
          });
          return ensure('3gS', {
            cursor: [1, 31]
          });
        });
      });
      return describe('editor for hardTab', function() {
        var pack;
        pack = 'language-go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return getVimState('sample.go', function(state, vimEditor) {
            editor = state.editor, editorElement = state.editorElement;
            return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursor: [0, 0]
          });
          ensure('gs', {
            cursor: [2, 7]
          });
          ensure('gs', {
            cursor: [3, 7]
          });
          ensure('gs', {
            cursor: [8, 8]
          });
          ensure('gs', {
            cursor: [9, 8]
          });
          ensure('gs', {
            cursor: [11, 20]
          });
          ensure('gs', {
            cursor: [12, 15]
          });
          ensure('gs', {
            cursor: [13, 15]
          });
          ensure('gs', {
            cursor: [15, 15]
          });
          return ensure('gs', {
            cursor: [16, 15]
          });
        });
        return it("move to previous string", function() {
          set({
            cursor: [18, 0]
          });
          ensure('gS', {
            cursor: [16, 15]
          });
          ensure('gS', {
            cursor: [15, 15]
          });
          ensure('gS', {
            cursor: [13, 15]
          });
          ensure('gS', {
            cursor: [12, 15]
          });
          ensure('gS', {
            cursor: [11, 20]
          });
          ensure('gS', {
            cursor: [9, 8]
          });
          ensure('gS', {
            cursor: [8, 8]
          });
          ensure('gS', {
            cursor: [3, 7]
          });
          return ensure('gS', {
            cursor: [2, 7]
          });
        });
      });
    });
    return describe('MoveTo(Previous|Next)Number', function() {
      var pack;
      pack = 'language-coffee-script';
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g n': 'vim-mode-plus:move-to-next-number',
            'g N': 'vim-mode-plus:move-to-previous-number'
          }
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage(pack);
        });
        runs(function() {
          return set({
            grammar: 'source.coffee'
          });
        });
        return set({
          text: "num1 = 1\narr1 = [1, 101, 1001]\narr2 = [\"1\", \"2\", \"3\"]\nnum2 = 2\nfun(\"1\", 2, 3)\n\n"
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage(pack);
      });
      it("move to next number", function() {
        set({
          cursor: [0, 0]
        });
        ensure('gn', {
          cursor: [0, 7]
        });
        ensure('gn', {
          cursor: [1, 8]
        });
        ensure('gn', {
          cursor: [1, 11]
        });
        ensure('gn', {
          cursor: [1, 16]
        });
        ensure('gn', {
          cursor: [3, 7]
        });
        ensure('gn', {
          cursor: [4, 9]
        });
        return ensure('gn', {
          cursor: [4, 12]
        });
      });
      it("move to previous number", function() {
        set({
          cursor: [5, 0]
        });
        ensure('gN', {
          cursor: [4, 12]
        });
        ensure('gN', {
          cursor: [4, 9]
        });
        ensure('gN', {
          cursor: [3, 7]
        });
        ensure('gN', {
          cursor: [1, 16]
        });
        ensure('gN', {
          cursor: [1, 11]
        });
        ensure('gN', {
          cursor: [1, 8]
        });
        return ensure('gN', {
          cursor: [0, 7]
        });
      });
      return it("support count", function() {
        set({
          cursor: [0, 0]
        });
        ensure('5gn', {
          cursor: [3, 7]
        });
        return ensure('3gN', {
          cursor: [1, 8]
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tZ2VuZXJhbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0REFBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IsZ0JBQUEsUUFBeEIsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQUZkLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxXQUFBLEdBQUQsRUFBTSxjQUFBLE1BQU4sRUFBYyxpQkFBQSxTQUFkLEVBQTJCLEtBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEs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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/spec/motion-general-spec.coffee
