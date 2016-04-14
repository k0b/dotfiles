(function() {
  var findClosingIndex, split, _ref;

  _ref = require('../lib/utils'), findClosingIndex = _ref.findClosingIndex, split = _ref.split;

  describe('.split()', function() {
    var tests;
    tests = [['a,b,c', ['a', 'b', 'c']], ['a,b(),c', ['a', 'b()', 'c']], ['a,b(c)', ['a', 'b(c)']], ['a,(b, c)', ['a', '(b,c)']], ['a,(b, c())', ['a', '(b,c())']], ['a(b, c())', ['a(b,c())']], ['a,)(', ['a']], ['a(,', []], ['(,', []], ['(,(,(,)', []], ['a,(,', ['a']], ['a,((),', ['a']], ['a,()),', ['a', '()']]];
    return tests.forEach(function(_arg) {
      var expected, source;
      source = _arg[0], expected = _arg[1];
      return it("splits " + (jasmine.pp(source)) + " as " + (jasmine.pp(expected)), function() {
        return expect(split(source)).toEqual(expected);
      });
    });
  });

  describe('.findClosingIndex()', function() {
    var tests;
    tests = [['a(', -1], ['a()', 2], ['a(((()', -1]];
    return tests.forEach(function(_arg) {
      var expected, source;
      source = _arg[0], expected = _arg[1];
      return it("returs the index of the closing character", function() {
        return expect(findClosingIndex(source, 2, '(', ')')).toEqual(expected);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvdXRpbHMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkJBQUE7O0FBQUEsRUFBQSxPQUE0QixPQUFBLENBQVEsY0FBUixDQUE1QixFQUFDLHdCQUFBLGdCQUFELEVBQW1CLGFBQUEsS0FBbkIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxDQUNOLENBQUMsT0FBRCxFQUFVLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBQVYsQ0FETSxFQUVOLENBQUMsU0FBRCxFQUFZLENBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxHQUFiLENBQVosQ0FGTSxFQUdOLENBQUMsUUFBRCxFQUFXLENBQUMsR0FBRCxFQUFNLE1BQU4sQ0FBWCxDQUhNLEVBSU4sQ0FBQyxVQUFELEVBQWEsQ0FBQyxHQUFELEVBQU0sT0FBTixDQUFiLENBSk0sRUFLTixDQUFDLFlBQUQsRUFBZSxDQUFDLEdBQUQsRUFBTSxTQUFOLENBQWYsQ0FMTSxFQU1OLENBQUMsV0FBRCxFQUFjLENBQUMsVUFBRCxDQUFkLENBTk0sRUFPTixDQUFDLE1BQUQsRUFBUyxDQUFDLEdBQUQsQ0FBVCxDQVBNLEVBUU4sQ0FBQyxLQUFELEVBQVEsRUFBUixDQVJNLEVBU04sQ0FBQyxJQUFELEVBQU8sRUFBUCxDQVRNLEVBVU4sQ0FBQyxTQUFELEVBQVksRUFBWixDQVZNLEVBV04sQ0FBQyxNQUFELEVBQVMsQ0FBQyxHQUFELENBQVQsQ0FYTSxFQVlOLENBQUMsUUFBRCxFQUFXLENBQUMsR0FBRCxDQUFYLENBWk0sRUFhTixDQUFDLFFBQUQsRUFBVyxDQUFDLEdBQUQsRUFBTSxJQUFOLENBQVgsQ0FiTSxDQUFSLENBQUE7V0FnQkEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLElBQUQsR0FBQTtBQUNaLFVBQUEsZ0JBQUE7QUFBQSxNQURjLGtCQUFRLGtCQUN0QixDQUFBO2FBQUEsRUFBQSxDQUFJLFNBQUEsR0FBUSxDQUFDLE9BQU8sQ0FBQyxFQUFSLENBQVcsTUFBWCxDQUFELENBQVIsR0FBMkIsTUFBM0IsR0FBZ0MsQ0FBQyxPQUFPLENBQUMsRUFBUixDQUFXLFFBQVgsQ0FBRCxDQUFwQyxFQUE2RCxTQUFBLEdBQUE7ZUFDM0QsTUFBQSxDQUFPLEtBQUEsQ0FBTSxNQUFOLENBQVAsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixRQUE5QixFQUQyRDtNQUFBLENBQTdELEVBRFk7SUFBQSxDQUFkLEVBakJtQjtFQUFBLENBQXJCLENBRkEsQ0FBQTs7QUFBQSxFQXVCQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFFBQUEsS0FBQTtBQUFBLElBQUEsS0FBQSxHQUFRLENBQ04sQ0FBQyxJQUFELEVBQU8sQ0FBQSxDQUFQLENBRE0sRUFFTixDQUFDLEtBQUQsRUFBUSxDQUFSLENBRk0sRUFHTixDQUFDLFFBQUQsRUFBVyxDQUFBLENBQVgsQ0FITSxDQUFSLENBQUE7V0FNQSxLQUFLLENBQUMsT0FBTixDQUFjLFNBQUMsSUFBRCxHQUFBO0FBQ1osVUFBQSxnQkFBQTtBQUFBLE1BRGMsa0JBQVEsa0JBQ3RCLENBQUE7YUFBQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO2VBQzlDLE1BQUEsQ0FBTyxnQkFBQSxDQUFpQixNQUFqQixFQUF5QixDQUF6QixFQUE0QixHQUE1QixFQUFpQyxHQUFqQyxDQUFQLENBQTZDLENBQUMsT0FBOUMsQ0FBc0QsUUFBdEQsRUFEOEM7TUFBQSxDQUFoRCxFQURZO0lBQUEsQ0FBZCxFQVA4QjtFQUFBLENBQWhDLENBdkJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/pigments/spec/utils-spec.coffee
