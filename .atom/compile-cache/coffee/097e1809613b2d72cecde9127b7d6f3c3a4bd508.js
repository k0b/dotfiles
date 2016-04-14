(function() {
  var Dialog, ProjectDialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = ProjectDialog = (function(_super) {
    __extends(ProjectDialog, _super);

    function ProjectDialog() {
      return ProjectDialog.__super__.constructor.apply(this, arguments);
    }

    ProjectDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('Project');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Project');
            return _this.select({
              outlet: 'projectList'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'changeProject'
            }, function() {
              _this.i({
                "class": 'icon icon-repo-pull'
              });
              return _this.span('Change');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    ProjectDialog.prototype.activate = function() {
      var projectIndex, projectList, repo, _fn, _i, _len, _ref;
      projectIndex = 0;
      projectList = this.projectList;
      projectList.html('');
      _ref = atom.project.getRepositories();
      _fn = function(repo) {
        var option;
        if (repo) {
          option = document.createElement("option");
          option.value = projectIndex;
          option.text = repo.path.split('/').reverse()[1];
          projectList.append(option);
        }
        return projectIndex = projectIndex + 1;
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        repo = _ref[_i];
        _fn(repo);
      }
      projectList.val(git.getProjectIndex);
      return ProjectDialog.__super__.activate.call(this);
    };

    ProjectDialog.prototype.changeProject = function() {
      var repo;
      this.deactivate();
      git.setProjectIndex(this.projectList.val());
      repo = git.getRepository();
      this.parentView.setWorkspaceTitle(repo.path.split('/').reverse()[1]);
      this.parentView.update();
    };

    return ProjectDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL3Byb2plY3QtZGlhbG9nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEIsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUEsR0FBQTtBQUNyQixZQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxjQUFBLE9BQUEsRUFBTyxrQkFBUDtBQUFBLGNBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFILENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLFNBQVIsRUFGcUI7VUFBQSxDQUF2QixDQUFBLENBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFlBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxpQkFBUCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsTUFBQSxFQUFR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

//# sourceURL=/Users/james/.atom/packages/git-control/lib/dialogs/project-dialog.coffee
