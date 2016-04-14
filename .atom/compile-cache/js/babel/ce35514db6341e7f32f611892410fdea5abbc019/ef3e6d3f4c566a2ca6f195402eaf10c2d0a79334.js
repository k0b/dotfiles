Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _child_process = require('child_process');

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _check = require('./check');

'use babel';

var Executor = (function () {
  function Executor(options) {
    _classCallCheck(this, Executor);

    this.environmentFn = null;
    if ((0, _check.isFalsy)(options) || (0, _check.isFalsy)(options.environmentFn)) {
      return;
    }

    this.environmentFn = options.environmentFn;
  }

  _createClass(Executor, [{
    key: 'dispose',
    value: function dispose() {
      this.environmentFn = null;
    }
  }, {
    key: 'environment',
    value: function environment() {
      if ((0, _check.isFalsy)(this.environmentFn)) {
        return process.env;
      }

      return this.environmentFn();
    }
  }, {
    key: 'execSync',
    value: function execSync(command) {
      var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      options = (0, _check.isFalsy)(options) ? {} : options;
      options.encoding = 'utf8';
      if ((0, _check.isFalsy)(options.env)) {
        options.env = this.environment();
      }
      if ((0, _check.isTruthy)(options.cwd) && options.cwd.length > 0) {
        try {
          options.cwd = _fsPlus2['default'].realpathSync(options.cwd);
        } catch (e) {
          if (e.handle) {
            e.handle();
          }
          console.log(e);
        }
      }
      if ((0, _check.isFalsy)(args)) {
        args = [];
      }

      var done = (0, _child_process.spawnSync)(command, args, options);
      var code = done.status;

      var stdout = '';
      if (done.stdout && done.stdout.length > 0) {
        stdout = done.stdout;
      }
      var stderr = '';
      if (done.stderr && done.stderr.length > 0) {
        stderr = done.stderr;
      }
      var error = done.error;
      if (error && error.code) {
        switch (error.code) {
          case 'ENOENT':
            code = 127;
            break;
          case 'ENOTCONN':
            // https://github.com/iojs/io.js/pull/1214
            error = null;
            code = 0;
            break;
        }
      }

      return { exitcode: code, stdout: stdout, stderr: stderr, error: error };
    }
  }, {
    key: 'exec',
    value: function exec(command) {
      var _this = this;

      var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return new Promise(function (resolve, reject) {
        options = (0, _check.isFalsy)(options) ? {} : options;
        options.encoding = 'utf8';
        if ((0, _check.isFalsy)(options.env)) {
          options.env = _this.environment();
        }
        if ((0, _check.isTruthy)(options.cwd) && options.cwd.length > 0) {
          try {
            options.cwd = _fsPlus2['default'].realpathSync(options.cwd);
          } catch (e) {
            if (e.handle) {
              e.handle();
            }
            console.log(e);
          }
        }
        if ((0, _check.isFalsy)(args)) {
          args = [];
        }

        var stdout = '';
        var stderr = '';
        var stdoutFn = function stdoutFn(data) {
          stdout += data;
        };
        var stderrFn = function stderrFn(data) {
          stderr += data;
        };
        var exitFn = function exitFn(code) {
          if ((0, _check.isTruthy)(stderr)) {
            var nonexistentcommand = "\'" + command + "\' is not recognized as an internal or external command,operable program or batch file.";
            if (stderr.replace(/\r?\n|\r/g, '') === nonexistentcommand) {
              resolve({
                error: {
                  code: 'ENOENT',
                  errno: 'ENOENT',
                  message: 'spawn ' + command + ' ENOENT',
                  path: command
                },
                exitcode: 127,
                stdout: stdout,
                stderr: stderr
              });
              return;
            }
          }

          resolve({
            error: null,
            exitcode: code,
            stdout: stdout,
            stderr: stderr
          });
        };
        if ((0, _check.isFalsy)(args)) {
          args = [];
        }

        var bufferedprocess = new _atom.BufferedProcess({ command: command, args: args, options: options, stdout: stdoutFn, stderr: stderrFn, exit: exitFn });
        bufferedprocess.onWillThrowError(function (err) {
          var e = err;
          if ((0, _check.isTruthy)(err)) {
            if (err.handle) {
              err.handle();
            }
            if (err.error) {
              e = err.error;
            }
          }
          resolve({
            error: e,
            exitcode: 127,
            stdout: stdout,
            stderr: stderr
          });
        });

        if ((0, _check.isTruthy)(options.input) && options.input.length > 0) {
          bufferedprocess.process.stdin.end(options.input);
        }
      });
    }
  }]);

  return Executor;
})();

