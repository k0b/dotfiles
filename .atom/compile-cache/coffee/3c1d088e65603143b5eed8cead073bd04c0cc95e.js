(function() {
  module.exports = {
    config: {
      iconsPlus: {
        type: 'boolean',
        "default": false,
        description: 'Use additional and enhanced icons.'
      },
      noColor: {
        type: 'boolean',
        "default": false,
        description: 'Display icons without color.'
      }
    },
    activate: function(state) {
      atom.config.onDidChange('seti-icons.iconsPlus', (function(_this) {
        return function(_arg) {
          var newValue;
          newValue = _arg.newValue;
          return _this.iconsPlus(newValue);
        };
      })(this));
      atom.config.onDidChange('seti-icons.noColor', (function(_this) {
        return function(_arg) {
          var newValue;
          newValue = _arg.newValue;
          return _this.noColor(newValue);
        };
      })(this));
      this.iconsPlus(atom.config.get('seti-icons.iconsPlus'));
      return this.noColor(atom.config.get('seti-icons.noColor'));
    },
    update: function(enable, text) {
      var body;
      body = document.querySelector('body');
      if (enable) {
        return body.className = "" + body.className + " " + text;
      } else {
        return body.className = body.className.replace(" " + text, '');
      }
    },
    iconsPlus: function(enable) {
      return this.update(enable, 'seti-icons-plus');
    },
    noColor: function(enable) {
      return this.update(enable, 'seti-icons-no-color');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3NldGktaWNvbnMvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxvQ0FGYjtPQURGO0FBQUEsTUFJQSxPQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDhCQUZiO09BTEY7S0FERjtBQUFBLElBVUEsUUFBQSxFQUFVLFNBQUUsS0FBRixHQUFBO0FBQ1IsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0Isc0JBQXhCLEVBQWdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUM5QyxjQUFBLFFBQUE7QUFBQSxVQURpRCxXQUFGLEtBQUUsUUFDakQsQ0FBQTtpQkFBQSxLQUFDLENBQUEsU0FBRCxDQUFXLFFBQVgsRUFEOEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRCxDQUFBLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixvQkFBeEIsRUFBOEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzVDLGNBQUEsUUFBQTtBQUFBLFVBRCtDLFdBQUYsS0FBRSxRQUMvQyxDQUFBO2lCQUFBLEtBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUQ0QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDLENBSEEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLENBQVgsQ0FOQSxDQUFBO2FBT0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLENBQVQsRUFSUTtJQUFBLENBVlY7QUFBQSxJQW9CQSxNQUFBLEVBQVEsU0FBRSxNQUFGLEVBQVUsSUFBVixHQUFBO0FBQ04sVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBUCxDQUFBO0FBRUEsTUFBQSxJQUFHLE1BQUg7ZUFDRSxJQUFJLENBQUMsU0FBTCxHQUFpQixFQUFBLEdBQUcsSUFBSSxDQUFDLFNBQVIsR0FBa0IsR0FBbEIsR0FBcUIsS0FEeEM7T0FBQSxNQUFBO2VBR0UsSUFBSSxDQUFDLFNBQUwsR0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFmLENBQXdCLEdBQUEsR0FBRyxJQUEzQixFQUFtQyxFQUFuQyxFQUhuQjtPQUhNO0lBQUEsQ0FwQlI7QUFBQSxJQTRCQSxTQUFBLEVBQVcsU0FBRSxNQUFGLEdBQUE7YUFDVCxJQUFDLENBQUEsTUFBRCxDQUFRLE1BQVIsRUFBZ0IsaUJBQWhCLEVBRFM7SUFBQSxDQTVCWDtBQUFBLElBK0JBLE9BQUEsRUFBUyxTQUFFLE1BQUYsR0FBQTthQUNQLElBQUMsQ0FBQSxNQUFELENBQVEsTUFBUixFQUFnQixxQkFBaEIsRUFETztJQUFBLENBL0JUO0dBREYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/james/.atom/packages/seti-icons/index.coffee
