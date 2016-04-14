(function() {
  var Dialog, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  module.exports = Dialog = (function(_super) {
    __extends(Dialog, _super);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.prototype.activate = function() {
      this.addClass('active');
    };

    Dialog.prototype.deactivate = function() {
      this.removeClass('active');
    };

    Dialog.prototype.cancel = function() {
      this.deactivate();
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2RpYWxvZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsWUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osNkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHFCQUFBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixDQUFBLENBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEscUJBSUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxRQUFiLENBQUEsQ0FEVTtJQUFBLENBSlosQ0FBQTs7QUFBQSxxQkFRQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FETTtJQUFBLENBUlIsQ0FBQTs7a0JBQUE7O0tBRG1CLEtBSHJCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/git-control/lib/dialogs/dialog.coffee
