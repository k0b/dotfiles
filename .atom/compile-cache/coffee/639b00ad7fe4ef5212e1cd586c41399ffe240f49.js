(function() {
  var $, $$, MAX_ITEMS, SelectListView, View, fuzzaldrin, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom-space-pen-views'), SelectListView = _ref.SelectListView, $ = _ref.$, $$ = _ref.$$;

  fuzzaldrin = require('fuzzaldrin');

  MAX_ITEMS = 5;

  module.exports = View = (function(_super) {
    __extends(View, _super);

    function View() {
      return View.__super__.constructor.apply(this, arguments);
    }

    View.init = function() {
      var _ref1;
      return _ref1 = require('./commands'), this.normalCommands = _ref1.normalCommands, this.toggleCommands = _ref1.toggleCommands, this.numberCommands = _ref1.numberCommands, _ref1;
    };

    View.prototype.initialize = function() {
      this.setMaxItems(MAX_ITEMS);
      View.__super__.initialize.apply(this, arguments);
      return this.addClass('vim-mode-plus-ex-mode');
    };

    View.prototype.getFilterKey = function() {
      return 'displayName';
    };

    View.prototype.cancelled = function() {
      return this.hide();
    };

    View.prototype.toggle = function(vimState, commandKind) {
      var _ref1, _ref2;
      this.vimState = vimState;
      this.commandKind = commandKind;
      if ((_ref1 = this.panel) != null ? _ref1.isVisible() : void 0) {
        return this.cancel();
      } else {
        _ref2 = this.vimState, this.editorElement = _ref2.editorElement, this.editor = _ref2.editor;
        return this.show();
      }
    };

    View.prototype.show = function() {
      this.count = null;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setItems(this.getItemsFor(this.commandKind));
      return this.focusFilterEditor();
    };

    View.prototype.getItemsFor = function(kind) {
      var commands, humanize;
      commands = _.keys(this.constructor[kind]).sort();
      humanize = function(name) {
        return _.humanizeEventName(_.dasherize(name));
      };
      switch (kind) {
        case 'normalCommands':
          return commands.map(function(name) {
            return {
              name: name,
              displayName: name
            };
          });
        case 'toggleCommands':
        case 'numberCommands':
          return commands.map(function(name) {
            return {
              name: name,
              displayName: humanize(name)
            };
          });
      }
    };

    View.prototype.executeCommand = function(kind, name) {
      var action;
      action = this.constructor[kind][name];
      return action(this.vimState, this.count);
    };

    View.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    View.prototype.getCommandKindFromQuery = function(query) {
      if (query.match(/^!/)) {
        return 'toggleCommands';
      } else if (query.match(/(\d+)(%)?$/)) {
        return 'numberCommands';
      } else {
        return null;
      }
    };

    View.prototype.getEmptyMessage = function(itemCount, filteredItemCount) {
      var filterQuery, items, number, percent, query, _ref1;
      query = this.getFilterQuery();
      if (!(this.commandKind = this.getCommandKindFromQuery(query))) {
        return;
      }
      items = this.getItemsFor(this.commandKind);
      switch (this.commandKind) {
        case 'toggleCommands':
          filterQuery = query.slice(1);
          items = fuzzaldrin.filter(items, filterQuery, {
            key: this.getFilterKey()
          });
          break;
        case 'numberCommands':
          _ref1 = query.match(/(\d+)(%)?$/).slice(1, 3), number = _ref1[0], percent = _ref1[1];
          this.count = Number(number);
          items = items.filter(function(_arg) {
            var name;
            name = _arg.name;
            if (percent != null) {
              return name === 'moveToLineByPercent';
            } else {
              return name === 'moveToLine';
            }
          });
      }
      this.setError(null);
      this.setFallbackItems(items);
      return this.selectItemView(this.list.find('li:first'));
    };

    View.prototype.setFallbackItems = function(items) {
      var item, itemView, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        itemView = $(this.viewForItem(item));
        itemView.data('select-list-item', item);
        _results.push(this.list.append(itemView));
      }
      return _results;
    };

    View.prototype.viewForItem = function(_arg) {
      var displayName, filterQuery, matches;
      displayName = _arg.displayName;
      filterQuery = this.getFilterQuery();
      if (filterQuery.startsWith('!')) {
        filterQuery = filterQuery.slice(1);
      }
      matches = fuzzaldrin.match(displayName, filterQuery);
      return $$(function() {
        var highlighter;
        highlighter = (function(_this) {
          return function(command, matches, offsetIndex) {
            var lastIndex, matchIndex, matchedChars, unmatched, _i, _len;
            lastIndex = 0;
            matchedChars = [];
            for (_i = 0, _len = matches.length; _i < _len; _i++) {
              matchIndex = matches[_i];
              matchIndex -= offsetIndex;
              if (matchIndex < 0) {
                continue;
              }
              unmatched = command.substring(lastIndex, matchIndex);
              if (unmatched) {
                if (matchedChars.length) {
                  _this.span(matchedChars.join(''), {
                    "class": 'character-match'
                  });
                }
                matchedChars = [];
                _this.text(unmatched);
              }
              matchedChars.push(command[matchIndex]);
              lastIndex = matchIndex + 1;
            }
            if (matchedChars.length) {
              _this.span(matchedChars.join(''), {
                "class": 'character-match'
              });
            }
            return _this.text(command.substring(lastIndex));
          };
        })(this);
        return this.li({
          "class": 'event',
          'data-event-name': name
        }, (function(_this) {
          return function() {
            return _this.span({
              title: displayName
            }, function() {
              return highlighter(displayName, matches, 0);
            });
          };
        })(this));
      });
    };

    View.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      this.cancel();
      return this.executeCommand(this.commandKind, name);
    };

    return View;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMtZXgtbW9kZS9saWIvdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkRBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBMEIsT0FBQSxDQUFRLHNCQUFSLENBQTFCLEVBQUMsc0JBQUEsY0FBRCxFQUFpQixTQUFBLENBQWpCLEVBQW9CLFVBQUEsRUFEcEIsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUZiLENBQUE7O0FBQUEsRUFJQSxTQUFBLEdBQVksQ0FKWixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDJCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQSxHQUFBO0FBQ0wsVUFBQSxLQUFBO2FBQUEsUUFBc0QsT0FBQSxDQUFRLFlBQVIsQ0FBdEQsRUFBQyxJQUFDLENBQUEsdUJBQUEsY0FBRixFQUFrQixJQUFDLENBQUEsdUJBQUEsY0FBbkIsRUFBbUMsSUFBQyxDQUFBLHVCQUFBLGNBQXBDLEVBQUEsTUFESztJQUFBLENBQVAsQ0FBQTs7QUFBQSxtQkFHQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLFNBQWIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxzQ0FBQSxTQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsdUJBQVYsRUFIVTtJQUFBLENBSFosQ0FBQTs7QUFBQSxtQkFRQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1osY0FEWTtJQUFBLENBUmQsQ0FBQTs7QUFBQSxtQkFX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

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus-ex-mode/lib/view.coffee
