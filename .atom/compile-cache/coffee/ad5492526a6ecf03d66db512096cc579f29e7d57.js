(function() {
  var Dialog, PushDialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = PushDialog = (function(_super) {
    __extends(PushDialog, _super);

    function PushDialog() {
      return PushDialog.__super__.constructor.apply(this, arguments);
    }

    PushDialog.content = function() {
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
            return _this.strong('Push');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.div(function() {
              return _this.button({
                click: 'upstream'
              }, function() {
                return _this.p('Push upstream', function() {
                  return _this.i({
                    "class": 'icon push'
                  });
                });
              });
            });
            _this.label('Push from branch');
            _this.input({
              "class": 'native-key-bindings',
              readonly: true,
              outlet: 'fromBranch'
            });
            _this.label('To branch');
            return _this.select({
              "class": 'native-key-bindings',
              outlet: 'toBranch'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'push'
            }, function() {
              _this.i({
                "class": 'icon push'
              });
              return _this.span('Push');
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

    PushDialog.prototype.activate = function(remotes) {
      var remote, _i, _len;
      this.fromBranch.val(git.getLocalBranch());
      this.toBranch.find('option').remove();
      this.toBranch.append("<option value='origin'>origin</option>");
      for (_i = 0, _len = remotes.length; _i < _len; _i++) {
        remote = remotes[_i];
        this.toBranch.append("<option value='" + remote + "'>" + remote + "</option>");
      }
      return PushDialog.__super__.activate.call(this);
    };

    PushDialog.prototype.push = function() {
      var branch, remote;
      this.deactivate();
      remote = this.toBranch.val().split('/')[0];
      branch = git.getLocalBranch();
      this.parentView.push(remote, branch);
    };

    PushDialog.prototype.upstream = function() {
      this.deactivate();
      return this.parentView.push('', '');
    };

    return PushDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL3B1c2gtZGlhbG9nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1QkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUROLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEIsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUEsR0FBQTtBQUNyQixZQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxjQUFBLE9BQUEsRUFBTyxrQkFBUDtBQUFBLGNBQTBCLEtBQUEsRUFBTyxRQUFqQzthQUFILENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLE1BQVIsRUFGcUI7VUFBQSxDQUF2QixDQUFBLENBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFlBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBLEdBQUE7cUJBQ0gsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGdCQUFBLEtBQUEsRUFBTyxVQUFQO2VB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

//# sourceURL=/Users/james/.atom/packages/git-control/lib/dialogs/push-dialog.coffee
