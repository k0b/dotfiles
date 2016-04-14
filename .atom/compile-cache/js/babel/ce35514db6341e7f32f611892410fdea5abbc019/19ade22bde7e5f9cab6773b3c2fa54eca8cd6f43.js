'use babel';
/* eslint-env jasmine */

describe('go-plus', function () {
  var mainModule = null;

  beforeEach(function () {
    waitsForPromise(function () {
      return atom.packages.activatePackage('go-plus').then(function (pack) {
        mainModule = pack.mainModule;
        return;
      });
    });
  });

  describe('when the go-plus package is activated', function () {
    it('activates successfully', function () {
      expect(mainModule).toBeDefined();
      expect(mainModule).toBeTruthy();
      expect(mainModule.activate).toBeDefined();
      expect(mainModule.deactivate).toBeDefined();
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1wbHVzL3NwZWMvbWFpbi1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7O0FBR1gsUUFBUSxDQUFDLFNBQVMsRUFBRSxZQUFNO0FBQ3hCLE1BQUksVUFBVSxHQUFHLElBQUksQ0FBQTs7QUFFckIsWUFBVSxDQUFDLFlBQU07QUFDZixtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDN0Qsa0JBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFBO0FBQzVCLGVBQU07T0FDUCxDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLHVDQUF1QyxFQUFFLFlBQU07QUFDdEQsTUFBRSxDQUFDLHdCQUF3QixFQUFFLFlBQU07QUFDakMsWUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2hDLFlBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtBQUMvQixZQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ3pDLFlBQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7S0FDNUMsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1wbHVzL3NwZWMvbWFpbi1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5kZXNjcmliZSgnZ28tcGx1cycsICgpID0+IHtcbiAgbGV0IG1haW5Nb2R1bGUgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnZ28tcGx1cycpLnRoZW4oKHBhY2spID0+IHtcbiAgICAgICAgbWFpbk1vZHVsZSA9IHBhY2subWFpbk1vZHVsZVxuICAgICAgICByZXR1cm5cbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiB0aGUgZ28tcGx1cyBwYWNrYWdlIGlzIGFjdGl2YXRlZCcsICgpID0+IHtcbiAgICBpdCgnYWN0aXZhdGVzIHN1Y2Nlc3NmdWxseScsICgpID0+IHtcbiAgICAgIGV4cGVjdChtYWluTW9kdWxlKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QobWFpbk1vZHVsZSkudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QobWFpbk1vZHVsZS5hY3RpdmF0ZSkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVhY3RpdmF0ZSkudG9CZURlZmluZWQoKVxuICAgIH0pXG4gIH0pXG59KVxuIl19
//# sourceURL=/Users/james/.atom/packages/go-plus/spec/main-spec.js
