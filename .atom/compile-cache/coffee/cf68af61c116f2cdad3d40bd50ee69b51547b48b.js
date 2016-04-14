(function() {
  var CommitDialog, Dialog,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  module.exports = CommitDialog = (function(_super) {
    __extends(CommitDialog, _super);

    function CommitDialog() {
      return CommitDialog.__super__.constructor.apply(this, arguments);
    }

    CommitDialog.content = function() {
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
            return _this.strong('Commit');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Commit Message');
            return _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'msg',
              keyUp: 'colorLength'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'commit'
            }, function() {
              _this.i({
                "class": 'icon commit'
              });
              return _this.span('Commit');
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

    CommitDialog.prototype.activate = function() {
      this.msg.val('');
      return CommitDialog.__super__.activate.call(this);
    };

    CommitDialog.prototype.colorLength = function() {
      var i, line, too_long, _i, _len, _ref;
      too_long = false;
      _ref = this.msg.val().split("\n");
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        line = _ref[i];
        if ((i === 0 && line.length > 50) || (i > 0 && line.length > 80)) {
          too_long = true;
          break;
        }
      }
      if (too_long) {
        this.msg.addClass('over-fifty');
      } else {
        this.msg.removeClass('over-fifty');
      }
    };

    CommitDialog.prototype.commit = function() {
      this.deactivate();
      this.parentView.commit();
    };

    CommitDialog.prototype.getMessage = function() {
      return this.msg.val();
    };

    return CommitDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2NvbW1pdC1kaWFsb2cuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BCLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBLEdBQUE7QUFDckIsWUFBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsY0FBQSxPQUFBLEVBQU8sa0JBQVA7QUFBQSxjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBRnFCO1VBQUEsQ0FBdkIsQ0FBQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUEsR0FBQTtBQUNsQixZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVAsQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxRQUFELENBQVU7QUFBQSxjQUFBLE9BQUEsRUFBTyxxQkFBUDtBQUFBLGNBQThCLE1BQUEsRUFBUSxLQUF0QztBQUFBLGNBQTZDLEtBQUEsRUFBTyxhQUFwRDthQUFWLEVBRmtCO1VBQUEsQ0FBcEIsQ0FIQSxDQUFBO2lCQU1BLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFlBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsT0FBQSxFQUFPLFFBQVA7QUFBQSxjQUFpQixLQUFBLEVBQU8sUUFBeEI7YUFBUixFQUEwQyxTQUFBLEdBQUE7QUFDeEMsY0FBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLGFBQVA7ZUFBSCxDQUFBLENBQUE7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBRndDO1lBQUEsQ0FBMUMsQ0FBQSxDQUFBO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLGNBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGdCQUFBLE9BQUEsRUFBTyxRQUFQO2VBQUgsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUZ1QjtZQUFBLENBQXpCLEVBSnFCO1VBQUEsQ0FBdkIsRUFQb0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDJCQWdCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQUEsQ0FBQTtBQUNBLGFBQU8seUNBQUEsQ0FBUCxDQUZRO0lBQUEsQ0FoQlYsQ0FBQTs7QUFBQSwyQkFvQkEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLFVBQUEsaUNBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFDQTtBQUFBLFdBQUEsbURBQUE7dUJBQUE7QUFDRSxRQUFBLElBQUcsQ0FBQyxDQUFBLEtBQUssQ0FBTCxJQUFVLElBQUksQ0FBQyxNQUFMLEdBQWMsRUFBekIsQ0FBQSxJQUFnQyxDQUFDLENBQUEsR0FBSSxDQUFKLElBQVMsSUFBSSxDQUFDLE1BQUwsR0FBYyxFQUF4QixDQUFuQztBQUNFLFVBQUEsUUFBQSxHQUFXLElBQVgsQ0FBQTtBQUNBLGdCQUZGO1NBREY7QUFBQSxPQURBO0FBTUEsTUFBQSxJQUFHLFFBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLFlBQWQsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLFlBQWpCLENBQUEsQ0FIRjtPQVBXO0lBQUEsQ0FwQmIsQ0FBQTs7QUFBQSwyQkFpQ0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFBLENBREEsQ0FETTtJQUFBLENBakNSLENBQUE7O0FBQUEsMkJBc0NBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixhQUFPLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUFBLENBQVAsQ0FEVTtJQUFBLENBdENaLENBQUE7O3dCQUFBOztLQUR5QixPQUgzQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/james/.atom/packages/git-control/lib/dialogs/commit-dialog.coffee
