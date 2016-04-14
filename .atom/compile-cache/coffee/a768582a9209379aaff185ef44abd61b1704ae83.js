(function() {
  var ConfirmDialog, Dialog,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  module.exports = ConfirmDialog = (function(_super) {
    __extends(ConfirmDialog, _super);

    function ConfirmDialog() {
      return ConfirmDialog.__super__.constructor.apply(this, arguments);
    }

    ConfirmDialog.content = function(params) {
      return this.div({
        "class": 'dialog active'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong(params.hdr);
          });
          _this.div({
            "class": 'body'
          }, function() {
            return _this.div(params.msg);
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'confirm'
            }, function() {
              _this.i({
                "class": 'icon check'
              });
              return _this.span('Yes');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('No');
            });
          });
        };
      })(this));
    };

    ConfirmDialog.prototype.initialize = function(params) {
      return this.params = params;
    };

    ConfirmDialog.prototype.confirm = function() {
      this.deactivate();
      this.params.cb(this.params);
    };

    return ConfirmDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2NvbmZpcm0tZGlhbG9nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsTUFBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLGVBQVA7T0FBTCxFQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQzNCLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBLEdBQUE7QUFDckIsWUFBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsY0FBQSxPQUFBLEVBQU8sa0JBQVA7QUFBQSxjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxNQUFNLENBQUMsR0FBZixFQUZxQjtVQUFBLENBQXZCLENBQUEsQ0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBLEdBQUE7bUJBQ2xCLEtBQUMsQ0FBQSxHQUFELENBQUssTUFBTSxDQUFDLEdBQVosRUFEa0I7VUFBQSxDQUFwQixDQUhBLENBQUE7aUJBS0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBLEdBQUE7QUFDckIsWUFBQSxLQUFDLENBQUEsTUFBRCxDQUFRO0FBQUEsY0FBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLGNBQWlCLEtBQUEsRUFBTyxTQUF4QjthQUFSLEVBQTJDLFNBQUEsR0FBQTtBQUN6QyxjQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8sWUFBUDtlQUFILENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLEtBQU4sRUFGeUM7WUFBQSxDQUEzQyxDQUFBLENBQUE7bUJBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsS0FBQSxFQUFPLFFBQVA7YUFBUixFQUF5QixTQUFBLEdBQUE7QUFDdkIsY0FBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLFFBQVA7ZUFBSCxDQUFBLENBQUE7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBRnVCO1lBQUEsQ0FBekIsRUFKcUI7VUFBQSxDQUF2QixFQU4yQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsNEJBZUEsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO2FBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQURBO0lBQUEsQ0FmWixDQUFBOztBQUFBLDRCQWtCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLENBQVcsSUFBQyxDQUFBLE1BQVosQ0FEQSxDQURPO0lBQUEsQ0FsQlQsQ0FBQTs7eUJBQUE7O0tBRDBCLE9BSDVCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/git-control/lib/dialogs/confirm-dialog.coffee
