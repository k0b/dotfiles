function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

'use babel';

var nl = '\n';

describe('formatter', function () {
  var mainModule = null;
  var formatter = null;

  beforeEach(function () {
    _temp2['default'].track();
    atom.config.set('gofmt.formatOnSave', false);
    atom.config.set('editor.defaultLineEnding', 'LF');

    waitsForPromise(function () {
      return atom.packages.activatePackage('go-config').then(function () {
        return atom.packages.activatePackage('language-go');
      }).then(function () {
        return atom.packages.activatePackage('gofmt');
      }).then(function (pack) {
        mainModule = pack.mainModule;
      });
    });

    waitsFor(function () {
      return mainModule.goconfig;
    });

    waitsFor(function () {
      formatter = mainModule.getFormatter();
      return formatter;
    });

    waitsFor(function () {
      return formatter.ready();
    });
  });

  describe('when a simple file is opened', function () {
    var editor = undefined;
    var filePath = undefined;
    var saveSubscription = undefined;
    var actual = undefined;

    beforeEach(function () {
      var directory = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
      atom.project.setPaths([directory]);
      filePath = _path2['default'].join(directory, 'main.go');
      _fs2['default'].writeFileSync(filePath, '');
      waitsForPromise(function () {
        return atom.workspace.open(filePath).then(function (e) {
          editor = e;
          saveSubscription = e.onDidSave(function () {
            actual = e.getText();
          });
        });
      });
    });

    afterEach(function () {
      if (saveSubscription) {
        saveSubscription.dispose();
      }

      actual = undefined;
    });

    describe('when format on save is disabled and gofmt is the tool', function () {
      beforeEach(function () {
        atom.config.set('gofmt.formatOnSave', false);
        formatter.resetFormatterCache();
        formatter.updateFormatterCache();
        atom.config.set('gofmt.formatTool', 'gofmt');
        waitsFor(function () {
          return formatter.ready();
        });
      });

      it('does not format the file on save', function () {
        var text = 'package main' + nl + nl + 'func main()  {' + nl + '}' + nl;
        var expected = text;
        var formatted = 'package main' + nl + nl + 'func main() {' + nl + '}' + nl;

        runs(function () {
          var buffer = editor.getBuffer();
          buffer.setText(text);
          buffer.save();
        });

        waitsFor(function () {
          return actual;
        });

        runs(function () {
          expect(actual).toBe(expected);
          expect(actual).not.toBe(formatted);
        });
      });

      it('formats the file on command', function () {
        var text = 'package main' + nl + nl + 'func main()  {' + nl + '}' + nl;
        var unformatted = text;
        var formatted = 'package main' + nl + nl + 'func main() {' + nl + '}' + nl;

        runs(function () {
          var buffer = editor.getBuffer();
          buffer.setText(text);
          buffer.save();
        });

        waitsFor(function () {
          return actual;
        });

        runs(function () {
          expect(actual).toBe(unformatted);
          expect(actual).not.toBe(formatted);
          var target = atom.views.getView(editor);
          atom.commands.dispatch(target, 'golang:gofmt');
        });

        runs(function () {
          expect(editor.getText()).toBe(formatted);
        });
      });
    });

    describe('when format on save is enabled and gofmt is the tool', function () {
      beforeEach(function () {
        atom.config.set('gofmt.formatOnSave', true);
        formatter.resetFormatterCache();
        formatter.updateFormatterCache();
        atom.config.set('gofmt.formatTool', 'gofmt');
        waitsFor(function () {
          return formatter.ready();
        });
      });

      it('formats the file on save', function () {
        var text = 'package main' + nl + nl + 'func main()  {' + nl + '}' + nl;
        var expected = 'package main' + nl + nl + 'func main() {' + nl + '}' + nl;

        runs(function () {
          var buffer = editor.getBuffer();
          buffer.setText(text);
          buffer.save();
        });

        waitsFor(function () {
          return actual;
        });

        runs(function () {
          expect(actual).toBe(expected);
        });
      });
    });

    describe('when format on save is enabled and goimports is the tool', function () {
      beforeEach(function () {
        atom.config.set('gofmt.formatOnSave', true);
        formatter.resetFormatterCache();
        formatter.updateFormatterCache();
        atom.config.set('gofmt.formatTool', 'goimports');
        waitsFor(function () {
          return formatter.ready();
        });
      });

      it('formats the file on save', function () {
        var text = 'package main' + nl + nl + 'func main()  {' + nl + '}' + nl;
        var expected = 'package main' + nl + nl + 'func main() {' + nl + '}' + nl;

        runs(function () {
          var buffer = editor.getBuffer();
          buffer.setText(text);
          buffer.save();
        });

        waitsFor(function () {
          return actual;
        });

        runs(function () {
          expect(actual).toBe(expected);
        });
      });
    });

    describe('when format on save is enabled and goreturns is the tool', function () {
      beforeEach(function () {
        atom.config.set('gofmt.formatOnSave', true);
        formatter.resetFormatterCache();
        formatter.updateFormatterCache();
        atom.config.set('gofmt.formatTool', 'goreturns');
        waitsFor(function () {
          return formatter.ready();
        });
      });

      it('formats the file on save', function () {
        var text = 'package main' + nl + nl + 'func main()  {' + nl + '}' + nl;
        var expected = 'package main' + nl + nl + 'func main() {' + nl + '}' + nl;

        runs(function () {
          var buffer = editor.getBuffer();
          buffer.setText(text);
          buffer.save();
        });

        waitsFor(function () {
          return actual;
        });

        runs(function () {
          expect(actual).toBe(expected);
        });
      });
    });
  });
});

