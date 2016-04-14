'use babel';
/* eslint-env jasmine */

describe('godef', function () {
  var mainModule = null;

  beforeEach(function () {
    waitsForPromise(function () {
      return atom.packages.activatePackage('go-config').then(function () {
        return atom.packages.activatePackage('navigator-godef');
      }).then(function (pack) {
        mainModule = pack.mainModule;
      });
    });

    waitsFor(function () {
      return mainModule.getGoconfig() !== false;
    });
  });
});

/*
path = require('path')
fs = require('fs-plus')
temp = require('temp').track()
_ = require ("underscore-plus")
{Subscriber} = require 'emissary'
{Point} = require 'atom'

describe "godef", ->
  [mainModule, editor, editorView, dispatch, filePath, workspaceElement] = []
  testDisposables = []
  testText = """package main
                import "fmt"
                var testvar = "stringy"

                func f(){
                  localVar := " says 世界中の世界中の!"
                  fmt.Println( testvar + localVar )}
             """

  beforeEach ->
    # don't run any of the on-save tools
    atom.config.set("go-plus.formatOnSave", false)
    atom.config.set("go-plus.lintOnSave", false)
    atom.config.set("go-plus.vetOnSave", false)
    atom.config.set("go-plus.syntaxCheckOnSave", false)
    atom.config.set("go-plus.runCoverageOnSave", false)

    directory = temp.mkdirSync()
    atom.project.setPaths(directory)
    filePath = path.join(directory, 'go-plus-testing.go')
    fs.writeFileSync(filePath, '')
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)
    jasmine.unspy(window, 'setTimeout')

    waitsForPromise -> atom.workspace.open(filePath).then (e) ->
      editor = e
      editorView = atom.views.getView(editor)

    waitsForPromise ->
      atom.packages.activatePackage('language-go')

    waitsForPromise -> atom.packages.activatePackage('go-plus').then (g) ->
      mainModule = g.mainModule

    waitsFor ->
      mainModule.dispatch?.ready

    runs ->
      dispatch = mainModule.dispatch

  triggerCommand = (command) ->
    atom.commands.dispatch(workspaceElement, dispatch.godef[command])

  godefDone = ->
    new Promise (resolve, reject) ->
      testDisposables.push(dispatch.godef.onDidComplete(resolve))
      return

  bufferTextOffset = (text, count = 1, delta = 0) ->
    buffer = editor.getText()
    index = -1
    for i in [1..count]
      index = buffer.indexOf(text, (if index is -1 then 0 else index + text.length))
      break if index is -1
    return index if index is -1
    index + delta

  offsetCursorPos = (offset) ->
    return if offset < 0
    editor.getBuffer().positionForCharacterIndex(offset)

  bufferTextPos = (text, count = 1, delta = 0) ->
    offsetCursorPos(bufferTextOffset(text, count, delta))

  cursorToOffset = (offset) ->
    return if offset is -1
    editor.setCursorBufferPosition(offsetCursorPos(offset))
    return

  cursorToText = (text, count = 1, delta = 0) ->
    cursorToOffset(bufferTextOffset(text, count, delta))

  afterEach ->
    disposable.dispose() for disposable in testDisposables
    testDisposables = []

  waitsForCommand = (command) ->
    godefPromise = undefined
    runs ->
      # Create the promise before triggering the command because triggerCommand
      # may call onDidComplete synchronously.
      godefPromise = godefDone()
      triggerCommand(command)
    waitsForPromise -> godefPromise
    return

  waitsForGodef = ->
    waitsForCommand 'godefCommand'

  waitsForGodefReturn = ->
    waitsForCommand 'returnCommand'

  waitsForDispatchComplete = (action) ->
    dispatchComplete = false
    runs ->
      dispatch.once 'dispatch-complete', -> dispatchComplete = true
    runs action
    waitsFor -> dispatchComplete

  describe "wordAtCursor (| represents cursor pos)", ->
    godef = null
    beforeEach ->
      godef = dispatch.godef
      godef.editor = editor
      editor.setText("foo foo.bar bar")

    it "should return foo for |foo", ->
      editor.setCursorBufferPosition([0, 0])
      {word, range} = godef.wordAtCursor()
      expect(word).toEqual('foo')
      expect(range).toEqual([[0, 0], [0, 3]])

    it "should return foo for fo|o", ->
      editor.setCursorBufferPosition([0, 2])
      {word, range} = godef.wordAtCursor()
      expect(word).toEqual('foo')
      expect(range).toEqual([[0, 0], [0, 3]])

    # TODO: Check with https://github.com/crispinb - this test used to fail and
    # it is possible the semantics of cursor.getCurrentWordBufferRange have
    # changed
    it "should return no word for foo| foo", ->
      editor.setCursorBufferPosition([0, 3])
      {word, range} = godef.wordAtCursor()
      expect(word).toEqual('foo')
      expect(range).toEqual([[0, 0], [0, 3]])

    it "should return bar for |bar", ->
      editor.setCursorBufferPosition([0, 12])
      {word, range} = godef.wordAtCursor()
      expect(word).toEqual('bar')
      expect(range).toEqual([[0, 12], [0, 15]])

    it "should return foo.bar for !foo.bar", ->
      editor.setCursorBufferPosition([0, 4])
      {word, range} = godef.wordAtCursor()
      expect(word).toEqual('foo.bar')
      expect(range).toEqual([[0, 4], [0, 11]])

    it "should return foo.bar for foo.ba|r", ->
      editor.setCursorBufferPosition([0, 10])
      {word, range} = godef.wordAtCursor()
      expect(word).toEqual('foo.bar')
      expect(range).toEqual([[0, 4], [0, 11]])

  describe "when go-plus is loaded", ->
    it "should have registered the golang:godef command",  ->
      currentCommands = atom.commands.findCommands({target: editorView})
      godefCommand = (cmd for cmd in currentCommands when cmd.name is dispatch.godef.godefCommand)
      expect(godefCommand.length).toEqual(1)

  describe "when godef command is invoked", ->
    describe "if there is more than one cursor", ->
      it "displays a warning message", ->
        waitsForDispatchComplete ->
          editor.setText testText
          editor.save()
        runs ->
          editor.setCursorBufferPosition([0, 0])
          editor.addCursorAtBufferPosition([1, 0])

        waitsForGodef()

        runs ->
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe 1
          expect(dispatch.messages[0].type).toBe("warning")

    describe "with no word under the cursor", ->
      it "displays a warning message", ->
        editor.setCursorBufferPosition([0, 0])
        waitsForGodef()
        runs ->
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe 1
          expect(dispatch.messages[0].type).toBe("warning")

    describe "with a word under the cursor", ->
      beforeEach ->
        waitsForDispatchComplete ->
          editor.setText testText
          editor.save()

      describe "defined within the current file", ->
        beforeEach ->
          cursorToText("testvar", 2)
          waitsForGodef()

        it "should move the cursor to the definition", ->
          runs ->
            expect(editor.getCursorBufferPosition()).toEqual(bufferTextPos("testvar", 1))

        it "should create a highlight decoration of the correct class", ->
          runs ->
            higlightClass = 'definition'
            goPlusHighlightDecs = (d for d in editor.getHighlightDecorations() when d.getProperties()['class'] is higlightClass)
            expect(goPlusHighlightDecs.length).toBe(1)

      describe "defined outside the current file", ->
        it "should open a new text editor", ->
          runs ->
            # Go to the Println in fmt.Println:
            cursorToText("fmt.Println", 1, "fmt.".length)
          waitsForGodef()
          runs ->
            currentEditor = atom.workspace.getActiveTextEditor()
            expect(currentEditor.getTitle()).toBe('print.go')

      describe "defined as a local variable", ->
        it "should jump to the local var definition", ->
          runs ->
            cursorToText("localVar", 2)
          waitsForGodef()
          runs ->
            expect(editor.getCursorBufferPosition()).toEqual(bufferTextPos("localVar", 1))

      describe "defined as a local import prefix", ->
        it "should jump to the import", ->
          runs -> cursorToText("fmt.Println")
          waitsForGodef()
          runs ->
            expect(editor.getCursorBufferPosition()).toEqual(bufferTextPos("\"fmt\""))

      describe "an import statement", ->
        it "should open the first (lexicographical) .go file in the imported package", ->
          runs -> cursorToText("\"fmt\"")
          waitsForGodef()
          runs ->
            activeEditor = atom.workspace.getActiveTextEditor()
            file = activeEditor.getURI()
            expect(path.basename(file)).toEqual("doc.go")
            expect(path.basename(path.dirname(file))).toEqual("fmt")

  describe "when godef-return command is invoked", ->
    beforeEach ->
      waitsForDispatchComplete ->
        editor.setText testText
        editor.save()

    it "will return across files to the location where godef was invoked", ->
      runs -> cursorToText("fmt.Println", 1, "fmt.".length)
      waitsForGodef()
      runs ->
        activeEditor = atom.workspace.getActiveTextEditor()
        expect(path.basename(activeEditor.getURI())).toEqual("print.go")
      waitsForGodefReturn()
      runs ->
        expect(atom.workspace.getActiveTextEditor()).toBe(editor)
        expect(editor.getCursorBufferPosition()).toEqual(bufferTextPos("fmt.Println", 1, "fmt.".length))

    it "will return within the same file to the location where godef was invoked", ->
      runs -> cursorToText("localVar", 2)
      waitsForGodef()
      runs ->
        expect(editor.getCursorBufferPosition()).toEqual(bufferTextPos("localVar", 1))
      waitsForGodefReturn()
      runs ->
        expect(editor.getCursorBufferPosition()).toEqual(bufferTextPos("localVar", 2))

    it 'will do nothing if the return stack is empty', ->
      runs ->
        dispatch.godef.clearReturnHistory()
        cursorToText("localVar", 2)
      waitsForGodefReturn()
      runs ->
        expect(editor.getCursorBufferPosition()).toEqual(bufferTextPos("localVar", 2))

*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9uYXZpZ2F0b3ItZ29kZWYvc3BlYy9nb2RlZi1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7O0FBR1gsUUFBUSxDQUFDLE9BQU8sRUFBRSxZQUFNO0FBQ3RCLE1BQUksVUFBVSxHQUFHLElBQUksQ0FBQTs7QUFFckIsWUFBVSxDQUFDLFlBQU07QUFDZixtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUMzRCxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUE7T0FDeEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUNoQixrQkFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUE7T0FDN0IsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxZQUFNO0FBQ2IsYUFBTyxVQUFVLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFBO0tBQzFDLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvbmF2aWdhdG9yLWdvZGVmL3NwZWMvZ29kZWYtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiBlc2xpbnQtZW52IGphc21pbmUgKi9cblxuZGVzY3JpYmUoJ2dvZGVmJywgKCkgPT4ge1xuICBsZXQgbWFpbk1vZHVsZSA9IG51bGxcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdnby1jb25maWcnKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCduYXZpZ2F0b3ItZ29kZWYnKVxuICAgICAgfSkudGhlbigocGFjaykgPT4ge1xuICAgICAgICBtYWluTW9kdWxlID0gcGFjay5tYWluTW9kdWxlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICByZXR1cm4gbWFpbk1vZHVsZS5nZXRHb2NvbmZpZygpICE9PSBmYWxzZVxuICAgIH0pXG4gIH0pXG59KVxuXG4vKlxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuZnMgPSByZXF1aXJlKCdmcy1wbHVzJylcbnRlbXAgPSByZXF1aXJlKCd0ZW1wJykudHJhY2soKVxuXyA9IHJlcXVpcmUgKFwidW5kZXJzY29yZS1wbHVzXCIpXG57U3Vic2NyaWJlcn0gPSByZXF1aXJlICdlbWlzc2FyeSdcbntQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuXG5kZXNjcmliZSBcImdvZGVmXCIsIC0+XG4gIFttYWluTW9kdWxlLCBlZGl0b3IsIGVkaXRvclZpZXcsIGRpc3BhdGNoLCBmaWxlUGF0aCwgd29ya3NwYWNlRWxlbWVudF0gPSBbXVxuICB0ZXN0RGlzcG9zYWJsZXMgPSBbXVxuICB0ZXN0VGV4dCA9IFwiXCJcInBhY2thZ2UgbWFpblxuICAgICAgICAgICAgICAgIGltcG9ydCBcImZtdFwiXG4gICAgICAgICAgICAgICAgdmFyIHRlc3R2YXIgPSBcInN0cmluZ3lcIlxuXG4gICAgICAgICAgICAgICAgZnVuYyBmKCl7XG4gICAgICAgICAgICAgICAgICBsb2NhbFZhciA6PSBcIiBzYXlzIOS4lueVjOS4reOBruS4lueVjOS4reOBriFcIlxuICAgICAgICAgICAgICAgICAgZm10LlByaW50bG4oIHRlc3R2YXIgKyBsb2NhbFZhciApfVxuICAgICAgICAgICAgIFwiXCJcIlxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICAjIGRvbid0IHJ1biBhbnkgb2YgdGhlIG9uLXNhdmUgdG9vbHNcbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJnby1wbHVzLmZvcm1hdE9uU2F2ZVwiLCBmYWxzZSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJnby1wbHVzLmxpbnRPblNhdmVcIiwgZmFsc2UpXG4gICAgYXRvbS5jb25maWcuc2V0KFwiZ28tcGx1cy52ZXRPblNhdmVcIiwgZmFsc2UpXG4gICAgYXRvbS5jb25maWcuc2V0KFwiZ28tcGx1cy5zeW50YXhDaGVja09uU2F2ZVwiLCBmYWxzZSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJnby1wbHVzLnJ1bkNvdmVyYWdlT25TYXZlXCIsIGZhbHNlKVxuXG4gICAgZGlyZWN0b3J5ID0gdGVtcC5ta2RpclN5bmMoKVxuICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhkaXJlY3RvcnkpXG4gICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oZGlyZWN0b3J5LCAnZ28tcGx1cy10ZXN0aW5nLmdvJylcbiAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCAnJylcbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudClcbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ3NldFRpbWVvdXQnKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpLnRoZW4gKGUpIC0+XG4gICAgICBlZGl0b3IgPSBlXG4gICAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWdvJylcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnZ28tcGx1cycpLnRoZW4gKGcpIC0+XG4gICAgICBtYWluTW9kdWxlID0gZy5tYWluTW9kdWxlXG5cbiAgICB3YWl0c0ZvciAtPlxuICAgICAgbWFpbk1vZHVsZS5kaXNwYXRjaD8ucmVhZHlcblxuICAgIHJ1bnMgLT5cbiAgICAgIGRpc3BhdGNoID0gbWFpbk1vZHVsZS5kaXNwYXRjaFxuXG4gIHRyaWdnZXJDb21tYW5kID0gKGNvbW1hbmQpIC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCBkaXNwYXRjaC5nb2RlZltjb21tYW5kXSlcblxuICBnb2RlZkRvbmUgPSAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICB0ZXN0RGlzcG9zYWJsZXMucHVzaChkaXNwYXRjaC5nb2RlZi5vbkRpZENvbXBsZXRlKHJlc29sdmUpKVxuICAgICAgcmV0dXJuXG5cbiAgYnVmZmVyVGV4dE9mZnNldCA9ICh0ZXh0LCBjb3VudCA9IDEsIGRlbHRhID0gMCkgLT5cbiAgICBidWZmZXIgPSBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgaW5kZXggPSAtMVxuICAgIGZvciBpIGluIFsxLi5jb3VudF1cbiAgICAgIGluZGV4ID0gYnVmZmVyLmluZGV4T2YodGV4dCwgKGlmIGluZGV4IGlzIC0xIHRoZW4gMCBlbHNlIGluZGV4ICsgdGV4dC5sZW5ndGgpKVxuICAgICAgYnJlYWsgaWYgaW5kZXggaXMgLTFcbiAgICByZXR1cm4gaW5kZXggaWYgaW5kZXggaXMgLTFcbiAgICBpbmRleCArIGRlbHRhXG5cbiAgb2Zmc2V0Q3Vyc29yUG9zID0gKG9mZnNldCkgLT5cbiAgICByZXR1cm4gaWYgb2Zmc2V0IDwgMFxuICAgIGVkaXRvci5nZXRCdWZmZXIoKS5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KG9mZnNldClcblxuICBidWZmZXJUZXh0UG9zID0gKHRleHQsIGNvdW50ID0gMSwgZGVsdGEgPSAwKSAtPlxuICAgIG9mZnNldEN1cnNvclBvcyhidWZmZXJUZXh0T2Zmc2V0KHRleHQsIGNvdW50LCBkZWx0YSkpXG5cbiAgY3Vyc29yVG9PZmZzZXQgPSAob2Zmc2V0KSAtPlxuICAgIHJldHVybiBpZiBvZmZzZXQgaXMgLTFcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ob2Zmc2V0Q3Vyc29yUG9zKG9mZnNldCkpXG4gICAgcmV0dXJuXG5cbiAgY3Vyc29yVG9UZXh0ID0gKHRleHQsIGNvdW50ID0gMSwgZGVsdGEgPSAwKSAtPlxuICAgIGN1cnNvclRvT2Zmc2V0KGJ1ZmZlclRleHRPZmZzZXQodGV4dCwgY291bnQsIGRlbHRhKSlcblxuICBhZnRlckVhY2ggLT5cbiAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKSBmb3IgZGlzcG9zYWJsZSBpbiB0ZXN0RGlzcG9zYWJsZXNcbiAgICB0ZXN0RGlzcG9zYWJsZXMgPSBbXVxuXG4gIHdhaXRzRm9yQ29tbWFuZCA9IChjb21tYW5kKSAtPlxuICAgIGdvZGVmUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgIHJ1bnMgLT5cbiAgICAgICMgQ3JlYXRlIHRoZSBwcm9taXNlIGJlZm9yZSB0cmlnZ2VyaW5nIHRoZSBjb21tYW5kIGJlY2F1c2UgdHJpZ2dlckNvbW1hbmRcbiAgICAgICMgbWF5IGNhbGwgb25EaWRDb21wbGV0ZSBzeW5jaHJvbm91c2x5LlxuICAgICAgZ29kZWZQcm9taXNlID0gZ29kZWZEb25lKClcbiAgICAgIHRyaWdnZXJDb21tYW5kKGNvbW1hbmQpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGdvZGVmUHJvbWlzZVxuICAgIHJldHVyblxuXG4gIHdhaXRzRm9yR29kZWYgPSAtPlxuICAgIHdhaXRzRm9yQ29tbWFuZCAnZ29kZWZDb21tYW5kJ1xuXG4gIHdhaXRzRm9yR29kZWZSZXR1cm4gPSAtPlxuICAgIHdhaXRzRm9yQ29tbWFuZCAncmV0dXJuQ29tbWFuZCdcblxuICB3YWl0c0ZvckRpc3BhdGNoQ29tcGxldGUgPSAoYWN0aW9uKSAtPlxuICAgIGRpc3BhdGNoQ29tcGxldGUgPSBmYWxzZVxuICAgIHJ1bnMgLT5cbiAgICAgIGRpc3BhdGNoLm9uY2UgJ2Rpc3BhdGNoLWNvbXBsZXRlJywgLT4gZGlzcGF0Y2hDb21wbGV0ZSA9IHRydWVcbiAgICBydW5zIGFjdGlvblxuICAgIHdhaXRzRm9yIC0+IGRpc3BhdGNoQ29tcGxldGVcblxuICBkZXNjcmliZSBcIndvcmRBdEN1cnNvciAofCByZXByZXNlbnRzIGN1cnNvciBwb3MpXCIsIC0+XG4gICAgZ29kZWYgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZ29kZWYgPSBkaXNwYXRjaC5nb2RlZlxuICAgICAgZ29kZWYuZWRpdG9yID0gZWRpdG9yXG4gICAgICBlZGl0b3Iuc2V0VGV4dChcImZvbyBmb28uYmFyIGJhclwiKVxuXG4gICAgaXQgXCJzaG91bGQgcmV0dXJuIGZvbyBmb3IgfGZvb1wiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcbiAgICAgIHt3b3JkLCByYW5nZX0gPSBnb2RlZi53b3JkQXRDdXJzb3IoKVxuICAgICAgZXhwZWN0KHdvcmQpLnRvRXF1YWwoJ2ZvbycpXG4gICAgICBleHBlY3QocmFuZ2UpLnRvRXF1YWwoW1swLCAwXSwgWzAsIDNdXSlcblxuICAgIGl0IFwic2hvdWxkIHJldHVybiBmb28gZm9yIGZvfG9cIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMl0pXG4gICAgICB7d29yZCwgcmFuZ2V9ID0gZ29kZWYud29yZEF0Q3Vyc29yKClcbiAgICAgIGV4cGVjdCh3b3JkKS50b0VxdWFsKCdmb28nKVxuICAgICAgZXhwZWN0KHJhbmdlKS50b0VxdWFsKFtbMCwgMF0sIFswLCAzXV0pXG5cbiAgICAjIFRPRE86IENoZWNrIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL2NyaXNwaW5iIC0gdGhpcyB0ZXN0IHVzZWQgdG8gZmFpbCBhbmRcbiAgICAjIGl0IGlzIHBvc3NpYmxlIHRoZSBzZW1hbnRpY3Mgb2YgY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UgaGF2ZVxuICAgICMgY2hhbmdlZFxuICAgIGl0IFwic2hvdWxkIHJldHVybiBubyB3b3JkIGZvciBmb298IGZvb1wiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAzXSlcbiAgICAgIHt3b3JkLCByYW5nZX0gPSBnb2RlZi53b3JkQXRDdXJzb3IoKVxuICAgICAgZXhwZWN0KHdvcmQpLnRvRXF1YWwoJ2ZvbycpXG4gICAgICBleHBlY3QocmFuZ2UpLnRvRXF1YWwoW1swLCAwXSwgWzAsIDNdXSlcblxuICAgIGl0IFwic2hvdWxkIHJldHVybiBiYXIgZm9yIHxiYXJcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMTJdKVxuICAgICAge3dvcmQsIHJhbmdlfSA9IGdvZGVmLndvcmRBdEN1cnNvcigpXG4gICAgICBleHBlY3Qod29yZCkudG9FcXVhbCgnYmFyJylcbiAgICAgIGV4cGVjdChyYW5nZSkudG9FcXVhbChbWzAsIDEyXSwgWzAsIDE1XV0pXG5cbiAgICBpdCBcInNob3VsZCByZXR1cm4gZm9vLmJhciBmb3IgIWZvby5iYXJcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgNF0pXG4gICAgICB7d29yZCwgcmFuZ2V9ID0gZ29kZWYud29yZEF0Q3Vyc29yKClcbiAgICAgIGV4cGVjdCh3b3JkKS50b0VxdWFsKCdmb28uYmFyJylcbiAgICAgIGV4cGVjdChyYW5nZSkudG9FcXVhbChbWzAsIDRdLCBbMCwgMTFdXSlcblxuICAgIGl0IFwic2hvdWxkIHJldHVybiBmb28uYmFyIGZvciBmb28uYmF8clwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAxMF0pXG4gICAgICB7d29yZCwgcmFuZ2V9ID0gZ29kZWYud29yZEF0Q3Vyc29yKClcbiAgICAgIGV4cGVjdCh3b3JkKS50b0VxdWFsKCdmb28uYmFyJylcbiAgICAgIGV4cGVjdChyYW5nZSkudG9FcXVhbChbWzAsIDRdLCBbMCwgMTFdXSlcblxuICBkZXNjcmliZSBcIndoZW4gZ28tcGx1cyBpcyBsb2FkZWRcIiwgLT5cbiAgICBpdCBcInNob3VsZCBoYXZlIHJlZ2lzdGVyZWQgdGhlIGdvbGFuZzpnb2RlZiBjb21tYW5kXCIsICAtPlxuICAgICAgY3VycmVudENvbW1hbmRzID0gYXRvbS5jb21tYW5kcy5maW5kQ29tbWFuZHMoe3RhcmdldDogZWRpdG9yVmlld30pXG4gICAgICBnb2RlZkNvbW1hbmQgPSAoY21kIGZvciBjbWQgaW4gY3VycmVudENvbW1hbmRzIHdoZW4gY21kLm5hbWUgaXMgZGlzcGF0Y2guZ29kZWYuZ29kZWZDb21tYW5kKVxuICAgICAgZXhwZWN0KGdvZGVmQ29tbWFuZC5sZW5ndGgpLnRvRXF1YWwoMSlcblxuICBkZXNjcmliZSBcIndoZW4gZ29kZWYgY29tbWFuZCBpcyBpbnZva2VkXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIGN1cnNvclwiLCAtPlxuICAgICAgaXQgXCJkaXNwbGF5cyBhIHdhcm5pbmcgbWVzc2FnZVwiLCAtPlxuICAgICAgICB3YWl0c0ZvckRpc3BhdGNoQ29tcGxldGUgLT5cbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCB0ZXN0VGV4dFxuICAgICAgICAgIGVkaXRvci5zYXZlKClcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgICAgICAgZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24oWzEsIDBdKVxuXG4gICAgICAgIHdhaXRzRm9yR29kZWYoKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QoZGlzcGF0Y2gubWVzc2FnZXM/KS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KF8uc2l6ZShkaXNwYXRjaC5tZXNzYWdlcykpLnRvQmUgMVxuICAgICAgICAgIGV4cGVjdChkaXNwYXRjaC5tZXNzYWdlc1swXS50eXBlKS50b0JlKFwid2FybmluZ1wiKVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG5vIHdvcmQgdW5kZXIgdGhlIGN1cnNvclwiLCAtPlxuICAgICAgaXQgXCJkaXNwbGF5cyBhIHdhcm5pbmcgbWVzc2FnZVwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuICAgICAgICB3YWl0c0ZvckdvZGVmKClcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChkaXNwYXRjaC5tZXNzYWdlcz8pLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QoXy5zaXplKGRpc3BhdGNoLm1lc3NhZ2VzKSkudG9CZSAxXG4gICAgICAgICAgZXhwZWN0KGRpc3BhdGNoLm1lc3NhZ2VzWzBdLnR5cGUpLnRvQmUoXCJ3YXJuaW5nXCIpXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSB3b3JkIHVuZGVyIHRoZSBjdXJzb3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JEaXNwYXRjaENvbXBsZXRlIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQgdGVzdFRleHRcbiAgICAgICAgICBlZGl0b3Iuc2F2ZSgpXG5cbiAgICAgIGRlc2NyaWJlIFwiZGVmaW5lZCB3aXRoaW4gdGhlIGN1cnJlbnQgZmlsZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgY3Vyc29yVG9UZXh0KFwidGVzdHZhclwiLCAyKVxuICAgICAgICAgIHdhaXRzRm9yR29kZWYoKVxuXG4gICAgICAgIGl0IFwic2hvdWxkIG1vdmUgdGhlIGN1cnNvciB0byB0aGUgZGVmaW5pdGlvblwiLCAtPlxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbChidWZmZXJUZXh0UG9zKFwidGVzdHZhclwiLCAxKSlcblxuICAgICAgICBpdCBcInNob3VsZCBjcmVhdGUgYSBoaWdobGlnaHQgZGVjb3JhdGlvbiBvZiB0aGUgY29ycmVjdCBjbGFzc1wiLCAtPlxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGhpZ2xpZ2h0Q2xhc3MgPSAnZGVmaW5pdGlvbidcbiAgICAgICAgICAgIGdvUGx1c0hpZ2hsaWdodERlY3MgPSAoZCBmb3IgZCBpbiBlZGl0b3IuZ2V0SGlnaGxpZ2h0RGVjb3JhdGlvbnMoKSB3aGVuIGQuZ2V0UHJvcGVydGllcygpWydjbGFzcyddIGlzIGhpZ2xpZ2h0Q2xhc3MpXG4gICAgICAgICAgICBleHBlY3QoZ29QbHVzSGlnaGxpZ2h0RGVjcy5sZW5ndGgpLnRvQmUoMSlcblxuICAgICAgZGVzY3JpYmUgXCJkZWZpbmVkIG91dHNpZGUgdGhlIGN1cnJlbnQgZmlsZVwiLCAtPlxuICAgICAgICBpdCBcInNob3VsZCBvcGVuIGEgbmV3IHRleHQgZWRpdG9yXCIsIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgIyBHbyB0byB0aGUgUHJpbnRsbiBpbiBmbXQuUHJpbnRsbjpcbiAgICAgICAgICAgIGN1cnNvclRvVGV4dChcImZtdC5QcmludGxuXCIsIDEsIFwiZm10LlwiLmxlbmd0aClcbiAgICAgICAgICB3YWl0c0ZvckdvZGVmKClcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBjdXJyZW50RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvci5nZXRUaXRsZSgpKS50b0JlKCdwcmludC5nbycpXG5cbiAgICAgIGRlc2NyaWJlIFwiZGVmaW5lZCBhcyBhIGxvY2FsIHZhcmlhYmxlXCIsIC0+XG4gICAgICAgIGl0IFwic2hvdWxkIGp1bXAgdG8gdGhlIGxvY2FsIHZhciBkZWZpbml0aW9uXCIsIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgY3Vyc29yVG9UZXh0KFwibG9jYWxWYXJcIiwgMilcbiAgICAgICAgICB3YWl0c0ZvckdvZGVmKClcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwoYnVmZmVyVGV4dFBvcyhcImxvY2FsVmFyXCIsIDEpKVxuXG4gICAgICBkZXNjcmliZSBcImRlZmluZWQgYXMgYSBsb2NhbCBpbXBvcnQgcHJlZml4XCIsIC0+XG4gICAgICAgIGl0IFwic2hvdWxkIGp1bXAgdG8gdGhlIGltcG9ydFwiLCAtPlxuICAgICAgICAgIHJ1bnMgLT4gY3Vyc29yVG9UZXh0KFwiZm10LlByaW50bG5cIilcbiAgICAgICAgICB3YWl0c0ZvckdvZGVmKClcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwoYnVmZmVyVGV4dFBvcyhcIlxcXCJmbXRcXFwiXCIpKVxuXG4gICAgICBkZXNjcmliZSBcImFuIGltcG9ydCBzdGF0ZW1lbnRcIiwgLT5cbiAgICAgICAgaXQgXCJzaG91bGQgb3BlbiB0aGUgZmlyc3QgKGxleGljb2dyYXBoaWNhbCkgLmdvIGZpbGUgaW4gdGhlIGltcG9ydGVkIHBhY2thZ2VcIiwgLT5cbiAgICAgICAgICBydW5zIC0+IGN1cnNvclRvVGV4dChcIlxcXCJmbXRcXFwiXCIpXG4gICAgICAgICAgd2FpdHNGb3JHb2RlZigpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgICAgICBmaWxlID0gYWN0aXZlRWRpdG9yLmdldFVSSSgpXG4gICAgICAgICAgICBleHBlY3QocGF0aC5iYXNlbmFtZShmaWxlKSkudG9FcXVhbChcImRvYy5nb1wiKVxuICAgICAgICAgICAgZXhwZWN0KHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKGZpbGUpKSkudG9FcXVhbChcImZtdFwiKVxuXG4gIGRlc2NyaWJlIFwid2hlbiBnb2RlZi1yZXR1cm4gY29tbWFuZCBpcyBpbnZva2VkXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JEaXNwYXRjaENvbXBsZXRlIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0IHRlc3RUZXh0XG4gICAgICAgIGVkaXRvci5zYXZlKClcblxuICAgIGl0IFwid2lsbCByZXR1cm4gYWNyb3NzIGZpbGVzIHRvIHRoZSBsb2NhdGlvbiB3aGVyZSBnb2RlZiB3YXMgaW52b2tlZFwiLCAtPlxuICAgICAgcnVucyAtPiBjdXJzb3JUb1RleHQoXCJmbXQuUHJpbnRsblwiLCAxLCBcImZtdC5cIi5sZW5ndGgpXG4gICAgICB3YWl0c0ZvckdvZGVmKClcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGV4cGVjdChwYXRoLmJhc2VuYW1lKGFjdGl2ZUVkaXRvci5nZXRVUkkoKSkpLnRvRXF1YWwoXCJwcmludC5nb1wiKVxuICAgICAgd2FpdHNGb3JHb2RlZlJldHVybigpXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpLnRvQmUoZWRpdG9yKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwoYnVmZmVyVGV4dFBvcyhcImZtdC5QcmludGxuXCIsIDEsIFwiZm10LlwiLmxlbmd0aCkpXG5cbiAgICBpdCBcIndpbGwgcmV0dXJuIHdpdGhpbiB0aGUgc2FtZSBmaWxlIHRvIHRoZSBsb2NhdGlvbiB3aGVyZSBnb2RlZiB3YXMgaW52b2tlZFwiLCAtPlxuICAgICAgcnVucyAtPiBjdXJzb3JUb1RleHQoXCJsb2NhbFZhclwiLCAyKVxuICAgICAgd2FpdHNGb3JHb2RlZigpXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbChidWZmZXJUZXh0UG9zKFwibG9jYWxWYXJcIiwgMSkpXG4gICAgICB3YWl0c0ZvckdvZGVmUmV0dXJuKClcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKGJ1ZmZlclRleHRQb3MoXCJsb2NhbFZhclwiLCAyKSlcblxuICAgIGl0ICd3aWxsIGRvIG5vdGhpbmcgaWYgdGhlIHJldHVybiBzdGFjayBpcyBlbXB0eScsIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIGRpc3BhdGNoLmdvZGVmLmNsZWFyUmV0dXJuSGlzdG9yeSgpXG4gICAgICAgIGN1cnNvclRvVGV4dChcImxvY2FsVmFyXCIsIDIpXG4gICAgICB3YWl0c0ZvckdvZGVmUmV0dXJuKClcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKGJ1ZmZlclRleHRQb3MoXCJsb2NhbFZhclwiLCAyKSlcblxuKi9cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/navigator-godef/spec/godef-spec.js
