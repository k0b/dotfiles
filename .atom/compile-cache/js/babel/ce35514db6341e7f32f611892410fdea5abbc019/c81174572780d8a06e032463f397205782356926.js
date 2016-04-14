function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */

var _libPathhelper = require('./../lib/pathhelper');

var _libPathhelper2 = _interopRequireDefault(_libPathhelper);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

describe('pathhelper', function () {
  var gopathToken = '';

  beforeEach(function () {
    runs(function () {
      gopathToken = '$GOPATH';
      if (_os2['default'].platform() === 'win32') {
        gopathToken = '%GOPATH%';
      }
    });
  });

  describe('when working with a single-item path', function () {
    it('expands the path', function () {
      var env = Object.assign({}, process.env);
      env.GOPATH = '~' + _path2['default'].sep + 'go';

      var result = _libPathhelper2['default'].expand(env, _path2['default'].join('~', 'go', 'go', '..', 'bin', 'goimports'));
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
      expect(result).toBe(_path2['default'].join(_libPathhelper2['default'].home(), 'go', 'bin', 'goimports'));

      result = _libPathhelper2['default'].expand(env, _path2['default'].join(gopathToken, 'go', '..', 'bin', 'goimports'));
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
      expect(result).toBe(_path2['default'].join(_libPathhelper2['default'].home(), 'go', 'bin', 'goimports'));

      var root = _path2['default'].sep;
      var nonexistentKey = '$NONEXISTENT';
      if (_os2['default'].platform() === 'win32') {
        root = 'c:' + _path2['default'].sep;
        nonexistentKey = '%NONEXISTENT%';
      }
      result = _libPathhelper2['default'].expand(env, _path2['default'].join(root, nonexistentKey, 'go', '..', 'bin', 'goimports'));
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
      expect(result).toBe(_path2['default'].join(root, nonexistentKey, 'bin', 'goimports'));
    });
  });

  describe('when working with a multi-item path', function () {
    it('expands the path', function () {
      var env = Object.assign({}, process.env);
      env.GOPATH = '~' + _path2['default'].sep + 'go' + _path2['default'].delimiter + '~' + _path2['default'].sep + 'othergo';

      var result = _libPathhelper2['default'].expand(env, _path2['default'].join('~', 'go', 'go', '..', 'bin', 'goimports'));
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
      expect(result).toBe(_path2['default'].join(_libPathhelper2['default'].home(), 'go', 'bin', 'goimports'));

      result = _libPathhelper2['default'].expand(env, _path2['default'].join(gopathToken, 'go', '..', 'bin', 'goimports'));
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
      expect(result).toBe(_path2['default'].join(_libPathhelper2['default'].home(), 'go', 'bin', 'goimports'));
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1jb25maWcvc3BlYy9wYXRoaGVscGVyLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs2QkFHdUIscUJBQXFCOzs7O2tCQUM3QixJQUFJOzs7O29CQUNGLE1BQU07Ozs7QUFMdkIsV0FBVyxDQUFBOztBQU9YLFFBQVEsQ0FBQyxZQUFZLEVBQUUsWUFBTTtBQUMzQixNQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7O0FBRXBCLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBSSxDQUFDLFlBQU07QUFDVCxpQkFBVyxHQUFHLFNBQVMsQ0FBQTtBQUN2QixVQUFJLGdCQUFHLFFBQVEsRUFBRSxLQUFLLE9BQU8sRUFBRTtBQUM3QixtQkFBVyxHQUFHLFVBQVUsQ0FBQTtPQUN6QjtLQUNGLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsc0NBQXNDLEVBQUUsWUFBTTtBQUNyRCxNQUFFLENBQUMsa0JBQWtCLEVBQUUsWUFBTTtBQUMzQixVQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDeEMsU0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsa0JBQUssR0FBRyxHQUFHLElBQUksQ0FBQTs7QUFFbEMsVUFBSSxNQUFNLEdBQUcsMkJBQVcsTUFBTSxDQUFDLEdBQUcsRUFBRSxrQkFBSyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFBO0FBQ3pGLFlBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUM1QixZQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDM0IsWUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBSyxJQUFJLENBQUMs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LDJCQUFXLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQTtLQUM1RSxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dvLWNvbmZpZy9zcGVjL3BhdGhoZWxwZXItc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiBlc2xpbnQtZW52IGphc21pbmUgKi9cblxuaW1wb3J0IHBhdGhoZWxwZXIgZnJvbSAnLi8uLi9saWIvcGF0aGhlbHBlcidcbmltcG9ydCBvcyBmcm9tICdvcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmRlc2NyaWJlKCdwYXRoaGVscGVyJywgKCkgPT4ge1xuICBsZXQgZ29wYXRoVG9rZW4gPSAnJ1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgZ29wYXRoVG9rZW4gPSAnJEdPUEFUSCdcbiAgICAgIGlmIChvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInKSB7XG4gICAgICAgIGdvcGF0aFRva2VuID0gJyVHT1BBVEglJ1xuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gd29ya2luZyB3aXRoIGEgc2luZ2xlLWl0ZW0gcGF0aCcsICgpID0+IHtcbiAgICBpdCgnZXhwYW5kcyB0aGUgcGF0aCcsICgpID0+IHtcbiAgICAgIGxldCBlbnYgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudilcbiAgICAgIGVudi5HT1BBVEggPSAnficgKyBwYXRoLnNlcCArICdnbydcblxuICAgICAgbGV0IHJlc3VsdCA9IHBhdGhoZWxwZXIuZXhwYW5kKGVudiwgcGF0aC5qb2luKCd+JywgJ2dvJywgJ2dvJywgJy4uJywgJ2JpbicsICdnb2ltcG9ydHMnKSlcbiAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmVUcnV0aHkoKVxuICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZShwYXRoLmpvaW4ocGF0aGhlbHBlci5ob21lKCksICdnbycsICdiaW4nLCAnZ29pbXBvcnRzJykpXG5cbiAgICAgIHJlc3VsdCA9IHBhdGhoZWxwZXIuZXhwYW5kKGVudiwgcGF0aC5qb2luKGdvcGF0aFRva2VuLCAnZ28nLCAnLi4nLCAnYmluJywgJ2dvaW1wb3J0cycpKVxuICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QocmVzdWx0KS50b0JlKHBhdGguam9pbihwYXRoaGVscGVyLmhvbWUoKSwgJ2dvJywgJ2JpbicsICdnb2ltcG9ydHMnKSlcblxuICAgICAgbGV0IHJvb3QgPSBwYXRoLnNlcFxuICAgICAgbGV0IG5vbmV4aXN0ZW50S2V5ID0gJyROT05FWElTVEVOVCdcbiAgICAgIGlmIChvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInKSB7XG4gICAgICAgIHJvb3QgPSAnYzonICsgcGF0aC5zZXBcbiAgICAgICAgbm9uZXhpc3RlbnRLZXkgPSAnJU5PTkVYSVNURU5UJSdcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IHBhdGhoZWxwZXIuZXhwYW5kKGVudiwgcGF0aC5qb2luKHJvb3QsIG5vbmV4aXN0ZW50S2V5LCAnZ28nLCAnLi4nLCAnYmluJywgJ2dvaW1wb3J0cycpKVxuICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QocmVzdWx0KS50b0JlKHBhdGguam9pbihyb290LCBub25leGlzdGVudEtleSwgJ2JpbicsICdnb2ltcG9ydHMnKSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHdvcmtpbmcgd2l0aCBhIG11bHRpLWl0ZW0gcGF0aCcsICgpID0+IHtcbiAgICBpdCgnZXhwYW5kcyB0aGUgcGF0aCcsICgpID0+IHtcbiAgICAgIGxldCBlbnYgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudilcbiAgICAgIGVudi5HT1BBVEggPSAnficgKyBwYXRoLnNlcCArICdnbycgKyBwYXRoLmRlbGltaXRlciArICd+JyArIHBhdGguc2VwICsgJ290aGVyZ28nXG5cbiAgICAgIGxldCByZXN1bHQgPSBwYXRoaGVscGVyLmV4cGFuZChlbnYsIHBhdGguam9pbignficsICdnbycsICdnbycsICcuLicsICdiaW4nLCAnZ29pbXBvcnRzJykpXG4gICAgICBleHBlY3QocmVzdWx0KS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0KS50b0JlVHJ1dGh5KClcbiAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmUocGF0aC5qb2luKHBhdGhoZWxwZXIuaG9tZSgpLCAnZ28nLCAnYmluJywgJ2dvaW1wb3J0cycpKVxuXG4gICAgICByZXN1bHQgPSBwYXRoaGVscGVyLmV4cGFuZChlbnYsIHBhdGguam9pbihnb3BhdGhUb2tlbiwgJ2dvJywgJy4uJywgJ2JpbicsICdnb2ltcG9ydHMnKSlcbiAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmVUcnV0aHkoKVxuICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZShwYXRoLmpvaW4ocGF0aGhlbHBlci5ob21lKCksICdnbycsICdiaW4nLCAnZ29pbXBvcnRzJykpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
//# sourceURL=/Users/james/.atom/packages/go-config/spec/pathhelper-spec.js
