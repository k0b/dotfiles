function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

'use babel';

describe('tester', function () {
  var mainModule = null;
  var gopath = null;
  var oldGopath = null;

  beforeEach(function () {
    runs(function () {
      if (process.env.GOPATH) {
        oldGopath = process.env.GOPATH;
      }
      gopath = _temp2['default'].mkdirSync();
      process.env.GOPATH = gopath;
      atom.project.setPaths(gopath);
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('go-config').then(function () {
        return atom.packages.activatePackage('tester-go');
      }).then(function (pack) {
        mainModule = pack.mainModule;
        return atom.packages.activatePackage('language-go');
      });
    });

    waitsFor(function () {
      return mainModule.getGoconfig() !== false;
    });
  });

  afterEach(function () {
    if (oldGopath) {
      process.env.GOPATH = oldGopath;
    } else {
      delete process.env.GOPATH;
    }
  });

  describe('when run coverage on save is disabled', function () {
    var filePath = undefined;
    var testFilePath = undefined;
    var editor = undefined;
    var testEditor = undefined;

    beforeEach(function () {
      atom.config.set('tester-go.runCoverageOnSave', false);
      filePath = _path2['default'].join(gopath, 'src', 'github.com', 'testuser', 'example', 'go-plus.go');
      testFilePath = _path2['default'].join(gopath, 'src', 'github.com', 'testuser', 'example', 'go-plus_test.go');
      _fsPlus2['default'].writeFileSync(filePath, '');
      _fsPlus2['default'].writeFileSync(testFilePath, '');
      waitsForPromise(function () {
        return atom.workspace.open(filePath).then(function (e) {
          editor = e;
        });
      });

      waitsForPromise(function () {
        return atom.workspace.open(testFilePath).then(function (e) {
          testEditor = e;
        });
      });
    });

    it('displays coverage for go source', function () {
      var buffer = editor.getBuffer();
      buffer.setText('package main\n\nimport "fmt"\n\nfunc main()  {\n\tfmt.Println(Hello())\n}\n\nfunc Hello() string {\n\treturn "Hello, 世界"\n}\n');
      buffer.save();
      var testBuffer = testEditor.getBuffer();
      testBuffer.setText('package main\n\nimport "testing"\n\nfunc TestHello(t *testing.T) {\n\tresult := Hello()\n\tif result != "Hello, 世界" {\n\t\tt.Errorf("Expected %s - got %s", "Hello, 世界", result)\n\t}\n}');
      testBuffer.save();
      var p = mainModule.getTester().runCoverage(editor);

      waitsForPromise(function () {
        return p;
      });

      runs(function () {
        var markers = buffer.findMarkers({ 'class': 'gocover' });
        expect(markers).toBeDefined();
        expect(markers.length).toBe(2);
        expect(markers[0]).toBeDefined();
        var range = markers[0].getRange();
        expect(range.start.row).toBe(4);
        expect(range.start.column).toBe(13);
        expect(range.end.row).toBe(6);
        expect(range.end.column).toBe(1);

        expect(markers[1]).toBeDefined();
        range = markers[1].getRange();
        expect(range).toBeDefined();
        expect(range.start.row).toBe(8);
        expect(range.start.column).toBe(20);
        expect(range.end.row).toBe(10);
        expect(range.end.column).toBe(1);
      });
      expect(mainModule).toBeDefined();
      expect(mainModule).toBeTruthy();
      expect(mainModule.getGoconfig).toBeDefined();
      expect(mainModule.consumeGoconfig).toBeDefined();
      expect(mainModule.getGoconfig()).toBeTruthy();
      expect(mainModule.tester).toBeDefined();
      expect(mainModule.tester).toBeTruthy();
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy90ZXN0ZXItZ28vc3BlYy90ZXN0ZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUdpQixNQUFNOzs7O29CQUNOLE1BQU07Ozs7c0JBQ1IsU0FBUzs7OztBQUx4QixXQUFXLENBQUE7O0FBT1gsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFNO0FBQ3ZCLE1BQUksVUFBVSxHQUFHLElBQUksQ0FBQTtBQUNyQixNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDakIsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFBOztBQUVwQixZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxZQUFNO0FBQ1QsVUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtBQUN0QixpQkFBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFBO09BQy9CO0FBQ0QsWUFBTSxHQUFHLGtCQUFLLFNBQVMsRUFBRSxDQUFBO0FBQ3pCLGFBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUMzQixVQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUM5QixDQUFDLENBQUE7O0FBRUYsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDM0QsZUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtPQUNsRCxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQ2hCLGtCQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQTtBQUM1QixlQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFBO09BQ3BELENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTs7QUFFRixZ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QUFDL0IsWUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUM1QyxZQUFNLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2hELFlBQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtBQUM3QyxZQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ3ZDLFlBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7S0FDdkMsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy90ZXN0ZXItZ28vc3BlYy90ZXN0ZXItc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiBlc2xpbnQtZW52IGphc21pbmUgKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cydcblxuZGVzY3JpYmUoJ3Rlc3RlcicsICgpID0+IHtcbiAgbGV0IG1haW5Nb2R1bGUgPSBudWxsXG4gIGxldCBnb3BhdGggPSBudWxsXG4gIGxldCBvbGRHb3BhdGggPSBudWxsXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgcnVucygoKSA9PiB7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuR09QQVRIKSB7XG4gICAgICAgIG9sZEdvcGF0aCA9IHByb2Nlc3MuZW52LkdPUEFUSFxuICAgICAgfVxuICAgICAgZ29wYXRoID0gdGVtcC5ta2RpclN5bmMoKVxuICAgICAgcHJvY2Vzcy5lbnYuR09QQVRIID0gZ29wYXRoXG4gICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoZ29wYXRoKVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdnby1jb25maWcnKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd0ZXN0ZXItZ28nKVxuICAgICAgfSkudGhlbigocGFjaykgPT4ge1xuICAgICAgICBtYWluTW9kdWxlID0gcGFjay5tYWluTW9kdWxlXG4gICAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtZ28nKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIG1haW5Nb2R1bGUuZ2V0R29jb25maWcoKSAhPT0gZmFsc2VcbiAgICB9KVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgaWYgKG9sZEdvcGF0aCkge1xuICAgICAgcHJvY2Vzcy5lbnYuR09QQVRIID0gb2xkR29wYXRoXG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBwcm9jZXNzLmVudi5HT1BBVEhcbiAgICB9XG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gcnVuIGNvdmVyYWdlIG9uIHNhdmUgaXMgZGlzYWJsZWQnLCAoKSA9PiB7XG4gICAgbGV0IGZpbGVQYXRoXG4gICAgbGV0IHRlc3RGaWxlUGF0aFxuICAgIGxldCBlZGl0b3JcbiAgICBsZXQgdGVzdEVkaXRvclxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ3Rlc3Rlci1nby5ydW5Db3ZlcmFnZU9uU2F2ZScsIGZhbHNlKVxuICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oZ29wYXRoLCAnc3JjJywgJ2dpdGh1Yi5jb20nLCAndGVzdHVzZXInLCAnZXhhbXBsZScsICdnby1wbHVzLmdvJylcbiAgICAgIHRlc3RGaWxlUGF0aCA9IHBhdGguam9pbihnb3BhdGgsICdzcmMnLCAnZ2l0aHViLmNvbScsICd0ZXN0dXNlcicsICdleGFtcGxlJywgJ2dvLXBsdXNfdGVzdC5nbycpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCAnJylcbiAgICAgIGZzLndyaXRlRmlsZVN5bmModGVzdEZpbGVQYXRoLCAnJylcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKS50aGVuKChlKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gZVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4odGVzdEZpbGVQYXRoKS50aGVuKChlKSA9PiB7XG4gICAgICAgICAgdGVzdEVkaXRvciA9IGVcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdkaXNwbGF5cyBjb3ZlcmFnZSBmb3IgZ28gc291cmNlJywgKCkgPT4ge1xuICAgICAgbGV0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgYnVmZmVyLnNldFRleHQoJ3BhY2thZ2UgbWFpblxcblxcbmltcG9ydCBcImZtdFwiXFxuXFxuZnVuYyBtYWluKCkgIHtcXG5cXHRmbXQuUHJpbnRsbihIZWxsbygpKVxcbn1cXG5cXG5mdW5jIEhlbGxvKCkgc3RyaW5nIHtcXG5cXHRyZXR1cm4gXCJIZWxsbywg5LiW55WMXCJcXG59XFxuJylcbiAgICAgIGJ1ZmZlci5zYXZlKClcbiAgICAgIGxldCB0ZXN0QnVmZmVyID0gdGVzdEVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgdGVzdEJ1ZmZlci5zZXRUZXh0KCdwYWNrYWdlIG1haW5cXG5cXG5pbXBvcnQgXCJ0ZXN0aW5nXCJcXG5cXG5mdW5jIFRlc3RIZWxsbyh0ICp0ZXN0aW5nLlQpIHtcXG5cXHRyZXN1bHQgOj0gSGVsbG8oKVxcblxcdGlmIHJlc3VsdCAhPSBcIkhlbGxvLCDkuJbnlYxcIiB7XFxuXFx0XFx0dC5FcnJvcmYoXCJFeHBlY3RlZCAlcyAtIGdvdCAlc1wiLCBcIkhlbGxvLCDkuJbnlYxcIiwgcmVzdWx0KVxcblxcdH1cXG59JylcbiAgICAgIHRlc3RCdWZmZXIuc2F2ZSgpXG4gICAgICBsZXQgcCA9IG1haW5Nb2R1bGUuZ2V0VGVzdGVyKCkucnVuQ292ZXJhZ2UoZWRpdG9yKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gcCB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgbGV0IG1hcmtlcnMgPSBidWZmZXIuZmluZE1hcmtlcnMoe2NsYXNzOiAnZ29jb3Zlcid9KVxuICAgICAgICBleHBlY3QobWFya2VycykudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QobWFya2Vycy5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgZXhwZWN0KG1hcmtlcnNbMF0pLnRvQmVEZWZpbmVkKClcbiAgICAgICAgbGV0IHJhbmdlID0gbWFya2Vyc1swXS5nZXRSYW5nZSgpXG4gICAgICAgIGV4cGVjdChyYW5nZS5zdGFydC5yb3cpLnRvQmUoNClcbiAgICAgICAgZXhwZWN0KHJhbmdlLnN0YXJ0LmNvbHVtbikudG9CZSgxMylcbiAgICAgICAgZXhwZWN0KHJhbmdlLmVuZC5yb3cpLnRvQmUoNilcbiAgICAgICAgZXhwZWN0KHJhbmdlLmVuZC5jb2x1bW4pLnRvQmUoMSlcblxuICAgICAgICBleHBlY3QobWFya2Vyc1sxXSkudG9CZURlZmluZWQoKVxuICAgICAgICByYW5nZSA9IG1hcmtlcnNbMV0uZ2V0UmFuZ2UoKVxuICAgICAgICBleHBlY3QocmFuZ2UpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHJhbmdlLnN0YXJ0LnJvdykudG9CZSg4KVxuICAgICAgICBleHBlY3QocmFuZ2Uuc3RhcnQuY29sdW1uKS50b0JlKDIwKVxuICAgICAgICBleHBlY3QocmFuZ2UuZW5kLnJvdykudG9CZSgxMClcbiAgICAgICAgZXhwZWN0KHJhbmdlLmVuZC5jb2x1bW4pLnRvQmUoMSlcbiAgICAgIH0pXG4gICAgICBleHBlY3QobWFpbk1vZHVsZSkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUpLnRvQmVUcnV0aHkoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUuZ2V0R29jb25maWcpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChtYWluTW9kdWxlLmNvbnN1bWVHb2NvbmZpZykudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUuZ2V0R29jb25maWcoKSkudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QobWFpbk1vZHVsZS50ZXN0ZXIpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChtYWluTW9kdWxlLnRlc3RlcikudG9CZVRydXRoeSgpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
//# sourceURL=/Users/james/.atom/packages/tester-go/spec/tester-spec.js
