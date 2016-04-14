Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var GetDialog = (function () {
  function GetDialog(identifier, callback) {
    var _this = this;

    _classCallCheck(this, GetDialog);

    this.callback = callback;
    this.element = document.createElement('div');
    this.element.classList.add('goget');

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add(this.element, 'core:cancel', function () {
      _this.cancel();
    }));
    this.subscriptions.add(atom.commands.add(this.element, 'core:confirm', function () {
      _this.confirm();
    }));

    var message = document.createElement('div');
    message.textContent = 'Which Go Package Would You Like To Get?';
    message.style.padding = '1em';
    this.element.appendChild(message);

    this.input = document.createElement('atom-text-editor');
    this.input.setAttribute('mini', true);
    this.input.getModel().setText(identifier);
    this.element.appendChild(this.input);
  }

  _createClass(GetDialog, [{
    key: 'attach',
    value: function attach() {
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.input.focus();
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.close();
    }
  }, {
    key: 'confirm',
    value: function confirm() {
      var pack = this.input.getModel().getText();
      this.close();
      if (this.callback) {
        this.callback(pack);
      }
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

  return GetDialog;
})();

exports.GetDialog = GetDialog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1nZXQvbGliL2dldC1kaWFsb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRWtDLE1BQU07O0FBRnhDLFdBQVcsQ0FBQTs7SUFJTCxTQUFTO0FBQ0QsV0FEUixTQUFTLENBQ0EsVUFBVSxFQUFFLFFBQVEsRUFBRTs7OzBCQUQvQixTQUFTOztBQUVYLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0FBQ3hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1QyxRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7O0FBRW5DLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsWUFBTTtBQUFFLFlBQUssTUFBTSxFQUFFLENBQUE7S0FBRSxDQUFDLENBQUMsQ0FBQTtBQUMvRixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxZQUFNO0FBQUUsWUFBSyxPQUFPLEVBQUUsQ0FBQTtLQUFFLENBQUMsQ0FBQyxDQUFBOztBQUVqRyxRQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzNDLFdBQU8sQ0FBQyxXQUFXLEdBQUcseUNBQXlDLENBQUE7QUFDL0QsV0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO0FBQzdCLFFBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUVqQyxRQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUN2RCxRQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDckMsUUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDekMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQ3JDOztlQW5CRyxTQUFTOztXQXFCTixrQkFBRztBQUNSLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDeEMsWUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPO09BQ25CLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDbkI7OztXQUVNLGtCQUFHO0FBQ1IsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO0tBQ2I7OztXQUVPLG1CQUFHO0FBQ1QsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUMxQyxVQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDWixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUNwQjtBQUNELFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0tBQ3JCOzs7V0FFSyxpQkFBRztBQUNQLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7T0FDdEI7QUFDRCxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTs7QUFFbkIsVUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2QsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUNyQjtBQUNELFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0tBQ2xCOzs7U0FwREcsU0FBUzs7O1FBdURQLFNBQVMsR0FBVCxTQUFTIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1nZXQvbGliL2dldC1kaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5cbmNsYXNzIEdldERpYWxvZyB7XG4gIGNvbnN0cnVjdG9yIChpZGVudGlmaWVyLCBjYWxsYmFjaykge1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2dvZ2V0JylcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwgJ2NvcmU6Y2FuY2VsJywgKCkgPT4geyB0aGlzLmNhbmNlbCgpIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCAnY29yZTpjb25maXJtJywgKCkgPT4geyB0aGlzLmNvbmZpcm0oKSB9KSlcblxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gJ1doaWNoIEdvIFBhY2thZ2UgV291bGQgWW91IExpa2UgVG8gR2V0PydcbiAgICBtZXNzYWdlLnN0eWxlLnBhZGRpbmcgPSAnMWVtJ1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlKVxuXG4gICAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F0b20tdGV4dC1lZGl0b3InKVxuICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdtaW5pJywgdHJ1ZSlcbiAgICB0aGlzLmlucHV0LmdldE1vZGVsKCkuc2V0VGV4dChpZGVudGlmaWVyKVxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmlucHV0KVxuICB9XG5cbiAgYXR0YWNoICgpIHtcbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnRcbiAgICB9KVxuICAgIHRoaXMuaW5wdXQuZm9jdXMoKVxuICB9XG5cbiAgY2FuY2VsICgpIHtcbiAgICB0aGlzLmNsb3NlKClcbiAgfVxuXG4gIGNvbmZpcm0gKCkge1xuICAgIGxldCBwYWNrID0gdGhpcy5pbnB1dC5nZXRNb2RlbCgpLmdldFRleHQoKVxuICAgIHRoaXMuY2xvc2UoKVxuICAgIGlmICh0aGlzLmNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrKHBhY2spXG4gICAgfVxuICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsXG4gIH1cblxuICBjbG9zZSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsXG5cbiAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KClcbiAgICB9XG4gICAgdGhpcy5wYW5lbCA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQge0dldERpYWxvZ31cbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/go-get/lib/get-dialog.js
