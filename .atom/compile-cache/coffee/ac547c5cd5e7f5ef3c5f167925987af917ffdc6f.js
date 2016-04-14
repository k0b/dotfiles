(function() {
  var $, $$, BranchDialog, BranchView, CommitDialog, ConfirmDialog, DeleteDialog, DiffView, FileView, FlowDialog, GitControlView, LogView, MenuView, MergeDialog, ProjectDialog, PushDialog, View, git, gitWorkspaceTitle, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), View = _ref.View, $ = _ref.$, $$ = _ref.$$;

  git = require('./git');

  BranchView = require('./views/branch-view');

  DiffView = require('./views/diff-view');

  FileView = require('./views/file-view');

  LogView = require('./views/log-view');

  MenuView = require('./views/menu-view');

  ProjectDialog = require('./dialogs/project-dialog');

  BranchDialog = require('./dialogs/branch-dialog');

  CommitDialog = require('./dialogs/commit-dialog');

  ConfirmDialog = require('./dialogs/confirm-dialog');

  DeleteDialog = require('./dialogs/delete-dialog');

  MergeDialog = require('./dialogs/merge-dialog');

  FlowDialog = require('./dialogs/flow-dialog');

  PushDialog = require('./dialogs/push-dialog');

  gitWorkspaceTitle = '';

  module.exports = GitControlView = (function(_super) {
    __extends(GitControlView, _super);

    function GitControlView() {
      this.flow = __bind(this.flow, this);
      this.merge = __bind(this.merge, this);
      return GitControlView.__super__.constructor.apply(this, arguments);
    }

    GitControlView.content = function() {
      if (git.isInitialised()) {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            _this.subview('menuView', new MenuView());
            _this.div({
              "class": 'content',
              outlet: 'contentView'
            }, function() {
              _this.div({
                "class": 'sidebar'
              }, function() {
                _this.subview('filesView', new FileView());
                _this.subview('localBranchView', new BranchView({
                  name: 'Local',
                  local: true
                }));
                return _this.subview('remoteBranchView', new BranchView({
                  name: 'Remote'
                }));
              });
              _this.div({
                "class": 'domain'
              }, function() {
                return _this.subview('diffView', new DiffView());
              });
              _this.subview('projectDialog', new ProjectDialog());
              _this.subview('branchDialog', new BranchDialog());
              _this.subview('commitDialog', new CommitDialog());
              _this.subview('mergeDialog', new MergeDialog());
              _this.subview('flowDialog', new FlowDialog());
              return _this.subview('pushDialog', new PushDialog());
            });
            return _this.subview('logView', new LogView());
          };
        })(this));
      } else {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            return _this.subview('logView', new LogView());
          };
        })(this));
      }
    };

    GitControlView.prototype.serialize = function() {};

    GitControlView.prototype.initialize = function() {
      console.log('GitControlView: initialize');
      git.setLogger((function(_this) {
        return function(log, iserror) {
          return _this.logView.log(log, iserror);
        };
      })(this));
      this.active = true;
      this.branchSelected = null;
      if (!git.isInitialised()) {
        git.alert("> This project is not a git repository. Either open another project or create a repository.");
      } else {
        this.setWorkspaceTitle(git.getRepository().path.split('/').reverse()[1]);
      }
      this.update(true);
    };

    GitControlView.prototype.destroy = function() {
      console.log('GitControlView: destroy');
      this.active = false;
    };

    GitControlView.prototype.setWorkspaceTitle = function(title) {
      return gitWorkspaceTitle = title;
    };

    GitControlView.prototype.getTitle = function() {
      return 'git:control';
    };

    GitControlView.prototype.update = function(nofetch) {
      if (git.isInitialised()) {
        this.loadBranches();
        this.showStatus();
        this.filesView.setWorkspaceTitle(gitWorkspaceTitle);
        if (!nofetch) {
          this.fetchMenuClick();
          if (this.diffView) {
            this.diffView.clearAll();
          }
        }
      }
    };

    GitControlView.prototype.loadLog = function() {
      git.log(this.selectedBranch).then(function(logs) {
        console.log('git.log', logs);
      });
    };

    GitControlView.prototype.checkoutBranch = function(branch, remote) {
      git.checkout(branch, remote).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.branchCount = function(count) {
      var remotes;
      if (git.isInitialised()) {
        remotes = git.hasOrigin();
        this.menuView.activate('upstream', remotes && count.behind);
        this.menuView.activate('downstream', remotes && (count.ahead || !git.getRemoteBranch()));
        this.menuView.activate('remote', remotes);
      }
    };

    GitControlView.prototype.loadBranches = function() {
      if (git.isInitialised()) {
        this.selectedBranch = git.getLocalBranch();
        git.getBranches().then((function(_this) {
          return function(branches) {
            _this.branches = branches;
            _this.remoteBranchView.addAll(branches.remote);
            _this.localBranchView.addAll(branches.local, true);
          };
        })(this));
      }
    };

    GitControlView.prototype.showSelectedFiles = function() {
      this.menuView.activate('file', this.filesView.hasSelected());
      this.menuView.activate('file.merging', this.filesView.hasSelected() || git.isMerging());
    };

    GitControlView.prototype.showStatus = function() {
      git.status().then((function(_this) {
        return function(files) {
          _this.filesView.addAll(files);
        };
      })(this));
    };

    GitControlView.prototype.projectMenuClick = function() {
      this.projectDialog.activate();
    };

    GitControlView.prototype.branchMenuClick = function() {
      this.branchDialog.activate();
    };

    GitControlView.prototype.compareMenuClick = function() {
      git.diff(this.filesView.getSelected().all.join(' ')).then((function(_this) {
        return function(diffs) {
          return _this.diffView.addAll(diffs);
        };
      })(this));
    };

    GitControlView.prototype.commitMenuClick = function() {
      if (!(this.filesView.hasSelected() || git.isMerging())) {
        return;
      }
      this.commitDialog.activate();
    };

    GitControlView.prototype.commit = function() {
      var files, msg;
      if (!this.filesView.hasSelected()) {
        return;
      }
      msg = this.commitDialog.getMessage();
      files = this.filesView.getSelected();
      this.filesView.unselectAll();
      git.add(files.add).then(function() {
        return git.remove(files.rem);
      }).then(function() {
        return git.commit(msg);
      }).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.createBranch = function(branch) {
      git.createBranch(branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.deleteBranch = function(branch) {
      var confirmCb, forceDeleteCallback;
      confirmCb = (function(_this) {
        return function(params) {
          git.deleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      forceDeleteCallback = (function(_this) {
        return function(params) {
          return git.forceDeleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      this.contentView.append(new DeleteDialog({
        hdr: 'Delete Branch',
        msg: "Are you sure you want to delete the local branch '" + branch + "'?",
        cb: confirmCb,
        fdCb: forceDeleteCallback,
        branch: branch
      }));
    };

    GitControlView.prototype.fetchMenuClick = function() {
      if (git.isInitialised()) {
        if (!git.hasOrigin()) {
          return;
        }
      }
      git.fetch().then((function(_this) {
        return function() {
          return _this.loadBranches();
        };
      })(this));
    };

    GitControlView.prototype.mergeMenuClick = function() {
      this.mergeDialog.activate(this.branches.local);
    };

    GitControlView.prototype.merge = function(branch, noff) {
      git.merge(branch, noff).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.flowMenuClick = function() {
      this.flowDialog.activate(this.branches.local);
    };

    GitControlView.prototype.flow = function(type, action, branch) {
      git.flow(type, action, branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.pullMenuClick = function() {
      git.pull().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pullupMenuClick = function() {
      git.pullup().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pushMenuClick = function() {
      git.getBranches().then((function(_this) {
        return function(branches) {
          return _this.pushDialog.activate(branches.remote);
        };
      })(this));
    };

    GitControlView.prototype.push = function(remote, branches) {
      return git.push(remote, branches).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.resetMenuClick = function() {
      var files;
      if (!this.filesView.hasSelected()) {
        return;
      }
      files = this.filesView.getSelected();
      return atom.confirm({
        message: "Reset will erase changes since the last commit in the selected files. Are you sure?",
        buttons: {
          Cancel: (function(_this) {
            return function() {};
          })(this),
          Reset: (function(_this) {
            return function() {
              git.reset(files.all).then(function() {
                return _this.update();
              });
            };
          })(this)
        }
      });
    };

    return GitControlView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9naXQtY29udHJvbC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5TkFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFBLE9BQWdCLE9BQUEsQ0FBUSxzQkFBUixDQUFoQixFQUFDLFlBQUEsSUFBRCxFQUFPLFNBQUEsQ0FBUCxFQUFVLFVBQUEsRUFBVixDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FKYixDQUFBOztBQUFBLEVBS0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUixDQUxYLENBQUE7O0FBQUEsRUFNQSxRQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSLENBTlgsQ0FBQTs7QUFBQSxFQU9BLE9BQUEsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FQVixDQUFBOztBQUFBLEVBUUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUixDQVJYLENBQUE7O0FBQUEsRUFVQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUixDQVZoQixDQUFBOztBQUFBLEVBV0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUixDQVhmLENBQUE7O0FBQUEsRUFZQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHlCQUFSLENBWmYsQ0FBQTs7QUFBQSxFQWFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDBCQUFSLENBYmhCLENBQUE7O0FBQUEsRUFjQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHlCQUFSLENBZGYsQ0FBQTs7QUFBQSxFQWVBLFdBQUEsR0FBYyxPQUFBLENBQVEsd0JBQVIsQ0FmZCxDQUFBOztBQUFBLEVBZ0JBLFVBQUEsR0FBYSxPQUFBLENBQVEsdUJB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

//# sourceURL=/Users/james/.atom/packages/git-control/lib/git-control-view.coffee