exports.Executor = Executor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1jb25maWcvbGliL2V4ZWN1dG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRThCLE1BQU07OzZCQUNaLGVBQWU7O3NCQUN4QixTQUFTOzs7O3FCQUNRLFNBQVM7O0FBTHpDLFdBQVcsQ0FBQTs7SUFPTCxRQUFRO0FBQ0EsV0FEUixRQUFRLENBQ0MsT0FBTyxFQUFFOzBCQURsQixRQUFROztBQUVWLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFFBQUksb0JBQVEsT0FBTyxDQUFDLElBQUksb0JBQVEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQ3RELGFBQU07S0FDUDs7QUFFRCxRQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUE7R0FDM0M7O2VBUkcsUUFBUTs7V0FVSixtQkFBRztBQUNULFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0tBQzFCOzs7V0FFVyx1QkFBRztBQUNiLFVBQUksb0JBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQy9CLGVBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQTtPQUNuQjs7QUFFRCxhQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtLQUM1Qjs7O1dBRVEsa0JBQUMsT0FBTyxFQUEyQjtVQUF6QixJQUFJLHlEQUFHLEVBQUU7VUFBRSxPQUFPLHlEQUFHLEVBQUU7O0FBQ3hDLGFBQU8sR0FBRyxvQkFBUSxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFBO0FBQ3pDLGFBQU8sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFBO0FBQ3pCLFVBQUksb0JBQVEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLGVBQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO09BQ2pDO0FBQ0QsVUFBSSxxQkFBUyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUks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LE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQTtBQUM3SSx1QkFBZSxDQUFDLGdCQUFnQixDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ3hDLGNBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQTtBQUNYLGNBQUkscUJBQVMsR0FBRyxDQUFDLEVBQUU7QUFDakIsZ0JBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtBQUNkLGlCQUFHLENBQUMsTUFBTSxFQUFFLENBQUE7YUFDYjtBQUNELGdCQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUU7QUFDYixlQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQTthQUNkO1dBQ0Y7QUFDRCxpQkFBTyxDQUFDO0FBQ04saUJBQUssRUFBRSxDQUFDO0FBQ1Isb0JBQVEsRUFBRSxHQUFHO0FBQ2Isa0JBQU0sRUFBRSxNQUFNO0FBQ2Qsa0JBQU0sRUFBRSxNQUFNO1dBQ2YsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxDQUFBOztBQUVGLFlBQUkscUJBQVMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN2RCx5QkFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUNqRDtPQUNGLENBQUMsQ0FBQTtLQUNIOzs7U0FuSkcsUUFBUTs7O1FBc0pOLFFBQVEsR0FBUixRQUFRIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1jb25maWcvbGliL2V4ZWN1dG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtCdWZmZXJlZFByb2Nlc3N9IGZyb20gJ2F0b20nXG5pbXBvcnQge3NwYXduU3luY30gZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuaW1wb3J0IHtpc1RydXRoeSwgaXNGYWxzeX0gZnJvbSAnLi9jaGVjaydcblxuY2xhc3MgRXhlY3V0b3Ige1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgIHRoaXMuZW52aXJvbm1lbnRGbiA9IG51bGxcbiAgICBpZiAoaXNGYWxzeShvcHRpb25zKSB8fCBpc0ZhbHN5KG9wdGlvbnMuZW52aXJvbm1lbnRGbikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuZW52aXJvbm1lbnRGbiA9IG9wdGlvbnMuZW52aXJvbm1lbnRGblxuICB9XG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgdGhpcy5lbnZpcm9ubWVudEZuID0gbnVsbFxuICB9XG5cbiAgZW52aXJvbm1lbnQgKCkge1xuICAgIGlmIChpc0ZhbHN5KHRoaXMuZW52aXJvbm1lbnRGbikpIHtcbiAgICAgIHJldHVybiBwcm9jZXNzLmVudlxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmVudmlyb25tZW50Rm4oKVxuICB9XG5cbiAgZXhlY1N5bmMgKGNvbW1hbmQsIGFyZ3MgPSBbXSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgb3B0aW9ucyA9IGlzRmFsc3kob3B0aW9ucykgPyB7fSA6IG9wdGlvbnNcbiAgICBvcHRpb25zLmVuY29kaW5nID0gJ3V0ZjgnXG4gICAgaWYgKGlzRmFsc3kob3B0aW9ucy5lbnYpKSB7XG4gICAgICBvcHRpb25zLmVudiA9IHRoaXMuZW52aXJvbm1lbnQoKVxuICAgIH1cbiAgICBpZiAoaXNUcnV0aHkob3B0aW9ucy5jd2QpICYmIG9wdGlvbnMuY3dkLmxlbmd0aCA+IDApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG9wdGlvbnMuY3dkID0gZnMucmVhbHBhdGhTeW5jKG9wdGlvbnMuY3dkKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5oYW5kbGUpIHtcbiAgICAgICAgICBlLmhhbmRsZSgpXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzRmFsc3koYXJncykpIHtcbiAgICAgIGFyZ3MgPSBbXVxuICAgIH1cblxuICAgIGxldCBkb25lID0gc3Bhd25TeW5jKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpXG4gICAgbGV0IGNvZGUgPSBkb25lLnN0YXR1c1xuXG4gICAgbGV0IHN0ZG91dCA9ICcnXG4gICAgaWYgKGRvbmUuc3Rkb3V0ICYmIGRvbmUuc3Rkb3V0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHN0ZG91dCA9IGRvbmUuc3Rkb3V0XG4gICAgfVxuICAgIGxldCBzdGRlcnIgPSAnJ1xuICAgIGlmIChkb25lLnN0ZGVyciAmJiBkb25lLnN0ZGVyci5sZW5ndGggPiAwKSB7XG4gICAgICBzdGRlcnIgPSBkb25lLnN0ZGVyclxuICAgIH1cbiAgICBsZXQgZXJyb3IgPSBkb25lLmVycm9yXG4gICAgaWYgKGVycm9yICYmIGVycm9yLmNvZGUpIHtcbiAgICAgIHN3aXRjaCAoZXJyb3IuY29kZSkge1xuICAgICAgICBjYXNlICdFTk9FTlQnOlxuICAgICAgICAgIGNvZGUgPSAxMjdcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdFTk9UQ09OTic6IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9pb2pzL2lvLmpzL3B1bGwvMTIxNFxuICAgICAgICAgIGVycm9yID0gbnVsbFxuICAgICAgICAgIGNvZGUgPSAwXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge2V4aXRjb2RlOiBjb2RlLCBzdGRvdXQ6IHN0ZG91dCwgc3RkZXJyOiBzdGRlcnIsIGVycm9yOiBlcnJvcn1cbiAgfVxuXG4gIGV4ZWMgKGNvbW1hbmQsIGFyZ3MgPSBbXSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIG9wdGlvbnMgPSBpc0ZhbHN5KG9wdGlvbnMpID8ge30gOiBvcHRpb25zXG4gICAgICBvcHRpb25zLmVuY29kaW5nID0gJ3V0ZjgnXG4gICAgICBpZiAoaXNGYWxzeShvcHRpb25zLmVudikpIHtcbiAgICAgICAgb3B0aW9ucy5lbnYgPSB0aGlzLmVudmlyb25tZW50KClcbiAgICAgIH1cbiAgICAgIGlmIChpc1RydXRoeShvcHRpb25zLmN3ZCkgJiYgb3B0aW9ucy5jd2QubGVuZ3RoID4gMCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIG9wdGlvbnMuY3dkID0gZnMucmVhbHBhdGhTeW5jKG9wdGlvbnMuY3dkKVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUuaGFuZGxlKSB7XG4gICAgICAgICAgICBlLmhhbmRsZSgpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc0ZhbHN5KGFyZ3MpKSB7XG4gICAgICAgIGFyZ3MgPSBbXVxuICAgICAgfVxuXG4gICAgICBsZXQgc3Rkb3V0ID0gJydcbiAgICAgIGxldCBzdGRlcnIgPSAnJ1xuICAgICAgbGV0IHN0ZG91dEZuID0gKGRhdGEpID0+IHsgc3Rkb3V0ICs9IGRhdGEgfVxuICAgICAgbGV0IHN0ZGVyckZuID0gKGRhdGEpID0+IHsgc3RkZXJyICs9IGRhdGEgfVxuICAgICAgbGV0IGV4aXRGbiA9IChjb2RlKSA9PiB7XG4gICAgICAgIGlmIChpc1RydXRoeShzdGRlcnIpKSB7XG4gICAgICAgICAgbGV0IG5vbmV4aXN0ZW50Y29tbWFuZCA9IFwiXFwnXCIgKyBjb21tYW5kICsgXCJcXCcgaXMgbm90IHJlY29nbml6ZWQgYXMgYW4gaW50ZXJuYWwgb3IgZXh0ZXJuYWwgY29tbWFuZCxvcGVyYWJsZSBwcm9ncmFtIG9yIGJhdGNoIGZpbGUuXCJcbiAgICAgICAgICBpZiAoc3RkZXJyLnJlcGxhY2UoL1xccj9cXG58XFxyL2csICcnKSA9PT0gbm9uZXhpc3RlbnRjb21tYW5kKSB7XG4gICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICBjb2RlOiAnRU5PRU5UJyxcbiAgICAgICAgICAgICAgICBlcnJubzogJ0VOT0VOVCcsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ3NwYXduICcgKyBjb21tYW5kICsgJyBFTk9FTlQnLFxuICAgICAgICAgICAgICAgIHBhdGg6IGNvbW1hbmRcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXhpdGNvZGU6IDEyNyxcbiAgICAgICAgICAgICAgc3Rkb3V0OiBzdGRvdXQsXG4gICAgICAgICAgICAgIHN0ZGVycjogc3RkZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgZXhpdGNvZGU6IGNvZGUsXG4gICAgICAgICAgc3Rkb3V0OiBzdGRvdXQsXG4gICAgICAgICAgc3RkZXJyOiBzdGRlcnJcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChpc0ZhbHN5KGFyZ3MpKSB7XG4gICAgICAgIGFyZ3MgPSBbXVxuICAgICAgfVxuXG4gICAgICBsZXQgYnVmZmVyZWRwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZDogY29tbWFuZCwgYXJnczogYXJncywgb3B0aW9uczogb3B0aW9ucywgc3Rkb3V0OiBzdGRvdXRGbiwgc3RkZXJyOiBzdGRlcnJGbiwgZXhpdDogZXhpdEZufSlcbiAgICAgIGJ1ZmZlcmVkcHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yKChlcnIpID0+IHtcbiAgICAgICAgbGV0IGUgPSBlcnJcbiAgICAgICAgaWYgKGlzVHJ1dGh5KGVycikpIHtcbiAgICAgICAgICBpZiAoZXJyLmhhbmRsZSkge1xuICAgICAgICAgICAgZXJyLmhhbmRsZSgpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlcnIuZXJyb3IpIHtcbiAgICAgICAgICAgIGUgPSBlcnIuZXJyb3JcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgZXJyb3I6IGUsXG4gICAgICAgICAgZXhpdGNvZGU6IDEyNyxcbiAgICAgICAgICBzdGRvdXQ6IHN0ZG91dCxcbiAgICAgICAgICBzdGRlcnI6IHN0ZGVyclxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaWYgKGlzVHJ1dGh5KG9wdGlvbnMuaW5wdXQpICYmIG9wdGlvbnMuaW5wdXQubGVuZ3RoID4gMCkge1xuICAgICAgICBidWZmZXJlZHByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQob3B0aW9ucy5pbnB1dClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCB7RXhlY3V0b3J9XG4iXX0=
//# sourceURL=/Users/james/.atom/packages/go-config/lib/executor.js
