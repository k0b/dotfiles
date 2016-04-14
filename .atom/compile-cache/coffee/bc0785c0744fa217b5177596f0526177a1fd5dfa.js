(function() {
  var $, $$, CommandPaletteView, SelectListView, match, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom-space-pen-views'), SelectListView = _ref.SelectListView, $ = _ref.$, $$ = _ref.$$;

  match = require('fuzzaldrin').match;

  module.exports = CommandPaletteView = (function(_super) {
    __extends(CommandPaletteView, _super);

    function CommandPaletteView() {
      return CommandPaletteView.__super__.constructor.apply(this, arguments);
    }

    CommandPaletteView.activate = function() {
      var view;
      view = new CommandPaletteView;
      return this.disposable = atom.commands.add('atom-workspace', 'command-palette:toggle', function() {
        return view.toggle();
      });
    };

    CommandPaletteView.deactivate = function() {
      return this.disposable.dispose();
    };

    CommandPaletteView.prototype.keyBindings = null;

    CommandPaletteView.prototype.initialize = function() {
      CommandPaletteView.__super__.initialize.apply(this, arguments);
      return this.addClass('command-palette');
    };

    CommandPaletteView.prototype.getFilterKey = function() {
      return 'displayName';
    };

    CommandPaletteView.prototype.cancelled = function() {
      return this.hide();
    };

    CommandPaletteView.prototype.toggle = function() {
      var _ref1;
      if ((_ref1 = this.panel) != null ? _ref1.isVisible() : void 0) {
        return this.cancel();
      } else {
        return this.show();
      }
    };

    CommandPaletteView.prototype.show = function(callback) {
      var commands;
      this.callback = callback;
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.storeFocusedElement();
      if (this.previouslyFocusedElement[0] && this.previouslyFocusedElement[0] !== document.body) {
        this.eventElement = this.previouslyFocusedElement[0];
      } else {
        this.eventElement = atom.views.getView(atom.workspace);
      }
      this.keyBindings = atom.keymaps.findKeyBindings({
        target: this.eventElement
      });
      commands = atom.commands.findCommands({
        target: this.eventElement
      });
      commands = _.sortBy(commands, 'displayName');
      this.setItems(commands);
      return this.focusFilterEditor();
    };

    CommandPaletteView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    CommandPaletteView.prototype.viewForItem = function(_arg) {
      var displayName, eventDescription, filterQuery, keyBindings, matches, name;
      name = _arg.name, displayName = _arg.displayName, eventDescription = _arg.eventDescription;
      keyBindings = this.keyBindings;
      filterQuery = this.getFilterQuery();
      matches = match(displayName, filterQuery);
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
            _this.div({
              "class": 'pull-right'
            }, function() {
              var binding, _i, _len, _results;
              _results = [];
              for (_i = 0, _len = keyBindings.length; _i < _len; _i++) {
                binding = keyBindings[_i];
                if (binding.command === name) {
                  _results.push(_this.kbd(_.humanizeKeystroke(binding.keystrokes), {
                    "class": 'key-binding'
                  }));
                }
              }
              return _results;
            });
            return _this.span({
              title: name
            }, function() {
              return highlighter(displayName, matches, 0);
            });
          };
        })(this));
      });
    };

    CommandPaletteView.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      this.cancel();
      return this.callback(name);
    };

    return CommandPaletteView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2NvbW1hbmQtdG9vbGJhci9saWIvZmluZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5REFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUEwQixPQUFBLENBQVEsc0JBQVIsQ0FBMUIsRUFBQyxzQkFBQSxjQUFELEVBQWlCLFNBQUEsQ0FBakIsRUFBb0IsVUFBQSxFQURwQixDQUFBOztBQUFBLEVBRUMsUUFBUyxPQUFBLENBQVEsWUFBUixFQUFULEtBRkQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLFFBQUQsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxHQUFBLENBQUEsa0JBQVAsQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyx3QkFBcEMsRUFBOEQsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxFQUFIO01BQUEsQ0FBOUQsRUFGTDtJQUFBLENBQVgsQ0FBQTs7QUFBQSxJQUlBLGtCQUFDLENBQUEsVUFBRCxHQUFhLFNBQUEsR0FBQTthQUNYLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLEVBRFc7SUFBQSxDQUpiLENBQUE7O0FBQUEsaUNBT0EsV0FBQSxHQUFhLElBUGIsQ0FBQTs7QUFBQSxpQ0FTQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxvREFBQSxTQUFBLENBQUEsQ0FBQTthQUVBLElBQUMsQ0FB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

//# sourceURL=/Users/james/.atom/packages/command-toolbar/lib/finder.coffee
