(function() {
  var BranchDialog, Dialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = BranchDialog = (function(_super) {
    __extends(BranchDialog, _super);

    function BranchDialog() {
      return BranchDialog.__super__.constructor.apply(this, arguments);
    }

    BranchDialog.content = function() {
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
            return _this.strong('Branch');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Branch');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              readonly: true,
              outlet: 'fromBranch'
            });
            _this.label('New Branch');
            return _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'toBranch'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'branch'
            }, function() {
              _this.i({
                "class": 'icon branch'
              });
              return _this.span('Branch');
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

    BranchDialog.prototype.activate = function() {
      this.fromBranch.val(git.getLocalBranch());
      this.toBranch.val('');
      return BranchDialog.__super__.activate.call(this);
    };

    BranchDialog.prototype.branch = function() {
      this.deactivate();
      this.parentView.createBranch(this.toBranch.val());
    };

    return BranchDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2JyYW5jaC1kaWFsb2cuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwQixVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFlBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGNBQUEsT0FBQSxFQUFPLGtCQUFQO0FBQUEsY0FBMkIsS0FBQSxFQUFPLFFBQWxDO2FBQUgsQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUZxQjtVQUFBLENBQXZCLENBQUEsQ0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsWUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLGNBQUEsT0FBQSxFQUFPLHFCQUFQO0FBQUEsY0FBOEIsSUFBQSxFQUFNLE1BQXBDO0FBQUEsY0FBNEMsUUFBQSxFQUFVLElBQXREO0FBQUEsY0FBNEQsTUFBQSxFQUFRLFlBQXBFO2FBQVAsQ0FEQSxDQUFBO0FBQUEsWUFFQSxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsQ0FGQSxDQUFBO21CQUdBLEtBQUMsQ0FBQSxLQUFELENBQU87QUFBQSxjQUFBLE9BQUEsRUFBTyxxQkFBUDtBQUFBLGNBQThCLElBQUEsRUFBTSxNQUFwQztBQUFBLGNBQTRDLE1BQUEsRUFBUSxVQUFwRDthQUFQLEVBSmtCO1VBQUEsQ0FBcEIsQ0FIQSxDQUFBO2lCQVFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFlBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsT0FBQSxFQUFPLFFBQVA7QUFBQSxjQUFpQixLQUFBLEVBQU8sUUFBeEI7YUFBUixFQUEwQyxTQUFBLEdBQUE7QUFDeEMsY0FBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLGFBQVA7ZUFBSCxDQUFBLENBQUE7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBRndDO1lBQUEsQ0FBMUMsQ0FBQSxDQUFBO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLGNBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGdCQUFBLE9BQUEsRUFBTyxRQUFQO2VBQUgsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUZ1QjtZQUFBLENBQXpCLEVBSnFCO1VBQUEsQ0FBdkIsRUFUb0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDJCQWtCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsR0FBRyxDQUFDLGNBQUosQ0FBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLEVBQWQsQ0FEQSxDQUFBO0FBRUEsYUFBTyx5Q0FBQSxDQUFQLENBSFE7SUFBQSxDQWxCVixDQUFBOztBQUFBLDJCQXVCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxZQUFaLENBQXlCLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFBLENBQXpCLENBREEsQ0FETTtJQUFBLENBdkJSLENBQUE7O3dCQUFBOztLQUR5QixPQUwzQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/james/.atom/packages/git-control/lib/dialogs/branch-dialog.coffee
