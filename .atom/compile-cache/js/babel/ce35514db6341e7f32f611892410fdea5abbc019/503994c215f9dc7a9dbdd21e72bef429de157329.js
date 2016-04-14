function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

describe('gocodeprovider', function () {
  var completionDelay = null;
  var autocompleteplusMain = null;
  var autocompleteManager = null;
  var goconfigMain = null;
  var autocompletegoMain = null;
  var provider = null;
  var editor = null;
  var editorView = null;
  var workspaceElement = null;
  var suggestionsPromise = null;

  beforeEach(function () {
    waitsForPromise(function () {
      return atom.packages.activatePackage('language-go').then(function () {
        return atom.packages.activatePackage('autocomplete-plus');
      }).then(function (pack) {
        autocompleteplusMain = pack.mainModule;
        return atom.packages.activatePackage('go-config');
      }).then(function (pack) {
        goconfigMain = pack.mainModule;
        return atom.packages.activatePackage('autocomplete-go');
      }).then(function (pack) {
        autocompletegoMain = pack.mainModule;
      });
    });

    waitsFor(function () {
      return autocompleteplusMain.autocompleteManager && autocompleteplusMain.autocompleteManager.ready;
    });

    runs(function () {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);

      // autocomplete-plus
      autocompleteManager = autocompleteplusMain.getAutocompleteManager();
      spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
      spyOn(autocompleteManager, 'showSuggestionList').andCallThrough();
      spyOn(autocompleteManager, 'hideSuggestionList').andCallThrough();
      atom.config.set('autocomplete-plus.enableAutoActivation', true);
      // atom.config.set('go-plus.suppressBuiltinAutocompleteProvider', false)
      completionDelay = 100;
      atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
      completionDelay += 100; // Rendering delay

      // autocomplete-go
      provider = autocompletegoMain.getProvider();
      spyOn(provider, 'getSuggestions').andCallThrough();
      provider.onDidInsertSuggestion = jasmine.createSpy();
      provider.onDidGetSuggestions(function (p) {
        suggestionsPromise = p;
      });
    });

    waitsFor(function () {
      return provider.ready();
    });
  });

  afterEach(function () {
    if (provider !== null) {
      jasmine.unspy(provider, 'getSuggestions');
      provider.dispose();
      provider = null;
    }

    if (autocompleteManager !== null) {
      jasmine.unspy(autocompleteManager, 'displaySuggestions');
      jasmine.unspy(autocompleteManager, 'hideSuggestionList');
      jasmine.unspy(autocompleteManager, 'showSuggestionList');
      autocompleteManager.dispose();
      autocompleteManager = null;
    }

    if (autocompleteplusMain !== null) {
      autocompleteplusMain.deactivate();
      autocompleteplusMain = null;
    }

    if (autocompletegoMain !== null) {
      autocompletegoMain.deactivate();
      autocompletegoMain = null;
    }

    if (goconfigMain !== null) {
      goconfigMain.deactivate();
      goconfigMain = null;
    }

    if (editor !== null) {
      // TODO Close
      editor = null;
    }

    if (editorView !== null) {
      // TODO Close
      editorView = null;
    }

    if (workspaceElement !== null) {
      // TODO Close
      workspaceElement = null;
    }
  });

  describe('when the basic file is opened', function () {
    beforeEach(function () {
      waitsForPromise(function () {
        return atom.workspace.open('basic' + _path2['default'].sep + 'main.go').then(function (e) {
          editor = e;
          editorView = atom.views.getView(editor);
        });
      });
    });

    it('returns suggestions to autocomplete-plus', function () {
      var suggestions = null;
      runs(function () {
        expect(provider).toBeDefined();
        expect(provider.getSuggestions).not.toHaveBeenCalled();
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.setCursorScreenPosition([5, 6]);
        editor.insertText('P');
        advanceClock(completionDelay);
      });

      waitsFor(function () {
        return provider.getSuggestions.calls.length === 1 && suggestionsPromise !== null;
      });

      waitsForPromise(function () {
        return suggestionsPromise.then(function (s) {
          suggestions = s;
        });
      });

      runs(function () {
        expect(provider.getSuggestions).toHaveBeenCalled();
        expect(provider.getSuggestions.calls.length).toBe(1);
        expect(suggestions).toBeTruthy();
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0]).toBeTruthy();
        expect(suggestions[0].snippet).toBe('Print(${1:a ...interface{\\}})');
        expect(suggestions[0].replacementPrefix).toBe('P');
        expect(suggestions[0].type).toBe('function');
        expect(suggestions[0].leftLabel).toBe('n int, err error');
        editor.backspace();
      });
    });
  });

  describe('when the go-plus-issue-307 file is opened', function () {
    var suggestions = null;
    beforeEach(function () {
      waitsForPromise(function () {
        return atom.workspace.open('go-plus-issue-307' + _path2['default'].sep + 'main.go').then(function (e) {
          editor = e;
          editorView = atom.views.getView(editor);
        });
      });
    });

    it('returns suggestions to autocomplete-plus scenario 1', function () {
      runs(function () {
        expect(provider).toBeDefined();
        expect(provider.getSuggestions).not.toHaveBeenCalled();
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.setCursorScreenPosition([13, 0]);
        editor.insertText('\tSayHello("world")');
        suggestions = null;
        suggestionsPromise = null;
        advanceClock(completionDelay);
      });

      runs(function () {
        expect(provider.getSuggestions.calls.length).toBe(0);
        expect(suggestionsPromise).toBeFalsy();
        editor.insertText('.');
        advanceClock(completionDelay);
      });

      waitsFor(function () {
        return provider.getSuggestions.calls.length === 1 && suggestionsPromise !== null;
      });

      waitsForPromise(function () {
        return suggestionsPromise.then(function (s) {
          suggestions = s;
        });
      });

      runs(function () {
        expect(provider.getSuggestions).toHaveBeenCalled();
        expect(provider.getSuggestions.calls.length).toBe(1);
        expect(suggestions).toBeTruthy();
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0]).toBeTruthy();
        expect(suggestions[0].snippet).toBe('Fatal(${1:v ...interface{\\}})');
        expect(suggestions[0].replacementPrefix).toBe('');
        expect(suggestions[0].type).toBe('function');
        expect(suggestions[0].leftLabel).toBe('');
        editor.backspace();
      });
    });

    it('returns suggestions to autocomplete-plus scenario 2', function () {
      runs(function () {
        expect(provider).toBeDefined();
        expect(provider.getSuggestions).not.toHaveBeenCalled();
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.setCursorScreenPosition([13, 0]);
        editor.insertText('\tSayHello("world") ');
        suggestions = null;
        suggestionsPromise = null;
        advanceClock(completionDelay);
      });

      runs(function () {
        expect(provider.getSuggestions.calls.length).toBe(0);
        expect(suggestionsPromise).toBeFalsy();
        editor.insertText('.');
        advanceClock(completionDelay);
      });

      waitsFor(function () {
        return provider.getSuggestions.calls.length === 1 && suggestionsPromise !== null;
      });

      waitsForPromise(function () {
        return suggestionsPromise.then(function (s) {
          suggestions = s;
        });
      });

      runs(function () {
        expect(provider.getSuggestions).toHaveBeenCalled();
        expect(provider.getSuggestions.calls.length).toBe(1);
        expect(suggestions).toBeTruthy();
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0]).toBeTruthy();
        expect(suggestions[0].snippet).toBe('Fatal(${1:v ...interface{\\}})');
        expect(suggestions[0].replacementPrefix).toBe('');
        expect(suggestions[0].type).toBe('function');
        expect(suggestions[0].leftLabel).toBe('');
        editor.backspace();
      });
    });

    it('returns suggestions to autocomplete-plus scenario 3', function () {
      runs(function () {
        expect(provider).toBeDefined();
        expect(provider.getSuggestions).not.toHaveBeenCalled();
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.setCursorScreenPosition([13, 0]);
        editor.insertText('\tSayHello("world")  ');
        suggestions = null;
        suggestionsPromise = null;
        advanceClock(completionDelay);
      });

      runs(function () {
        expect(provider.getSuggestions.calls.length).toBe(0);
        expect(suggestionsPromise).toBeFalsy();
        editor.insertText('.');
        advanceClock(completionDelay);
      });

      waitsFor(function () {
        return provider.getSuggestions.calls.length === 1 && suggestionsPromise !== null;
      });

      waitsForPromise(function () {
        return suggestionsPromise.then(function (s) {
          suggestions = s;
        });
      });

      runs(function () {
        expect(provider.getSuggestions).toHaveBeenCalled();
        expect(provider.getSuggestions.calls.length).toBe(1);
        expect(suggestions).toBeTruthy();
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0]).toBeTruthy();
        expect(suggestions[0].snippet).toBe('Fatal(${1:v ...interface{\\}})');
        expect(suggestions[0].replacementPrefix).toBe('');
        expect(suggestions[0].type).toBe('function');
        expect(suggestions[0].leftLabel).toBe('');
        editor.backspace();
      });
    });

    it('returns suggestions to autocomplete-plus scenario 4', function () {
      runs(function () {
        expect(provider).toBeDefined();
        expect(provider.getSuggestions).not.toHaveBeenCalled();
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.setCursorScreenPosition([13, 0]);
        editor.insertText('\tSayHello("world")\t');
        suggestions = null;
        suggestionsPromise = null;
        advanceClock(completionDelay);
      });

      runs(function () {
        expect(provider.getSuggestions.calls.length).toBe(0);
        expect(suggestionsPromise).toBeFalsy();
        editor.insertText('.');
        advanceClock(completionDelay);
      });

      waitsFor(function () {
        return provider.getSuggestions.calls.length === 1 && suggestionsPromise !== null;
      });

      waitsForPromise(function () {
        return suggestionsPromise.then(function (s) {
          suggestions = s;
        });
      });

      runs(function () {
        expect(provider.getSuggestions).toHaveBeenCalled();
        expect(provider.getSuggestions.calls.length).toBe(1);
        expect(suggestions).toBeTruthy();
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0]).toBeTruthy();
        expect(suggestions[0].snippet).toBe('Fatal(${1:v ...interface{\\}})');
        expect(suggestions[0].replacementPrefix).toBe('');
        expect(suggestions[0].type).toBe('function');
        expect(suggestions[0].leftLabel).toBe('');
        editor.backspace();
      });
    });
  });
});

