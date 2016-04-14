(function() {
  var BranchItem, BranchView, View, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  git = require('../git');

  BranchItem = (function(_super) {
    __extends(BranchItem, _super);

    function BranchItem() {
      return BranchItem.__super__.constructor.apply(this, arguments);
    }

    BranchItem.content = function(branch) {
      var bklass, cklass, dclass;
      bklass = branch.current ? 'active' : '';
      cklass = branch.count.total ? '' : 'invisible';
      dclass = branch.current || !branch.local ? 'invisible' : '';
      return this.div({
        "class": "branch " + bklass,
        'data-name': branch.name
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'info'
          }, function() {
            _this.i({
              "class": 'icon chevron-right'
            });
            return _this.span({
              "class": 'clickable',
              click: 'checkout'
            }, branch.name);
          });
          _this.div({
            "class": "right-info " + dclass
          }, function() {
            return _this.i({
              "class": 'icon trash clickable',
              click: 'deleteThis'
            });
          });
          return _this.div({
            "class": "right-info count " + cklass
          }, function() {
            _this.span(branch.count.ahead);
            _this.i({
              "class": 'icon cloud-upload'
            });
            _this.span(branch.count.behind);
            return _this.i({
              "class": 'icon cloud-download'
            });
          });
        };
      })(this));
    };

    BranchItem.prototype.initialize = function(branch) {
      return this.branch = branch;
    };

    BranchItem.prototype.checkout = function() {
      return this.branch.checkout(this.branch.name);
    };

    BranchItem.prototype.deleteThis = function() {
      return this.branch["delete"](this.branch.name);
    };

    return BranchItem;

  })(View);

  module.exports = BranchView = (function(_super) {
    __extends(BranchView, _super);

    function BranchView() {
      return BranchView.__super__.constructor.apply(this, arguments);
    }

    BranchView.content = function(params) {
      return this.div({
        "class": 'branches'
      }, (function(_this) {
        return function() {
          return _this.div({
            click: 'toggleBranch',
            "class": 'heading clickable'
          }, function() {
            _this.i({
              "class": 'icon branch'
            });
            return _this.span(params.name);
          });
        };
      })(this));
    };

    BranchView.prototype.initialize = function(params) {
      this.params = params;
      this.branches = [];
      return this.hidden = false;
    };

    BranchView.prototype.toggleBranch = function() {
      if (this.hidden) {
        this.addAll(this.branches);
      } else {
        this.clearAll();
      }
      return this.hidden = !this.hidden;
    };

    BranchView.prototype.clearAll = function() {
      this.find('>.branch').remove();
    };

    BranchView.prototype.addAll = function(branches) {
      var checkout, remove;
      this.branches = branches;
      this.selectedBranch = git["get" + (this.params.local ? 'Local' : 'Remote') + "Branch"]();
      this.clearAll();
      remove = (function(_this) {
        return function(name) {
          return _this.deleteBranch(name);
        };
      })(this);
      checkout = (function(_this) {
        return function(name) {
          return _this.checkoutBranch(name);
        };
      })(this);
      branches.forEach((function(_this) {
        return function(branch) {
          var count, current;
          current = _this.params.local && branch === _this.selectedBranch;
          count = {
            total: 0
          };
          if (current) {
            count = git.count(branch);
            count.total = count.ahead + count.behind;
            _this.parentView.branchCount(count);
          }
          _this.append(new BranchItem({
            name: branch,
            count: count,
            current: current,
            local: _this.params.local,
            "delete": remove,
            checkout: checkout
          }));
        };
      })(this));
    };

    BranchView.prototype.checkoutBranch = function(name) {
      this.parentView.checkoutBranch(name, !this.params.local);
    };

    BranchView.prototype.deleteBranch = function(name) {
      this.parentView.deleteBranch(name);
    };

    return BranchView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9icmFuY2gtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUlNO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQsR0FBQTtBQUNSLFVBQUEsc0JBQUE7QUFBQSxNQUFBLE1BQUEsR0FBWSxNQUFNLENBQUMsT0FBVixHQUF1QixRQUF2QixHQUFxQyxFQUE5QyxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFoQixHQUEyQixFQUEzQixHQUFtQyxXQUQ1QyxDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVksTUFBTSxDQUFDLE9BQVAsSUFBa0IsQ0FBQSxNQUFPLENBQUMsS0FBN0IsR0FBd0MsV0FBeEMsR0FBeUQsRUFGbEUsQ0FBQTthQUlBLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBUSxTQUFBLEdBQVMsTUFBakI7QUFBQSxRQUEyQixXQUFBLEVBQWEsTUFBTSxDQUFDLElBQS9DO09BQUwsRUFBMEQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN4RCxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFlBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGNBQUEsT0FBQSxFQUFP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

//# sourceURL=/Users/james/.atom/packages/git-control/lib/views/branch-view.coffee
