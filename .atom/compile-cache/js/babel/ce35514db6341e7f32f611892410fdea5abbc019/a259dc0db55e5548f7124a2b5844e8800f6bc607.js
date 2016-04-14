'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var NavigationStack = (function () {
  function NavigationStack() {
    var maxSize = arguments.length <= 0 || arguments[0] === undefined ? 500 : arguments[0];

    _classCallCheck(this, NavigationStack);

    if (maxSize >= 1) {
      this.maxSize = maxSize;
    } else {
      this.maxSize = 1;
    }
    this.stack = [];
  }

  _createClass(NavigationStack, [{
    key: 'dispose',
    value: function dispose() {
      this.maxSize = null;
      this.stack = null;
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return !this.stack || !this.stack.length || this.stack.length <= 0;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.stack = [];
    }
  }, {
    key: 'pushCurrentLocation',
    value: function pushCurrentLocation() {
      var editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return;
      }
      var loc = {
        position: editor.getCursorBufferPosition(),
        file: editor.getURI()
      };

      if (!loc.file || !loc.position || !loc.position.row || !loc.position.column) {
        return;
      }

      this.push(loc);
      return;
    }

    // Returns a promise that is complete when navigation is done.
  }, {
    key: 'restorePreviousLocation',
    value: function restorePreviousLocation() {
      var _this = this;

      if (this.isEmpty()) {
        return Promise.resolve();
      }

      if (!this.stack || this.stack.length < 1) {
        return Promise.resolve();
      }

      var lastLocation = this.stack.shift();
      return atom.workspace.open(lastLocation.file).then(function (editor) {
        _this.moveEditorCursorTo(editor, lastLocation.position);
        return;
      });
    }
  }, {
    key: 'moveEditorCursorTo',
    value: function moveEditorCursorTo(editor, pos) {
      if (!editor) {
        return;
      }
      editor.scrollToBufferPosition(pos);
      editor.setCursorBufferPosition(pos);
      return;
    }
  }, {
    key: 'push',
    value: function push(loc) {
      if (!this.stack || !loc) {
        return;
      }

      if (this.stack.length > 0 && this.compareLoc(this.stack[0], loc)) {
        return;
      }
      this.stack.unshift(loc);
      if (this.stack.length > this.maxSize) {
        this.stack.splice(-1, this.stack.length - this.maxSize);
      }
      return;
    }
  }, {
    key: 'compareLoc',
    value: function compareLoc(loc1, loc2) {
      if (!loc1 && !loc2) {
        return true;
      }

      if (!loc1 || !loc2) {
        return false;
      }

      return loc1.filepath === loc2.filepath && this.comparePosition(loc1.position, loc2.position);
    }
  }, {
    key: 'comparePosition',
    value: function comparePosition(pos1, pos2) {
      if (!pos1 && !pos2) {
        return true;
      }

      if (!pos1 || !pos2) {
        return false;
      }

      return pos1.column === pos2.column && pos1.row === pos2.row;
    }
  }]);

  return NavigationStack;
})();

