(function() {
  var LogLine, LogView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  LogLine = (function(_super) {
    __extends(LogLine, _super);

    function LogLine() {
      return LogLine.__super__.constructor.apply(this, arguments);
    }

    LogLine.content = function(line) {
      return this.pre({
        "class": "" + (line.iserror ? 'error' : '')
      }, line.log);
    };

    return LogLine;

  })(View);

  module.exports = LogView = (function(_super) {
    __extends(LogView, _super);

    function LogView() {
      return LogView.__super__.constructor.apply(this, arguments);
    }

    LogView.content = function() {
      return this.div({
        "class": 'logger'
      });
    };

    LogView.prototype.log = function(log, iserror) {
      this.append(new LogLine({
        iserror: iserror,
        log: log
      }));
      this.scrollToBottom();
    };

    return LogView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9sb2ctdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0JBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRU07QUFDSiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxPQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLEVBQUEsR0FBRSxDQUFJLElBQUksQ0FBQyxPQUFSLEdBQXFCLE9BQXJCLEdBQWtDLEVBQW5DLENBQVQ7T0FBTCxFQUF1RCxJQUFJLENBQUMsR0FBNUQsRUFEUTtJQUFBLENBQVYsQ0FBQTs7bUJBQUE7O0tBRG9CLEtBRnRCLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsT0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsc0JBR0EsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLE9BQU4sR0FBQTtBQUNILE1BQUEsSUFBQyxDQUFBLE1BQUQsQ0FBWSxJQUFBLE9BQUEsQ0FBUTtBQUFBLFFBQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxRQUFrQixHQUFBLEVBQUssR0FBdkI7T0FBUixDQUFaLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQURBLENBREc7SUFBQSxDQUhMLENBQUE7O21CQUFBOztLQURvQixLQVB0QixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/james/.atom/packages/git-control/lib/views/log-view.coffee
