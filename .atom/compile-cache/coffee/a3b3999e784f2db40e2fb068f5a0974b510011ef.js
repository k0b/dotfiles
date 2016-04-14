(function() {
  var CommandToolbar, ToolbarView, fs, pathUtil;

  fs = require('fs');

  pathUtil = require('path');

  ToolbarView = require('./toolbar-view');

  CommandToolbar = (function() {
    function CommandToolbar() {}

    CommandToolbar.prototype.config = {
      alwaysShowToolbarOnLoad: {
        title: 'Always show command bar when Atom opens',
        type: 'boolean',
        "default": true
      },
      useRightPane: {
        title: 'Open web pages in a right pane',
        type: 'boolean',
        "default": false
      }
    };

    CommandToolbar.prototype.activate = function() {
      var e;
      this.state = {
        statePath: pathUtil.dirname(atom.config.getUserConfigPath()) + '/command-toolbar.json'
      };
      try {
        this.state = JSON.parse(fs.readFileSync(this.state.statePath));
      } catch (_error) {
        e = _error;
        this.state.opened = true;
      }
      if (atom.config.get('command-toolbar.alwaysShowToolbarOnLoad')) {
        this.state.opened = true;
      }
      if (this.state.opened) {
        this.toggle(true);
      }
      return this.sub = atom.commands.add('atom-workspace', {
        'command-toolbar:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      });
    };

    CommandToolbar.prototype.toggle = function(forceOn) {
      var _ref;
      if (forceOn || !this.state.opened) {
        this.state.opened = true;
        if (this.toolbarView == null) {
          this.toolbarView = new ToolbarView(this, this.state);
        }
        this.toolbarView.show();
        return this.toolbarView.saveState();
      } else {
        this.state.opened = false;
        this.toolbarView.saveState();
        return (_ref = this.toolbarView) != null ? _ref.hide() : void 0;
      }
    };

    CommandToolbar.prototype.destroyToolbar = function() {
      var _ref;
      return (_ref = this.toolbarView) != null ? _ref.destroy() : void 0;
    };

    CommandToolbar.prototype.deactivate = function() {
      this.sub.dispose();
      return this.destroyToolbar();
    };

    return CommandToolbar;

  })();

  module.exports = new CommandToolbar;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2NvbW1hbmQtdG9vbGJhci9saWIvY29tbWFuZC10b29sYmFyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUdBO0FBQUEsTUFBQSx5Q0FBQTs7QUFBQSxFQUFBLEVBQUEsR0FBYyxPQUFBLENBQVEsSUFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQWMsT0FBQSxDQUFRLE1BQVIsQ0FEZCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUZkLENBQUE7O0FBQUEsRUFJTTtnQ0FDSjs7QUFBQSw2QkFBQSxNQUFBLEdBQ0U7QUFBQSxNQUFBLHVCQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyx5Q0FBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxJQUZUO09BREY7QUFBQSxNQUtBLFlBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGdDQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7T0FORjtLQURGLENBQUE7O0FBQUEsNkJBV0EsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FDRTtBQUFBLFFBQUEsU0FBQSxFQUFXLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQVosQ0FBQSxDQUFqQixDQUFBLEdBQ0MsdUJBRFo7T0FERixDQUFBO0FBR0E7QUFDRSxRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFFLENBQUMsWUFBSCxDQUFnQixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQXZCLENBQVgsQ0FBVCxDQURGO09BQUEsY0FBQTtBQUdFLFFBREksVUFDSixDQUFBO0FBQUEsUUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsR0FBZ0IsSUFBaEIsQ0FIRjtPQUhBO0FBUUEsTUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5Q0FBaEIsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEdBQWdCLElBQWhCLENBREY7T0FSQTtBQVVBLE1BQUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVY7QUFBc0IsUUFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLElBQVIsQ0FBQSxDQUF0QjtPQVZBO2FBWUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQUEsUUFBQSx3QkFBQSxFQUEwQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtPQUFwQyxFQWJDO0lBQUEsQ0FYVixDQUFBOztBQUFBLDZCQTBCQSxNQUFBLEdBQVEsU0FBQyxPQUFELEdBQUE7QUFDTixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUcsT0FBQSxJQUFXLENBQUEsSUFBSyxDQUFBLEtBQUssQ0FBQyxNQUF6QjtBQUNFLFFBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEdBQWdCLElBQWhCLENBQUE7O1VBQ0EsSUFBQyxDQUFBLGNBQW1CLElBQUEsV0FBQSxDQUFZLElBQVosRUFBZSxJQUFDLENBQUEsS0FBaEI7U0FEcEI7QUFBQSxRQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFBLENBRkEsQ0FBQTtlQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixDQUFBLEVBSkY7T0FBQSxNQUFBO0FBTUUsUUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsR0FBZ0IsS0FBaEIsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLENBQUEsQ0FEQSxDQUFBO3VEQUVZLENBQUUsSUFBZCxDQUFBLFdBUkY7T0FETTtJQUFBLENBMUJSLENBQUE7O0FBQUEsNkJBcUNBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQUcsVUFBQSxJQUFBO3FEQUFZLENBQUUsT0FBZCxDQUFBLFdBQUg7SUFBQSxDQXJDaEIsQ0FBQTs7QUFBQSw2QkF1Q0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFMLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQUZVO0lBQUEsQ0F2Q1osQ0FBQTs7MEJBQUE7O01BTEYsQ0FBQTs7QUFBQSxFQWdEQSxNQUFNLENBQUMsT0FBUCxHQUFpQixHQUFBLENBQUEsY0FoRGpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/command-toolbar/lib/command-toolbar.coffee
