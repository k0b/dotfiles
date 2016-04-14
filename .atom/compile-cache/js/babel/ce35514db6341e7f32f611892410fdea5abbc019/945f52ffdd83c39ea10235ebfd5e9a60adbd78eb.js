function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */

var _libExecutor = require('../lib/executor');

var _libPathhelper = require('./../lib/pathhelper');

var _libPathhelper2 = _interopRequireDefault(_libPathhelper);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

describe('executor', function () {
  var executor = null;
  var prefix = null;
  var result = null;
  var error = null;

  beforeEach(function () {
    runs(function () {
      result = null;
      error = null;
      prefix = '/';
      if (_os2['default'].platform() === 'win32') {
        prefix = 'C:\\';
      }
      executor = new _libExecutor.Executor();
    });
  });

  describe('when the executor is used', function () {
    it('has a valid environment', function () {
      expect(executor).toBeDefined();
      expect(executor.environment).toBeDefined();
      expect(executor.environment()).toBeDefined();
      expect(executor.environment()).toBeTruthy();
      expect(executor.environment().PATH).toBeDefined();
      expect(executor.environment().PATH).not.toBe('');
    });
  });

  describe('when asynchronously executing a command', function () {
    it('succeeds', function () {
      var command = 'env';
      if (_os2['default'].platform() === 'win32') {
        command = _path2['default'].resolve(__dirname, 'tools', 'env', 'env_windows_amd64.exe');
      }

      waitsForPromise(function () {
        return executor.exec(command, [], { cwd: prefix }).then(function (r) {
          result = r;
        })['catch'](function (e) {
          error = e;
        });
      });

      runs(function () {
        expect(result).toBeDefined();
        expect(result.exitcode).toBeDefined();
        expect(result.exitcode).toBe(0);
        expect(result.stdout).toBeDefined();
        expect(result.stdout).not.toBe('');
        expect(result.stderr).toBeDefined();
        expect(result.stderr).toBe('');

        expect(result.error).toBeFalsy();
        expect(error).toBeFalsy();
      });
    });

    it('sets the working directory correctly', function () {
      var command = 'pwd';
      if (_os2['default'].platform() === 'win32') {
        command = _path2['default'].resolve(__dirname, 'tools', 'pwd', 'pwd_windows_amd64.exe');
      }

      waitsForPromise(function () {
        return executor.exec(command, [], { cwd: _libPathhelper2['default'].home() }).then(function (r) {
          result = r;
        })['catch'](function (e) {
          error = e;
        });
      });

      runs(function () {
        expect(result).toBeDefined();
        expect(result.exitcode).toBeDefined();
        expect(result.exitcode).toBe(0);
        expect(result.stdout).toBeDefined();
        expect(result.stdout).toBe(_libPathhelper2['default'].home() + '\n');
        expect(result.stderr).toBeDefined();
        expect(result.stderr).toBe('');

        expect(result.error).toBeFalsy();
        expect(error).toBeFalsy();
      });
    });

    it('sets the environment correctly', function () {
      var command = 'env';
      if (_os2['default'].platform() === 'win32') {
        command = _path2['default'].resolve(__dirname, 'tools', 'env', 'env_windows_amd64.exe');
      }
      var env = { testenv: 'testing' };

      waitsForPromise(function () {
        return executor.exec(command, [], { env: env }).then(function (r) {
          result = r;
        })['catch'](function (e) {
          error = e;
        });
      });

      runs(function () {
        expect(result).toBeDefined();
        expect(result.exitcode).toBeDefined();
        expect(result.exitcode).toBe(0);
        expect(result.stdout).toBeDefined();
        expect(result.stdout).toContain('testenv=testing\n');
        expect(result.stderr).toBeDefined();
        expect(result.stderr).toBe('');

        expect(result.error).toBeFalsy();
        expect(error).toBeFalsy();
      });
    });

    it('handles and returns an ENOENT error if the command was not found', function () {
      waitsForPromise(function () {
        return executor.exec('nonexistentcommand', []).then(function (r) {
          result = r;
        })['catch'](function (e) {
          error = e;
        });
      });

      runs(function () {
        expect(result).toBeDefined();
        expect(result).toBeTruthy();
        expect(result.error).toBeDefined();
        expect(result.error).toBeTruthy();
        expect(result.error.code).toBe('ENOENT');
        expect(result.error.errno).toBe('ENOENT');
        expect(result.error.message).toBe('spawn nonexistentcommand ENOENT');
        expect(result.error.path).toBe('nonexistentcommand');
        expect(result.exitcode).toBeDefined();
        expect(result.exitcode).not.toBe(0);
        expect(result.exitcode).toBe(127);
        expect(result.stdout).toBeDefined();
        expect(result.stdout).toBe('');
        expect(result.stderr).toBeDefined();
        if (_os2['default'].platform() === 'win32') {
          expect(result.stderr).toBe('\'nonexistentcommand\' is not recognized as an internal or external command,\r\noperable program or batch file.\r\n');
        } else {
          expect(result.stderr).toBe('');
        }
        expect(error).toBeFalsy();
      });
    });
  });

  describe('when synchronously executing a command', function () {
    it('succeeds', function () {
      var command = 'env';
      if (_os2['default'].platform() === 'win32') {
        command = _path2['default'].resolve(__dirname, 'tools', 'env', 'env_windows_amd64.exe');
      }

      var result = executor.execSync(command);
      expect(result.exitcode).toBeDefined();
      expect(result.exitcode).toBe(0);
      expect(result.stdout).toBeDefined();
      expect(result.stdout).not.toBe('');
      expect(result.stderr).toBeDefined();
      expect(result.stderr).toBe('');
      expect(result.error).toBeFalsy();
    });

    it('returns a message if the command was not found', function () {
      var result = executor.execSync('nonexistentcommand');
      expect(result.exitcode).toBeDefined();
      expect(result.exitcode).toBe(127);
      expect(result.stdout).toBeDefined();
      expect(result.stdout).toBe('');
      expect(result.stderr).toBeDefined();
      expect(result.stderr).toBe('');
      expect(result.error).toBeTruthy();
      expect(result.error.code).toBe('ENOENT');
      expect(result.error.errno).toBe('ENOENT');
      expect(result.error.message).toBe('spawnSync nonexistentcommand ENOENT');
      expect(result.error.path).toBe('nonexistentcommand');
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1jb25maWcvc3BlYy9leGVjdXRvci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7MkJBR3VCLGlCQUFpQjs7NkJBQ2pCLHFCQUFxQjs7OztrQkFDN0IsSUFBSTs7OztvQkFDRixNQUFNOzs7O0FBTnZCLFdBQVcsQ0FBQTs7QUFRWCxRQUFRLENBQUMsVUFBVSxFQUFFLFlBQU07QUFDekIsTUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ25CLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNqQixNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDakIsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFBOztBQUVoQixZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFdBQUssR0FBRyxJQUFJLENBQUE7QUFDWixZQUFNLEdBQUcsR0FBRyxDQUFBO0FBQ1osVUFBSSxnQkFBRyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7QUFDN0IsY0FBTSxHQUFHLE1BQU0sQ0FBQTtPQUNoQjtBQUNELGNBQVEsR0FBRywyQkFBYyxDQUFBO0tBQzFCLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsMkJBQTJCLEVBQUUsWUFBTTtBQUMxQyxNQUFFLENBQUMseUJBQXlCLEVBQUUsWUFBTTtBQUNsQyxZQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDOUIsWUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUMxQyxZQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDNUMsWUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO0FBQzNDLFlBQU0sQ0FBQyxR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Q0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0tBQ3JELENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvZ28tY29uZmlnL3NwZWMvZXhlY3V0b3Itc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiBlc2xpbnQtZW52IGphc21pbmUgKi9cblxuaW1wb3J0IHtFeGVjdXRvcn0gZnJvbSAnLi4vbGliL2V4ZWN1dG9yJ1xuaW1wb3J0IHBhdGhoZWxwZXIgZnJvbSAnLi8uLi9saWIvcGF0aGhlbHBlcidcbmltcG9ydCBvcyBmcm9tICdvcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmRlc2NyaWJlKCdleGVjdXRvcicsICgpID0+IHtcbiAgbGV0IGV4ZWN1dG9yID0gbnVsbFxuICBsZXQgcHJlZml4ID0gbnVsbFxuICBsZXQgcmVzdWx0ID0gbnVsbFxuICBsZXQgZXJyb3IgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgcnVucygoKSA9PiB7XG4gICAgICByZXN1bHQgPSBudWxsXG4gICAgICBlcnJvciA9IG51bGxcbiAgICAgIHByZWZpeCA9ICcvJ1xuICAgICAgaWYgKG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicpIHtcbiAgICAgICAgcHJlZml4ID0gJ0M6XFxcXCdcbiAgICAgIH1cbiAgICAgIGV4ZWN1dG9yID0gbmV3IEV4ZWN1dG9yKClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHRoZSBleGVjdXRvciBpcyB1c2VkJywgKCkgPT4ge1xuICAgIGl0KCdoYXMgYSB2YWxpZCBlbnZpcm9ubWVudCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChleGVjdXRvcikudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KGV4ZWN1dG9yLmVudmlyb25tZW50KS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QoZXhlY3V0b3IuZW52aXJvbm1lbnQoKSkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KGV4ZWN1dG9yLmVudmlyb25tZW50KCkpLnRvQmVUcnV0aHkoKVxuICAgICAgZXhwZWN0KGV4ZWN1dG9yLmVudmlyb25tZW50KCkuUEFUSCkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KGV4ZWN1dG9yLmVudmlyb25tZW50KCkuUEFUSCkubm90LnRvQmUoJycpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBhc3luY2hyb25vdXNseSBleGVjdXRpbmcgYSBjb21tYW5kJywgKCkgPT4ge1xuICAgIGl0KCdzdWNjZWVkcycsICgpID0+IHtcbiAgICAgIGxldCBjb21tYW5kID0gJ2VudidcbiAgICAgIGlmIChvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInKSB7XG4gICAgICAgIGNvbW1hbmQgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAndG9vbHMnLCAnZW52JywgJ2Vudl93aW5kb3dzX2FtZDY0LmV4ZScpXG4gICAgICB9XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBleGVjdXRvci5leGVjKGNvbW1hbmQsIFtdLCB7Y3dkOiBwcmVmaXh9KS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgcmVzdWx0ID0gclxuICAgICAgICB9KS5jYXRjaCgoZSkgPT4geyBlcnJvciA9IGUgfSlcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QocmVzdWx0KS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5leGl0Y29kZSkudG9CZSgwKVxuICAgICAgICBleHBlY3QocmVzdWx0LnN0ZG91dCkudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QocmVzdWx0LnN0ZG91dCkubm90LnRvQmUoJycpXG4gICAgICAgIGV4cGVjdChyZXN1bHQuc3RkZXJyKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChyZXN1bHQuc3RkZXJyKS50b0JlKCcnKVxuXG4gICAgICAgIGV4cGVjdChyZXN1bHQuZXJyb3IpLnRvQmVGYWxzeSgpXG4gICAgICAgIGV4cGVjdChlcnJvcikudG9CZUZhbHN5KClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzZXRzIHRoZSB3b3JraW5nIGRpcmVjdG9yeSBjb3JyZWN0bHknLCAoKSA9PiB7XG4gICAgICBsZXQgY29tbWFuZCA9ICdwd2QnXG4gICAgICBpZiAob3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJykge1xuICAgICAgICBjb21tYW5kID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3Rvb2xzJywgJ3B3ZCcsICdwd2Rfd2luZG93c19hbWQ2NC5leGUnKVxuICAgICAgfVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gZXhlY3V0b3IuZXhlYyhjb21tYW5kLCBbXSwge2N3ZDogcGF0aGhlbHBlci5ob21lKCl9KS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgcmVzdWx0ID0gclxuICAgICAgICB9KS5jYXRjaCgoZSkgPT4geyBlcnJvciA9IGUgfSlcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QocmVzdWx0KS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5leGl0Y29kZSkudG9CZSgwKVxuICAgICAgICBleHBlY3QocmVzdWx0LnN0ZG91dCkudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QocmVzdWx0LnN0ZG91dCkudG9CZShwYXRoaGVscGVyLmhvbWUoKSArICdcXG4nKVxuICAgICAgICBleHBlY3QocmVzdWx0LnN0ZGVycikudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QocmVzdWx0LnN0ZGVycikudG9CZSgnJylcblxuICAgICAgICBleHBlY3QocmVzdWx0LmVycm9yKS50b0JlRmFsc3koKVxuICAgICAgICBleHBlY3QoZXJyb3IpLnRvQmVGYWxzeSgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2V0cyB0aGUgZW52aXJvbm1lbnQgY29ycmVjdGx5JywgKCkgPT4ge1xuICAgICAgbGV0IGNvbW1hbmQgPSAnZW52J1xuICAgICAgaWYgKG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicpIHtcbiAgICAgICAgY29tbWFuZCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICd0b29scycsICdlbnYnLCAnZW52X3dpbmRvd3NfYW1kNjQuZXhlJylcbiAgICAgIH1cbiAgICAgIGxldCBlbnYgPSB7dGVzdGVudjogJ3Rlc3RpbmcnfVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gZXhlY3V0b3IuZXhlYyhjb21tYW5kLCBbXSwge2VudjogZW52fSkudGhlbigocikgPT4ge1xuICAgICAgICAgIHJlc3VsdCA9IHJcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHsgZXJyb3IgPSBlIH0pXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QocmVzdWx0LmV4aXRjb2RlKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5zdGRvdXQpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5zdGRvdXQpLnRvQ29udGFpbigndGVzdGVudj10ZXN0aW5nXFxuJylcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5zdGRlcnIpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5zdGRlcnIpLnRvQmUoJycpXG5cbiAgICAgICAgZXhwZWN0KHJlc3VsdC5lcnJvcikudG9CZUZhbHN5KClcbiAgICAgICAgZXhwZWN0KGVycm9yKS50b0JlRmFsc3koKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2hhbmRsZXMgYW5kIHJldHVybnMgYW4gRU5PRU5UIGVycm9yIGlmIHRoZSBjb21tYW5kIHdhcyBub3QgZm91bmQnLCAoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gZXhlY3V0b3IuZXhlYygnbm9uZXhpc3RlbnRjb21tYW5kJywgW10pLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICByZXN1bHQgPSByXG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7IGVycm9yID0gZSB9KVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZVRydXRoeSgpXG4gICAgICAgIGV4cGVjdChyZXN1bHQuZXJyb3IpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5lcnJvcikudG9CZVRydXRoeSgpXG4gICAgICAgIGV4cGVjdChyZXN1bHQuZXJyb3IuY29kZSkudG9CZSgnRU5PRU5UJylcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5lcnJvci5lcnJubykudG9CZSgnRU5PRU5UJylcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5lcnJvci5tZXNzYWdlKS50b0JlKCdzcGF3biBub25leGlzdGVudGNvbW1hbmQgRU5PRU5UJylcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5lcnJvci5wYXRoKS50b0JlKCdub25leGlzdGVudGNvbW1hbmQnKVxuICAgICAgICBleHBlY3QocmVzdWx0LmV4aXRjb2RlKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLm5vdC50b0JlKDApXG4gICAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLnRvQmUoMTI3KVxuICAgICAgICBleHBlY3QocmVzdWx0LnN0ZG91dCkudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QocmVzdWx0LnN0ZG91dCkudG9CZSgnJylcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5zdGRlcnIpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgaWYgKG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicpIHtcbiAgICAgICAgICBleHBlY3QocmVzdWx0LnN0ZGVycikudG9CZSgnXFwnbm9uZXhpc3RlbnRjb21tYW5kXFwnIGlzIG5vdCByZWNvZ25pemVkIGFzIGFuIGludGVybmFsIG9yIGV4dGVybmFsIGNvbW1hbmQsXFxyXFxub3BlcmFibGUgcHJvZ3JhbSBvciBiYXRjaCBmaWxlLlxcclxcbicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdC5zdGRlcnIpLnRvQmUoJycpXG4gICAgICAgIH1cbiAgICAgICAgZXhwZWN0KGVycm9yKS50b0JlRmFsc3koKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHN5bmNocm9ub3VzbHkgZXhlY3V0aW5nIGEgY29tbWFuZCcsICgpID0+IHtcbiAgICBpdCgnc3VjY2VlZHMnLCAoKSA9PiB7XG4gICAgICBsZXQgY29tbWFuZCA9ICdlbnYnXG4gICAgICBpZiAob3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJykge1xuICAgICAgICBjb21tYW5kID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3Rvb2xzJywgJ2VudicsICdlbnZfd2luZG93c19hbWQ2NC5leGUnKVxuICAgICAgfVxuXG4gICAgICBsZXQgcmVzdWx0ID0gZXhlY3V0b3IuZXhlY1N5bmMoY29tbWFuZClcbiAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLnRvQmUoMClcbiAgICAgIGV4cGVjdChyZXN1bHQuc3Rkb3V0KS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LnN0ZG91dCkubm90LnRvQmUoJycpXG4gICAgICBleHBlY3QocmVzdWx0LnN0ZGVycikudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5zdGRlcnIpLnRvQmUoJycpXG4gICAgICBleHBlY3QocmVzdWx0LmVycm9yKS50b0JlRmFsc3koKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyBhIG1lc3NhZ2UgaWYgdGhlIGNvbW1hbmQgd2FzIG5vdCBmb3VuZCcsICgpID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSBleGVjdXRvci5leGVjU3luYygnbm9uZXhpc3RlbnRjb21tYW5kJylcbiAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuZXhpdGNvZGUpLnRvQmUoMTI3KVxuICAgICAgZXhwZWN0KHJlc3VsdC5zdGRvdXQpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuc3Rkb3V0KS50b0JlKCcnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5zdGRlcnIpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RkZXJyKS50b0JlKCcnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5lcnJvcikudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QocmVzdWx0LmVycm9yLmNvZGUpLnRvQmUoJ0VOT0VOVCcpXG4gICAgICBleHBlY3QocmVzdWx0LmVycm9yLmVycm5vKS50b0JlKCdFTk9FTlQnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5lcnJvci5tZXNzYWdlKS50b0JlKCdzcGF3blN5bmMgbm9uZXhpc3RlbnRjb21tYW5kIEVOT0VOVCcpXG4gICAgICBleHBlY3QocmVzdWx0LmVycm9yLnBhdGgpLnRvQmUoJ25vbmV4aXN0ZW50Y29tbWFuZCcpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
//# sourceURL=/Users/james/.atom/packages/go-config/spec/executor-spec.js
