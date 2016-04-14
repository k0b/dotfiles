(function() {
  var $, MenuItem, MenuView, View, items, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), View = _ref.View, $ = _ref.$;

  items = [
    {
      id: 'project',
      menu: 'Project',
      icon: 'icon-repo',
      type: 'active'
    }, {
      id: 'compare',
      menu: 'Compare',
      icon: 'compare',
      type: 'active'
    }, {
      id: 'commit',
      menu: 'Commit',
      icon: 'commit',
      type: 'file merging'
    }, {
      id: 'reset',
      menu: 'Reset',
      icon: 'sync',
      type: 'file'
    }, {
      id: 'fetch',
      menu: 'Fetch',
      icon: 'cloud-download',
      type: 'remote'
    }, {
      id: 'pull',
      menu: 'Pull',
      icon: 'pull',
      type: 'upstream'
    }, {
      id: 'pullup',
      menu: 'Pull Upstream',
      icon: 'desktop-download',
      type: 'active'
    }, {
      id: 'push',
      menu: 'Push',
      icon: 'push',
      type: 'downstream'
    }, {
      id: 'merge',
      menu: 'Merge',
      icon: 'merge',
      type: 'active'
    }, {
      id: 'branch',
      menu: 'Branch',
      icon: 'branch',
      type: 'active'
    }, {
      id: 'flow',
      menu: 'GitFlow',
      icon: 'flow',
      type: 'active',
      showConfig: 'git-control.showGitFlowButton'
    }
  ];

  MenuItem = (function(_super) {
    __extends(MenuItem, _super);

    function MenuItem() {
      return MenuItem.__super__.constructor.apply(this, arguments);
    }

    MenuItem.content = function(item) {
      var klass;
      klass = item.type === 'active' ? '' : 'inactive';
      klass += (item.showConfig != null) && !atom.config.get(item.showConfig) ? ' hide' : '';
      return this.div({
        "class": "item " + klass + " " + item.type,
        id: "menu" + item.id,
        click: 'click'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "icon large " + item.icon
          });
          return _this.div(item.menu);
        };
      })(this));
    };

    MenuItem.prototype.initialize = function(item) {
      this.item = item;
      if (item.showConfig != null) {
        return atom.config.observe(item.showConfig, function(show) {
          if (show) {
            return $("#menu" + item.id).removeClass('hide');
          } else {
            return $("#menu" + item.id).addClass('hide');
          }
        });
      }
    };

    MenuItem.prototype.click = function() {
      return this.parentView.click(this.item.id);
    };

    return MenuItem;

  })(View);

  module.exports = MenuView = (function(_super) {
    __extends(MenuView, _super);

    function MenuView() {
      return MenuView.__super__.constructor.apply(this, arguments);
    }

    MenuView.content = function(item) {
      return this.div({
        "class": 'menu'
      }, (function(_this) {
        return function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            _results.push(_this.subview(item.id, new MenuItem(item)));
          }
          return _results;
        };
      })(this));
    };

    MenuView.prototype.click = function(id) {
      if (!(this.find("#menu" + id).hasClass('inactive'))) {
        return this.parentView["" + id + "MenuClick"]();
      }
    };

    MenuView.prototype.activate = function(type, active) {
      var menuItems;
      menuItems = this.find(".item." + type);
      if (active) {
        menuItems.removeClass('inactive');
      } else {
        menuItems.addClass('inactive');
      }
    };

    return MenuView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9tZW51LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsWUFBQSxJQUFELEVBQU8sU0FBQSxDQUFQLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVE7SUFDTjtBQUFBLE1BQUUsRUFBQSxFQUFJLFNBQU47QUFBQSxNQUFpQixJQUFBLEVBQU0sU0FBdkI7QUFBQSxNQUFrQyxJQUFBLEVBQU0sV0FBeEM7QUFBQSxNQUFxRCxJQUFBLEVBQU0sUUFBM0Q7S0FETSxFQUVOO0FBQUEsTUFBRSxFQUFBLEVBQUksU0FBTjtBQUFBLE1BQWlCLElBQUEsRUFBTSxTQUF2QjtBQUFBLE1BQWtDLElBQUEsRUFBTSxTQUF4QztBQUFBLE1BQW1ELElBQUEsRUFBTSxRQUF6RDtLQUZNLEVBR047QUFBQSxNQUFFLEVBQUEsRUFBSSxRQUFOO0FBQUEsTUFBZ0IsSUFBQSxFQUFNLFFBQXRCO0FBQUEsTUFBZ0MsSUFBQSxFQUFNLFFBQXRDO0FBQUEsTUFBZ0QsSUFBQSxFQUFNLGNBQXREO0tBSE0sRUFJTjtBQUFBLE1BQUUsRUFBQSxFQUFJLE9BQU47QUFBQSxNQUFlLElBQUEsRUFBTSxPQUFyQjtBQUFBLE1BQThCLElBQUEsRUFBTSxNQUFwQztBQUFBLE1BQTRDLElBQUEsRUFBTSxNQUFsRDtLQUpNLEVBTU47QUFBQSxNQUFFLEVBQUEsRUFBSSxPQUFOO0FBQUEsTUFBZSxJQUFBLEVBQU0sT0FBckI7QUFBQSxNQUE4QixJQUFBLEVBQU0sZ0JBQXBDO0FBQUEsTUFBc0QsSUFBQSxFQUFNLFFBQTVEO0tBTk0sRUFPTjtBQUFBLE1BQUUsRUFBQSxF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

//# sourceURL=/Users/james/.atom/packages/git-control/lib/views/menu-view.coffee
