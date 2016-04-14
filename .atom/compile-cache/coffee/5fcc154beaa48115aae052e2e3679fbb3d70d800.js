(function() {
  var dispatch, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator TransformString", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe('the ~ keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [[0, 0], [1, 0]]
        });
      });
      it('toggles the case and moves right', function() {
        ensure('~', {
          text: 'ABc\nxyZ',
          cursor: [[0, 1], [1, 1]]
        });
        ensure('~', {
          text: 'Abc\nxYZ',
          cursor: [[0, 2], [1, 2]]
        });
        return ensure('~', {
          text: 'AbC\nxYz',
          cursor: [[0, 2], [1, 2]]
        });
      });
      it('takes a count', function() {
        return ensure('4~', {
          text: 'AbC\nxYz',
          cursor: [[0, 2], [1, 2]]
        });
      });
      describe("in visual mode", function() {
        return it("toggles the case of the selected text", function() {
          set({
            cursorBuffer: [0, 0]
          });
          return ensure('V~', {
            text: 'AbC\nXyZ'
          });
        });
      });
      return describe("with g and motion", function() {
        it("toggles the case of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 0]
          });
          return ensure('g~2l', {
            text: 'Abc\nXyZ',
            cursor: [0, 0]
          });
        });
        it("g~~ toggles the line of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 1]
          });
          return ensure('g~~', {
            text: 'AbC\nXyZ',
            cursor: [0, 1]
          });
        });
        return it("g~g~ toggles the line of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 1]
          });
          return ensure('g~g~', {
            text: 'AbC\nXyZ',
            cursor: [0, 1]
          });
        });
      });
    });
    describe('the U keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [0, 0]
        });
      });
      it("makes text uppercase with g and motion, and won't move cursor", function() {
        ensure('gUl', {
          text: 'ABc\nXyZ',
          cursor: [0, 0]
        });
        ensure('gUe', {
          text: 'ABC\nXyZ',
          cursor: [0, 0]
        });
        set({
          cursorBuffer: [1, 0]
        });
        return ensure('gU$', {
          text: 'ABC\nXYZ',
          cursor: [1, 0]
        });
      });
      it("makes the selected text uppercase in visual mode", function() {
        return ensure('VU', {
          text: 'ABC\nXyZ'
        });
      });
      it("gUU upcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('gUU', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gUgU upcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('gUgU', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe('the u keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [0, 0]
        });
      });
      it("makes text lowercase with g and motion, and won't move cursor", function() {
        return ensure('gu$', {
          text: 'abc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes the selected text lowercase in visual mode", function() {
        return ensure('Vu', {
          text: 'abc\nXyZ'
        });
      });
      it("guu downcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('guu', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gugu downcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('gugu', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe("the > keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("on the last line", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        return describe("when followed by a >", function() {
          return it("indents the current line", function() {
            return ensure('>>', {
              text: "12345\nabcde\n  ABCDE",
              cursor: [2, 2]
            });
          });
        });
      });
      describe("on the first line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("when followed by a >", function() {
          return it("indents the current line", function() {
            return ensure('>>', {
              text: "  12345\nabcde\nABCDE",
              cursor: [0, 2]
            });
          });
        });
        return describe("when followed by a repeating >", function() {
          beforeEach(function() {
            return keystroke('3>>');
          });
          it("indents multiple lines at once", function() {
            return ensure({
              text: "  12345\n  abcde\n  ABCDE",
              cursor: [0, 2]
            });
          });
          return describe("undo behavior", function() {
            return it("outdents all three lines", function() {
              return ensure('u', {
                text: "12345\nabcde\nABCDE"
              });
            });
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return keystroke('V>');
        });
        it("indents the current line and exits visual mode", function() {
          return ensure({
            mode: 'normal',
            text: "  12345\nabcde\nABCDE",
            selectedBufferRange: [[0, 2], [0, 2]]
          });
        });
        return it("allows repeating the operation", function() {
          return ensure('.', {
            text: "    12345\nabcde\nABCDE"
          });
        });
      });
    });
    describe("the < keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  12345\n  abcde\nABCDE",
          cursor: [0, 0]
        });
      });
      describe("when followed by a <", function() {
        return it("indents the current line", function() {
          return ensure('<<', {
            text: "12345\n  abcde\nABCDE",
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by a repeating <", function() {
        beforeEach(function() {
          return keystroke('2<<');
        });
        it("indents multiple lines at once", function() {
          return ensure({
            text: "12345\nabcde\nABCDE",
            cursor: [0, 0]
          });
        });
        return describe("undo behavior", function() {
          return it("indents both lines", function() {
            return ensure('u', {
              text: "  12345\n  abcde\nABCDE"
            });
          });
        });
      });
      return describe("in visual mode", function() {
        return it("indents the current line and exits visual mode", function() {
          return ensure('V<', {
            mode: 'normal',
            text: "12345\n  abcde\nABCDE",
            selectedBufferRange: [[0, 0], [0, 0]]
          });
        });
      });
    });
    describe("the = keybinding", function() {
      var oldGrammar;
      oldGrammar = [];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        oldGrammar = editor.getGrammar();
        return set({
          text: "foo\n  bar\n  baz",
          cursor: [1, 0]
        });
      });
      return describe("when used in a scope that supports auto-indent", function() {
        beforeEach(function() {
          var jsGrammar;
          jsGrammar = atom.grammars.grammarForScopeName('source.js');
          return editor.setGrammar(jsGrammar);
        });
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        describe("when followed by a =", function() {
          beforeEach(function() {
            return keystroke('==');
          });
          return it("indents the current line", function() {
            return expect(editor.indentationForBufferRow(1)).toBe(0);
          });
        });
        return describe("when followed by a repeating =", function() {
          beforeEach(function() {
            return keystroke('2==');
          });
          it("autoindents multiple lines at once", function() {
            return ensure({
              text: "foo\nbar\nbaz",
              cursor: [1, 0]
            });
          });
          return describe("undo behavior", function() {
            return it("indents both lines", function() {
              return ensure('u', {
                text: "foo\n  bar\n  baz"
              });
            });
          });
        });
      });
    });
    describe('CamelCase', function() {
      beforeEach(function() {
        return set({
          text: 'vim-mode\natom-text-editor\n',
          cursorBuffer: [0, 0]
        });
      });
      it("CamelCase text and not move cursor", function() {
        ensure('gc$', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('jgc$', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("CamelCase selected text", function() {
        return ensure('Vjgc', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("gcgc CamelCase the line of text, won't move cursor", function() {
        return ensure('lgcgc', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('SnakeCase', function() {
      beforeEach(function() {
        set({
          text: 'vim-mode\natom-text-editor\n',
          cursorBuffer: [0, 0]
        });
        return atom.keymaps.add("g_", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g _': 'vim-mode-plus:snake-case'
          }
        });
      });
      it("SnakeCase text and not move cursor", function() {
        ensure('g_$', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('jg_$', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [1, 0]
        });
      });
      it("SnakeCase selected text", function() {
        return ensure('Vjg_', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [0, 0]
        });
      });
      return it("g_g_ SnakeCase the line of text, won't move cursor", function() {
        return ensure('lg_g_', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('DashCase', function() {
      beforeEach(function() {
        return set({
          text: 'vimMode\natom_text_editor\n',
          cursorBuffer: [0, 0]
        });
      });
      it("DashCase text and not move cursor", function() {
        ensure('g-$', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 0]
        });
        return ensure('jg-$', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [1, 0]
        });
      });
      it("DashCase selected text", function() {
        return ensure('Vjg-', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      return it("g-g- DashCase the line of text, won't move cursor", function() {
        return ensure('lg-g-', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('surround', function() {
      beforeEach(function() {
        return set({
          text: "apple\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
          cursorBuffer: [0, 0]
        });
      });
      describe('surround', function() {
        beforeEach(function() {
          return atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'y s': 'vim-mode-plus:surround'
            }
          }, 100);
        });
        it("surround text object with ( and repeatable", function() {
          ensure([
            'ysiw', {
              char: '('
            }
          ], {
            text: "(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround text object with { and repeatable", function() {
          ensure([
            'ysiw', {
              char: '{'
            }
          ], {
            text: "{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "{apple}\n{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround linewise", function() {
          ensure([
            'ysys', {
              char: '{'
            }
          ], {
            text: "{\napple\n}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('3j.', {
            text: "{\napple\n}\n{\npairs: [brackets]\n}\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          beforeEach(function() {
            return set({
              text: "apple\norange\nlemmon",
              cursorBuffer: [0, 0]
            });
          });
          return it("add additional space inside pair char when surround", function() {
            settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
            ensure([
              'ysiw', {
                char: '('
              }
            ], {
              text: "( apple )\norange\nlemmon"
            });
            keystroke('j');
            ensure([
              'ysiw', {
                char: '{'
              }
            ], {
              text: "( apple )\n{ orange }\nlemmon"
            });
            keystroke('j');
            return ensure([
              'ysiw', {
                char: '['
              }
            ], {
              text: "( apple )\n{ orange }\n[ lemmon ]"
            });
          });
        });
      });
      describe('map-surround', function() {
        beforeEach(function() {
          set({
            text: "\napple\npairs tomato\norange\nmilk\n",
            cursorBuffer: [1, 0]
          });
          return atom.keymaps.add("ms", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm s': 'vim-mode-plus:map-surround'
            },
            'atom-text-editor.vim-mode-plus.visual-mode': {
              'm s': 'vim-mode-plus:map-surround'
            }
          });
        });
        it("surround text for each word in target case-1", function() {
          return ensure([
            'msip', {
              char: '('
            }
          ], {
            text: "\n(apple)\n(pairs) (tomato)\n(orange)\n(milk)\n",
            cursor: [1, 0]
          });
        });
        it("surround text for each word in target case-2", function() {
          set({
            cursor: [2, 1]
          });
          return ensure([
            'msil', {
              char: '<'
            }
          ], {
            text: '\napple\n<pairs> <tomato>\norange\nmilk\n',
            cursor: [2, 0]
          });
        });
        return it("surround text for each word in visual selection", function() {
          return ensure([
            'vipms', {
              char: '"'
            }
          ], {
            text: '\n"apple"\n"pairs" "tomato"\n"orange"\n"milk"\n',
            cursor: [1, 0]
          });
        });
      });
      describe('delete surround', function() {
        beforeEach(function() {
          atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'd s': 'vim-mode-plus:delete-surround'
            }
          });
          return set({
            cursor: [1, 8]
          });
        });
        it("delete surrounded chars and repeatable", function() {
          ensure([
            'ds', {
              char: '['
            }
          ], {
            text: "apple\npairs: brackets\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('jl.', {
            text: "apple\npairs: brackets\npairs: brackets\n( multi\n  line )"
          });
        });
        it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure([
            'ds', {
              char: '('
            }
          ], {
            text: "apple\npairs: [brackets]\npairs: [brackets]\n multi\n  line "
          });
        });
        it("delete surrounded chars and trim padding spaces", function() {
          set({
            text: "( apple )\n{  orange   }\n",
            cursor: [0, 0]
          });
          ensure([
            'ds', {
              char: '('
            }
          ], {
            text: "apple\n{  orange   }\n"
          });
          return ensure([
            'jds', {
              char: '{'
            }
          ], {
            text: "apple\norange\n"
          });
        });
        return it("delete surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure([
            'ds', {
              char: '{'
            }
          ], {
            text: ["highlightRanges @editor, range, ", "  timeout: timeout", "  hello: world", ""].join("\n")
          });
        });
      });
      describe('change srurround', function() {
        beforeEach(function() {
          atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'c s': 'vim-mode-plus:change-surround'
            }
          });
          return set({
            text: "(apple)\n(grape)\n<lemmon>\n{orange}",
            cursorBuffer: [0, 1]
          });
        });
        it("change surrounded chars and repeatable", function() {
          ensure([
            'cs', {
              char: '(['
            }
          ], {
            text: "[apple]\n(grape)\n<lemmon>\n{orange}"
          });
          return ensure('jl.', {
            text: "[apple]\n[grape]\n<lemmon>\n{orange}"
          });
        });
        it("change surrounded chars", function() {
          ensure([
            'jjcs', {
              char: '<"'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n{orange}"
          });
          return ensure([
            'jlcs', {
              char: '{!'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n!orange!"
          });
        });
        return it("change surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure([
            'cs', {
              char: '{('
            }
          ], {
            text: "highlightRanges @editor, range, (\n  timeout: timeout\n  hello: world\n)"
          });
        });
      });
      describe('surround-word', function() {
        beforeEach(function() {
          return atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'y s w': 'vim-mode-plus:surround-word'
            }
          });
        });
        it("surround a word with ( and repeatable", function() {
          ensure([
            'ysw', {
              char: '('
            }
          ], {
            text: "(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return it("surround a word with { and repeatable", function() {
          ensure([
            'ysw', {
              char: '{'
            }
          ], {
            text: "{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "{apple}\n{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
      });
      describe('delete-surround-any-pair', function() {
        beforeEach(function() {
          set({
            text: "apple\n(pairs: [brackets])\n{pairs \"s\" [brackets]}\n( multi\n  line )",
            cursor: [1, 9]
          });
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'd s': 'vim-mode-plus:delete-surround-any-pair'
            }
          });
        });
        it("delete surrounded any pair found and repeatable", function() {
          ensure('ds', {
            text: 'apple\n(pairs: brackets)\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\npairs: brackets\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
        });
        it("delete surrounded any pair found with skip pair out of cursor and repeatable", function() {
          set({
            cursor: [2, 14]
          });
          ensure('ds', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" brackets}\n( multi\n  line )'
          });
          ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
        });
        return it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure('ds', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" [brackets]}\n multi\n  line '
          });
        });
      });
      describe('delete-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'd s': 'vim-mode-plus:delete-surround-any-pair-allow-forwarding'
            }
          });
        });
        return it("[1] single line", function() {
          set({
            cursor: [0, 0],
            text: "___(inner)\n___(inner)"
          });
          ensure('ds', {
            text: "___inner\n___(inner)",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "___inner\n___inner",
            cursor: [1, 0]
          });
        });
      });
      describe('change-surround-any-pair', function() {
        beforeEach(function() {
          set({
            text: "(apple)\n(grape)\n<lemmon>\n{orange}",
            cursor: [0, 1]
          });
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'c s': 'vim-mode-plus:change-surround-any-pair'
            }
          });
        });
        return it("change any surrounded pair found and repeatable", function() {
          ensure([
            'cs', {
              char: '<'
            }
          ], {
            text: "<apple>\n(grape)\n<lemmon>\n{orange}"
          });
          ensure('j.', {
            text: "<apple>\n<grape>\n<lemmon>\n{orange}"
          });
          return ensure('jj.', {
            text: "<apple>\n<grape>\n<lemmon>\n<orange>"
          });
        });
      });
      return describe('change-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'c s': 'vim-mode-plus:change-surround-any-pair-allow-forwarding'
            }
          });
        });
        return it("[1] single line", function() {
          set({
            cursor: [0, 0],
            text: "___(inner)\n___(inner)"
          });
          ensure([
            'cs', {
              char: '<'
            }
          ], {
            text: "___<inner>\n___(inner)",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "___<inner>\n___<inner>",
            cursor: [1, 0]
          });
        });
      });
    });
    describe('ReplaceWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            '_': 'vim-mode-plus:replace-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (parenthesis)\nhere (parenthesis)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'character'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'character'
            }
          }
        });
      });
      it("replace selection with regisgter's content", function() {
        ensure('viw', {
          selectedText: 'aaa'
        });
        return ensure('_', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register')
        });
      });
      it("replace text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_i(', {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'default register')
        });
      });
      it("can repeat", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_i(j.', {
          mode: 'normal',
          text: originalText.replace(/parenthesis/g, 'default register')
        });
      });
      return it("can use specified register to replace with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure([
          '"', {
            char: 'a'
          }, '_i('
        ], {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'A register')
        });
      });
    });
    describe('SwapWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g p': 'vim-mode-plus:swap-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (111)\nhere (222)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'character'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'character'
            }
          }
        });
      });
      it("swap selection with regisgter's content", function() {
        ensure('viw', {
          selectedText: 'aaa'
        });
        return ensure('gp', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register'),
          register: {
            '"': {
              text: 'aaa'
            }
          }
        });
      });
      it("swap text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('gpi(', {
          mode: 'normal',
          text: originalText.replace('111', 'default register'),
          register: {
            '"': {
              text: '111'
            }
          }
        });
      });
      it("can repeat", function() {
        var updatedText;
        set({
          cursor: [1, 6]
        });
        updatedText = "abc def 'aaa'\nhere (default register)\nhere (111)";
        return ensure('gpi(j.', {
          mode: 'normal',
          text: updatedText,
          register: {
            '"': {
              text: '222'
            }
          }
        });
      });
      return it("can use specified register to swap with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure([
          '"', {
            char: 'a'
          }, 'gpi('
        ], {
          mode: 'normal',
          text: originalText.replace('111', 'A register'),
          register: {
            'a': {
              text: '111'
            }
          }
        });
      });
    });
    return describe('ToggleLineComments', function() {
      var oldGrammar, originalText, _ref2;
      _ref2 = [], oldGrammar = _ref2[0], originalText = _ref2[1];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          var grammar;
          oldGrammar = editor.getGrammar();
          grammar = atom.grammars.grammarForScopeName('source.coffee');
          editor.setGrammar(grammar);
          originalText = "class Base\n  constructor: (args) ->\n    pivot = items.shift()\n    left = []\n    right = []\n\nconsole.log \"hello\"";
          return set({
            text: originalText
          });
        });
      });
      afterEach(function() {
        return editor.setGrammar(oldGrammar);
      });
      it('toggle comment for textobject for indent and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g/ii', {
          text: "class Base\n  constructor: (args) ->\n    # pivot = items.shift()\n    # left = []\n    # right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
      return it('toggle comment for textobject for paragraph and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g/ip', {
          text: "# class Base\n#   constructor: (args) ->\n#     pivot = items.shift()\n#     left = []\n#     right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLGVBQVIsQ0FBMUIsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsMEJBQVQsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQ0U7QUFB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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus/spec/operator-transform-string-spec.coffee
