(function() {
  var CompositeDisposable, Emitter, View, getEditorState, _ref;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  getEditorState = null;

  View = require('./view');

  module.exports = {
    activate: function() {
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus-ex-mode:open': (function(_this) {
          return function() {
            return _this.toggle('normalCommands');
          };
        })(this),
        'vim-mode-plus-ex-mode:toggle-setting': (function(_this) {
          return function() {
            return _this.toggle('toggleCommands');
          };
        })(this)
      }));
    },
    toggle: function(commandKind) {
      if (getEditorState != null) {
        return this.getView().toggle(this.getVimState(), commandKind);
      } else {
        return this.onDidConsumeVim((function(_this) {
          return function() {
            return _this.getView().toggle(_this.getVimState(), commandKind);
          };
        })(this));
      }
    },
    deactivate: function() {
      var _ref1, _ref2;
      this.subscriptions.dispose();
      if ((_ref1 = this.view) != null) {
        if (typeof _ref1.destroy === "function") {
          _ref1.destroy();
        }
      }
      return _ref2 = {}, this.subscriptions = _ref2.subscriptions, this.view = _ref2.view, _ref2;
    },
    getView: function() {
      if (this.view != null) {
        return this.view;
      }
      View.init();
      return this.view = new View();
    },
    getVimState: function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      return getEditorState(editor);
    },
    onDidConsumeVim: function(fn) {
      return this.emitter.on('did-consume-vim', fn);
    },
    consumeVim: function(service) {
      getEditorState = service.getEditorState;
      return this.emitter.emit('did-consume-vim');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMtZXgtbW9kZS9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0RBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQWlCLElBRGpCLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRGpCLENBQUE7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLDhCQUFsQixFQUNqQjtBQUFBLFFBQUEsNEJBQUEsRUFBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBUSxnQkFBUixFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7QUFBQSxRQUNBLHNDQUFBLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQVEsZ0JBQVIsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRHhDO09BRGlCLENBQW5CLEVBSFE7SUFBQSxDQUFWO0FBQUEsSUFPQSxNQUFBLEVBQVEsU0FBQyxXQUFELEdBQUE7QUFDTixNQUFBLElBQUcsc0JBQUg7ZUFDRSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxNQUFYLENBQWtCLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBbEIsRUFBa0MsV0FBbEMsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDZixLQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQUMsQ0FBQSxXQUFELENBQUEsQ0FBbEIsRUFBa0MsV0FBbEMsRUFEZTtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLEVBSEY7T0FETTtJQUFBLENBUFI7QUFBQSxJQWNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixVQUFBLFlBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBQUEsQ0FBQTs7O2VBQ0ssQ0FBRTs7T0FEUDthQUVBLFFBQTBCLEVBQTFCLEVBQUMsSUFBQyxDQUFBLHNCQUFBLGFBQUYsRUFBaUIsSUFBQyxDQUFBLGFBQUEsSUFBbEIsRUFBQSxNQUhVO0lBQUEsQ0FkWjtBQUFBLElBbUJBLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQWdCLGlCQUFoQjtBQUFBLGVBQU8sSUFBQyxDQUFBLElBQVIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsSUFBTCxDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxJQUFBLENBQUEsRUFITDtJQUFBLENBbkJUO0FBQUEsSUF3QkEsV0FBQSxFQUFhLFNBQUEsR0FBQTtBQUNYLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7YUFDQSxjQUFBLENBQWUsTUFBZixFQUZXO0lBQUEsQ0F4QmI7QUFBQSxJQTRCQSxlQUFBLEVBQWlCLFNBQUMsRUFBRCxHQUFBO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0IsRUFEZTtJQUFBLENBNUJqQjtBQUFBLElBK0JBLFVBQUEsRUFBWSxTQUFDLE9BQUQsR0FBQTtBQUNWLE1BQUMsaUJBQWtCLFFBQWxCLGNBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGlCQUFkLEVBRlU7SUFBQSxDQS9CWjtHQUxGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/vim-mode-plus-ex-mode/lib/main.coffee