/*
path = require('path')
fs = require('fs-plus')
temp = require('temp').track()
_ = require('lodash')
AtomConfig = require('./util/atomconfig')

describe 'format', ->
  [mainModule, editor, dispatch, buffer, filePath] = []

  beforeEach ->
    atomconfig = new AtomConfig()
    atomconfig.allfunctionalitydisabled()
    directory = temp.mkdirSync()
    atom.project.setPaths(directory)
    filePath = path.join(directory, 'go-plus.go')
    fs.writeFileSync(filePath, '')
    jasmine.unspy(window, 'setTimeout')

    waitsForPromise -> atom.workspace.open(filePath).then (e) ->
      editor = e
      buffer = editor.getBuffer()

    waitsForPromise ->
      atom.packages.activatePackage('language-go')

    waitsForPromise -> atom.packages.activatePackage('go-plus').then (g) ->
      mainModule = g.mainModule

    waitsFor ->
      mainModule.dispatch?.ready

    runs ->
      dispatch = mainModule.dispatch

  describe 'when format on save is enabled', ->
    beforeEach ->
      atom.config.set('go-plus.formatOnSave', true)

    it 'reformats the file', ->
      done = false
      runs ->
        dispatch.once 'dispatch-complete', ->
          expect(fs.readFileSync(filePath, {encoding: 'utf8'})).toBe('package main\n\nfunc main() {\n}\n')
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe(0)
          done = true
        buffer.setText('package main\n\nfunc main()  {\n}\n')
        buffer.save()

      waitsFor ->
        done is true

    it 'reformats the file after multiple saves', ->
      done = false
      displayDone = false

      runs ->
        dispatch.once 'dispatch-complete', ->
          expect(fs.readFileSync(filePath, {encoding: 'utf8'})).toBe('package main\n\nfunc main() {\n}\n')
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe(0)
          done = true
        dispatch.once 'display-complete', ->
          displayDone = true
        buffer.setText('package main\n\nfunc main()  {\n}\n')
        buffer.save()

      waitsFor ->
        done is true

      waitsFor ->
        displayDone is true

      runs ->
        done = false
        dispatch.once 'dispatch-complete', ->
          expect(fs.readFileSync(filePath, {encoding: 'utf8'})).toBe('package main\n\nfunc main() {\n}\n')
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe(0)
          done = true
        buffer.setText('package main\n\nfunc main()  {\n}\n')
        buffer.save()

      waitsFor ->
        done is true

    it 'collects errors when the input is invalid', ->
      done = false
      runs ->
        dispatch.once 'dispatch-complete', (editor) ->
          expect(fs.readFileSync(filePath, {encoding: 'utf8'})).toBe('package main\n\nfunc main(!)  {\n}\n')
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe(1)
          expect(dispatch.messages[0].column).toBe('11')
          expect(dispatch.messages[0].line).toBe('3')
          expect(dispatch.messages[0].msg).toBe('expected type, found \'!\'')
          done = true
        buffer.setText('package main\n\nfunc main(!)  {\n}\n')
        buffer.save()

      waitsFor ->
        done is true

    it 'uses goimports to reorganize imports if enabled', ->
      done = false
      runs ->
        atom.config.set('go-plus.formatTool', 'goimports')
        dispatch.once 'dispatch-complete', ->
          expect(fs.readFileSync(filePath, {encoding: 'utf8'})).toBe('package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, 世界")\n}\n')
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe(0)
          done = true
        buffer.setText('package main\n\nfunc main()  {\n\tfmt.Println("Hello, 世界")\n}\n')
        buffer.save()

      waitsFor ->
        done is true

    it 'uses goreturns to handle returns if enabled', ->
      done = false
      runs ->
        atom.config.set('go-plus.formatTool', 'goreturns')
        dispatch.once 'dispatch-complete', ->
          expect(fs.readFileSync(filePath, {encoding: 'utf8'})).toBe('package demo\n\nimport "errors"\n\nfunc F() (string, int, error) {\n\treturn "", 0, errors.New("foo")\n}\n')
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe(0)
          done = true
        buffer.setText('package demo\n\nfunc F() (string, int, error)     {\nreturn errors.New("foo") }')
        buffer.save()

      waitsFor ->
        done is true

  describe 'when format on save is disabled', ->
    beforeEach ->
      atom.config.set('go-plus.formatOnSave', false)

    it 'does not reformat the file', ->
      done = false
      runs ->
        dispatch.once 'dispatch-complete', ->
          expect(fs.readFileSync(filePath, {encoding: 'utf8'})).toBe('package main\n\nfunc main()  {\n}\n')
          expect(dispatch.messages?).toBe(true)
          expect(_.size(dispatch.messages)).toBe(0)
          done = true
        buffer.setText('package main\n\nfunc main()  {\n}\n')
        buffer.save()

      waitsFor ->
        done is true

*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb2ZtdC9zcGVjL2Zvcm1hdHRlci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7a0JBR2UsSUFBSTs7OztvQkFDRixNQUFNOzs7O29CQUNOLE1BQU07Ozs7QUFMdkIsV0FBVyxDQUFBOztBQU9YLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQTs7QUFFYixRQUFRLENBQUMsV0FBVyxFQUFFLFlBQU07QUFDMUIsTUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFBO0FBQ3JCLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQTs7QUFFcEIsWUFBVSxDQUFDLFlBQU07QUFDZixzQkFBSyxLQUFLLEVBQUUsQ0FBQTtBQUNaLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzVDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUFBOztBQUVqRCxtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUMzRCxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFBO09BQ3BELENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNaLGVBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUE7T0FDOUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUNoQixrQkFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUE7T0FDN0IsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxZQUFNO0FBQ2IsYUFBTyxVQUFVLENBQUMsUUFBUSxDQUFBO0tBQzNCLENBQUMsQ0FBQTs7QUFFRixZQUFRLENBQUMsWUFBTTtB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LENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDOUIsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb2ZtdC9zcGVjL2Zvcm1hdHRlci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCdcblxubGV0IG5sID0gJ1xcbidcblxuZGVzY3JpYmUoJ2Zvcm1hdHRlcicsICgpID0+IHtcbiAgbGV0IG1haW5Nb2R1bGUgPSBudWxsXG4gIGxldCBmb3JtYXR0ZXIgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdGVtcC50cmFjaygpXG4gICAgYXRvbS5jb25maWcuc2V0KCdnb2ZtdC5mb3JtYXRPblNhdmUnLCBmYWxzZSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5kZWZhdWx0TGluZUVuZGluZycsICdMRicpXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdnby1jb25maWcnKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1nbycpXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdnb2ZtdCcpXG4gICAgICB9KS50aGVuKChwYWNrKSA9PiB7XG4gICAgICAgIG1haW5Nb2R1bGUgPSBwYWNrLm1haW5Nb2R1bGVcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgIHJldHVybiBtYWluTW9kdWxlLmdvY29uZmlnXG4gICAgfSlcblxuICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgIGZvcm1hdHRlciA9IG1haW5Nb2R1bGUuZ2V0Rm9ybWF0dGVyKClcbiAgICAgIHJldHVybiBmb3JtYXR0ZXJcbiAgICB9KVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIGZvcm1hdHRlci5yZWFkeSgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBhIHNpbXBsZSBmaWxlIGlzIG9wZW5lZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yXG4gICAgbGV0IGZpbGVQYXRoXG4gICAgbGV0IHNhdmVTdWJzY3JpcHRpb25cbiAgICBsZXQgYWN0dWFsXG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGxldCBkaXJlY3RvcnkgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoKSlcbiAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZGlyZWN0b3J5XSlcbiAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGRpcmVjdG9yeSwgJ21haW4uZ28nKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgJycpXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCkudGhlbigoZSkgPT4ge1xuICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICBzYXZlU3Vic2NyaXB0aW9uID0gZS5vbkRpZFNhdmUoKCkgPT4ge1xuICAgICAgICAgICAgYWN0dWFsID0gZS5nZXRUZXh0KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgIGlmIChzYXZlU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHNhdmVTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG5cbiAgICAgIGFjdHVhbCA9IHVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBmb3JtYXQgb24gc2F2ZSBpcyBkaXNhYmxlZCBhbmQgZ29mbXQgaXMgdGhlIHRvb2wnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdnb2ZtdC5mb3JtYXRPblNhdmUnLCBmYWxzZSlcbiAgICAgICAgZm9ybWF0dGVyLnJlc2V0Rm9ybWF0dGVyQ2FjaGUoKVxuICAgICAgICBmb3JtYXR0ZXIudXBkYXRlRm9ybWF0dGVyQ2FjaGUoKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dvZm10LmZvcm1hdFRvb2wnLCAnZ29mbXQnKVxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGZvcm1hdHRlci5yZWFkeSgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZG9lcyBub3QgZm9ybWF0IHRoZSBmaWxlIG9uIHNhdmUnLCAoKSA9PiB7XG4gICAgICAgIGxldCB0ZXh0ID0gJ3BhY2thZ2UgbWFpbicgKyBubCArIG5sICsgJ2Z1bmMgbWFpbigpICB7JyArIG5sICsgJ30nICsgbmxcbiAgICAgICAgbGV0IGV4cGVjdGVkID0gdGV4dFxuICAgICAgICBsZXQgZm9ybWF0dGVkID0gJ3BhY2thZ2UgbWFpbicgKyBubCArIG5sICsgJ2Z1bmMgbWFpbigpIHsnICsgbmwgKyAnfScgKyBubFxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGxldCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgICAgICBidWZmZXIuc2V0VGV4dCh0ZXh0KVxuICAgICAgICAgIGJ1ZmZlci5zYXZlKClcbiAgICAgICAgfSlcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBhY3R1YWwgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoYWN0dWFsKS50b0JlKGV4cGVjdGVkKVxuICAgICAgICAgIGV4cGVjdChhY3R1YWwpLm5vdC50b0JlKGZvcm1hdHRlZClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdmb3JtYXRzIHRoZSBmaWxlIG9uIGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICAgIGxldCB0ZXh0ID0gJ3BhY2thZ2UgbWFpbicgKyBubCArIG5sICsgJ2Z1bmMgbWFpbigpICB7JyArIG5sICsgJ30nICsgbmxcbiAgICAgICAgbGV0IHVuZm9ybWF0dGVkID0gdGV4dFxuICAgICAgICBsZXQgZm9ybWF0dGVkID0gJ3BhY2thZ2UgbWFpbicgKyBubCArIG5sICsgJ2Z1bmMgbWFpbigpIHsnICsgbmwgKyAnfScgKyBubFxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGxldCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgICAgICBidWZmZXIuc2V0VGV4dCh0ZXh0KVxuICAgICAgICAgIGJ1ZmZlci5zYXZlKClcbiAgICAgICAgfSlcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGFjdHVhbFxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChhY3R1YWwpLnRvQmUodW5mb3JtYXR0ZWQpXG4gICAgICAgICAgZXhwZWN0KGFjdHVhbCkubm90LnRvQmUoZm9ybWF0dGVkKVxuICAgICAgICAgIGxldCB0YXJnZXQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnZ29sYW5nOmdvZm10JylcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZShmb3JtYXR0ZWQpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBmb3JtYXQgb24gc2F2ZSBpcyBlbmFibGVkIGFuZCBnb2ZtdCBpcyB0aGUgdG9vbCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dvZm10LmZvcm1hdE9uU2F2ZScsIHRydWUpXG4gICAgICAgIGZvcm1hdHRlci5yZXNldEZvcm1hdHRlckNhY2hlKClcbiAgICAgICAgZm9ybWF0dGVyLnVwZGF0ZUZvcm1hdHRlckNhY2hlKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdnb2ZtdC5mb3JtYXRUb29sJywgJ2dvZm10JylcbiAgICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBmb3JtYXR0ZXIucmVhZHkoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ2Zvcm1hdHMgdGhlIGZpbGUgb24gc2F2ZScsICgpID0+IHtcbiAgICAgICAgbGV0IHRleHQgPSAncGFja2FnZSBtYWluJyArIG5sICsgbmwgKyAnZnVuYyBtYWluKCkgIHsnICsgbmwgKyAnfScgKyBubFxuICAgICAgICBsZXQgZXhwZWN0ZWQgPSAncGFja2FnZSBtYWluJyArIG5sICsgbmwgKyAnZnVuYyBtYWluKCkgeycgKyBubCArICd9JyArIG5sXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbGV0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgICAgIGJ1ZmZlci5zZXRUZXh0KHRleHQpXG4gICAgICAgICAgYnVmZmVyLnNhdmUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gYWN0dWFsXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGFjdHVhbCkudG9CZShleHBlY3RlZClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIGZvcm1hdCBvbiBzYXZlIGlzIGVuYWJsZWQgYW5kIGdvaW1wb3J0cyBpcyB0aGUgdG9vbCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dvZm10LmZvcm1hdE9uU2F2ZScsIHRydWUpXG4gICAgICAgIGZvcm1hdHRlci5yZXNldEZvcm1hdHRlckNhY2hlKClcbiAgICAgICAgZm9ybWF0dGVyLnVwZGF0ZUZvcm1hdHRlckNhY2hlKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdnb2ZtdC5mb3JtYXRUb29sJywgJ2dvaW1wb3J0cycpXG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gZm9ybWF0dGVyLnJlYWR5KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdmb3JtYXRzIHRoZSBmaWxlIG9uIHNhdmUnLCAoKSA9PiB7XG4gICAgICAgIGxldCB0ZXh0ID0gJ3BhY2thZ2UgbWFpbicgKyBubCArIG5sICsgJ2Z1bmMgbWFpbigpICB7JyArIG5sICsgJ30nICsgbmxcbiAgICAgICAgbGV0IGV4cGVjdGVkID0gJ3BhY2thZ2UgbWFpbicgKyBubCArIG5sICsgJ2Z1bmMgbWFpbigpIHsnICsgbmwgKyAnfScgKyBubFxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGxldCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgICAgICBidWZmZXIuc2V0VGV4dCh0ZXh0KVxuICAgICAgICAgIGJ1ZmZlci5zYXZlKClcbiAgICAgICAgfSlcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGFjdHVhbFxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChhY3R1YWwpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBmb3JtYXQgb24gc2F2ZSBpcyBlbmFibGVkIGFuZCBnb3JldHVybnMgaXMgdGhlIHRvb2wnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdnb2ZtdC5mb3JtYXRPblNhdmUnLCB0cnVlKVxuICAgICAgICBmb3JtYXR0ZXIucmVzZXRGb3JtYXR0ZXJDYWNoZSgpXG4gICAgICAgIGZvcm1hdHRlci51cGRhdGVGb3JtYXR0ZXJDYWNoZSgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZ29mbXQuZm9ybWF0VG9vbCcsICdnb3JldHVybnMnKVxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGZvcm1hdHRlci5yZWFkeSgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZm9ybWF0cyB0aGUgZmlsZSBvbiBzYXZlJywgKCkgPT4ge1xuICAgICAgICBsZXQgdGV4dCA9ICdwYWNrYWdlIG1haW4nICsgbmwgKyBubCArICdmdW5jIG1haW4oKSAgeycgKyBubCArICd9JyArIG5sXG4gICAgICAgIGxldCBleHBlY3RlZCA9ICdwYWNrYWdlIG1haW4nICsgbmwgKyBubCArICdmdW5jIG1haW4oKSB7JyArIG5sICsgJ30nICsgbmxcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBsZXQgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICAgICAgYnVmZmVyLnNldFRleHQodGV4dClcbiAgICAgICAgICBidWZmZXIuc2F2ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBhY3R1YWxcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoYWN0dWFsKS50b0JlKGV4cGVjdGVkKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcblxuLypcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcbmZzID0gcmVxdWlyZSgnZnMtcGx1cycpXG50ZW1wID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKClcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuQXRvbUNvbmZpZyA9IHJlcXVpcmUoJy4vdXRpbC9hdG9tY29uZmlnJylcblxuZGVzY3JpYmUgJ2Zvcm1hdCcsIC0+XG4gIFttYWluTW9kdWxlLCBlZGl0b3IsIGRpc3BhdGNoLCBidWZmZXIsIGZpbGVQYXRoXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGF0b21jb25maWcgPSBuZXcgQXRvbUNvbmZpZygpXG4gICAgYXRvbWNvbmZpZy5hbGxmdW5jdGlvbmFsaXR5ZGlzYWJsZWQoKVxuICAgIGRpcmVjdG9yeSA9IHRlbXAubWtkaXJTeW5jKClcbiAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoZGlyZWN0b3J5KVxuICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGRpcmVjdG9yeSwgJ2dvLXBsdXMuZ28nKVxuICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsICcnKVxuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnc2V0VGltZW91dCcpXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCkudGhlbiAoZSkgLT5cbiAgICAgIGVkaXRvciA9IGVcbiAgICAgIGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtZ28nKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdnby1wbHVzJykudGhlbiAoZykgLT5cbiAgICAgIG1haW5Nb2R1bGUgPSBnLm1haW5Nb2R1bGVcblxuICAgIHdhaXRzRm9yIC0+XG4gICAgICBtYWluTW9kdWxlLmRpc3BhdGNoPy5yZWFkeVxuXG4gICAgcnVucyAtPlxuICAgICAgZGlzcGF0Y2ggPSBtYWluTW9kdWxlLmRpc3BhdGNoXG5cbiAgZGVzY3JpYmUgJ3doZW4gZm9ybWF0IG9uIHNhdmUgaXMgZW5hYmxlZCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdnby1wbHVzLmZvcm1hdE9uU2F2ZScsIHRydWUpXG5cbiAgICBpdCAncmVmb3JtYXRzIHRoZSBmaWxlJywgLT5cbiAgICAgIGRvbmUgPSBmYWxzZVxuICAgICAgcnVucyAtPlxuICAgICAgICBkaXNwYXRjaC5vbmNlICdkaXNwYXRjaC1jb21wbGV0ZScsIC0+XG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KSkudG9CZSgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCkge1xcbn1cXG4nKVxuICAgICAgICAgIGV4cGVjdChkaXNwYXRjaC5tZXNzYWdlcz8pLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QoXy5zaXplKGRpc3BhdGNoLm1lc3NhZ2VzKSkudG9CZSgwKVxuICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0KCdwYWNrYWdlIG1haW5cXG5cXG5mdW5jIG1haW4oKSAge1xcbn1cXG4nKVxuICAgICAgICBidWZmZXIuc2F2ZSgpXG5cbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIGRvbmUgaXMgdHJ1ZVxuXG4gICAgaXQgJ3JlZm9ybWF0cyB0aGUgZmlsZSBhZnRlciBtdWx0aXBsZSBzYXZlcycsIC0+XG4gICAgICBkb25lID0gZmFsc2VcbiAgICAgIGRpc3BsYXlEb25lID0gZmFsc2VcblxuICAgICAgcnVucyAtPlxuICAgICAgICBkaXNwYXRjaC5vbmNlICdkaXNwYXRjaC1jb21wbGV0ZScsIC0+XG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KSkudG9CZSgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCkge1xcbn1cXG4nKVxuICAgICAgICAgIGV4cGVjdChkaXNwYXRjaC5tZXNzYWdlcz8pLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QoXy5zaXplKGRpc3BhdGNoLm1lc3NhZ2VzKSkudG9CZSgwKVxuICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgIGRpc3BhdGNoLm9uY2UgJ2Rpc3BsYXktY29tcGxldGUnLCAtPlxuICAgICAgICAgIGRpc3BsYXlEb25lID0gdHJ1ZVxuICAgICAgICBidWZmZXIuc2V0VGV4dCgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCkgIHtcXG59XFxuJylcbiAgICAgICAgYnVmZmVyLnNhdmUoKVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBkb25lIGlzIHRydWVcblxuICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgZGlzcGxheURvbmUgaXMgdHJ1ZVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGRvbmUgPSBmYWxzZVxuICAgICAgICBkaXNwYXRjaC5vbmNlICdkaXNwYXRjaC1jb21wbGV0ZScsIC0+XG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KSkudG9CZSgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCkge1xcbn1cXG4nKVxuICAgICAgICAgIGV4cGVjdChkaXNwYXRjaC5tZXNzYWdlcz8pLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QoXy5zaXplKGRpc3BhdGNoLm1lc3NhZ2VzKSkudG9CZSgwKVxuICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0KCdwYWNrYWdlIG1haW5cXG5cXG5mdW5jIG1haW4oKSAge1xcbn1cXG4nKVxuICAgICAgICBidWZmZXIuc2F2ZSgpXG5cbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIGRvbmUgaXMgdHJ1ZVxuXG4gICAgaXQgJ2NvbGxlY3RzIGVycm9ycyB3aGVuIHRoZSBpbnB1dCBpcyBpbnZhbGlkJywgLT5cbiAgICAgIGRvbmUgPSBmYWxzZVxuICAgICAgcnVucyAtPlxuICAgICAgICBkaXNwYXRjaC5vbmNlICdkaXNwYXRjaC1jb21wbGV0ZScsIChlZGl0b3IpIC0+XG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KSkudG9CZSgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCEpICB7XFxufVxcbicpXG4gICAgICAgICAgZXhwZWN0KGRpc3BhdGNoLm1lc3NhZ2VzPykudG9CZSh0cnVlKVxuICAgICAgICAgIGV4cGVjdChfLnNpemUoZGlzcGF0Y2gubWVzc2FnZXMpKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KGRpc3BhdGNoLm1lc3NhZ2VzWzBdLmNvbHVtbikudG9CZSgnMTEnKVxuICAgICAgICAgIGV4cGVjdChkaXNwYXRjaC5tZXNzYWdlc1swXS5saW5lKS50b0JlKCczJylcbiAgICAgICAgICBleHBlY3QoZGlzcGF0Y2gubWVzc2FnZXNbMF0ubXNnKS50b0JlKCdleHBlY3RlZCB0eXBlLCBmb3VuZCBcXCchXFwnJylcbiAgICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICBidWZmZXIuc2V0VGV4dCgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCEpICB7XFxufVxcbicpXG4gICAgICAgIGJ1ZmZlci5zYXZlKClcblxuICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgZG9uZSBpcyB0cnVlXG5cbiAgICBpdCAndXNlcyBnb2ltcG9ydHMgdG8gcmVvcmdhbml6ZSBpbXBvcnRzIGlmIGVuYWJsZWQnLCAtPlxuICAgICAgZG9uZSA9IGZhbHNlXG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZ28tcGx1cy5mb3JtYXRUb29sJywgJ2dvaW1wb3J0cycpXG4gICAgICAgIGRpc3BhdGNoLm9uY2UgJ2Rpc3BhdGNoLWNvbXBsZXRlJywgLT5cbiAgICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCB7ZW5jb2Rpbmc6ICd1dGY4J30pKS50b0JlKCdwYWNrYWdlIG1haW5cXG5cXG5pbXBvcnQgXCJmbXRcIlxcblxcbmZ1bmMgbWFpbigpIHtcXG5cXHRmbXQuUHJpbnRsbihcIkhlbGxvLCDkuJbnlYxcIilcXG59XFxuJylcbiAgICAgICAgICBleHBlY3QoZGlzcGF0Y2gubWVzc2FnZXM/KS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KF8uc2l6ZShkaXNwYXRjaC5tZXNzYWdlcykpLnRvQmUoMClcbiAgICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICBidWZmZXIuc2V0VGV4dCgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCkgIHtcXG5cXHRmbXQuUHJpbnRsbihcIkhlbGxvLCDkuJbnlYxcIilcXG59XFxuJylcbiAgICAgICAgYnVmZmVyLnNhdmUoKVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBkb25lIGlzIHRydWVcblxuICAgIGl0ICd1c2VzIGdvcmV0dXJucyB0byBoYW5kbGUgcmV0dXJucyBpZiBlbmFibGVkJywgLT5cbiAgICAgIGRvbmUgPSBmYWxzZVxuICAgICAgcnVucyAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dvLXBsdXMuZm9ybWF0VG9vbCcsICdnb3JldHVybnMnKVxuICAgICAgICBkaXNwYXRjaC5vbmNlICdkaXNwYXRjaC1jb21wbGV0ZScsIC0+XG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KSkudG9CZSgncGFja2FnZSBkZW1vXFxuXFxuaW1wb3J0IFwiZXJyb3JzXCJcXG5cXG5mdW5jIEYoKSAoc3RyaW5nLCBpbnQsIGVycm9yKSB7XFxuXFx0cmV0dXJuIFwiXCIsIDAsIGVycm9ycy5OZXcoXCJmb29cIilcXG59XFxuJylcbiAgICAgICAgICBleHBlY3QoZGlzcGF0Y2gubWVzc2FnZXM/KS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KF8uc2l6ZShkaXNwYXRjaC5tZXNzYWdlcykpLnRvQmUoMClcbiAgICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICBidWZmZXIuc2V0VGV4dCgncGFja2FnZSBkZW1vXFxuXFxuZnVuYyBGKCkgKHN0cmluZywgaW50LCBlcnJvcikgICAgIHtcXG5yZXR1cm4gZXJyb3JzLk5ldyhcImZvb1wiKSB9JylcbiAgICAgICAgYnVmZmVyLnNhdmUoKVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBkb25lIGlzIHRydWVcblxuICBkZXNjcmliZSAnd2hlbiBmb3JtYXQgb24gc2F2ZSBpcyBkaXNhYmxlZCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdnby1wbHVzLmZvcm1hdE9uU2F2ZScsIGZhbHNlKVxuXG4gICAgaXQgJ2RvZXMgbm90IHJlZm9ybWF0IHRoZSBmaWxlJywgLT5cbiAgICAgIGRvbmUgPSBmYWxzZVxuICAgICAgcnVucyAtPlxuICAgICAgICBkaXNwYXRjaC5vbmNlICdkaXNwYXRjaC1jb21wbGV0ZScsIC0+XG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KSkudG9CZSgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCkgIHtcXG59XFxuJylcbiAgICAgICAgICBleHBlY3QoZGlzcGF0Y2gubWVzc2FnZXM/KS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KF8uc2l6ZShkaXNwYXRjaC5tZXNzYWdlcykpLnRvQmUoMClcbiAgICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICBidWZmZXIuc2V0VGV4dCgncGFja2FnZSBtYWluXFxuXFxuZnVuYyBtYWluKCkgIHtcXG59XFxuJylcbiAgICAgICAgYnVmZmVyLnNhdmUoKVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBkb25lIGlzIHRydWVcblxuKi9cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/gofmt/spec/formatter-spec.js
