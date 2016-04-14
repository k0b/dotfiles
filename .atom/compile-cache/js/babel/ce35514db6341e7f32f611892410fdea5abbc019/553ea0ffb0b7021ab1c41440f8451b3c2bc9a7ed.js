Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var RenameDialog = (function () {
  function RenameDialog(identifier, callback) {
    var _this = this;

    _classCallCheck(this, RenameDialog);

    this.identifier = identifier;
    this.callback = callback;
    this.element = document.createElement('div');
    this.element.classList.add('gorename');

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add(this.element, 'core:cancel', function () {
      _this.cancel();
    }));
    this.subscriptions.add(atom.commands.add(this.element, 'core:confirm', function () {
      _this.confirm();
    }));

    this.oncancel = null;

    var message = document.createElement('div');
    message.textContent = 'Rename ' + identifier + ' to:';
    message.style.padding = '1em';
    this.element.appendChild(message);

    this.input = document.createElement('atom-text-editor');
    this.input.setAttribute('mini', true);
    this.element.appendChild(this.input);
  }

  _createClass(RenameDialog, [{
    key: 'attach',
    value: function attach() {
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.input.model.setText(this.identifier);
      this.input.model.selectAll();
      this.input.focus();
    }
  }, {
    key: 'onCancelled',
    value: function onCancelled(callback) {
      this.oncancel = callback;
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.close();
      if (this.oncancel) {
        this.oncancel();
        this.oncancel = null;
      }
    }
  }, {
    key: 'confirm',
    value: function confirm() {
      var newName = this.input.getModel().getText();
      this.close();
      this.callback(newName);
      this.callback = null;
    }
  }, {
    key: 'close',
    value: function close() {
      this.subscriptions.dispose();
      if (this.element) {
        this.element.remove();
      }
      this.element = null;

      if (this.panel) {
        this.panel.destroy();
      }
      this.panel = null;
    }
  }]);

  return RenameDialog;
})();

exports.RenameDialog = RenameDialog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nb3JlbmFtZS9saWIvcmVuYW1lLWRpYWxvZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFa0MsTUFBTTs7QUFGeEMsV0FBVyxDQUFBOztJQUlMLFlBQVk7QUFDSixXQURSLFlBQVksQ0FDSCxVQUFVLEVBQUUsUUFBUSxFQUFFOzs7MEJBRC9CLFlBQVk7O0FBRWQsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDeEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzVDLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTs7QUFFdEMsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxZQUFNO0FBQUUsWUFBSyxNQUFNLEVBQUUsQ0FBQTtLQUFFLENBQUMsQ0FBQyxDQUFBO0FBQy9GLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFlBQU07QUFBRSxZQUFLLE9BQU8sRUFBRSxDQUFBO0tBQUUsQ0FBQyxDQUFDLENBQUE7O0FBRWpHLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBOztBQUVwQixRQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzNDLFdBQU8sQ0FBQyxXQUFXLGVBQWEsVUFBVSxTQUFNLENBQUE7QUFDaEQsV0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO0FBQzdCLFFBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUVqQyxRQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUN2RCxRQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDckMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQ3JDOztlQXJCRyxZQUFZOztXQXVCVCxrQkFBRztBQUNSLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDeEMsWUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPO09BQ25CLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDekMsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQTtLQUNuQjs7O1dBRVcscUJBQUMsUUFBUSxFQUFFO0FBQ3JCLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0tBQ3pCOzs7V0FFTSxrQkFBRztBQUNSLFVBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNaLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDZixZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtPQUNyQjtLQUNGOzs7V0FFTyxtQkFBRztBQUNULFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDN0MsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ1osVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUN0QixVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtLQUNyQjs7O1dBRUssaUJBQUc7QUFDUCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixZQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFBO09BQ3RCO0FBQ0QsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7O0FBRW5CLFVBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNkLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDckI7QUFDRCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtLQUNsQjs7O1NBOURHLFlBQVk7OztRQWlFVixZQUFZLEdBQVosWUFBWSIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvZ29yZW5hbWUvbGliL3JlbmFtZS1kaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5cbmNsYXNzIFJlbmFtZURpYWxvZyB7XG4gIGNvbnN0cnVjdG9yIChpZGVudGlmaWVyLCBjYWxsYmFjaykge1xuICAgIHRoaXMuaWRlbnRpZmllciA9IGlkZW50aWZpZXJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2tcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdnb3JlbmFtZScpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsICdjb3JlOmNhbmNlbCcsICgpID0+IHsgdGhpcy5jYW5jZWwoKSB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwgJ2NvcmU6Y29uZmlybScsICgpID0+IHsgdGhpcy5jb25maXJtKCkgfSkpXG5cbiAgICB0aGlzLm9uY2FuY2VsID0gbnVsbFxuXG4gICAgbGV0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBgUmVuYW1lICR7aWRlbnRpZmllcn0gdG86YFxuICAgIG1lc3NhZ2Uuc3R5bGUucGFkZGluZyA9ICcxZW0nXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKG1lc3NhZ2UpXG5cbiAgICB0aGlzLmlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ21pbmknLCB0cnVlKVxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmlucHV0KVxuICB9XG5cbiAgYXR0YWNoICgpIHtcbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnRcbiAgICB9KVxuICAgIHRoaXMuaW5wdXQubW9kZWwuc2V0VGV4dCh0aGlzLmlkZW50aWZpZXIpXG4gICAgdGhpcy5pbnB1dC5tb2RlbC5zZWxlY3RBbGwoKVxuICAgIHRoaXMuaW5wdXQuZm9jdXMoKVxuICB9XG5cbiAgb25DYW5jZWxsZWQgKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vbmNhbmNlbCA9IGNhbGxiYWNrXG4gIH1cblxuICBjYW5jZWwgKCkge1xuICAgIHRoaXMuY2xvc2UoKVxuICAgIGlmICh0aGlzLm9uY2FuY2VsKSB7XG4gICAgICB0aGlzLm9uY2FuY2VsKClcbiAgICAgIHRoaXMub25jYW5jZWwgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgY29uZmlybSAoKSB7XG4gICAgbGV0IG5ld05hbWUgPSB0aGlzLmlucHV0LmdldE1vZGVsKCkuZ2V0VGV4dCgpXG4gICAgdGhpcy5jbG9zZSgpXG4gICAgdGhpcy5jYWxsYmFjayhuZXdOYW1lKVxuICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsXG4gIH1cblxuICBjbG9zZSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsXG5cbiAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KClcbiAgICB9XG4gICAgdGhpcy5wYW5lbCA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQge1JlbmFtZURpYWxvZ31cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/gorename/lib/rename-dialog.js
