(function() {
  var atomRefresh, callGit, cwd, fs, getBranches, git, logcb, noop, parseDefault, parseDiff, parseStatus, path, projectIndex, q, repo, setProjectIndex;

  fs = require('fs');

  path = require('path');

  git = require('git-promise');

  q = require('q');

  logcb = function(log, error) {
    return console[error ? 'error' : 'log'](log);
  };

  repo = void 0;

  cwd = void 0;

  projectIndex = 0;

  noop = function() {
    return q.fcall(function() {
      return true;
    });
  };

  atomRefresh = function() {
    repo.refreshStatus();
  };

  getBranches = function() {
    return q.fcall(function() {
      var branches, h, refs, _i, _j, _len, _len1, _ref, _ref1;
      branches = {
        local: [],
        remote: [],
        tags: []
      };
      refs = repo.getReferences();
      _ref = refs.heads;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        h = _ref[_i];
        branches.local.push(h.replace('refs/heads/', ''));
      }
      _ref1 = refs.remotes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        h = _ref1[_j];
        branches.remote.push(h.replace('refs/remotes/', ''));
      }
      return branches;
    });
  };

  setProjectIndex = function(index) {
    repo = void 0;
    cwd = void 0;
    projectIndex = index;
    if (atom.project) {
      repo = atom.project.getRepositories()[index];
      cwd = repo ? repo.getWorkingDirectory() : void 0;
    }
  };

  setProjectIndex(projectIndex);

  parseDiff = function(data) {
    return q.fcall(function() {
      var diff, diffs, line, _i, _len, _ref;
      diffs = [];
      diff = {};
      _ref = data.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line.length) {
          switch (false) {
            case !/^diff --git /.test(line):
              diff = {
                lines: [],
                added: 0,
                removed: 0
              };
              diff['diff'] = line.replace(/^diff --git /, '');
              diffs.push(diff);
              break;
            case !/^index /.test(line):
              diff['index'] = line.replace(/^index /, '');
              break;
            case !/^--- /.test(line):
              diff['---'] = line.replace(/^--- [a|b]\//, '');
              break;
            case !/^\+\+\+ /.test(line):
              diff['+++'] = line.replace(/^\+\+\+ [a|b]\//, '');
              break;
            default:
              diff['lines'].push(line);
              if (/^\+/.test(line)) {
                diff['added']++;
              }
              if (/^-/.test(line)) {
                diff['removed']++;
              }
          }
        }
      }
      return diffs;
    });
  };

  parseStatus = function(data) {
    return q.fcall(function() {
      var files, line, name, type, _i, _len, _ref, _ref1;
      files = [];
      _ref = data.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (!line.length) {
          continue;
        }
        _ref1 = line.replace(/\ \ /g, ' ').trim().split(' '), type = _ref1[0], name = _ref1[1];
        files.push({
          name: name,
          selected: (function() {
            switch (type[type.length - 1]) {
              case 'C':
              case 'M':
              case 'R':
              case 'D':
              case 'A':
                return true;
              default:
                return false;
            }
          })(),
          type: (function() {
            switch (type[type.length - 1]) {
              case 'A':
                return 'added';
              case 'C':
                return 'modified';
              case 'D':
                return 'deleted';
              case 'M':
                return 'modified';
              case 'R':
                return 'modified';
              case 'U':
                return 'conflict';
              case '?':
                return 'new';
              default:
                return 'unknown';
            }
          })()
        });
      }
      return files;
    });
  };

  parseDefault = function(data) {
    return q.fcall(function() {
      return true;
    });
  };

  callGit = function(cmd, parser, nodatalog) {
    logcb("> git " + cmd);
    return git(cmd, {
      cwd: cwd
    }).then(function(data) {
      if (!nodatalog) {
        logcb(data);
      }
      return parser(data);
    }).fail(function(e) {
      logcb(e.stdout, true);
      logcb(e.message, true);
    });
  };

  module.exports = {
    isInitialised: function() {
      return cwd;
    },
    alert: function(text) {
      logcb(text);
    },
    setLogger: function(cb) {
      logcb = cb;
    },
    setProjectIndex: setProjectIndex,
    getProjectIndex: function() {
      return projectIndex;
    },
    getRepository: function() {
      return repo;
    },
    count: function(branch) {
      return repo.getAheadBehindCount(branch);
    },
    getLocalBranch: function() {
      return repo.getShortHead();
    },
    getRemoteBranch: function() {
      return repo.getUpstreamBranch();
    },
    isMerging: function() {
      return fs.existsSync(path.join(repo.path, 'MERGE_HEAD'));
    },
    getBranches: getBranches,
    hasRemotes: function() {
      var refs;
      refs = repo.getReferences();
      return refs && refs.remotes && refs.remotes.length;
    },
    hasOrigin: function() {
      return repo.getOriginURL() !== null;
    },
    add: function(files) {
      if (!files.length) {
        return noop();
      }
      return callGit("add -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    commit: function(message) {
      message = message || Date.now();
      message = message.replace(/"/g, '\\"');
      return callGit("commit -m \"" + message + "\"", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    checkout: function(branch, remote) {
      return callGit("checkout " + (remote ? '--track ' : '') + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    createBranch: function(branch) {
      return callGit("branch " + branch, function(data) {
        return callGit("checkout " + branch, function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      });
    },
    deleteBranch: function(branch) {
      return callGit("branch -d " + branch, function(data) {
        atomRefresh();
        return parseDefault;
      });
    },
    forceDeleteBranch: function(branch) {
      return callGit("branch -D " + branch, function(data) {
        atomRefresh();
        return parseDefault;
      });
    },
    diff: function(file) {
      return callGit("--no-pager diff " + (file || ''), parseDiff, true);
    },
    fetch: function() {
      return callGit("fetch --prune", parseDefault);
    },
    merge: function(branch, noff) {
      var noffOutput;
      noffOutput = noff ? "--no-ff" : "";
      return callGit("merge " + noffOutput + " " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    pullup: function() {
      return callGit("pull upstream $(git branch | grep '^\*' | sed -n 's/\*[ ]*//p')", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    pull: function() {
      return callGit("pull", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    flow: function(type, action, branch) {
      return callGit("flow " + type + " " + action + " " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    push: function(remote, branch) {
      var cmd;
      cmd = "-c push.default=simple push " + remote + " " + branch + " --porcelain";
      return callGit(cmd, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    log: function(branch) {
      return callGit("log origin/" + (repo.getUpstreamBranch() || 'master') + ".." + branch, parseDefault);
    },
    reset: function(files) {
      return callGit("checkout -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    remove: function(files) {
      if (!files.length) {
        return noop();
      }
      return callGit("rm -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(true);
      });
    },
    status: function() {
      return callGit('status --porcelain --untracked-files=all', parseStatus);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9naXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdKQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGFBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxHQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLEtBQUEsR0FBUSxTQUFDLEdBQUQsRUFBTSxLQUFOLEdBQUE7V0FDTixPQUFRLENBQUcsS0FBSCxHQUFjLE9BQWQsR0FBMkIsS0FBM0IsQ0FBUixDQUEwQyxHQUExQyxFQURNO0VBQUEsQ0FOUixDQUFBOztBQUFBLEVBU0EsSUFBQSxHQUFPLE1BVFAsQ0FBQTs7QUFBQSxFQVVBLEdBQUEsR0FBTSxNQVZOLENBQUE7O0FBQUEsRUFXQSxZQUFBLEdBQWUsQ0FYZixDQUFBOztBQUFBLEVBYUEsSUFBQSxHQUFPLFNBQUEsR0FBQTtXQUFHLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBQSxHQUFBO2FBQUcsS0FBSDtJQUFBLENBQVIsRUFBSDtFQUFBLENBYlAsQ0FBQTs7QUFBQSxFQWVBLFdBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixJQUFBLElBQUksQ0FBQyxhQUFMLENBQUEsQ0FBQSxDQURZO0VBQUEsQ0FmZCxDQUFBOztBQUFBLEVBbUJBLFdBQUEsR0FBYyxTQUFBLEdBQUE7V0FBRyxDQUFDLENBQUMsS0FBRixDQUFRLFNBQUEsR0FBQTtBQUN2QixVQUFBLG1EQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVc7QUFBQSxRQUFBLEtBQUEsRUFB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

//# sourceURL=/Users/james/.atom/packages/git-control/lib/git.coffee
