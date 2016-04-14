(function() {
  module.exports = {
    activate: function() {
      return atom.commands.add('atom-text-editor', {
        'vim-mode-zz:close': (function(_this) {
          return function() {
            return _this.close();
          };
        })(this),
        'vim-mode-zz:saveAndClose': (function(_this) {
          return function() {
            return _this.saveAndClose();
          };
        })(this)
      });
    },
    close: function() {
      var pack, selected, treeView, _ref;
      pack = atom.packages.activePackages['tree-view'];
      treeView = pack != null ? pack.mainModule.treeView : void 0;
      selected = treeView != null ? treeView.selectedEntry() : void 0;
      if ((_ref = atom.workspace.getActivePaneItem()) != null) {
        _ref.destroy();
      }
      if (treeView && !atom.workspace.getActivePane().getActiveItem()) {
        treeView.selectEntry(selected);
        return treeView.show();
      }
    },
    saveAndClose: function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getPath() && editor.isModified()) {
        editor.save();
      }
      return this.close();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXp6L2xpYi92aW0tbW9kZS16ei5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0M7QUFBQSxRQUNsQyxtQkFBQSxFQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURhO0FBQUEsUUFFbEMsMEJBQUEsRUFBNEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGTTtPQUF0QyxFQURNO0lBQUEsQ0FBVjtBQUFBLElBTUEsS0FBQSxFQUFPLFNBQUEsR0FBQTtBQUNILFVBQUEsOEJBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWUsQ0FBQSxXQUFBLENBQXBDLENBQUE7QUFBQSxNQUNBLFFBQUEsa0JBQVcsSUFBSSxDQUFFLFVBQVUsQ0FBQyxpQkFENUIsQ0FBQTtBQUFBLE1BR0EsUUFBQSxzQkFBVyxRQUFRLENBQUUsYUFBVixDQUFBLFVBSFgsQ0FBQTs7WUFLa0MsQ0FBRSxPQUFwQyxDQUFBO09BTEE7QUFPQSxNQUFBLElBQUcsUUFBQSxJQUFhLENBQUEsSUFBSyxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBOEIsQ0FBQyxhQUEvQixDQUFBLENBQWpCO0FBQ0ksUUFBQSxRQUFRLENBQUMsV0FBVCxDQUFxQixRQUFyQixDQUFBLENBQUE7ZUFDQSxRQUFRLENBQUMsSUFBVCxDQUFBLEVBRko7T0FSRztJQUFBLENBTlA7QUFBQSxJQWtCQSxZQUFBLEVBQWMsU0FBQSxHQUFBO0FBQ1YsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBaUIsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLElBQXFCLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBdEM7QUFBQSxRQUFBLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBQSxDQUFBO09BREE7YUFFQSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBSFU7SUFBQSxDQWxCZDtHQURKLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/vim-mode-zz/lib/vim-mode-zz.coffee
