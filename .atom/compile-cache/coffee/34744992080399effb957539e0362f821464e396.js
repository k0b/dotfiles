(function() {
  var $, FileItem, FileView, View, git, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom-space-pen-views'), View = _ref.View, $ = _ref.$;

  git = require('../git');

  FileItem = (function(_super) {
    __extends(FileItem, _super);

    function FileItem() {
      return FileItem.__super__.constructor.apply(this, arguments);
    }

    FileItem.content = function(file) {
      console.log('file', file);
      return this.div({
        "class": "file " + file.type,
        'data-name': file.name
      }, (function(_this) {
        return function() {
          _this.span({
            "class": 'clickable text',
            click: 'select',
            title: file.name
          }, file.name);
          _this.i({
            "class": 'icon check clickable',
            click: 'select'
          });
          return _this.i({
            "class": "icon " + (file.type === 'modified' ? 'clickable' : '') + " file-" + file.type,
            click: 'showFileDiff'
          });
        };
      })(this));
    };

    FileItem.prototype.initialize = function(file) {
      return this.file = file;
    };

    FileItem.prototype.showFileDiff = function() {
      if (this.file.type === 'modified') {
        return this.file.showFileDiff(this.file.name);
      }
    };

    FileItem.prototype.select = function() {
      return this.file.select(this.file.name);
    };

    return FileItem;

  })(View);

  module.exports = FileView = (function(_super) {
    __extends(FileView, _super);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.content = function() {
      return this.div({
        "class": 'files'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading clickable'
          }, function() {
            _this.i({
              click: 'toggleBranch',
              "class": 'icon forked'
            });
            _this.span({
              click: 'toggleBranch'
            }, 'Workspace:');
            _this.span('', {
              outlet: 'workspaceTitle'
            });
            return _this.div({
              "class": 'action',
              click: 'selectAll'
            }, function() {
              _this.span('Select');
              _this.i({
                "class": 'icon check'
              });
              return _this.input({
                "class": 'invisible',
                type: 'checkbox',
                outlet: 'allCheckbox',
                checked: true
              });
            });
          });
          return _this.div({
            "class": 'placeholder'
          }, 'No local working copy changes detected');
        };
      })(this));
    };

    FileView.prototype.initialize = function() {
      this.files = {};
      this.arrayOfFiles = new Array;
      return this.hidden = false;
    };

    FileView.prototype.toggleBranch = function() {
      if (this.hidden) {
        this.addAll(this.arrayOfFiles);
      } else {
        this.clearAll();
      }
      return this.hidden = !this.hidden;
    };

    FileView.prototype.hasSelected = function() {
      var file, name, _ref1;
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        if (file.selected) {
          return true;
        }
      }
      return false;
    };

    FileView.prototype.getSelected = function() {
      var file, files, name, _ref1;
      files = {
        all: [],
        add: [],
        rem: []
      };
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        if (!file.selected) {
          continue;
        }
        files.all.push(name);
        switch (file.type) {
          case 'deleted':
            files.rem.push(name);
            break;
          default:
            files.add.push(name);
        }
      }
      return files;
    };

    FileView.prototype.showSelected = function() {
      var file, fnames, name, _ref1;
      fnames = [];
      this.arrayOfFiles = Object.keys(this.files).map((function(_this) {
        return function(file) {
          return _this.files[file];
        };
      })(this));
      this.find('.file').toArray().forEach((function(_this) {
        return function(div) {
          var f, name;
          f = $(div);
          if (name = f.attr('data-name')) {
            if (_this.files[name].selected) {
              fnames.push(name);
              f.addClass('active');
            } else {
              f.removeClass('active');
            }
          }
        };
      })(this));
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        if (__indexOf.call(fnames, name) < 0) {
          file.selected = false;
        }
      }
      this.parentView.showSelectedFiles();
    };

    FileView.prototype.clearAll = function() {
      this.find('>.file').remove();
    };

    FileView.prototype.addAll = function(files) {
      var file, fnames, name, select, showFileDiff, _ref1;
      fnames = [];
      this.clearAll();
      if (files.length) {
        this.removeClass('none');
        select = (function(_this) {
          return function(name) {
            return _this.selectFile(name);
          };
        })(this);
        showFileDiff = (function(_this) {
          return function(name) {
            return _this.showFileDiff(name);
          };
        })(this);
        files.forEach((function(_this) {
          return function(file) {
            var _base, _name;
            fnames.push(file.name);
            file.select = select;
            file.showFileDiff = showFileDiff;
            (_base = _this.files)[_name = file.name] || (_base[_name] = {
              name: file.name
            });
            _this.files[file.name].type = file.type;
            _this.files[file.name].selected = file.selected;
            _this.append(new FileItem(file));
          };
        })(this));
      } else {
        this.addClass('none');
      }
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        if (__indexOf.call(fnames, name) < 0) {
          file.selected = false;
        }
      }
      this.showSelected();
    };

    FileView.prototype.showFileDiff = function(name) {
      return git.diff(name).then((function(_this) {
        return function(diffs) {
          _this.parentView.diffView.clearAll();
          return _this.parentView.diffView.addAll(diffs);
        };
      })(this));
    };

    FileView.prototype.selectFile = function(name) {
      if (name) {
        this.files[name].selected = !!!this.files[name].selected;
      }
      this.allCheckbox.prop('checked', false);
      this.showSelected();
    };

    FileView.prototype.selectAll = function() {
      var file, name, val, _ref1;
      if (this.hidden) {
        return;
      }
      val = !!!this.allCheckbox.prop('checked');
      this.allCheckbox.prop('checked', val);
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        file.selected = val;
      }
      this.showSelected();
    };

    FileView.prototype.unselectAll = function() {
      var file, name, _i, _len, _ref1;
      _ref1 = this.files;
      for (file = _i = 0, _len = _ref1.length; _i < _len; file = ++_i) {
        name = _ref1[file];
        if (file.selected) {
          file.selected = false;
        }
      }
    };

    FileView.prototype.setWorkspaceTitle = function(title) {
      this.workspaceTitle.text(title);
    };

    return FileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9maWxlLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNDQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFlBQUEsSUFBRCxFQUFPLFNBQUEsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBRE4sQ0FBQTs7QUFBQSxFQUdNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsR0FBQTtBQUNSLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLElBQXBCLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBUSxPQUFBLEdBQU8sSUFBSSxDQUFDLElBQXBCO0FBQUEsUUFBNEIsV0FBQSxFQUFhLElBQUksQ0FBQyxJQUE5QztPQUFMLEVBQXlELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdkQsVUFBQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsWUFBQSxPQUFBLEVBQU8sZ0JBQVA7QUFBQSxZQUF5QixLQUFBLEVBQU8sUUFBaEM7QUFBQSxZQUEwQyxLQUFBLEVBQU8sSUFBSSxDQUFDLElBQXREO1dBQU4sRUFBa0UsSUFBSSxDQUFDLElBQXZFLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLFlBQUEsT0FBQSxFQUFPLHNCQUFQO0FBQUEsWUFBK0IsS0FBQSxFQUFPLFFBQXRDO1dBQUgsQ0FEQSxDQUFBO2lCQUVBLEtBQUMsQ0FBQSxDQUFELENBQUc7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

//# sourceURL=/Users/james/.atom/packages/git-control/lib/views/file-view.coffee
