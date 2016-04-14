'use babel';
/* eslint-env jasmine */

describe('builder-go', function () {
  var mainModule = null;

  beforeEach(function () {
    waitsForPromise(function () {
      return atom.packages.activatePackage('go-config').then(function () {
        return atom.packages.activatePackage('builder-go');
      }).then(function (pack) {
        mainModule = pack.mainModule;
      });
    });

    waitsFor(function () {
      return mainModule.getGoconfig() !== false;
    });
  });

  describe('when the builder-go package is activated', function () {
    it('activates successfully', function () {
      expect(mainModule).toBeDefined();
      expect(mainModule).toBeTruthy();
      expect(mainModule.getBuilder).toBeDefined();
      expect(mainModule.getGoconfig).toBeDefined();
      expect(mainModule.consumeGoconfig).toBeDefined();
      expect(mainModule.getGoconfig()).toBeTruthy();
      expect(mainModule.getBuilder()).toBeTruthy();
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9idWlsZGVyLWdvL3NwZWMvbWFpbi1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7O0FBR1gsUUFBUSxDQUFDLFlBQVksRUFBRSxZQUFNO0FBQzNCLE1BQUksVUFBVSxHQUFHLElBQUksQ0FBQTs7QUFFckIsWUFBVSxDQUFDLFlBQU07QUFDZixtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUMzRCxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFBO09BQ25ELENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDaEIsa0JBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFBO09BQzdCLENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTs7QUFFRixZQUFRLENBQUMsWUFBTTtBQUNiLGFBQU8sVUFBVSxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssQ0FBQTtLQUMxQyxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLDBDQUEwQyxFQUFFLFlBQU07QUFDekQsTUFBRSxDQUFDLHdCQUF3QixFQUFFLFlBQU07QUFDakMsWUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2hDLFlBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtBQUMvQixZQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQzNDLFlBQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDNUMsWUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNoRCxZQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDN0MsWUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO0tBQzdDLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvYnVpbGRlci1nby9zcGVjL21haW4tc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiBlc2xpbnQtZW52IGphc21pbmUgKi9cblxuZGVzY3JpYmUoJ2J1aWxkZXItZ28nLCAoKSA9PiB7XG4gIGxldCBtYWluTW9kdWxlID0gbnVsbFxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2dvLWNvbmZpZycpLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2J1aWxkZXItZ28nKVxuICAgICAgfSkudGhlbigocGFjaykgPT4ge1xuICAgICAgICBtYWluTW9kdWxlID0gcGFjay5tYWluTW9kdWxlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICByZXR1cm4gbWFpbk1vZHVsZS5nZXRHb2NvbmZpZygpICE9PSBmYWxzZVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIGJ1aWxkZXItZ28gcGFja2FnZSBpcyBhY3RpdmF0ZWQnLCAoKSA9PiB7XG4gICAgaXQoJ2FjdGl2YXRlcyBzdWNjZXNzZnVsbHknLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWFpbk1vZHVsZSkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUpLnRvQmVUcnV0aHkoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUuZ2V0QnVpbGRlcikudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUuZ2V0R29jb25maWcpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChtYWluTW9kdWxlLmNvbnN1bWVHb2NvbmZpZykudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUuZ2V0R29jb25maWcoKSkudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QobWFpbk1vZHVsZS5nZXRCdWlsZGVyKCkpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG4gIH0pXG59KVxuIl19
//# sourceURL=/Users/james/.atom/packages/builder-go/spec/main-spec.js
