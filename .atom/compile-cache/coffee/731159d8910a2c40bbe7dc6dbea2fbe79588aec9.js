(function() {
  var DiffLine, DiffView, View, fmtNum,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  DiffLine = (function(_super) {
    __extends(DiffLine, _super);

    function DiffLine() {
      return DiffLine.__super__.constructor.apply(this, arguments);
    }

    DiffLine.content = function(line) {
      return this.div({
        "class": "line " + line.type
      }, (function(_this) {
        return function() {
          _this.pre({
            "class": "lineno " + (!line.lineno ? 'invisible' : '')
          }, line.lineno);
          return _this.pre({
            outlet: 'linetext'
          }, line.text);
        };
      })(this));
    };

    DiffLine.prototype.initialize = function(params) {
      if (params.type === 'heading') {
        return this.linetext.click(function() {
          return atom.workspace.open(params.text);
        });
      }
    };

    return DiffLine;

  })(View);

  fmtNum = function(num) {
    return ("     " + (num || '') + " ").slice(-6);
  };

  module.exports = DiffView = (function(_super) {
    __extends(DiffView, _super);

    function DiffView() {
      return DiffView.__super__.constructor.apply(this, arguments);
    }

    DiffView.content = function() {
      return this.div({
        "class": 'diff'
      });
    };

    DiffView.prototype.clearAll = function() {
      this.find('>.line').remove();
    };

    DiffView.prototype.addAll = function(diffs) {
      this.clearAll();
      diffs.forEach((function(_this) {
        return function(diff) {
          var file, noa, nob;
          if ((file = diff['+++']) === '+++ /dev/null') {
            file = diff['---'];
          }
          _this.append(new DiffLine({
            type: 'heading',
            text: file
          }));
          noa = 0;
          nob = 0;
          diff.lines.forEach(function(line) {
            var atend, atstart, klass, linea, lineb, lineno, _ref;
            klass = '';
            lineno = void 0;
            if (/^@@ /.test(line)) {
              _ref = line.replace(/-|\+/g, '').split(' '), atstart = _ref[0], linea = _ref[1], lineb = _ref[2], atend = _ref[3];
              noa = parseInt(linea, 10);
              nob = parseInt(lineb, 10);
              klass = 'subtle';
            } else {
              lineno = "" + (fmtNum(noa)) + (fmtNum(nob));
              if (/^-/.test(line)) {
                klass = 'red';
                lineno = "" + (fmtNum(noa)) + (fmtNum(0));
                noa++;
              } else if (/^\+/.test(line)) {
                klass = 'green';
                lineno = "" + (fmtNum(0)) + (fmtNum(nob));
                nob++;
              } else {
                noa++;
                nob++;
              }
            }
            _this.append(new DiffLine({
              type: klass,
              text: line,
              lineno: lineno
            }));
          });
        };
      })(this));
    };

    return DiffView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9kaWZmLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBUSxPQUFBLEdBQU8sSUFBSSxDQUFDLElBQXBCO09BQUwsRUFBaUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUMvQixVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBUSxTQUFBLEdBQVEsQ0FBQyxDQUFBLElBQVcsQ0FBQyxNQUFaLEdBQXdCLFdBQXhCLEdBQXlDLEVBQTFDLENBQWhCO1dBQUwsRUFBcUUsSUFBSSxDQUFDLE1BQTFFLENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxNQUFBLEVBQVEsVUFBUjtXQUFMLEVBQXlCLElBQUksQ0FBQyxJQUE5QixFQUYrQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsdUJBS0EsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1YsTUFBQSxJQUFHLE1BQU0sQ0FBQyxJQUFQLEtBQWUsU0FBbEI7ZUFBaUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLFNBQUEsR0FBQTtpQkFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsTUFBTSxDQUFDLElBQTNCLEVBQUg7UUFBQSxDQUFoQixFQUFqQztPQURVO0lBQUEsQ0FMWixDQUFBOztvQkFBQTs7S0FEcUIsS0FGdkIsQ0FBQTs7QUFBQSxFQVdBLE1BQUEsR0FBUyxTQUFDLEdBQUQsR0FBQTtBQUNQLFdBQU8sQ0FBQyxPQUFBLEdBQU0sQ0FBQyxHQUFBLElBQU8sRUFBUixDQUFOLEdBQWlCLEdBQWxCLENBQW9CLENBQUMsS0FBckIsQ0FBMkIsQ0FBQSxDQUEzQixDQUFQLENBRE87RUFBQSxDQVhULENBQUE7O0FBQUEsRUFjQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sTUFBUDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsdUJBR0EsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLENBQWUsQ0FBQyxNQUFoQixDQUFBLENBQUEsQ0FEUTtJQUFBLENBSFYsQ0FBQTs7QUFBQSx1QkFPQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7QUFDTixNQUFBLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQSxLQUFLLENBQUMsT0FBTixDQUFjLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUNaLGNBQUEsY0FBQTtBQUFBLFVBQUEsSUFBRyxDQUFDLElBQUEsR0FBTyxJQUFLLENBQUEsS0FBQSxDQUFiLENBQUEsS0FBd0IsZUFBM0I7QUFDRSxZQUFBLElBQUEsR0FBTyxJQUFLLENBQUEsS0FBQSxDQUFaLENBREY7V0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBWSxJQUFBLFFBQUEsQ0FBUztBQUFBLFlBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxZQUFpQixJQUFBLEVBQU0sSUFBdkI7V0FBVCxDQUFaLENBSEEsQ0FBQTtBQUFBLFVBS0EsR0FBQSxHQUFNLENBTE4sQ0FBQTtBQUFBLFVBTUEsR0FBQSxHQUFNLENBTk4sQ0FBQTtBQUFBLFVBUUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFNBQUMsSUFBRCxHQUFBO0FBQ2pCLGdCQUFBLGlEQUFBO0FBQUEsWUFBQSxLQUFBLEdBQVEsRUFBUixDQUFBO0FBQUEsWUFDQSxNQUFBLEdBQVMsTUFEVCxDQUFBO0FBR0EsWUFBQSxJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWixDQUFIO0FBRUUsY0FBQSxPQUFpQyxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsRUFBc0IsRUFBdEIsQ0FBeUIsQ0FBQyxLQUExQixDQUFnQyxHQUFoQyxDQUFqQyxFQUFDLGlCQUFELEVBQVUsZUFBVixFQUFpQixlQUFqQixFQUF3QixlQUF4QixDQUFBO0FBQUEsY0FDQSxHQUFBLEdBQU0sUUFBQSxDQUFTLEtBQVQsRUFBZ0IsRUFBaEIsQ0FETixDQUFBO0FBQUEsY0FFQSxHQUFBLEdBQU0sUUFBQSxDQUFTLEtBQVQsRUFBZ0IsRUFBaEIsQ0FGTixDQUFBO0FBQUEsY0FHQSxLQUFBLEdBQVEsUUFIUixDQUZGO2FBQUEsTUFBQTtBQVFFLGNBQUEsTUFBQSxHQUFTLEVBQUEsR0FBRSxDQUFDLE1BQUEsQ0FBTyxHQUFQLENBQUQsQ0FBRixHQUFlLENBQUMsTUFBQSxDQUFPLEdBQVAsQ0FBRCxDQUF4QixDQUFBO0FBRUEsY0FBQSxJQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixDQUFIO0FBQ0UsZ0JBQUEsS0FBQSxHQUFRLEtBQVIsQ0FBQTtBQUFBLGdCQUNBLE1BQUEsR0FBUyxFQUFBLEdBQUUsQ0FBQyxNQUFBLENBQU8sR0FBUCxDQUFELENBQUYsR0FBZSxDQUFDLE1BQUEsQ0FBTyxDQUFQLENBQUQsQ0FEeEIsQ0FBQTtBQUFBLGdCQUVBLEdBQUEsRUFGQSxDQURGO2VBQUEsTUFJSyxJQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFIO0FBQ0gsZ0JBQUEsS0FBQSxHQUFRLE9BQVIsQ0FBQTtBQUFBLGdCQUNBLE1BQUEsR0FBUyxFQUFBLEdBQUUsQ0FBQyxNQUFBLENBQU8sQ0FBUCxDQUFELENBQUYsR0FBYSxDQUFDLE1BQUEsQ0FBTyxHQUFQLENBQUQsQ0FEdEIsQ0FBQTtBQUFBLGdCQUVBLEdBQUEsRUFGQSxDQURHO2VBQUEsTUFBQTtBQUtILGdCQUFBLEdBQUEsRUFBQSxDQUFBO0FBQUEsZ0JBQ0EsR0FBQSxFQURBLENBTEc7ZUFkUDthQUhBO0FBQUEsWUF5QkEsS0FBQyxDQUFBLE1BQUQsQ0FBWSxJQUFBLFFBQUEsQ0FBUztBQUFBLGNBQUEsSUFBQSxFQUFNLEtBQU47QUFBQSxjQUFhLElBQUEsRUFBTSxJQUFuQjtBQUFBLGNBQXlCLE1BQUEsRUFBUSxNQUFqQzthQUFULENBQVosQ0F6QkEsQ0FEaUI7VUFBQSxDQUFuQixDQVJBLENBRFk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkLENBRkEsQ0FETTtJQUFBLENBUFIsQ0FBQTs7b0JBQUE7O0tBRHFCLEtBZnZCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/git-control/lib/views/diff-view.coffee