// path = require('path')
// _ = require('underscore-plus')
// AtomConfig = require('./util/atomconfig')
//
// describe 'gocode', ->
//   [workspaceElement, editor, editorView, dispatch, buffer, completionDelay, goplusMain, autocompleteMain, autocompleteManager, provider] = []
//
//   beforeEach ->
//     runs ->
//       atomconfig = new AtomConfig()
//       atomconfig.allfunctionalitydisabled()
//
//       # Enable live autocompletion
//       atom.config.set('autocomplete-plus.enableAutoActivation', true)
//       atom.config.set('go-plus.suppressBuiltinAutocompleteProvider', false)
//       # Set the completion delay
//       completionDelay = 100
//       atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay)
//       completionDelay += 100 # Rendering delay
//
//       workspaceElement = atom.views.getView(atom.workspace)
//       jasmine.attachToDOM(workspaceElement)
//
//       pack = atom.packages.loadPackage('go-plus')
//       goplusMain = pack.mainModule
//       spyOn(goplusMain, 'provide').andCallThrough()
//       spyOn(goplusMain, 'setDispatch').andCallThrough()
//       pack = atom.packages.loadPackage('autocomplete-plus')
//       autocompleteMain = pack.mainModule
//       spyOn(autocompleteMain, 'consumeProvider').andCallThrough()
//       jasmine.unspy(window, 'setTimeout')
//
//     waitsForPromise -> atom.workspace.open('gocode.go').then (e) ->
//       editor = e
//       editorView = atom.views.getView(editor)
//
//     waitsForPromise ->
//       atom.packages.activatePackage('autocomplete-plus')
//
//     waitsFor ->
//       autocompleteMain.autocompleteManager?.ready
//
//     runs ->
//       autocompleteManager = autocompleteMain.getAutocompleteManager()
//       spyOn(autocompleteManager, 'displaySuggestions').andCallThrough()
//       spyOn(autocompleteManager, 'showSuggestionList').andCallThrough()
//       spyOn(autocompleteManager, 'hideSuggestionList').andCallThrough()
//
//     waitsForPromise ->
//       atom.packages.activatePackage('language-go')
//
//     runs ->
//       expect(goplusMain.provide).not.toHaveBeenCalled()
//       expect(goplusMain.provide.calls.length).toBe(0)
//
//     waitsForPromise ->
//       atom.packages.activatePackage('go-plus')
//
//     waitsFor ->
//       goplusMain.provide.calls.length is 1
//
//     waitsFor ->
//       autocompleteMain.consumeProvider.calls.length is 1
//
//     waitsFor ->
//       goplusMain.dispatch?.ready
//
//     waitsFor ->
//       goplusMain.setDispatch.calls.length >= 1
//
//     runs ->
//       expect(goplusMain.provide).toHaveBeenCalled()
//       expect(goplusMain.provider).toBeDefined()
//       provider = goplusMain.provider
//       spyOn(provider, 'getSuggestions').andCallThrough()
//       provider.onDidInsertSuggestion = jasmine.createSpy()
//       expect(_.size(autocompleteManager.providerManager.providersForScopeDescriptor('.source.go'))).toEqual(1)
//       expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.go')[0]).toEqual(provider)
//       buffer = editor.getBuffer()
//       dispatch = atom.packages.getLoadedPackage('go-plus').mainModule.dispatch
//       dispatch.goexecutable.detect()
//
//   afterEach ->
//     jasmine.unspy(goplusMain, 'provide')
//     jasmine.unspy(goplusMain, 'setDispatch')
//     jasmine.unspy(autocompleteManager, 'displaySuggestions')
//     jasmine.unspy(autocompleteMain, 'consumeProvider')
//     jasmine.unspy(autocompleteManager, 'hideSuggestionList')
//     jasmine.unspy(autocompleteManager, 'showSuggestionList')
//     jasmine.unspy(provider, 'getSuggestions')
//
//   describe 'when the gocode autocomplete-plus provider is enabled', ->
//
//     it 'displays suggestions from gocode', ->
//       runs ->
//         expect(provider).toBeDefined()
//         expect(provider.getSuggestions).not.toHaveBeenCalled()
//         expect(autocompleteManager.displaySuggestions).not.toHaveBeenCalled()
//         expect(editorView.querySelector('.autocomplete-plus')).not.toExist()
//         editor.setCursorScreenPosition([5, 6])
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.hideSuggestionList.calls.length is 1
//
//       runs ->
//         editor.insertText('P')
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.showSuggestionList.calls.length is 1
//
//       waitsFor ->
//         editorView.querySelector('.autocomplete-plus span.word')?
//
//       runs ->
//         expect(provider.getSuggestions).toHaveBeenCalled()
//         expect(provider.getSuggestions.calls.length).toBe(1)
//         expect(editorView.querySelector('.autocomplete-plus')).toExist()
//         expect(editorView.querySelector('.autocomplete-plus span.word').innerHTML).toBe('<span class="character-match">P</span>rint(<span class="snippet-completion">a ...interface{}</span>)')
//         expect(editorView.querySelector('.autocomplete-plus span.left-label').innerHTML).toBe('n int, err error')
//         editor.backspace()
//
//     it 'confirms a suggestion when the prefix case does not match', ->
//       runs ->
//         expect(provider).toBeDefined()
//         expect(provider.getSuggestions).not.toHaveBeenCalled()
//         expect(autocompleteManager.displaySuggestions).not.toHaveBeenCalled()
//         expect(editorView.querySelector('.autocomplete-plus')).not.toExist()
//         editor.setCursorScreenPosition([7, 0])
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.hideSuggestionList.calls.length is 1
//
//       runs ->
//         editor.insertText('    fmt.')
//         editor.insertText('p')
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.showSuggestionList.calls.length is 1
//
//       waitsFor ->
//         editorView.querySelector('.autocomplete-plus span.word')?
//
//       runs ->
//         expect(provider.getSuggestions).toHaveBeenCalled()
//         expect(provider.getSuggestions.calls.length).toBe(1)
//         expect(provider.onDidInsertSuggestion).not.toHaveBeenCalled()
//         expect(editorView.querySelector('.autocomplete-plus span.word').innerHTML).toBe('<span class="character-match">P</span>rint(<span class="snippet-completion">a ...interface{}</span>)')
//         suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list')
//         atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm')
//
//       waitsFor ->
//         provider.onDidInsertSuggestion.calls.length is 1
//
//       runs ->
//         expect(provider.onDidInsertSuggestion).toHaveBeenCalled()
//         expect(buffer.getTextInRange([[7, 4], [7, 9]])).toBe('fmt.P')
//
//     it 'confirms a suggestion when the prefix case does not match', ->
//       runs ->
//         expect(provider).toBeDefined()
//         expect(provider.getSuggestions).not.toHaveBeenCalled()
//         expect(autocompleteManager.displaySuggestions).not.toHaveBeenCalled()
//         expect(editorView.querySelector('.autocomplete-plus')).not.toExist()
//         editor.setCursorScreenPosition([7, 0])
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.hideSuggestionList.calls.length is 1
//
//       runs ->
//         editor.insertText('    fmt.p')
//         editor.insertText('r')
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.showSuggestionList.calls.length is 1
//
//       waitsFor ->
//         editorView.querySelector('.autocomplete-plus span.word')?
//
//       runs ->
//         expect(provider.getSuggestions).toHaveBeenCalled()
//         expect(provider.getSuggestions.calls.length).toBe(1)
//         expect(provider.onDidInsertSuggestion).not.toHaveBeenCalled()
//         expect(editorView.querySelector('.autocomplete-plus span.word').innerHTML).toBe('<span class="character-match">P</span><span class="character-match">r</span>int(<span class="snippet-completion">a ...interface{}</span>)')
//         suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list')
//         atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm')
//
//       waitsFor ->
//         provider.onDidInsertSuggestion.calls.length is 1
//
//       runs ->
//         expect(provider.onDidInsertSuggestion).toHaveBeenCalled()
//         expect(buffer.getTextInRange([[7, 4], [7, 10]])).toBe('fmt.Pr')
//
//     xit 'does not display suggestions when no gocode suggestions exist', ->
//       runs ->
//         expect(editorView.querySelector('.autocomplete-plus')).not.toExist()
//
//         editor.setCursorScreenPosition([6, 15])
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.hideSuggestionList.calls.length is 1
//
//       runs ->
//         editor.insertText('w')
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.hideSuggestionList.calls.length is 2
//
//       runs ->
//         expect(editorView.querySelector('.autocomplete-plus')).not.toExist()
//
//     it 'does not display suggestions at the end of a line when no gocode suggestions exist', ->
//       runs ->
//         expect(editorView.querySelector('.autocomplete-plus')).not.toExist()
//
//         editor.setCursorScreenPosition([5, 15])
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.hideSuggestionList.calls.length is 1
//
//       waitsFor ->
//         autocompleteManager.displaySuggestions.calls.length is 0
//
//       runs ->
//         editor.insertText(')')
//         advanceClock(completionDelay)
//
//       waitsFor ->
//         autocompleteManager.displaySuggestions.calls.length is 1
//
//       runs ->
//         expect(editorView.querySelector('.autocomplete-plus')).not.toExist()
//         editor.insertText(';')
//
//       waitsFor ->
//         autocompleteManager.displaySuggestions.calls.length is 1
//         advanceClock(completionDelay)
//
//       runs ->
//         expect(editorView.querySelector('.autocomplete-plus')).not.toExist()
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtZ28vc3BlYy9nb2NvZGVwcm92aWRlci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBR2lCLE1BQU07Ozs7QUFIdkIsV0FBVyxDQUFBOztBQUtYLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO0FBQy9CLE1BQUksZUFBZSxHQUFHLElBQUksQ0FBQTtBQUMxQixNQUFJLG9CQUFvQixHQUFHLElBQUksQ0FBQTtBQUMvQixNQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQTtBQUM5QixNQUFJLFlBQVksR0FBRyxJQUFJLENBQUE7QUFDdkIsTUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUE7QUFDN0IsTUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ25CLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNqQixNQUFJLFVBQVUsR0FBRyxJQUFJLENBQUE7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7QUFDM0IsTUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUE7O0FBRTdCLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDN0QsZUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO09BQzFELENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDaEIsNEJBQW9CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQTtBQUN0QyxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFBO09BQ2xELENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDaEIsb0JBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFBO0FBQzlC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QUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUN6QyxjQUFNLENBQUMsU0FBUyxFQUFFLENBQUE7T0FDbkIsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtZ28vc3BlYy9nb2NvZGVwcm92aWRlci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5kZXNjcmliZSgnZ29jb2RlcHJvdmlkZXInLCAoKSA9PiB7XG4gIGxldCBjb21wbGV0aW9uRGVsYXkgPSBudWxsXG4gIGxldCBhdXRvY29tcGxldGVwbHVzTWFpbiA9IG51bGxcbiAgbGV0IGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBudWxsXG4gIGxldCBnb2NvbmZpZ01haW4gPSBudWxsXG4gIGxldCBhdXRvY29tcGxldGVnb01haW4gPSBudWxsXG4gIGxldCBwcm92aWRlciA9IG51bGxcbiAgbGV0IGVkaXRvciA9IG51bGxcbiAgbGV0IGVkaXRvclZpZXcgPSBudWxsXG4gIGxldCB3b3Jrc3BhY2VFbGVtZW50ID0gbnVsbFxuICBsZXQgc3VnZ2VzdGlvbnNQcm9taXNlID0gbnVsbFxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWdvJykudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgfSkudGhlbigocGFjaykgPT4ge1xuICAgICAgICBhdXRvY29tcGxldGVwbHVzTWFpbiA9IHBhY2subWFpbk1vZHVsZVxuICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2dvLWNvbmZpZycpXG4gICAgICB9KS50aGVuKChwYWNrKSA9PiB7XG4gICAgICAgIGdvY29uZmlnTWFpbiA9IHBhY2subWFpbk1vZHVsZVxuICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1nbycpXG4gICAgICB9KS50aGVuKChwYWNrKSA9PiB7XG4gICAgICAgIGF1dG9jb21wbGV0ZWdvTWFpbiA9IHBhY2subWFpbk1vZHVsZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF1dG9jb21wbGV0ZXBsdXNNYWluLmF1dG9jb21wbGV0ZU1hbmFnZXIgJiYgYXV0b2NvbXBsZXRlcGx1c01haW4uYXV0b2NvbXBsZXRlTWFuYWdlci5yZWFkeVxuICAgIH0pXG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICAgIC8vIGF1dG9jb21wbGV0ZS1wbHVzXG4gICAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gYXV0b2NvbXBsZXRlcGx1c01haW4uZ2V0QXV0b2NvbXBsZXRlTWFuYWdlcigpXG4gICAgICBzcHlPbihhdXRvY29tcGxldGVNYW5hZ2VyLCAnZGlzcGxheVN1Z2dlc3Rpb25zJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24oYXV0b2NvbXBsZXRlTWFuYWdlciwgJ3Nob3dTdWdnZXN0aW9uTGlzdCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKGF1dG9jb21wbGV0ZU1hbmFnZXIsICdoaWRlU3VnZ2VzdGlvbkxpc3QnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgdHJ1ZSlcbiAgICAgIC8vIGF0b20uY29uZmlnLnNldCgnZ28tcGx1cy5zdXBwcmVzc0J1aWx0aW5BdXRvY29tcGxldGVQcm92aWRlcicsIGZhbHNlKVxuICAgICAgY29tcGxldGlvbkRlbGF5ID0gMTAwXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmF1dG9BY3RpdmF0aW9uRGVsYXknLCBjb21wbGV0aW9uRGVsYXkpXG4gICAgICBjb21wbGV0aW9uRGVsYXkgKz0gMTAwIC8vIFJlbmRlcmluZyBkZWxheVxuXG4gICAgICAvLyBhdXRvY29tcGxldGUtZ29cbiAgICAgIHByb3ZpZGVyID0gYXV0b2NvbXBsZXRlZ29NYWluLmdldFByb3ZpZGVyKClcbiAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBwcm92aWRlci5vbkRpZEluc2VydFN1Z2dlc3Rpb24gPSBqYXNtaW5lLmNyZWF0ZVNweSgpXG4gICAgICBwcm92aWRlci5vbkRpZEdldFN1Z2dlc3Rpb25zKChwKSA9PiB7XG4gICAgICAgIHN1Z2dlc3Rpb25zUHJvbWlzZSA9IHBcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgIHJldHVybiBwcm92aWRlci5yZWFkeSgpXG4gICAgfSlcbiAgfSlcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIGlmIChwcm92aWRlciAhPT0gbnVsbCkge1xuICAgICAgamFzbWluZS51bnNweShwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJylcbiAgICAgIHByb3ZpZGVyLmRpc3Bvc2UoKVxuICAgICAgcHJvdmlkZXIgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKGF1dG9jb21wbGV0ZU1hbmFnZXIgIT09IG51bGwpIHtcbiAgICAgIGphc21pbmUudW5zcHkoYXV0b2NvbXBsZXRlTWFuYWdlciwgJ2Rpc3BsYXlTdWdnZXN0aW9ucycpXG4gICAgICBqYXNtaW5lLnVuc3B5KGF1dG9jb21wbGV0ZU1hbmFnZXIsICdoaWRlU3VnZ2VzdGlvbkxpc3QnKVxuICAgICAgamFzbWluZS51bnNweShhdXRvY29tcGxldGVNYW5hZ2VyLCAnc2hvd1N1Z2dlc3Rpb25MaXN0JylcbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcG9zZSgpXG4gICAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gbnVsbFxuICAgIH1cblxuICAgIGlmIChhdXRvY29tcGxldGVwbHVzTWFpbiAhPT0gbnVsbCkge1xuICAgICAgYXV0b2NvbXBsZXRlcGx1c01haW4uZGVhY3RpdmF0ZSgpXG4gICAgICBhdXRvY29tcGxldGVwbHVzTWFpbiA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAoYXV0b2NvbXBsZXRlZ29NYWluICE9PSBudWxsKSB7XG4gICAgICBhdXRvY29tcGxldGVnb01haW4uZGVhY3RpdmF0ZSgpXG4gICAgICBhdXRvY29tcGxldGVnb01haW4gPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKGdvY29uZmlnTWFpbiAhPT0gbnVsbCkge1xuICAgICAgZ29jb25maWdNYWluLmRlYWN0aXZhdGUoKVxuICAgICAgZ29jb25maWdNYWluID0gbnVsbFxuICAgIH1cblxuICAgIGlmIChlZGl0b3IgIT09IG51bGwpIHtcbiAgICAgIC8vIFRPRE8gQ2xvc2VcbiAgICAgIGVkaXRvciA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAoZWRpdG9yVmlldyAhPT0gbnVsbCkge1xuICAgICAgLy8gVE9ETyBDbG9zZVxuICAgICAgZWRpdG9yVmlldyA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAod29ya3NwYWNlRWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgLy8gVE9ETyBDbG9zZVxuICAgICAgd29ya3NwYWNlRWxlbWVudCA9IG51bGxcbiAgICB9XG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIGJhc2ljIGZpbGUgaXMgb3BlbmVkJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oJ2Jhc2ljJyArIHBhdGguc2VwICsgJ21haW4uZ28nKS50aGVuKChlKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gZVxuICAgICAgICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3JldHVybnMgc3VnZ2VzdGlvbnMgdG8gYXV0b2NvbXBsZXRlLXBsdXMnLCAoKSA9PiB7XG4gICAgICBsZXQgc3VnZ2VzdGlvbnMgPSBudWxsXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oWzUsIDZdKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnUCcpXG4gICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG4gICAgICB9KVxuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiBwcm92aWRlci5nZXRTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggPT09IDEgJiYgc3VnZ2VzdGlvbnNQcm9taXNlICE9PSBudWxsXG4gICAgICB9KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnNQcm9taXNlLnRoZW4oKHMpID0+IHtcbiAgICAgICAgICBzdWdnZXN0aW9ucyA9IHNcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QocHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QocHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9ucykudG9CZVRydXRoeSgpXG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9ucy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0pLnRvQmVUcnV0aHkoKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0uc25pcHBldCkudG9CZSgnUHJpbnQoJHsxOmEgLi4uaW50ZXJmYWNle1xcXFx9fSknKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0ucmVwbGFjZW1lbnRQcmVmaXgpLnRvQmUoJ1AnKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udHlwZSkudG9CZSgnZnVuY3Rpb24nKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0ubGVmdExhYmVsKS50b0JlKCduIGludCwgZXJyIGVycm9yJylcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIGdvLXBsdXMtaXNzdWUtMzA3IGZpbGUgaXMgb3BlbmVkJywgKCkgPT4ge1xuICAgIGxldCBzdWdnZXN0aW9ucyA9IG51bGxcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKCdnby1wbHVzLWlzc3VlLTMwNycgKyBwYXRoLnNlcCArICdtYWluLmdvJykudGhlbigoZSkgPT4ge1xuICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdyZXR1cm5zIHN1Z2dlc3Rpb25zIHRvIGF1dG9jb21wbGV0ZS1wbHVzIHNjZW5hcmlvIDEnLCAoKSA9PiB7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oWzEzLCAwXSlcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1xcdFNheUhlbGxvKFwid29ybGRcIiknKVxuICAgICAgICBzdWdnZXN0aW9ucyA9IG51bGxcbiAgICAgICAgc3VnZ2VzdGlvbnNQcm9taXNlID0gbnVsbFxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zUHJvbWlzZSkudG9CZUZhbHN5KClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJy4nKVxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zUHJvbWlzZSAhPT0gbnVsbFxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zUHJvbWlzZS50aGVuKChzKSA9PiB7XG4gICAgICAgICAgc3VnZ2VzdGlvbnMgPSBzXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMpLnRvQmVUcnV0aHkoKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdKS50b0JlVHJ1dGh5KClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnNuaXBwZXQpLnRvQmUoJ0ZhdGFsKCR7MTp2IC4uLmludGVyZmFjZXtcXFxcfX0pJylcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnJlcGxhY2VtZW50UHJlZml4KS50b0JlKCcnKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udHlwZSkudG9CZSgnZnVuY3Rpb24nKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0ubGVmdExhYmVsKS50b0JlKCcnKVxuICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdyZXR1cm5zIHN1Z2dlc3Rpb25zIHRvIGF1dG9jb21wbGV0ZS1wbHVzIHNjZW5hcmlvIDInLCAoKSA9PiB7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oWzEzLCAwXSlcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1xcdFNheUhlbGxvKFwid29ybGRcIikgJylcbiAgICAgICAgc3VnZ2VzdGlvbnMgPSBudWxsXG4gICAgICAgIHN1Z2dlc3Rpb25zUHJvbWlzZSA9IG51bGxcbiAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QocHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoKS50b0JlKDApXG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1Byb21pc2UpLnRvQmVGYWxzeSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcuJylcbiAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcbiAgICAgIH0pXG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1Byb21pc2UgIT09IG51bGxcbiAgICAgIH0pXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uc1Byb21pc2UudGhlbigocykgPT4ge1xuICAgICAgICAgIHN1Z2dlc3Rpb25zID0gc1xuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucykudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zKS50b0JlVHJ1dGh5KClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKDApXG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1swXSkudG9CZVRydXRoeSgpXG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1swXS5zbmlwcGV0KS50b0JlKCdGYXRhbCgkezE6diAuLi5pbnRlcmZhY2V7XFxcXH19KScpXG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1swXS5yZXBsYWNlbWVudFByZWZpeCkudG9CZSgnJylcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnR5cGUpLnRvQmUoJ2Z1bmN0aW9uJylcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLmxlZnRMYWJlbCkudG9CZSgnJylcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyBzdWdnZXN0aW9ucyB0byBhdXRvY29tcGxldGUtcGx1cyBzY2VuYXJpbyAzJywgKCkgPT4ge1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwcm92aWRlcikudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QocHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKFsxMywgMF0pXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdcXHRTYXlIZWxsbyhcIndvcmxkXCIpICAnKVxuICAgICAgICBzdWdnZXN0aW9ucyA9IG51bGxcbiAgICAgICAgc3VnZ2VzdGlvbnNQcm9taXNlID0gbnVsbFxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zUHJvbWlzZSkudG9CZUZhbHN5KClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJy4nKVxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zUHJvbWlzZSAhPT0gbnVsbFxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zUHJvbWlzZS50aGVuKChzKSA9PiB7XG4gICAgICAgICAgc3VnZ2VzdGlvbnMgPSBzXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMpLnRvQmVUcnV0aHkoKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdKS50b0JlVHJ1dGh5KClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnNuaXBwZXQpLnRvQmUoJ0ZhdGFsKCR7MTp2IC4uLmludGVyZmFjZXtcXFxcfX0pJylcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnJlcGxhY2VtZW50UHJlZml4KS50b0JlKCcnKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udHlwZSkudG9CZSgnZnVuY3Rpb24nKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0ubGVmdExhYmVsKS50b0JlKCcnKVxuICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdyZXR1cm5zIHN1Z2dlc3Rpb25zIHRvIGF1dG9jb21wbGV0ZS1wbHVzIHNjZW5hcmlvIDQnLCAoKSA9PiB7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oWzEzLCAwXSlcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1xcdFNheUhlbGxvKFwid29ybGRcIilcXHQnKVxuICAgICAgICBzdWdnZXN0aW9ucyA9IG51bGxcbiAgICAgICAgc3VnZ2VzdGlvbnNQcm9taXNlID0gbnVsbFxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zUHJvbWlzZSkudG9CZUZhbHN5KClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJy4nKVxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zUHJvbWlzZSAhPT0gbnVsbFxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zUHJvbWlzZS50aGVuKChzKSA9PiB7XG4gICAgICAgICAgc3VnZ2VzdGlvbnMgPSBzXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMpLnRvQmVUcnV0aHkoKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdKS50b0JlVHJ1dGh5KClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnNuaXBwZXQpLnRvQmUoJ0ZhdGFsKCR7MTp2IC4uLmludGVyZmFjZXtcXFxcfX0pJylcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnJlcGxhY2VtZW50UHJlZml4KS50b0JlKCcnKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udHlwZSkudG9CZSgnZnVuY3Rpb24nKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0ubGVmdExhYmVsKS50b0JlKCcnKVxuICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG5cbi8vIHBhdGggPSByZXF1aXJlKCdwYXRoJylcbi8vIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlLXBsdXMnKVxuLy8gQXRvbUNvbmZpZyA9IHJlcXVpcmUoJy4vdXRpbC9hdG9tY29uZmlnJylcbi8vXG4vLyBkZXNjcmliZSAnZ29jb2RlJywgLT5cbi8vICAgW3dvcmtzcGFjZUVsZW1lbnQsIGVkaXRvciwgZWRpdG9yVmlldywgZGlzcGF0Y2gsIGJ1ZmZlciwgY29tcGxldGlvbkRlbGF5LCBnb3BsdXNNYWluLCBhdXRvY29tcGxldGVNYWluLCBhdXRvY29tcGxldGVNYW5hZ2VyLCBwcm92aWRlcl0gPSBbXVxuLy9cbi8vICAgYmVmb3JlRWFjaCAtPlxuLy8gICAgIHJ1bnMgLT5cbi8vICAgICAgIGF0b21jb25maWcgPSBuZXcgQXRvbUNvbmZpZygpXG4vLyAgICAgICBhdG9tY29uZmlnLmFsbGZ1bmN0aW9uYWxpdHlkaXNhYmxlZCgpXG4vL1xuLy8gICAgICAgIyBFbmFibGUgbGl2ZSBhdXRvY29tcGxldGlvblxuLy8gICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIHRydWUpXG4vLyAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dvLXBsdXMuc3VwcHJlc3NCdWlsdGluQXV0b2NvbXBsZXRlUHJvdmlkZXInLCBmYWxzZSlcbi8vICAgICAgICMgU2V0IHRoZSBjb21wbGV0aW9uIGRlbGF5XG4vLyAgICAgICBjb21wbGV0aW9uRGVsYXkgPSAxMDBcbi8vICAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuYXV0b0FjdGl2YXRpb25EZWxheScsIGNvbXBsZXRpb25EZWxheSlcbi8vICAgICAgIGNvbXBsZXRpb25EZWxheSArPSAxMDAgIyBSZW5kZXJpbmcgZGVsYXlcbi8vXG4vLyAgICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuLy8gICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuLy9cbi8vICAgICAgIHBhY2sgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdnby1wbHVzJylcbi8vICAgICAgIGdvcGx1c01haW4gPSBwYWNrLm1haW5Nb2R1bGVcbi8vICAgICAgIHNweU9uKGdvcGx1c01haW4sICdwcm92aWRlJykuYW5kQ2FsbFRocm91Z2goKVxuLy8gICAgICAgc3B5T24oZ29wbHVzTWFpbiwgJ3NldERpc3BhdGNoJykuYW5kQ2FsbFRocm91Z2goKVxuLy8gICAgICAgcGFjayA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1wbHVzJylcbi8vICAgICAgIGF1dG9jb21wbGV0ZU1haW4gPSBwYWNrLm1haW5Nb2R1bGVcbi8vICAgICAgIHNweU9uKGF1dG9jb21wbGV0ZU1haW4sICdjb25zdW1lUHJvdmlkZXInKS5hbmRDYWxsVGhyb3VnaCgpXG4vLyAgICAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ3NldFRpbWVvdXQnKVxuLy9cbi8vICAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbignZ29jb2RlLmdvJykudGhlbiAoZSkgLT5cbi8vICAgICAgIGVkaXRvciA9IGVcbi8vICAgICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuLy9cbi8vICAgICB3YWl0c0ZvclByb21pc2UgLT5cbi8vICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpXG4vL1xuLy8gICAgIHdhaXRzRm9yIC0+XG4vLyAgICAgICBhdXRvY29tcGxldGVNYWluLmF1dG9jb21wbGV0ZU1hbmFnZXI/LnJlYWR5XG4vL1xuLy8gICAgIHJ1bnMgLT5cbi8vICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBhdXRvY29tcGxldGVNYWluLmdldEF1dG9jb21wbGV0ZU1hbmFnZXIoKVxuLy8gICAgICAgc3B5T24oYXV0b2NvbXBsZXRlTWFuYWdlciwgJ2Rpc3BsYXlTdWdnZXN0aW9ucycpLmFuZENhbGxUaHJvdWdoKClcbi8vICAgICAgIHNweU9uKGF1dG9jb21wbGV0ZU1hbmFnZXIsICdzaG93U3VnZ2VzdGlvbkxpc3QnKS5hbmRDYWxsVGhyb3VnaCgpXG4vLyAgICAgICBzcHlPbihhdXRvY29tcGxldGVNYW5hZ2VyLCAnaGlkZVN1Z2dlc3Rpb25MaXN0JykuYW5kQ2FsbFRocm91Z2goKVxuLy9cbi8vICAgICB3YWl0c0ZvclByb21pc2UgLT5cbi8vICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1nbycpXG4vL1xuLy8gICAgIHJ1bnMgLT5cbi8vICAgICAgIGV4cGVjdChnb3BsdXNNYWluLnByb3ZpZGUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbi8vICAgICAgIGV4cGVjdChnb3BsdXNNYWluLnByb3ZpZGUuY2FsbHMubGVuZ3RoKS50b0JlKDApXG4vL1xuLy8gICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuLy8gICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2dvLXBsdXMnKVxuLy9cbi8vICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgZ29wbHVzTWFpbi5wcm92aWRlLmNhbGxzLmxlbmd0aCBpcyAxXG4vL1xuLy8gICAgIHdhaXRzRm9yIC0+XG4vLyAgICAgICBhdXRvY29tcGxldGVNYWluLmNvbnN1bWVQcm92aWRlci5jYWxscy5sZW5ndGggaXMgMVxuLy9cbi8vICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgZ29wbHVzTWFpbi5kaXNwYXRjaD8ucmVhZHlcbi8vXG4vLyAgICAgd2FpdHNGb3IgLT5cbi8vICAgICAgIGdvcGx1c01haW4uc2V0RGlzcGF0Y2guY2FsbHMubGVuZ3RoID49IDFcbi8vXG4vLyAgICAgcnVucyAtPlxuLy8gICAgICAgZXhwZWN0KGdvcGx1c01haW4ucHJvdmlkZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4vLyAgICAgICBleHBlY3QoZ29wbHVzTWFpbi5wcm92aWRlcikudG9CZURlZmluZWQoKVxuLy8gICAgICAgcHJvdmlkZXIgPSBnb3BsdXNNYWluLnByb3ZpZGVyXG4vLyAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbFRocm91Z2goKVxuLy8gICAgICAgcHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uID0gamFzbWluZS5jcmVhdGVTcHkoKVxuLy8gICAgICAgZXhwZWN0KF8uc2l6ZShhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5wcm92aWRlcnNGb3JTY29wZURlc2NyaXB0b3IoJy5zb3VyY2UuZ28nKSkpLnRvRXF1YWwoMSlcbi8vICAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5wcm92aWRlcnNGb3JTY29wZURlc2NyaXB0b3IoJy5zb3VyY2UuZ28nKVswXSkudG9FcXVhbChwcm92aWRlcilcbi8vICAgICAgIGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuLy8gICAgICAgZGlzcGF0Y2ggPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ2dvLXBsdXMnKS5tYWluTW9kdWxlLmRpc3BhdGNoXG4vLyAgICAgICBkaXNwYXRjaC5nb2V4ZWN1dGFibGUuZGV0ZWN0KClcbi8vXG4vLyAgIGFmdGVyRWFjaCAtPlxuLy8gICAgIGphc21pbmUudW5zcHkoZ29wbHVzTWFpbiwgJ3Byb3ZpZGUnKVxuLy8gICAgIGphc21pbmUudW5zcHkoZ29wbHVzTWFpbiwgJ3NldERpc3BhdGNoJylcbi8vICAgICBqYXNtaW5lLnVuc3B5KGF1dG9jb21wbGV0ZU1hbmFnZXIsICdkaXNwbGF5U3VnZ2VzdGlvbnMnKVxuLy8gICAgIGphc21pbmUudW5zcHkoYXV0b2NvbXBsZXRlTWFpbiwgJ2NvbnN1bWVQcm92aWRlcicpXG4vLyAgICAgamFzbWluZS51bnNweShhdXRvY29tcGxldGVNYW5hZ2VyLCAnaGlkZVN1Z2dlc3Rpb25MaXN0Jylcbi8vICAgICBqYXNtaW5lLnVuc3B5KGF1dG9jb21wbGV0ZU1hbmFnZXIsICdzaG93U3VnZ2VzdGlvbkxpc3QnKVxuLy8gICAgIGphc21pbmUudW5zcHkocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpXG4vL1xuLy8gICBkZXNjcmliZSAnd2hlbiB0aGUgZ29jb2RlIGF1dG9jb21wbGV0ZS1wbHVzIHByb3ZpZGVyIGlzIGVuYWJsZWQnLCAtPlxuLy9cbi8vICAgICBpdCAnZGlzcGxheXMgc3VnZ2VzdGlvbnMgZnJvbSBnb2NvZGUnLCAtPlxuLy8gICAgICAgcnVucyAtPlxuLy8gICAgICAgICBleHBlY3QocHJvdmlkZXIpLnRvQmVEZWZpbmVkKClcbi8vICAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4vLyAgICAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuLy8gICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuLy8gICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oWzUsIDZdKVxuLy8gICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuLy9cbi8vICAgICAgIHdhaXRzRm9yIC0+XG4vLyAgICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaGlkZVN1Z2dlc3Rpb25MaXN0LmNhbGxzLmxlbmd0aCBpcyAxXG4vL1xuLy8gICAgICAgcnVucyAtPlxuLy8gICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnUCcpXG4vLyAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG4vL1xuLy8gICAgICAgd2FpdHNGb3IgLT5cbi8vICAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5zaG93U3VnZ2VzdGlvbkxpc3QuY2FsbHMubGVuZ3RoIGlzIDFcbi8vXG4vLyAgICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgICBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBzcGFuLndvcmQnKT9cbi8vXG4vLyAgICAgICBydW5zIC0+XG4vLyAgICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucykudG9IYXZlQmVlbkNhbGxlZCgpXG4vLyAgICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGgpLnRvQmUoMSlcbi8vICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuLy8gICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgc3Bhbi53b3JkJykuaW5uZXJIVE1MKS50b0JlKCc8c3BhbiBjbGFzcz1cImNoYXJhY3Rlci1tYXRjaFwiPlA8L3NwYW4+cmludCg8c3BhbiBjbGFzcz1cInNuaXBwZXQtY29tcGxldGlvblwiPmEgLi4uaW50ZXJmYWNle308L3NwYW4+KScpXG4vLyAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBzcGFuLmxlZnQtbGFiZWwnKS5pbm5lckhUTUwpLnRvQmUoJ24gaW50LCBlcnIgZXJyb3InKVxuLy8gICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbi8vXG4vLyAgICAgaXQgJ2NvbmZpcm1zIGEgc3VnZ2VzdGlvbiB3aGVuIHRoZSBwcmVmaXggY2FzZSBkb2VzIG5vdCBtYXRjaCcsIC0+XG4vLyAgICAgICBydW5zIC0+XG4vLyAgICAgICAgIGV4cGVjdChwcm92aWRlcikudG9CZURlZmluZWQoKVxuLy8gICAgICAgICBleHBlY3QocHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbi8vICAgICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4vLyAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4vLyAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihbNywgMF0pXG4vLyAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG4vL1xuLy8gICAgICAgd2FpdHNGb3IgLT5cbi8vICAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5oaWRlU3VnZ2VzdGlvbkxpc3QuY2FsbHMubGVuZ3RoIGlzIDFcbi8vXG4vLyAgICAgICBydW5zIC0+XG4vLyAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcgICAgZm10LicpXG4vLyAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdwJylcbi8vICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcbi8vXG4vLyAgICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLnNob3dTdWdnZXN0aW9uTGlzdC5jYWxscy5sZW5ndGggaXMgMVxuLy9cbi8vICAgICAgIHdhaXRzRm9yIC0+XG4vLyAgICAgICAgIGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIHNwYW4ud29yZCcpP1xuLy9cbi8vICAgICAgIHJ1bnMgLT5cbi8vICAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKS50b0hhdmVCZWVuQ2FsbGVkKClcbi8vICAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCkudG9CZSgxKVxuLy8gICAgICAgICBleHBlY3QocHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4vLyAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBzcGFuLndvcmQnKS5pbm5lckhUTUwpLnRvQmUoJzxzcGFuIGNsYXNzPVwiY2hhcmFjdGVyLW1hdGNoXCI+UDwvc3Bhbj5yaW50KDxzcGFuIGNsYXNzPVwic25pcHBldC1jb21wbGV0aW9uXCI+YSAuLi5pbnRlcmZhY2V7fTwvc3Bhbj4pJylcbi8vICAgICAgICAgc3VnZ2VzdGlvbkxpc3RWaWV3ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24tbGlzdCcpXG4vLyAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybScpXG4vL1xuLy8gICAgICAgd2FpdHNGb3IgLT5cbi8vICAgICAgICAgcHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uLmNhbGxzLmxlbmd0aCBpcyAxXG4vL1xuLy8gICAgICAgcnVucyAtPlxuLy8gICAgICAgICBleHBlY3QocHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbi8vICAgICAgICAgZXhwZWN0KGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShbWzcsIDRdLCBbNywgOV1dKSkudG9CZSgnZm10LlAnKVxuLy9cbi8vICAgICBpdCAnY29uZmlybXMgYSBzdWdnZXN0aW9uIHdoZW4gdGhlIHByZWZpeCBjYXNlIGRvZXMgbm90IG1hdGNoJywgLT5cbi8vICAgICAgIHJ1bnMgLT5cbi8vICAgICAgICAgZXhwZWN0KHByb3ZpZGVyKS50b0JlRGVmaW5lZCgpXG4vLyAgICAgICAgIGV4cGVjdChwcm92aWRlci5nZXRTdWdnZXN0aW9ucykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuLy8gICAgICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbi8vICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbi8vICAgICAgICAgZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKFs3LCAwXSlcbi8vICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcbi8vXG4vLyAgICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmhpZGVTdWdnZXN0aW9uTGlzdC5jYWxscy5sZW5ndGggaXMgMVxuLy9cbi8vICAgICAgIHJ1bnMgLT5cbi8vICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyAgICBmbXQucCcpXG4vLyAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdyJylcbi8vICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcbi8vXG4vLyAgICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLnNob3dTdWdnZXN0aW9uTGlzdC5jYWxscy5sZW5ndGggaXMgMVxuLy9cbi8vICAgICAgIHdhaXRzRm9yIC0+XG4vLyAgICAgICAgIGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIHNwYW4ud29yZCcpP1xuLy9cbi8vICAgICAgIHJ1bnMgLT5cbi8vICAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKS50b0hhdmVCZWVuQ2FsbGVkKClcbi8vICAgICAgICAgZXhwZWN0KHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCkudG9CZSgxKVxuLy8gICAgICAgICBleHBlY3QocHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4vLyAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBzcGFuLndvcmQnKS5pbm5lckhUTUwpLnRvQmUoJzxzcGFuIGNsYXNzPVwiY2hhcmFjdGVyLW1hdGNoXCI+UDwvc3Bhbj48c3BhbiBjbGFzcz1cImNoYXJhY3Rlci1tYXRjaFwiPnI8L3NwYW4+aW50KDxzcGFuIGNsYXNzPVwic25pcHBldC1jb21wbGV0aW9uXCI+YSAuLi5pbnRlcmZhY2V7fTwvc3Bhbj4pJylcbi8vICAgICAgICAgc3VnZ2VzdGlvbkxpc3RWaWV3ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24tbGlzdCcpXG4vLyAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybScpXG4vL1xuLy8gICAgICAgd2FpdHNGb3IgLT5cbi8vICAgICAgICAgcHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uLmNhbGxzLmxlbmd0aCBpcyAxXG4vL1xuLy8gICAgICAgcnVucyAtPlxuLy8gICAgICAgICBleHBlY3QocHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbi8vICAgICAgICAgZXhwZWN0KGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShbWzcsIDRdLCBbNywgMTBdXSkpLnRvQmUoJ2ZtdC5QcicpXG4vL1xuLy8gICAgIHhpdCAnZG9lcyBub3QgZGlzcGxheSBzdWdnZXN0aW9ucyB3aGVuIG5vIGdvY29kZSBzdWdnZXN0aW9ucyBleGlzdCcsIC0+XG4vLyAgICAgICBydW5zIC0+XG4vLyAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4vL1xuLy8gICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oWzYsIDE1XSlcbi8vICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcbi8vXG4vLyAgICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmhpZGVTdWdnZXN0aW9uTGlzdC5jYWxscy5sZW5ndGggaXMgMVxuLy9cbi8vICAgICAgIHJ1bnMgLT5cbi8vICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3cnKVxuLy8gICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuLy9cbi8vICAgICAgIHdhaXRzRm9yIC0+XG4vLyAgICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaGlkZVN1Z2dlc3Rpb25MaXN0LmNhbGxzLmxlbmd0aCBpcyAyXG4vL1xuLy8gICAgICAgcnVucyAtPlxuLy8gICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuLy9cbi8vICAgICBpdCAnZG9lcyBub3QgZGlzcGxheSBzdWdnZXN0aW9ucyBhdCB0aGUgZW5kIG9mIGEgbGluZSB3aGVuIG5vIGdvY29kZSBzdWdnZXN0aW9ucyBleGlzdCcsIC0+XG4vLyAgICAgICBydW5zIC0+XG4vLyAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4vL1xuLy8gICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oWzUsIDE1XSlcbi8vICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcbi8vXG4vLyAgICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmhpZGVTdWdnZXN0aW9uTGlzdC5jYWxscy5sZW5ndGggaXMgMVxuLy9cbi8vICAgICAgIHdhaXRzRm9yIC0+XG4vLyAgICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCBpcyAwXG4vL1xuLy8gICAgICAgcnVucyAtPlxuLy8gICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnKScpXG4vLyAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG4vL1xuLy8gICAgICAgd2FpdHNGb3IgLT5cbi8vICAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcbi8vXG4vLyAgICAgICBydW5zIC0+XG4vLyAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4vLyAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc7Jylcbi8vXG4vLyAgICAgICB3YWl0c0ZvciAtPlxuLy8gICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuLy8gICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuLy9cbi8vICAgICAgIHJ1bnMgLT5cbi8vICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/autocomplete-go/spec/gocodeprovider-spec.js
