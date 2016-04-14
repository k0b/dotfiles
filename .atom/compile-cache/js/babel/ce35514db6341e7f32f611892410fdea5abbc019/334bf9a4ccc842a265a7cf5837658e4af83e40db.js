function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */

var _libCheck = require('./../lib/check');

var _libExecutor = require('./../lib/executor');

var _libPathhelper = require('./../lib/pathhelper');

var _libPathhelper2 = _interopRequireDefault(_libPathhelper);

var _libLocator = require('./../lib/locator');

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

describe('Locator', function () {
  var env = null;
  var environmentFn = null;
  var executor = null;
  var platform = null;
  var arch = null;
  var executableSuffix = null;
  var pathkey = null;
  var readyFn = null;
  var locator = null;

  beforeEach(function () {
    _temp2['default'].track();
    env = Object.assign({}, process.env);
    if ((0, _libCheck.isTruthy)(env.GOROOT)) {
      delete env.GOROOT;
    }
    environmentFn = function () {
      return env;
    };
    readyFn = function () {
      return true;
    };
    platform = process.platform;
    if (process.arch === 'arm') {
      arch = 'arm';
    } else if (process.arch === 'ia32') {
      // Ugh, Atom is 32-bit on Windows... for now.
      if (platform === 'win32') {
        arch = 'amd64';
      } else {
        arch = '386';
      }
    } else {
      arch = 'amd64';
    }
    executor = new _libExecutor.Executor({ environmentFn: environmentFn });
    executableSuffix = '';
    pathkey = 'PATH';
    if (process.platform === 'win32') {
      platform = 'windows';
      executableSuffix = '.exe';
      pathkey = 'Path';
    }

    locator = new _libLocator.Locator({
      environment: environmentFn,
      executor: executor,
      ready: readyFn
    });
  });

  afterEach(function () {
    if (executor !== null) {
      executor.dispose();
      executor = null;
    }

    if (locator !== null) {
      locator.dispose();
      locator = null;
    }

    arch = null;
    platform = null;
    environmentFn = null;
    executableSuffix = null;
    pathkey = null;
    readyFn = null;
  });

  describe('when the environment is process.env', function () {
    it('findExecutablesInPath returns an empty array if its arguments are invalid', function () {
      expect(locator.findExecutablesInPath).toBeDefined();
      expect(locator.findExecutablesInPath(false, false).length).toBe(0);
      expect(locator.findExecutablesInPath('', false).length).toBe(0);
      expect(locator.findExecutablesInPath('abcd', false).length).toBe(0);
      expect(locator.findExecutablesInPath('abcd', { bleh: 'abcd' }).length).toBe(0);
      expect(locator.findExecutablesInPath('abcd', 'abcd').length).toBe(0);
      expect(locator.findExecutablesInPath('abcd', []).length).toBe(0);
      expect(locator.findExecutablesInPath([], []).length).toBe(0);
    });

    it('findExecutablesInPath returns an array with elements if its arguments are valid', function () {
      expect(locator.findExecutablesInPath).toBeDefined();
      if (_os2['default'].platform() === 'win32') {
        expect(locator.findExecutablesInPath('c:\\windows\\system32', ['cmd.exe']).length).toBe(1);
        expect(locator.findExecutablesInPath('c:\\windows\\system32', ['cmd.exe'])[0]).toBe('c:\\windows\\system32\\cmd.exe');
      } else {
        expect(locator.findExecutablesInPath('/bin', ['sh']).length).toBe(1);
        expect(locator.findExecutablesInPath('/bin', ['sh'])[0]).toBe('/bin/sh');
      }
    });
  });

  describe('when the environment has a GOPATH that includes a tilde', function () {
    beforeEach(function () {
      env.GOPATH = _path2['default'].join('~', 'go');
    });

    it('is defined', function () {
      expect(locator).toBeDefined();
      expect(locator).toBeTruthy();
    });

    it('gopath() returns a path with the home directory expanded', function () {
      expect(locator.gopath).toBeDefined();
      expect(locator.gopath()).toBe(_path2['default'].join(_libPathhelper2['default'].home(), 'go'));
    });
  });

  describe('when the environment has an empty GOPATH', function () {
    beforeEach(function () {
      if ((0, _libCheck.isTruthy)(env.GOPATH)) {
        delete env.GOPATH;
      }
    });

    it('gopath() returns false', function () {
      expect(locator.gopath).toBeDefined();
      expect(locator.gopath()).toBe(false);
    });
  });

  describe('when the environment has a GOPATH that is whitespace', function () {
    beforeEach(function () {
      env.GOPATH = '        ';
    });

    it('gopath() returns false', function () {
      expect(locator.gopath).toBeDefined();
      expect(locator.gopath()).toBe(false);
    });
  });

  describe('when the PATH has a single directory with a go runtime in it', function () {
    var godir = null;
    var go = null;
    beforeEach(function () {
      godir = _temp2['default'].mkdirSync('go-');
      go = _path2['default'].join(godir, 'go' + executableSuffix);
      _fsExtra2['default'].writeFileSync(go, '.', { encoding: 'utf8', mode: 511 });
      env[pathkey] = godir;
      env.GOPATH = _path2['default'].join('~', 'go');
    });

    it('runtimeCandidates() finds the runtime', function () {
      expect(locator.runtimeCandidates).toBeDefined();
      var candidates = locator.runtimeCandidates();
      expect(candidates).toBeTruthy();
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0]).toBe(go);
    });
  });

  describe('when GOROOT is set and the go tool is available within $GOROOT/bin', function () {
    var godir = null;
    var go = null;
    var gorootgo = null;
    var gorootdir = null;
    var gorootbindir = null;

    beforeEach(function () {
      gorootdir = _temp2['default'].mkdirSync('goroot-');
      gorootbindir = _path2['default'].join(gorootdir, 'bin');
      _fsExtra2['default'].mkdirSync(gorootbindir);
      gorootgo = _path2['default'].join(gorootbindir, 'go' + executableSuffix);
      godir = _temp2['default'].mkdirSync('go-');
      go = _path2['default'].join(godir, 'go' + executableSuffix);
      _fsExtra2['default'].writeFileSync(gorootgo, '.', { encoding: 'utf8', mode: 511 });
      _fsExtra2['default'].writeFileSync(go, '.', { encoding: 'utf8', mode: 511 });
      env[pathkey] = godir;
      env.GOROOT = gorootdir;
      env.GOPATH = _path2['default'].join('~', 'go');
    });

    afterEach(function () {
      env.GOROOT = '';
    });

    it('runtimeCandidates() finds the runtime and orders the go in $GOROOT/bin before the go in PATH', function () {
      expect(locator.runtimeCandidates).toBeDefined();
      var candidates = locator.runtimeCandidates();
      expect(candidates).toBeTruthy();
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0]).toBe(gorootgo);
      expect(candidates[1]).toBe(go);
    });
  });

  describe('when the PATH has multiple directories with a go runtime in it', function () {
    var godir = null;
    var go1dir = null;
    var go = null;
    var go1 = null;
    beforeEach(function () {
      godir = _temp2['default'].mkdirSync('go-');
      go1dir = _temp2['default'].mkdirSync('go1-');
      go = _path2['default'].join(godir, 'go' + executableSuffix);
      go1 = _path2['default'].join(go1dir, 'go' + executableSuffix);
      _fsExtra2['default'].writeFileSync(go, '.', { encoding: 'utf8', mode: 511 });
      _fsExtra2['default'].writeFileSync(go1, '.', { encoding: 'utf8', mode: 511 });
      env[pathkey] = godir + _path2['default'].delimiter + go1dir;
    });

    it('runtimeCandidates() returns the candidates in the correct order', function () {
      expect(locator.runtimeCandidates).toBeDefined();
      var candidates = locator.runtimeCandidates();
      expect(candidates).toBeTruthy();
      expect(candidates.length).toBeGreaterThan(1);
      expect(candidates[0]).toBe(go);
      expect(candidates[1]).toBe(go1);
    });

    it('runtimeCandidates() returns candidates in the correct order when a candidate occurs multiple times in the path', function () {
      env[pathkey] = godir + _path2['default'].delimiter + go1dir + _path2['default'].delimiter + godir;
      expect(locator.runtimeCandidates).toBeDefined();
      var candidates = locator.runtimeCandidates();
      expect(candidates).toBeTruthy();
      expect(candidates.length).toBeGreaterThan(1);
      expect(candidates[0]).toBe(go);
      expect(candidates[1]).toBe(go1);
      if (candidates.length > 2) {
        expect(candidates[2]).not.toBe(go);
      }
    });
  });

  describe('when the path includes a directory with go 1.5.1 in it', function () {
    var godir = null;
    var gopathdir = null;
    var gorootdir = null;
    var gorootbindir = null;
    var gotooldir = null;
    var go = null;
    var gorootbintools = null;
    var gotooldirtools = null;
    beforeEach(function () {
      gorootbintools = ['go', 'godoc', 'gofmt'];
      gotooldirtools = ['addr2line', 'cgo', 'dist', 'link', 'pack', 'trace', 'api', 'compile', 'doc', 'nm', 'pprof', 'vet', 'asm', 'cover', 'fix', 'objdump', 'yacc'];
      godir = _temp2['default'].mkdirSync('go-');
      gopathdir = _temp2['default'].mkdirSync('gopath-');
      gorootdir = _temp2['default'].mkdirSync('goroot-');
      gorootbindir = _path2['default'].join(gorootdir, 'bin');
      _fsExtra2['default'].mkdirSync(gorootbindir);
      gotooldir = _path2['default'].join(gorootdir, 'pkg', 'tool', platform + '_' + arch);
      _fsExtra2['default'].mkdirsSync(gotooldir);
      var fakeexecutable = 'go_' + platform + '_' + arch + executableSuffix;
      var go151json = _path2['default'].join(__dirname, 'fixtures', 'go-151-' + platform + '.json');
      var fakego = _path2['default'].join(__dirname, 'tools', 'go', fakeexecutable);
      go = _path2['default'].join(gorootbindir, 'go' + executableSuffix);
      _fsExtra2['default'].copySync(fakego, go);
      _fsExtra2['default'].copySync(go151json, _path2['default'].join(gorootbindir, 'go.json'));
      env[pathkey] = godir;
      env['GOPATH'] = gopathdir;
      env['GOROOT'] = gorootdir;
      for (var tool of gorootbintools) {
        if (tool !== 'go') {
          _fsExtra2['default'].writeFileSync(_path2['default'].join(gorootbindir, tool + executableSuffix), '.', { encoding: 'utf8', mode: 511 });
        }
      }
      for (var tool of gotooldirtools) {
        var toolpath = _path2['default'].join(gotooldir, tool + executableSuffix);
        _fsExtra2['default'].writeFileSync(toolpath, '.', { encoding: 'utf8', mode: 511 });
      }
    });

    it('runtimeCandidates() finds the runtime', function () {
      expect(locator.runtimeCandidates).toBeDefined();
      var candidates = locator.runtimeCandidates();
      expect(candidates).toBeTruthy();
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0]).toBe(go);
    });

    it('runtimes() returns the runtime', function () {
      expect(locator.runtimes).toBeDefined();
      var runtimes = null;
      var done = locator.runtimes().then(function (r) {
        runtimes = r;
      });

      waitsForPromise(function () {
        return done;
      });

      runs(function () {
        expect(runtimes).toBeTruthy();
        expect(runtimes.length).toBeGreaterThan(0);
        expect(runtimes[0].name).toBe('go1.5.1');
        expect(runtimes[0].semver).toBe('1.5.1');
        expect(runtimes[0].version).toBe('go version go1.5.1 ' + platform + '/' + arch);
        expect(runtimes[0].path).toBe(go);
        expect(runtimes[0].GOARCH).toBe(arch);
        expect(runtimes[0].GOBIN).toBe('');
        if (platform === 'windows') {
          expect(runtimes[0].GOEXE).toBe('.exe');
        } else {
          expect(runtimes[0].GOEXE).toBe('');
        }
        expect(runtimes[0].GOHOSTARCH).toBe(arch);
        expect(runtimes[0].GOHOSTOS).toBe(platform);
        expect(runtimes[0].GOOS).toBe(platform);
        expect(runtimes[0].GOPATH).toBe(gopathdir);
        expect(runtimes[0].GORACE).toBe('');
        expect(runtimes[0].GOROOT).toBe(gorootdir);
        expect(runtimes[0].GOTOOLDIR).toBe(gotooldir);
        if (platform === 'windows') {
          expect(runtimes[0].CC).toBe('gcc');
          expect(runtimes[0].GOGCCFLAGS).toBe('-m64 -mthreads -fmessage-length=0');
          expect(runtimes[0].CXX).toBe('g++');
        } else if (platform === 'darwin') {
          expect(runtimes[0].CC).toBe('clang');
          expect(runtimes[0].GOGCCFLAGS).toBe('-fPIC -m64 -pthread -fno-caret-diagnostics -Qunused-arguments -fmessage-length=0 -fno-common');
          expect(runtimes[0].CXX).toBe('clang++');
        } else if (_os2['default'].platform() === 'linux') {
          expect(runtimes[0].CC).toBe('gcc');
          expect(runtimes[0].GOGCCFLAGS).toBe('-fPIC -m64 -pthread -fmessage-length=0');
          expect(runtimes[0].CXX).toBe('g++');
        }
        expect(runtimes[0].GO15VENDOREXPERIMENT).toBe('');
        expect(runtimes[0].CGO_ENABLED).toBe('1');
      });
    });

    it('findTool() finds the go tool', function () {
      expect(locator.findTool).toBeDefined();
      var tool = null;
      var err = null;
      var done = locator.findTool('go').then(function (t) {
        tool = t;
      })['catch'](function (e) {
        err = e;
      });

      waitsForPromise(function () {
        return done;
      });

      runs(function () {
        expect(err).toBe(null);
        expect(tool).toBeTruthy();
        expect(tool).toBe(_path2['default'].join(gorootbindir, 'go' + executableSuffix));
      });
    });

    it('findTool() finds tools in GOROOT', function () {
      var tools = ['go', 'godoc', 'gofmt'];
      var runtime = false;
      var tool = null;
      var toolPath = false;
      var done = locator.runtime().then(function (r) {
        runtime = r;
      });

      waitsForPromise(function () {
        return done;
      });

      runs(function () {
        for (var toolItem of tools) {
          tool = null;
          done = null;
          toolPath = _path2['default'].join(runtime.GOROOT, 'bin', toolItem + runtime.GOEXE);
          done = locator.findTool(toolItem).then(function (t) {
            tool = t;
          });
          waitsForPromise(function () {
            return done;
          });

          runs(function () {
            expect(tool).toBeTruthy();
            expect(tool).toBe(toolPath);
          });
        }
      });
    });

    it('stat() returns false for nonexistent files', function () {
      var stat = null;
      var done = locator.stat('nonexistentthing').then(function (s) {
        stat = s;
      });
      waitsForPromise(function () {
        return done;
      });

      runs(function () {
        expect(stat).toBe(false);
      });
    });

    it('findTool() finds tools in GOTOOLDIR', function () {
      var tools = ['addr2line', 'cgo', 'dist', 'link', 'pack', 'trace', 'api', 'compile', 'doc', 'nm', 'pprof', 'vet', 'asm', 'cover', 'fix', 'objdump', 'yacc'];
      var runtime = false;
      var done = locator.runtime().then(function (r) {
        runtime = r;
      });

      waitsForPromise(function () {
        return done;
      });

      runs(function () {
        var _loop = function (toolItem) {
          var tool = null;
          var toolPath = _path2['default'].join(runtime.GOTOOLDIR, toolItem + runtime.GOEXE);
          var done = locator.findTool(toolItem).then(function (t) {
            tool = t;
          });
          waitsForPromise(function () {
            return done;
          });

          runs(function () {
            expect(tool).toBeTruthy();
            expect(tool).toBe(toolPath);
          });
        };

        for (var toolItem of tools) {
          _loop(toolItem);
        }
      });
    });
  });

  describe('when the path includes a directory with the gometalinter tool in it', function () {
    var gopathdir = null;
    var gopathbindir = null;
    var pathdir = null;
    var pathtools = null;
    var gopathbintools = null;
    beforeEach(function () {
      pathtools = ['gometalinter', 'gb'];
      gopathbintools = ['somerandomtool', 'gb'];
      pathdir = _temp2['default'].mkdirSync('path-');
      gopathdir = _temp2['default'].mkdirSync('gopath-');
      gopathbindir = _path2['default'].join(gopathdir, 'bin');
      _fsExtra2['default'].mkdirSync(gopathbindir);
      env['GOPATH'] = gopathdir;
      env[pathkey] = pathdir + _path2['default'].delimiter + env['PATH'];
      for (var tool of pathtools) {
        _fsExtra2['default'].writeFileSync(_path2['default'].join(pathdir, tool + executableSuffix), '.', { encoding: 'utf8', mode: 511 });
      }
      for (var tool of gopathbintools) {
        _fsExtra2['default'].writeFileSync(_path2['default'].join(gopathbindir, tool + executableSuffix), '.', { encoding: 'utf8', mode: 511 });
      }
    });

    it('findTool() finds tools in PATH', function () {
      runs(function () {
        var _loop2 = function (toolItem) {
          var toolPath = false;
          var tool = null;
          var done = null;

          if (gopathbintools.indexOf(toolItem) !== -1) {
            toolPath = _path2['default'].join(gopathbindir, toolItem + executableSuffix);
          } else {
            toolPath = _path2['default'].join(pathdir, toolItem + executableSuffix);
          }

          done = locator.findTool(toolItem).then(function (t) {
            tool = t;
          });
          waitsForPromise(function () {
            return done;
          });
          runs(function () {
            done = null;
            expect(tool).toBeTruthy();
            expect(tool).toBe(toolPath);
          });
        };

        for (var toolItem of pathtools) {
          _loop2(toolItem);
        }
      });
    });

    it('findTool() finds tools in GOPATH\'s bin directory', function () {
      runs(function () {
        var _loop3 = function (toolItem) {
          var tool = null;
          var toolPath = false;
          var done = null;
          toolPath = _path2['default'].join(gopathbindir, toolItem + executableSuffix);
          done = locator.findTool(toolItem).then(function (t) {
            tool = t;
          });
          waitsForPromise(function () {
            return done;
          });
          runs(function () {
            expect(tool).toBeTruthy();
            expect(tool).toBe(toolPath);
          });
        };

        for (var toolItem of gopathbintools) {
          _loop3(toolItem);
        }
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1jb25maWcvc3BlYy9sb2NhdG9yLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt3QkFHdUIsZ0JBQWdCOzsyQkFDaEIsbUJBQW1COzs2QkFDbkIscUJBQXFCOzs7OzBCQUN0QixrQkFBa0I7O29CQUN2QixNQUFNOzs7O3VCQUNSLFVBQVU7Ozs7a0JBQ1YsSUFBSTs7OztvQkFDRixNQUFNOzs7O0FBVnZCLFdBQVcsQ0FBQTs7QUFZWCxRQUFRLENBQUMsU0FBUyxFQUFFLFlBQU07QUFDeEIsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFBO0FBQ2QsTUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3hCLE1BQUksUUFBUSxHQUFHLElBQUksQ0FBQTtBQUNuQixNQUFJLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDbkIsTUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2YsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7QUFDM0IsTUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLE1BQUksT0FBTyxHQUFHLElBQUksQ0FBQTtBQUNsQixNQUFJLE9BQU8sR0FBRyxJQUFJLENBQUE7O0FBRWxCLFlBQVUsQ0FBQyxZQUFNO0FBQ2Ysc0JBQUssS0FBSyxFQUFFLENBQUE7QUFDWixPQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3BDLFFBQUksd0JBQVMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3hCLGFBQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQTtLQUNsQjtBQUNELGlCQUFhLEdBQUcsWUFBTTtBQUNwQixhQUFPLEdBQUcsQ0FBQTtLQUNYLENBQUE7QUFDRCxXQUFPLEdBQUcsWUFBTTtBQUFFLGFBQU8sSUFBSSxDQUFBO0tBQUUsQ0FBQTtBQUMvQixZQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQTtBQUMzQixR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QUssU0FBUyxFQUFFO0FBQzFCLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUN2QyxNQUFNO0FBQ0wsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ25DO0FBQ0QsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDekMsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0MsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdkMsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDMUMsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDbkMsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDMUMsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDN0MsWUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNsQyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxD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LmF0b20vcGFja2FnZXMvZ28tY29uZmlnL3NwZWMvbG9jYXRvci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5pbXBvcnQge2lzVHJ1dGh5fSBmcm9tICcuLy4uL2xpYi9jaGVjaydcbmltcG9ydCB7RXhlY3V0b3J9IGZyb20gJy4vLi4vbGliL2V4ZWN1dG9yJ1xuaW1wb3J0IHBhdGhoZWxwZXIgZnJvbSAnLi8uLi9saWIvcGF0aGhlbHBlcidcbmltcG9ydCB7TG9jYXRvcn0gZnJvbSAnLi8uLi9saWIvbG9jYXRvcidcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5kZXNjcmliZSgnTG9jYXRvcicsICgpID0+IHtcbiAgbGV0IGVudiA9IG51bGxcbiAgbGV0IGVudmlyb25tZW50Rm4gPSBudWxsXG4gIGxldCBleGVjdXRvciA9IG51bGxcbiAgbGV0IHBsYXRmb3JtID0gbnVsbFxuICBsZXQgYXJjaCA9IG51bGxcbiAgbGV0IGV4ZWN1dGFibGVTdWZmaXggPSBudWxsXG4gIGxldCBwYXRoa2V5ID0gbnVsbFxuICBsZXQgcmVhZHlGbiA9IG51bGxcbiAgbGV0IGxvY2F0b3IgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdGVtcC50cmFjaygpXG4gICAgZW52ID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYpXG4gICAgaWYgKGlzVHJ1dGh5KGVudi5HT1JPT1QpKSB7XG4gICAgICBkZWxldGUgZW52LkdPUk9PVFxuICAgIH1cbiAgICBlbnZpcm9ubWVudEZuID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIGVudlxuICAgIH1cbiAgICByZWFkeUZuID0gKCkgPT4geyByZXR1cm4gdHJ1ZSB9XG4gICAgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtXG4gICAgaWYgKHByb2Nlc3MuYXJjaCA9PT0gJ2FybScpIHtcbiAgICAgIGFyY2ggPSAnYXJtJ1xuICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5hcmNoID09PSAnaWEzMicpIHtcbiAgICAgIC8vIFVnaCwgQXRvbSBpcyAzMi1iaXQgb24gV2luZG93cy4uLiBmb3Igbm93LlxuICAgICAgaWYgKHBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgICAgIGFyY2ggPSAnYW1kNjQnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmNoID0gJzM4NidcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJjaCA9ICdhbWQ2NCdcbiAgICB9XG4gICAgZXhlY3V0b3IgPSBuZXcgRXhlY3V0b3Ioe2Vudmlyb25tZW50Rm46IGVudmlyb25tZW50Rm59KVxuICAgIGV4ZWN1dGFibGVTdWZmaXggPSAnJ1xuICAgIHBhdGhrZXkgPSAnUEFUSCdcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuICAgICAgcGxhdGZvcm0gPSAnd2luZG93cydcbiAgICAgIGV4ZWN1dGFibGVTdWZmaXggPSAnLmV4ZSdcbiAgICAgIHBhdGhrZXkgPSAnUGF0aCdcbiAgICB9XG5cbiAgICBsb2NhdG9yID0gbmV3IExvY2F0b3Ioe1xuICAgICAgZW52aXJvbm1lbnQ6IGVudmlyb25tZW50Rm4sXG4gICAgICBleGVjdXRvcjogZXhlY3V0b3IsXG4gICAgICByZWFkeTogcmVhZHlGblxuICAgIH0pXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICBpZiAoZXhlY3V0b3IgIT09IG51bGwpIHtcbiAgICAgIGV4ZWN1dG9yLmRpc3Bvc2UoKVxuICAgICAgZXhlY3V0b3IgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKGxvY2F0b3IgIT09IG51bGwpIHtcbiAgICAgIGxvY2F0b3IuZGlzcG9zZSgpXG4gICAgICBsb2NhdG9yID0gbnVsbFxuICAgIH1cblxuICAgIGFyY2ggPSBudWxsXG4gICAgcGxhdGZvcm0gPSBudWxsXG4gICAgZW52aXJvbm1lbnRGbiA9IG51bGxcbiAgICBleGVjdXRhYmxlU3VmZml4ID0gbnVsbFxuICAgIHBhdGhrZXkgPSBudWxsXG4gICAgcmVhZHlGbiA9IG51bGxcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiB0aGUgZW52aXJvbm1lbnQgaXMgcHJvY2Vzcy5lbnYnLCAoKSA9PiB7XG4gICAgaXQoJ2ZpbmRFeGVjdXRhYmxlc0luUGF0aCByZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIGl0cyBhcmd1bWVudHMgYXJlIGludmFsaWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobG9jYXRvci5maW5kRXhlY3V0YWJsZXNJblBhdGgpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChsb2NhdG9yLmZpbmRFeGVjdXRhYmxlc0luUGF0aChmYWxzZSwgZmFsc2UpLmxlbmd0aCkudG9CZSgwKVxuICAgICAgZXhwZWN0KGxvY2F0b3IuZmluZEV4ZWN1dGFibGVzSW5QYXRoKCcnLCBmYWxzZSkubGVuZ3RoKS50b0JlKDApXG4gICAgICBleHBlY3QobG9jYXRvci5maW5kRXhlY3V0YWJsZXNJblBhdGgoJ2FiY2QnLCBmYWxzZSkubGVuZ3RoKS50b0JlKDApXG4gICAgICBleHBlY3QobG9jYXRvci5maW5kRXhlY3V0YWJsZXNJblBhdGgoJ2FiY2QnLCB7YmxlaDogJ2FiY2QnfSkubGVuZ3RoKS50b0JlKDApXG4gICAgICBleHBlY3QobG9jYXRvci5maW5kRXhlY3V0YWJsZXNJblBhdGgoJ2FiY2QnLCAnYWJjZCcpLmxlbmd0aCkudG9CZSgwKVxuICAgICAgZXhwZWN0KGxvY2F0b3IuZmluZEV4ZWN1dGFibGVzSW5QYXRoKCdhYmNkJywgW10pLmxlbmd0aCkudG9CZSgwKVxuICAgICAgZXhwZWN0KGxvY2F0b3IuZmluZEV4ZWN1dGFibGVzSW5QYXRoKFtdLCBbXSkubGVuZ3RoKS50b0JlKDApXG4gICAgfSlcblxuICAgIGl0KCdmaW5kRXhlY3V0YWJsZXNJblBhdGggcmV0dXJucyBhbiBhcnJheSB3aXRoIGVsZW1lbnRzIGlmIGl0cyBhcmd1bWVudHMgYXJlIHZhbGlkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGxvY2F0b3IuZmluZEV4ZWN1dGFibGVzSW5QYXRoKS50b0JlRGVmaW5lZCgpXG4gICAgICBpZiAob3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJykge1xuICAgICAgICBleHBlY3QobG9jYXRvci5maW5kRXhlY3V0YWJsZXNJblBhdGgoJ2M6XFxcXHdpbmRvd3NcXFxcc3lzdGVtMzInLCBbJ2NtZC5leGUnXSkubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgIGV4cGVjdChsb2NhdG9yLmZpbmRFeGVjdXRhYmxlc0luUGF0aCgnYzpcXFxcd2luZG93c1xcXFxzeXN0ZW0zMicsIFsnY21kLmV4ZSddKVswXSkudG9CZSgnYzpcXFxcd2luZG93c1xcXFxzeXN0ZW0zMlxcXFxjbWQuZXhlJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4cGVjdChsb2NhdG9yLmZpbmRFeGVjdXRhYmxlc0luUGF0aCgnL2JpbicsIFsnc2gnXSkubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgIGV4cGVjdChsb2NhdG9yLmZpbmRFeGVjdXRhYmxlc0luUGF0aCgnL2JpbicsIFsnc2gnXSlbMF0pLnRvQmUoJy9iaW4vc2gnKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIGVudmlyb25tZW50IGhhcyBhIEdPUEFUSCB0aGF0IGluY2x1ZGVzIGEgdGlsZGUnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlbnYuR09QQVRIID0gcGF0aC5qb2luKCd+JywgJ2dvJylcbiAgICB9KVxuXG4gICAgaXQoJ2lzIGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobG9jYXRvcikudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KGxvY2F0b3IpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG5cbiAgICBpdCgnZ29wYXRoKCkgcmV0dXJucyBhIHBhdGggd2l0aCB0aGUgaG9tZSBkaXJlY3RvcnkgZXhwYW5kZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobG9jYXRvci5nb3BhdGgpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChsb2NhdG9yLmdvcGF0aCgpKS50b0JlKHBhdGguam9pbihwYXRoaGVscGVyLmhvbWUoKSwgJ2dvJykpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiB0aGUgZW52aXJvbm1lbnQgaGFzIGFuIGVtcHR5IEdPUEFUSCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGlmIChpc1RydXRoeShlbnYuR09QQVRIKSkge1xuICAgICAgICBkZWxldGUgZW52LkdPUEFUSFxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpdCgnZ29wYXRoKCkgcmV0dXJucyBmYWxzZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChsb2NhdG9yLmdvcGF0aCkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KGxvY2F0b3IuZ29wYXRoKCkpLnRvQmUoZmFsc2UpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiB0aGUgZW52aXJvbm1lbnQgaGFzIGEgR09QQVRIIHRoYXQgaXMgd2hpdGVzcGFjZScsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGVudi5HT1BBVEggPSAnICAgICAgICAnXG4gICAgfSlcblxuICAgIGl0KCdnb3BhdGgoKSByZXR1cm5zIGZhbHNlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGxvY2F0b3IuZ29wYXRoKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QobG9jYXRvci5nb3BhdGgoKSkudG9CZShmYWxzZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHRoZSBQQVRIIGhhcyBhIHNpbmdsZSBkaXJlY3Rvcnkgd2l0aCBhIGdvIHJ1bnRpbWUgaW4gaXQnLCAoKSA9PiB7XG4gICAgbGV0IGdvZGlyID0gbnVsbFxuICAgIGxldCBnbyA9IG51bGxcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGdvZGlyID0gdGVtcC5ta2RpclN5bmMoJ2dvLScpXG4gICAgICBnbyA9IHBhdGguam9pbihnb2RpciwgJ2dvJyArIGV4ZWN1dGFibGVTdWZmaXgpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGdvLCAnLicsIHtlbmNvZGluZzogJ3V0ZjgnLCBtb2RlOiA1MTF9KVxuICAgICAgZW52W3BhdGhrZXldID0gZ29kaXJcbiAgICAgIGVudi5HT1BBVEggPSBwYXRoLmpvaW4oJ34nLCAnZ28nKVxuICAgIH0pXG5cbiAgICBpdCgncnVudGltZUNhbmRpZGF0ZXMoKSBmaW5kcyB0aGUgcnVudGltZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChsb2NhdG9yLnJ1bnRpbWVDYW5kaWRhdGVzKS50b0JlRGVmaW5lZCgpXG4gICAgICBsZXQgY2FuZGlkYXRlcyA9IGxvY2F0b3IucnVudGltZUNhbmRpZGF0ZXMoKVxuICAgICAgZXhwZWN0KGNhbmRpZGF0ZXMpLnRvQmVUcnV0aHkoKVxuICAgICAgZXhwZWN0KGNhbmRpZGF0ZXMubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMClcbiAgICAgIGV4cGVjdChjYW5kaWRhdGVzWzBdKS50b0JlKGdvKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gR09ST09UIGlzIHNldCBhbmQgdGhlIGdvIHRvb2wgaXMgYXZhaWxhYmxlIHdpdGhpbiAkR09ST09UL2JpbicsICgpID0+IHtcbiAgICBsZXQgZ29kaXIgPSBudWxsXG4gICAgbGV0IGdvID0gbnVsbFxuICAgIGxldCBnb3Jvb3RnbyA9IG51bGxcbiAgICBsZXQgZ29yb290ZGlyID0gbnVsbFxuICAgIGxldCBnb3Jvb3RiaW5kaXIgPSBudWxsXG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGdvcm9vdGRpciA9IHRlbXAubWtkaXJTeW5jKCdnb3Jvb3QtJylcbiAgICAgIGdvcm9vdGJpbmRpciA9IHBhdGguam9pbihnb3Jvb3RkaXIsICdiaW4nKVxuICAgICAgZnMubWtkaXJTeW5jKGdvcm9vdGJpbmRpcilcbiAgICAgIGdvcm9vdGdvID0gcGF0aC5qb2luKGdvcm9vdGJpbmRpciwgJ2dvJyArIGV4ZWN1dGFibGVTdWZmaXgpXG4gICAgICBnb2RpciA9IHRlbXAubWtkaXJTeW5jKCdnby0nKVxuICAgICAgZ28gPSBwYXRoLmpvaW4oZ29kaXIsICdnbycgKyBleGVjdXRhYmxlU3VmZml4KVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhnb3Jvb3RnbywgJy4nLCB7ZW5jb2Rpbmc6ICd1dGY4JywgbW9kZTogNTExfSlcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZ28sICcuJywge2VuY29kaW5nOiAndXRmOCcsIG1vZGU6IDUxMX0pXG4gICAgICBlbnZbcGF0aGtleV0gPSBnb2RpclxuICAgICAgZW52LkdPUk9PVCA9IGdvcm9vdGRpclxuICAgICAgZW52LkdPUEFUSCA9IHBhdGguam9pbignficsICdnbycpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICBlbnYuR09ST09UID0gJydcbiAgICB9KVxuXG4gICAgaXQoJ3J1bnRpbWVDYW5kaWRhdGVzKCkgZmluZHMgdGhlIHJ1bnRpbWUgYW5kIG9yZGVycyB0aGUgZ28gaW4gJEdPUk9PVC9iaW4gYmVmb3JlIHRoZSBnbyBpbiBQQVRIJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGxvY2F0b3IucnVudGltZUNhbmRpZGF0ZXMpLnRvQmVEZWZpbmVkKClcbiAgICAgIGxldCBjYW5kaWRhdGVzID0gbG9jYXRvci5ydW50aW1lQ2FuZGlkYXRlcygpXG4gICAgICBleHBlY3QoY2FuZGlkYXRlcykudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QoY2FuZGlkYXRlcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuICAgICAgZXhwZWN0KGNhbmRpZGF0ZXNbMF0pLnRvQmUoZ29yb290Z28pXG4gICAgICBleHBlY3QoY2FuZGlkYXRlc1sxXSkudG9CZShnbylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHRoZSBQQVRIIGhhcyBtdWx0aXBsZSBkaXJlY3RvcmllcyB3aXRoIGEgZ28gcnVudGltZSBpbiBpdCcsICgpID0+IHtcbiAgICBsZXQgZ29kaXIgPSBudWxsXG4gICAgbGV0IGdvMWRpciA9IG51bGxcbiAgICBsZXQgZ28gPSBudWxsXG4gICAgbGV0IGdvMSA9IG51bGxcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGdvZGlyID0gdGVtcC5ta2RpclN5bmMoJ2dvLScpXG4gICAgICBnbzFkaXIgPSB0ZW1wLm1rZGlyU3luYygnZ28xLScpXG4gICAgICBnbyA9IHBhdGguam9pbihnb2RpciwgJ2dvJyArIGV4ZWN1dGFibGVTdWZmaXgpXG4gICAgICBnbzEgPSBwYXRoLmpvaW4oZ28xZGlyLCAnZ28nICsgZXhlY3V0YWJsZVN1ZmZpeClcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZ28sICcuJywge2VuY29kaW5nOiAndXRmOCcsIG1vZGU6IDUxMX0pXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGdvMSwgJy4nLCB7ZW5jb2Rpbmc6ICd1dGY4JywgbW9kZTogNTExfSlcbiAgICAgIGVudltwYXRoa2V5XSA9IGdvZGlyICsgcGF0aC5kZWxpbWl0ZXIgKyBnbzFkaXJcbiAgICB9KVxuXG4gICAgaXQoJ3J1bnRpbWVDYW5kaWRhdGVzKCkgcmV0dXJucyB0aGUgY2FuZGlkYXRlcyBpbiB0aGUgY29ycmVjdCBvcmRlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChsb2NhdG9yLnJ1bnRpbWVDYW5kaWRhdGVzKS50b0JlRGVmaW5lZCgpXG4gICAgICBsZXQgY2FuZGlkYXRlcyA9IGxvY2F0b3IucnVudGltZUNhbmRpZGF0ZXMoKVxuICAgICAgZXhwZWN0KGNhbmRpZGF0ZXMpLnRvQmVUcnV0aHkoKVxuICAgICAgZXhwZWN0KGNhbmRpZGF0ZXMubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMSlcbiAgICAgIGV4cGVjdChjYW5kaWRhdGVzWzBdKS50b0JlKGdvKVxuICAgICAgZXhwZWN0KGNhbmRpZGF0ZXNbMV0pLnRvQmUoZ28xKVxuICAgIH0pXG5cbiAgICBpdCgncnVudGltZUNhbmRpZGF0ZXMoKSByZXR1cm5zIGNhbmRpZGF0ZXMgaW4gdGhlIGNvcnJlY3Qgb3JkZXIgd2hlbiBhIGNhbmRpZGF0ZSBvY2N1cnMgbXVsdGlwbGUgdGltZXMgaW4gdGhlIHBhdGgnLCAoKSA9PiB7XG4gICAgICBlbnZbcGF0aGtleV0gPSBnb2RpciArIHBhdGguZGVsaW1pdGVyICsgZ28xZGlyICsgcGF0aC5kZWxpbWl0ZXIgKyBnb2RpclxuICAgICAgZXhwZWN0KGxvY2F0b3IucnVudGltZUNhbmRpZGF0ZXMpLnRvQmVEZWZpbmVkKClcbiAgICAgIGxldCBjYW5kaWRhdGVzID0gbG9jYXRvci5ydW50aW1lQ2FuZGlkYXRlcygpXG4gICAgICBleHBlY3QoY2FuZGlkYXRlcykudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QoY2FuZGlkYXRlcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigxKVxuICAgICAgZXhwZWN0KGNhbmRpZGF0ZXNbMF0pLnRvQmUoZ28pXG4gICAgICBleHBlY3QoY2FuZGlkYXRlc1sxXSkudG9CZShnbzEpXG4gICAgICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgIGV4cGVjdChjYW5kaWRhdGVzWzJdKS5ub3QudG9CZShnbylcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHRoZSBwYXRoIGluY2x1ZGVzIGEgZGlyZWN0b3J5IHdpdGggZ28gMS41LjEgaW4gaXQnLCAoKSA9PiB7XG4gICAgbGV0IGdvZGlyID0gbnVsbFxuICAgIGxldCBnb3BhdGhkaXIgPSBudWxsXG4gICAgbGV0IGdvcm9vdGRpciA9IG51bGxcbiAgICBsZXQgZ29yb290YmluZGlyID0gbnVsbFxuICAgIGxldCBnb3Rvb2xkaXIgPSBudWxsXG4gICAgbGV0IGdvID0gbnVsbFxuICAgIGxldCBnb3Jvb3RiaW50b29scyA9IG51bGxcbiAgICBsZXQgZ290b29sZGlydG9vbHMgPSBudWxsXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBnb3Jvb3RiaW50b29scyA9IFsnZ28nLCAnZ29kb2MnLCAnZ29mbXQnXVxuICAgICAgZ290b29sZGlydG9vbHMgPSBbJ2FkZHIybGluZScsICdjZ28nLCAnZGlzdCcsICdsaW5rJywgJ3BhY2snLCAndHJhY2UnLCAnYXBpJywgJ2NvbXBpbGUnLCAnZG9jJywgJ25tJywgJ3Bwcm9mJywgJ3ZldCcsICdhc20nLCAnY292ZXInLCAnZml4JywgJ29iamR1bXAnLCAneWFjYyddXG4gICAgICBnb2RpciA9IHRlbXAubWtkaXJTeW5jKCdnby0nKVxuICAgICAgZ29wYXRoZGlyID0gdGVtcC5ta2RpclN5bmMoJ2dvcGF0aC0nKVxuICAgICAgZ29yb290ZGlyID0gdGVtcC5ta2RpclN5bmMoJ2dvcm9vdC0nKVxuICAgICAgZ29yb290YmluZGlyID0gcGF0aC5qb2luKGdvcm9vdGRpciwgJ2JpbicpXG4gICAgICBmcy5ta2RpclN5bmMoZ29yb290YmluZGlyKVxuICAgICAgZ290b29sZGlyID0gcGF0aC5qb2luKGdvcm9vdGRpciwgJ3BrZycsICd0b29sJywgcGxhdGZvcm0gKyAnXycgKyBhcmNoKVxuICAgICAgZnMubWtkaXJzU3luYyhnb3Rvb2xkaXIpXG4gICAgICBsZXQgZmFrZWV4ZWN1dGFibGUgPSAnZ29fJyArIHBsYXRmb3JtICsgJ18nICsgYXJjaCArIGV4ZWN1dGFibGVTdWZmaXhcbiAgICAgIGxldCBnbzE1MWpzb24gPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnLCAnZ28tMTUxLScgKyBwbGF0Zm9ybSArICcuanNvbicpXG4gICAgICBsZXQgZmFrZWdvID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ3Rvb2xzJywgJ2dvJywgZmFrZWV4ZWN1dGFibGUpXG4gICAgICBnbyA9IHBhdGguam9pbihnb3Jvb3RiaW5kaXIsICdnbycgKyBleGVjdXRhYmxlU3VmZml4KVxuICAgICAgZnMuY29weVN5bmMoZmFrZWdvLCBnbylcbiAgICAgIGZzLmNvcHlTeW5jKGdvMTUxanNvbiwgcGF0aC5qb2luKGdvcm9vdGJpbmRpciwgJ2dvLmpzb24nKSlcbiAgICAgIGVudltwYXRoa2V5XSA9IGdvZGlyXG4gICAgICBlbnZbJ0dPUEFUSCddID0gZ29wYXRoZGlyXG4gICAgICBlbnZbJ0dPUk9PVCddID0gZ29yb290ZGlyXG4gICAgICBmb3IgKGxldCB0b29sIG9mIGdvcm9vdGJpbnRvb2xzKSB7XG4gICAgICAgIGlmICh0b29sICE9PSAnZ28nKSB7XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oZ29yb290YmluZGlyLCB0b29sICsgZXhlY3V0YWJsZVN1ZmZpeCksICcuJywge2VuY29kaW5nOiAndXRmOCcsIG1vZGU6IDUxMX0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAobGV0IHRvb2wgb2YgZ290b29sZGlydG9vbHMpIHtcbiAgICAgICAgbGV0IHRvb2xwYXRoID0gcGF0aC5qb2luKGdvdG9vbGRpciwgdG9vbCArIGV4ZWN1dGFibGVTdWZmaXgpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmModG9vbHBhdGgsICcuJywge2VuY29kaW5nOiAndXRmOCcsIG1vZGU6IDUxMX0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIGl0KCdydW50aW1lQ2FuZGlkYXRlcygpIGZpbmRzIHRoZSBydW50aW1lJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGxvY2F0b3IucnVudGltZUNhbmRpZGF0ZXMpLnRvQmVEZWZpbmVkKClcbiAgICAgIGxldCBjYW5kaWRhdGVzID0gbG9jYXRvci5ydW50aW1lQ2FuZGlkYXRlcygpXG4gICAgICBleHBlY3QoY2FuZGlkYXRlcykudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QoY2FuZGlkYXRlcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuICAgICAgZXhwZWN0KGNhbmRpZGF0ZXNbMF0pLnRvQmUoZ28pXG4gICAgfSlcblxuICAgIGl0KCdydW50aW1lcygpIHJldHVybnMgdGhlIHJ1bnRpbWUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobG9jYXRvci5ydW50aW1lcykudG9CZURlZmluZWQoKVxuICAgICAgbGV0IHJ1bnRpbWVzID0gbnVsbFxuICAgICAgbGV0IGRvbmUgPSBsb2NhdG9yLnJ1bnRpbWVzKCkudGhlbigocikgPT4geyBydW50aW1lcyA9IHIgfSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHsgcmV0dXJuIGRvbmUgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChydW50aW1lcykudG9CZVRydXRoeSgpXG4gICAgICAgIGV4cGVjdChydW50aW1lcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuICAgICAgICBleHBlY3QocnVudGltZXNbMF0ubmFtZSkudG9CZSgnZ28xLjUuMScpXG4gICAgICAgIGV4cGVjdChydW50aW1lc1swXS5zZW12ZXIpLnRvQmUoJzEuNS4xJylcbiAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLnZlcnNpb24pLnRvQmUoJ2dvIHZlcnNpb24gZ28xLjUuMSAnICsgcGxhdGZvcm0gKyAnLycgKyBhcmNoKVxuICAgICAgICBleHBlY3QocnVudGltZXNbMF0ucGF0aCkudG9CZShnbylcbiAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkdPQVJDSCkudG9CZShhcmNoKVxuICAgICAgICBleHBlY3QocnVudGltZXNbMF0uR09CSU4pLnRvQmUoJycpXG4gICAgICAgIGlmIChwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnKSB7XG4gICAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkdPRVhFKS50b0JlKCcuZXhlJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHBlY3QocnVudGltZXNbMF0uR09FWEUpLnRvQmUoJycpXG4gICAgICAgIH1cbiAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkdPSE9TVEFSQ0gpLnRvQmUoYXJjaClcbiAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkdPSE9TVE9TKS50b0JlKHBsYXRmb3JtKVxuICAgICAgICBleHBlY3QocnVudGltZXNbMF0uR09PUykudG9CZShwbGF0Zm9ybSlcbiAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkdPUEFUSCkudG9CZShnb3BhdGhkaXIpXG4gICAgICAgIGV4cGVjdChydW50aW1lc1swXS5HT1JBQ0UpLnRvQmUoJycpXG4gICAgICAgIGV4cGVjdChydW50aW1lc1swXS5HT1JPT1QpLnRvQmUoZ29yb290ZGlyKVxuICAgICAgICBleHBlY3QocnVudGltZXNbMF0uR09UT09MRElSKS50b0JlKGdvdG9vbGRpcilcbiAgICAgICAgaWYgKHBsYXRmb3JtID09PSAnd2luZG93cycpIHtcbiAgICAgICAgICBleHBlY3QocnVudGltZXNbMF0uQ0MpLnRvQmUoJ2djYycpXG4gICAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkdPR0NDRkxBR1MpLnRvQmUoJy1tNjQgLW10aHJlYWRzIC1mbWVzc2FnZS1sZW5ndGg9MCcpXG4gICAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkNYWCkudG9CZSgnZysrJylcbiAgICAgICAgfSBlbHNlIGlmIChwbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAgICAgICBleHBlY3QocnVudGltZXNbMF0uQ0MpLnRvQmUoJ2NsYW5nJylcbiAgICAgICAgICBleHBlY3QocnVudGltZXNbMF0uR09HQ0NGTEFHUykudG9CZSgnLWZQSUMgLW02NCAtcHRocmVhZCAtZm5vLWNhcmV0LWRpYWdub3N0aWNzIC1RdW51c2VkLWFyZ3VtZW50cyAtZm1lc3NhZ2UtbGVuZ3RoPTAgLWZuby1jb21tb24nKVxuICAgICAgICAgIGV4cGVjdChydW50aW1lc1swXS5DWFgpLnRvQmUoJ2NsYW5nKysnKVxuICAgICAgICB9IGVsc2UgaWYgKG9zLnBsYXRmb3JtKCkgPT09ICdsaW51eCcpIHtcbiAgICAgICAgICBleHBlY3QocnVudGltZXNbMF0uQ0MpLnRvQmUoJ2djYycpXG4gICAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkdPR0NDRkxBR1MpLnRvQmUoJy1mUElDIC1tNjQgLXB0aHJlYWQgLWZtZXNzYWdlLWxlbmd0aD0wJylcbiAgICAgICAgICBleHBlY3QocnVudGltZXNbMF0uQ1hYKS50b0JlKCdnKysnKVxuICAgICAgICB9XG4gICAgICAgIGV4cGVjdChydW50aW1lc1swXS5HTzE1VkVORE9SRVhQRVJJTUVOVCkudG9CZSgnJylcbiAgICAgICAgZXhwZWN0KHJ1bnRpbWVzWzBdLkNHT19FTkFCTEVEKS50b0JlKCcxJylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdmaW5kVG9vbCgpIGZpbmRzIHRoZSBnbyB0b29sJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGxvY2F0b3IuZmluZFRvb2wpLnRvQmVEZWZpbmVkKClcbiAgICAgIGxldCB0b29sID0gbnVsbFxuICAgICAgbGV0IGVyciA9IG51bGxcbiAgICAgIGxldCBkb25lID0gbG9jYXRvci5maW5kVG9vbCgnZ28nKS50aGVuKCh0KSA9PiB7IHRvb2wgPSB0IH0pLmNhdGNoKChlKSA9PiB7IGVyciA9IGUgfSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHsgcmV0dXJuIGRvbmUgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChlcnIpLnRvQmUobnVsbClcbiAgICAgICAgZXhwZWN0KHRvb2wpLnRvQmVUcnV0aHkoKVxuICAgICAgICBleHBlY3QodG9vbCkudG9CZShwYXRoLmpvaW4oZ29yb290YmluZGlyLCAnZ28nICsgZXhlY3V0YWJsZVN1ZmZpeCkpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnZmluZFRvb2woKSBmaW5kcyB0b29scyBpbiBHT1JPT1QnLCAoKSA9PiB7XG4gICAgICBsZXQgdG9vbHMgPSBbJ2dvJywgJ2dvZG9jJywgJ2dvZm10J11cbiAgICAgIGxldCBydW50aW1lID0gZmFsc2VcbiAgICAgIGxldCB0b29sID0gbnVsbFxuICAgICAgbGV0IHRvb2xQYXRoID0gZmFsc2VcbiAgICAgIGxldCBkb25lID0gbG9jYXRvci5ydW50aW1lKCkudGhlbigocikgPT4geyBydW50aW1lID0gciB9KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gZG9uZSB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZm9yIChsZXQgdG9vbEl0ZW0gb2YgdG9vbHMpIHtcbiAgICAgICAgICB0b29sID0gbnVsbFxuICAgICAgICAgIGRvbmUgPSBudWxsXG4gICAgICAgICAgdG9vbFBhdGggPSBwYXRoLmpvaW4ocnVudGltZS5HT1JPT1QsICdiaW4nLCB0b29sSXRlbSArIHJ1bnRpbWUuR09FWEUpXG4gICAgICAgICAgZG9uZSA9IGxvY2F0b3IuZmluZFRvb2wodG9vbEl0ZW0pLnRoZW4oKHQpID0+IHsgdG9vbCA9IHQgfSlcbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gZG9uZSB9KVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QodG9vbCkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICBleHBlY3QodG9vbCkudG9CZSh0b29sUGF0aClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc3RhdCgpIHJldHVybnMgZmFsc2UgZm9yIG5vbmV4aXN0ZW50IGZpbGVzJywgKCkgPT4ge1xuICAgICAgbGV0IHN0YXQgPSBudWxsXG4gICAgICBsZXQgZG9uZSA9IGxvY2F0b3Iuc3RhdCgnbm9uZXhpc3RlbnR0aGluZycpLnRoZW4oKHMpID0+IHsgc3RhdCA9IHMgfSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7IHJldHVybiBkb25lIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3Qoc3RhdCkudG9CZShmYWxzZSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdmaW5kVG9vbCgpIGZpbmRzIHRvb2xzIGluIEdPVE9PTERJUicsICgpID0+IHtcbiAgICAgIGxldCB0b29scyA9IFsnYWRkcjJsaW5lJywgJ2NnbycsICdkaXN0JywgJ2xpbmsnLCAncGFjaycsICd0cmFjZScsICdhcGknLCAnY29tcGlsZScsICdkb2MnLCAnbm0nLCAncHByb2YnLCAndmV0JywgJ2FzbScsICdjb3ZlcicsICdmaXgnLCAnb2JqZHVtcCcsICd5YWNjJ11cbiAgICAgIGxldCBydW50aW1lID0gZmFsc2VcbiAgICAgIGxldCBkb25lID0gbG9jYXRvci5ydW50aW1lKCkudGhlbigocikgPT4geyBydW50aW1lID0gciB9KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gZG9uZSB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZm9yIChsZXQgdG9vbEl0ZW0gb2YgdG9vbHMpIHtcbiAgICAgICAgICBsZXQgdG9vbCA9IG51bGxcbiAgICAgICAgICBsZXQgdG9vbFBhdGggPSBwYXRoLmpvaW4ocnVudGltZS5HT1RPT0xESVIsIHRvb2xJdGVtICsgcnVudGltZS5HT0VYRSlcbiAgICAgICAgICBsZXQgZG9uZSA9IGxvY2F0b3IuZmluZFRvb2wodG9vbEl0ZW0pLnRoZW4oKHQpID0+IHsgdG9vbCA9IHQgfSlcbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gZG9uZSB9KVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QodG9vbCkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICBleHBlY3QodG9vbCkudG9CZSh0b29sUGF0aClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIHBhdGggaW5jbHVkZXMgYSBkaXJlY3Rvcnkgd2l0aCB0aGUgZ29tZXRhbGludGVyIHRvb2wgaW4gaXQnLCAoKSA9PiB7XG4gICAgbGV0IGdvcGF0aGRpciA9IG51bGxcbiAgICBsZXQgZ29wYXRoYmluZGlyID0gbnVsbFxuICAgIGxldCBwYXRoZGlyID0gbnVsbFxuICAgIGxldCBwYXRodG9vbHMgPSBudWxsXG4gICAgbGV0IGdvcGF0aGJpbnRvb2xzID0gbnVsbFxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgcGF0aHRvb2xzID0gWydnb21ldGFsaW50ZXInLCAnZ2InXVxuICAgICAgZ29wYXRoYmludG9vbHMgPSBbJ3NvbWVyYW5kb210b29sJywgJ2diJ11cbiAgICAgIHBhdGhkaXIgPSB0ZW1wLm1rZGlyU3luYygncGF0aC0nKVxuICAgICAgZ29wYXRoZGlyID0gdGVtcC5ta2RpclN5bmMoJ2dvcGF0aC0nKVxuICAgICAgZ29wYXRoYmluZGlyID0gcGF0aC5qb2luKGdvcGF0aGRpciwgJ2JpbicpXG4gICAgICBmcy5ta2RpclN5bmMoZ29wYXRoYmluZGlyKVxuICAgICAgZW52WydHT1BBVEgnXSA9IGdvcGF0aGRpclxuICAgICAgZW52W3BhdGhrZXldID0gcGF0aGRpciArIHBhdGguZGVsaW1pdGVyICsgZW52WydQQVRIJ11cbiAgICAgIGZvciAobGV0IHRvb2wgb2YgcGF0aHRvb2xzKSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHBhdGhkaXIsIHRvb2wgKyBleGVjdXRhYmxlU3VmZml4KSwgJy4nLCB7ZW5jb2Rpbmc6ICd1dGY4JywgbW9kZTogNTExfSlcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IHRvb2wgb2YgZ29wYXRoYmludG9vbHMpIHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oZ29wYXRoYmluZGlyLCB0b29sICsgZXhlY3V0YWJsZVN1ZmZpeCksICcuJywge2VuY29kaW5nOiAndXRmOCcsIG1vZGU6IDUxMX0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIGl0KCdmaW5kVG9vbCgpIGZpbmRzIHRvb2xzIGluIFBBVEgnLCAoKSA9PiB7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZm9yIChsZXQgdG9vbEl0ZW0gb2YgcGF0aHRvb2xzKSB7XG4gICAgICAgICAgbGV0IHRvb2xQYXRoID0gZmFsc2VcbiAgICAgICAgICBsZXQgdG9vbCA9IG51bGxcbiAgICAgICAgICBsZXQgZG9uZSA9IG51bGxcblxuICAgICAgICAgIGlmIChnb3BhdGhiaW50b29scy5pbmRleE9mKHRvb2xJdGVtKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHRvb2xQYXRoID0gcGF0aC5qb2luKGdvcGF0aGJpbmRpciwgdG9vbEl0ZW0gKyBleGVjdXRhYmxlU3VmZml4KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b29sUGF0aCA9IHBhdGguam9pbihwYXRoZGlyLCB0b29sSXRlbSArIGV4ZWN1dGFibGVTdWZmaXgpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9uZSA9IGxvY2F0b3IuZmluZFRvb2wodG9vbEl0ZW0pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIHRvb2wgPSB0XG4gICAgICAgICAgfSlcbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gZG9uZSB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgZG9uZSA9IG51bGxcbiAgICAgICAgICAgIGV4cGVjdCh0b29sKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIGV4cGVjdCh0b29sKS50b0JlKHRvb2xQYXRoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdmaW5kVG9vbCgpIGZpbmRzIHRvb2xzIGluIEdPUEFUSFxcJ3MgYmluIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBmb3IgKGxldCB0b29sSXRlbSBvZiBnb3BhdGhiaW50b29scykge1xuICAgICAgICAgIGxldCB0b29sID0gbnVsbFxuICAgICAgICAgIGxldCB0b29sUGF0aCA9IGZhbHNlXG4gICAgICAgICAgbGV0IGRvbmUgPSBudWxsXG4gICAgICAgICAgdG9vbFBhdGggPSBwYXRoLmpvaW4oZ29wYXRoYmluZGlyLCB0b29sSXRlbSArIGV4ZWN1dGFibGVTdWZmaXgpXG4gICAgICAgICAgZG9uZSA9IGxvY2F0b3IuZmluZFRvb2wodG9vbEl0ZW0pLnRoZW4oKHQpID0+IHsgdG9vbCA9IHQgfSlcbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gZG9uZSB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHRvb2wpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgZXhwZWN0KHRvb2wpLnRvQmUodG9vbFBhdGgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/go-config/spec/locator-spec.js