exports.NavigationStack = NavigationStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9uYXZpZ2F0b3ItZ29kZWYvbGliL25hdmlnYXRpb24tc3RhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O0lBRUwsZUFBZTtBQUNQLFdBRFIsZUFBZSxHQUNTO1FBQWYsT0FBTyx5REFBRyxHQUFHOzswQkFEdEIsZUFBZTs7QUFFakIsUUFBSSxPQUFPLElBQUksQ0FBQyxFQUFFO0FBQ2hCLFVBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0tBQ3ZCLE1BQU07QUFDTCxVQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQTtLQUNqQjtBQUNELFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0dBQ2hCOztlQVJHLGVBQWU7O1dBVVgsbUJBQUc7QUFDVCxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtBQUNuQixVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtLQUNsQjs7O1dBRU8sbUJBQUc7QUFDVCxhQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQTtLQUNuRTs7O1dBRUssaUJBQUc7QUFDUCxVQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQTtLQUNoQjs7O1dBRW1CLCtCQUFHO0FBQ3JCLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtBQUNqRCxVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsZUFBTTtPQUNQO0FBQ0QsVUFBSSxHQUFHLEdBQUc7QUFDUixnQkFBUSxFQUFFLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRTtBQUMxQyxZQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRTtPQUN0QixDQUFBOztBQUVELFVBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJ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SSxDQUFDLEdBQUcsQUFBQyxDQUFDO0tBQ2xFOzs7U0F4R0csZUFBZTs7O1FBMkdiLGVBQWUsR0FBZixlQUFlIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9uYXZpZ2F0b3ItZ29kZWYvbGliL25hdmlnYXRpb24tc3RhY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jbGFzcyBOYXZpZ2F0aW9uU3RhY2sge1xuICBjb25zdHJ1Y3RvciAobWF4U2l6ZSA9IDUwMCkge1xuICAgIGlmIChtYXhTaXplID49IDEpIHtcbiAgICAgIHRoaXMubWF4U2l6ZSA9IG1heFNpemVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tYXhTaXplID0gMVxuICAgIH1cbiAgICB0aGlzLnN0YWNrID0gW11cbiAgfVxuXG4gIGRpc3Bvc2UgKCkge1xuICAgIHRoaXMubWF4U2l6ZSA9IG51bGxcbiAgICB0aGlzLnN0YWNrID0gbnVsbFxuICB9XG5cbiAgaXNFbXB0eSAoKSB7XG4gICAgcmV0dXJuICF0aGlzLnN0YWNrIHx8ICF0aGlzLnN0YWNrLmxlbmd0aCB8fCB0aGlzLnN0YWNrLmxlbmd0aCA8PSAwXG4gIH1cblxuICByZXNldCAoKSB7XG4gICAgdGhpcy5zdGFjayA9IFtdXG4gIH1cblxuICBwdXNoQ3VycmVudExvY2F0aW9uICgpIHtcbiAgICBsZXQgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgbG9jID0ge1xuICAgICAgcG9zaXRpb246IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLFxuICAgICAgZmlsZTogZWRpdG9yLmdldFVSSSgpXG4gICAgfVxuXG4gICAgaWYgKCFsb2MuZmlsZSB8fCAhbG9jLnBvc2l0aW9uIHx8ICFsb2MucG9zaXRpb24ucm93IHx8ICFsb2MucG9zaXRpb24uY29sdW1uKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnB1c2gobG9jKVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gUmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyBjb21wbGV0ZSB3aGVuIG5hdmlnYXRpb24gaXMgZG9uZS5cbiAgcmVzdG9yZVByZXZpb3VzTG9jYXRpb24gKCkge1xuICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnN0YWNrIHx8IHRoaXMuc3RhY2subGVuZ3RoIDwgMSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfVxuXG4gICAgbGV0IGxhc3RMb2NhdGlvbiA9IHRoaXMuc3RhY2suc2hpZnQoKVxuICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGxhc3RMb2NhdGlvbi5maWxlKS50aGVuKChlZGl0b3IpID0+IHtcbiAgICAgIHRoaXMubW92ZUVkaXRvckN1cnNvclRvKGVkaXRvciwgbGFzdExvY2F0aW9uLnBvc2l0aW9uKVxuICAgICAgcmV0dXJuXG4gICAgfSlcbiAgfVxuXG4gIG1vdmVFZGl0b3JDdXJzb3JUbyAoZWRpdG9yLCBwb3MpIHtcbiAgICBpZiAoIWVkaXRvcikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHBvcylcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9zKVxuICAgIHJldHVyblxuICB9XG5cbiAgcHVzaCAobG9jKSB7XG4gICAgaWYgKCF0aGlzLnN0YWNrIHx8ICFsb2MpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgdGhpcy5jb21wYXJlTG9jKHRoaXMuc3RhY2tbMF0sIGxvYykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnN0YWNrLnVuc2hpZnQobG9jKVxuICAgIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgdGhpcy5zdGFjay5zcGxpY2UoLTEsIHRoaXMuc3RhY2subGVuZ3RoIC0gdGhpcy5tYXhTaXplKVxuICAgIH1cbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbXBhcmVMb2MgKGxvYzEsIGxvYzIpIHtcbiAgICBpZiAoIWxvYzEgJiYgIWxvYzIpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKCFsb2MxIHx8ICFsb2MyKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gKGxvYzEuZmlsZXBhdGggPT09IGxvYzIuZmlsZXBhdGgpICYmIHRoaXMuY29tcGFyZVBvc2l0aW9uKGxvYzEucG9zaXRpb24sIGxvYzIucG9zaXRpb24pXG4gIH1cblxuICBjb21wYXJlUG9zaXRpb24gKHBvczEsIHBvczIpIHtcbiAgICBpZiAoIXBvczEgJiYgIXBvczIpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKCFwb3MxIHx8ICFwb3MyKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gKChwb3MxLmNvbHVtbiA9PT0gcG9zMi5jb2x1bW4pICYmIChwb3MxLnJvdyA9PT0gcG9zMi5yb3cpKVxuICB9XG59XG5cbmV4cG9ydCB7TmF2aWdhdGlvblN0YWNrfVxuIl19
//# sourceURL=/Users/james/.atom/packages/navigator-godef/lib/navigation-stack.js
