'use babel';
/* eslint-env jasmine */

describe('tester-go', function () {
  var mainModule = null;

  beforeEach(function () {
    waitsForPromise(function () {
      return atom.packages.activatePackage('go-config').then(function () {
        return atom.packages.activatePackage('tester-go');
      }).then(function (pack) {
        mainModule = pack.mainModule;
      });
    });

    waitsFor(function () {
      return mainModule.getGoconfig() !== false;
    });
  });

  describe('when the tester-go package is activated', function () {
    it('activates successfully', function () {
      expect(mainModule).toBeDefined();
      expect(mainModule).toBeTruthy();
      expect(mainModule.getGoconfig).toBeDefined();
      expect(mainModule.consumeGoconfig).toBeDefined();
      expect(mainModule.getGoconfig()).toBeTruthy();
      expect(mainModule.tester).toBeDefined();
      expect(mainModule.tester).toBeTruthy();
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy90ZXN0ZXItZ28vc3BlYy9tYWluLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7QUFHWCxRQUFRLENBQUMsV0FBVyxFQUFFLFlBQU07QUFDMUIsTUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFBOztBQUVyQixZQUFVLENBQUMsWUFBTTtBQUNmLG1CQUFlLENBQUMsWUFBTTtBQUNwQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQzNELGVBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUE7T0FDbEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUNoQixrQkFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUE7T0FDN0IsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxZQUFNO0FBQ2IsYUFBTyxVQUFVLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFBO0tBQzFDLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMseUNBQXlDLEVBQUUsWUFBTTtBQUN4RCxNQUFFLENBQUMsd0JBQXdCLEVBQUUsWUFBTTtBQUNqQyxZQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDaEMsWUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO0FBQy9CLFlBQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDNUMsWUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNoRCxZQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDN0MsWUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUN2QyxZQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO0tBQ3ZDLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvdGVzdGVyLWdvL3NwZWMvbWFpbi1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5kZXNjcmliZSgndGVzdGVyLWdvJywgKCkgPT4ge1xuICBsZXQgbWFpbk1vZHVsZSA9IG51bGxcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdnby1jb25maWcnKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd0ZXN0ZXItZ28nKVxuICAgICAgfSkudGhlbigocGFjaykgPT4ge1xuICAgICAgICBtYWluTW9kdWxlID0gcGFjay5tYWluTW9kdWxlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICByZXR1cm4gbWFpbk1vZHVsZS5nZXRHb2NvbmZpZygpICE9PSBmYWxzZVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIHRlc3Rlci1nbyBwYWNrYWdlIGlzIGFjdGl2YXRlZCcsICgpID0+IHtcbiAgICBpdCgnYWN0aXZhdGVzIHN1Y2Nlc3NmdWxseScsICgpID0+IHtcbiAgICAgIGV4cGVjdChtYWluTW9kdWxlKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QobWFpbk1vZHVsZSkudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QobWFpbk1vZHVsZS5nZXRHb2NvbmZpZykudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUuY29uc3VtZUdvY29uZmlnKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QobWFpbk1vZHVsZS5nZXRHb2NvbmZpZygpKS50b0JlVHJ1dGh5KClcbiAgICAgIGV4cGVjdChtYWluTW9kdWxlLnRlc3RlcikudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KG1haW5Nb2R1bGUudGVzdGVyKS50b0JlVHJ1dGh5KClcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/tester-go/spec/main-spec.js
