(function() {
  var CMD_TOGGLE, CompositeDisposable, EVT_SWITCH, GitControl, GitControlView, item, pane, view, views;

  GitControlView = require('./git-control-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  CMD_TOGGLE = 'git-control:toggle';

  EVT_SWITCH = 'pane-container:active-pane-item-changed';

  views = [];

  view = void 0;

  pane = void 0;

  item = void 0;

  module.exports = GitControl = {
    activate: function(state) {
      console.log('GitControl: activate');
      atom.commands.add('atom-workspace', CMD_TOGGLE, (function(_this) {
        return function() {
          return _this.toggleView();
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          return _this.updateViews();
        };
      })(this));
    },
    deactivate: function() {
      console.log('GitControl: deactivate');
    },
    toggleView: function() {
      console.log('GitControl: toggle');
      if (!(view && view.active)) {
        view = new GitControlView();
        views.push(view);
        pane = atom.workspace.getActivePane();
        item = pane.addItem(view, 0);
        pane.activateItem(item);
      } else {
        pane.destroyItem(item);
      }
    },
    updateViews: function() {
      var activeView, v, _i, _len;
      activeView = atom.workspace.getActivePane().getActiveItem();
      for (_i = 0, _len = views.length; _i < _len; _i++) {
        v = views[_i];
        if (v === activeView) {
          v.update();
        }
      }
    },
    serialize: function() {},
    config: {
      showGitFlowButton: {
        title: 'Show GitFlow button',
        description: 'Show the GitFlow button in the Git Control toolbar',
        type: 'boolean',
        "default": true
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9naXQtY29udHJvbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0dBQUE7O0FBQUEsRUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUixDQUFqQixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsb0JBSGIsQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSx5Q0FKYixDQUFBOztBQUFBLEVBTUEsS0FBQSxHQUFRLEVBTlIsQ0FBQTs7QUFBQSxFQU9BLElBQUEsR0FBTyxNQVBQLENBQUE7O0FBQUEsRUFRQSxJQUFBLEdBQU8sTUFSUCxDQUFBOztBQUFBLEVBU0EsSUFBQSxHQUFPLE1BVFAsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBQUEsR0FFZjtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHNCQUFaLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxVQUFwQyxFQUFnRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhELENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7aUJBQVUsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUFWO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekMsQ0FIQSxDQURRO0lBQUEsQ0FBVjtBQUFBLElBT0EsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSx3QkFBWixDQUFBLENBRFU7SUFBQSxDQVBaO0FBQUEsSUFXQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaLENBQUEsQ0FBQTtBQUVBLE1BQUEsSUFBQSxDQUFBLENBQU8sSUFBQSxJQUFTLElBQUksQ0FBQyxNQUFyQixDQUFBO0FBQ0UsUUFBQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQUEsQ0FBWCxDQUFBO0FBQUEsUUFDQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FEQSxDQUFBO0FBQUEsUUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FIUCxDQUFBO0FBQUEsUUFJQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLENBQW5CLENBSlAsQ0FBQTtBQUFBLFFBTUEsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsSUFBbEIsQ0FOQSxDQURGO09BQUEsTUFBQTtBQVVFLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakIsQ0FBQSxDQVZGO09BSFU7SUFBQSxDQVhaO0FBQUEsSUE0QkEsV0FBQSxFQUFhLFNBQUEsR0FBQTtBQUNYLFVBQUEsdUJBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLGFBQS9CLENBQUEsQ0FBYixDQUFBO0FBQ0EsV0FBQSw0Q0FBQTtzQkFBQTtZQUFvQixDQUFBLEtBQUs7QUFDdkIsVUFBQSxDQUFDLENBQUMsTUFBRixDQUFBLENBQUE7U0FERjtBQUFBLE9BRlc7SUFBQSxDQTVCYjtBQUFBLElBa0NBLFNBQUEsRUFBVyxTQUFBLEdBQUEsQ0FsQ1g7QUFBQSxJQW9DQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxxQkFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLG9EQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLElBSFQ7T0FERjtLQXJDRjtHQWJGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/git-control/lib/git-control.coffee
