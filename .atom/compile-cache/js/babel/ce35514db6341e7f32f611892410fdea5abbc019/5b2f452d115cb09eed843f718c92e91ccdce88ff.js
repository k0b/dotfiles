Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _osHomedir = require('os-homedir');

var _osHomedir2 = _interopRequireDefault(_osHomedir);

var _check = require('./check');

'use babel';

function expand(env, thepath) {
  if ((0, _check.isFalsy)(thepath) || thepath.trim() === '') {
    return '';
  }

  if ((0, _check.isFalsy)(env)) {
    return thepath;
  }

  thepath = thepath.replace(/(~|\$[^\\/:]*|%[^\\;%]*%)+?/gim, function (text, match) {
    if (match === '~') {
      return home();
    } else {
      var m = match;
      if (_os2['default'].platform() === 'win32') {
        m = match.replace(/%/g, '');
      } else {
        m = match.replace(/\$/g, '');
      }

      if (typeof env[m] !== 'undefined') {
        if (m === 'GOPATH' && env[m].indexOf(_path2['default'].delimiter) !== -1) {
          return expand(env, env[m].split(_path2['default'].delimiter)[0].trim());
        } else {
          return expand(env, env[m]);
        }
      } else {
        return match;
      }
    }
  });

  if (thepath.indexOf(_path2['default'].delimiter) === -1) {
    return resolveAndNormalize(thepath);
  }

  var paths = thepath.split(_path2['default'].delimiter);
  var result = '';
  for (var pathItem of paths) {
    pathItem = resolveAndNormalize(pathItem);
    if (result === '') {
      result = pathItem;
    } else {
      result = result + _path2['default'].delimiter + pathItem;
    }
  }

  return result;
}

function resolveAndNormalize(pathitem) {
  if ((0, _check.isFalsy)(pathitem) || pathitem.trim() === '') {
    return '';
  }
  var result = _path2['default'].resolve(_path2['default'].normalize(pathitem));
  return result;
}

function home() {
  return (0, _osHomedir2['default'])();
}

exports['default'] = { expand: expand, resolveAndNormalize: resolveAndNormalize, home: home };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9nby1jb25maWcvbGliL3BhdGhoZWxwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVpQixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7eUJBQ0csWUFBWTs7OztxQkFDWixTQUFTOztBQUwvQixXQUFXLENBQUE7O0FBT1gsU0FBUyxNQUFNLENBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUM3QixNQUFJLG9CQUFRLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDN0MsV0FBTyxFQUFFLENBQUE7R0FDVjs7QUFFRCxNQUFJLG9CQUFRLEdBQUcsQ0FBQyxFQUFFO0FBQ2hCLFdBQU8sT0FBTyxDQUFBO0dBQ2Y7O0FBRUQsU0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLEVBQUUsVUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFLO0FBQzNFLFFBQUksS0FBSyxLQUFLLEdBQUcsRUFBRTtBQUNqQixhQUFPLElBQUksRUFBRSxDQUFBO0tBQ2QsTUFBTTtBQUNMLFVBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQTtBQUNiLFVBQUksZ0JBQUcsUUFBUSxFQUFFLEtBQUssT0FBTyxFQUFFO0FBQzdCLFNBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQTtPQUM1QixNQUFNO0FBQ0wsU0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBO09BQzdCOztBQUVELFVBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxFQUFFO0FBQ2pDLFlBQUksQ0FBQyxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFLLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzNELGlCQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxrQkFBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQzNELE1BQU07QUFDTCxpQkFBTyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQzNCO09BQ0YsTUFBTTtBQUNMLGVBQU8sS0FBSyxDQUFBO09BQ2I7S0FDRjtHQUNGLENBQUMsQ0FBQTs7QUFFRixNQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQUssU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDMUMsV0FBTyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUNwQzs7QUFFRCxNQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFLLFNBQVMsQ0FBQyxDQUFBO0FBQ3pDLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUNmLE9BQUssSUFBSSxRQUFRLElBQUksS0FBSyxFQUFFO0FBQzFCLFlBQVEsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUN4QyxRQUFJLE1BQU0sS0FBSyxFQUFFLEVBQUU7QUFDakIsWUFBTSxHQUFHLFFBQVEsQ0FBQTtLQUNsQixNQUFNO0FBQ0wsWUFBTSxHQUFHLE1BQU0sR0FBRyxrQkFBSyxTQUFTLEdBQUcsUUFBUSxDQUFBO0tBQzVDO0dBQ0Y7O0FBRUQsU0FBTyxNQUFNLENBQUE7Q0FDZDs7QUFFRCxTQUFTLG1CQUFtQixDQUFFLFFBQVEsRUFBRTtBQUN0QyxNQUFJLG9CQUFRLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDL0MsV0FBTyxFQUFFLENBQUE7R0FDVjtBQUNELE1BQUksTUFBTSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxrQkFBSyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtBQUNuRCxTQUFPLE1BQU0sQ0FBQTtDQUNkOztBQUVELFNBQVMsSUFBSSxHQUFJO0FBQ2YsU0FBTyw2QkFBVyxDQUFBO0NBQ25COztxQkFFYyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsbUJBQW1CLEVBQW5CLG1CQUFtQixFQUFFLElBQUksRUFBSixJQUFJLEVBQUUiLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL2dvLWNvbmZpZy9saWIvcGF0aGhlbHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5pbXBvcnQgb3NIb21lZGlyIGZyb20gJ29zLWhvbWVkaXInXG5pbXBvcnQge2lzRmFsc3l9IGZyb20gJy4vY2hlY2snXG5cbmZ1bmN0aW9uIGV4cGFuZCAoZW52LCB0aGVwYXRoKSB7XG4gIGlmIChpc0ZhbHN5KHRoZXBhdGgpIHx8IHRoZXBhdGgudHJpbSgpID09PSAnJykge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGlzRmFsc3koZW52KSkge1xuICAgIHJldHVybiB0aGVwYXRoXG4gIH1cblxuICB0aGVwYXRoID0gdGhlcGF0aC5yZXBsYWNlKC8ofnxcXCRbXlxcXFwvOl0qfCVbXlxcXFw7JV0qJSkrPy9naW0sICh0ZXh0LCBtYXRjaCkgPT4ge1xuICAgIGlmIChtYXRjaCA9PT0gJ34nKSB7XG4gICAgICByZXR1cm4gaG9tZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtID0gbWF0Y2hcbiAgICAgIGlmIChvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInKSB7XG4gICAgICAgIG0gPSBtYXRjaC5yZXBsYWNlKC8lL2csICcnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbSA9IG1hdGNoLnJlcGxhY2UoL1xcJC9nLCAnJylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBlbnZbbV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChtID09PSAnR09QQVRIJyAmJiBlbnZbbV0uaW5kZXhPZihwYXRoLmRlbGltaXRlcikgIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIGV4cGFuZChlbnYsIGVudlttXS5zcGxpdChwYXRoLmRlbGltaXRlcilbMF0udHJpbSgpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBleHBhbmQoZW52LCBlbnZbbV0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBtYXRjaFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBpZiAodGhlcGF0aC5pbmRleE9mKHBhdGguZGVsaW1pdGVyKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gcmVzb2x2ZUFuZE5vcm1hbGl6ZSh0aGVwYXRoKVxuICB9XG5cbiAgbGV0IHBhdGhzID0gdGhlcGF0aC5zcGxpdChwYXRoLmRlbGltaXRlcilcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGZvciAobGV0IHBhdGhJdGVtIG9mIHBhdGhzKSB7XG4gICAgcGF0aEl0ZW0gPSByZXNvbHZlQW5kTm9ybWFsaXplKHBhdGhJdGVtKVxuICAgIGlmIChyZXN1bHQgPT09ICcnKSB7XG4gICAgICByZXN1bHQgPSBwYXRoSXRlbVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSByZXN1bHQgKyBwYXRoLmRlbGltaXRlciArIHBhdGhJdGVtXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiByZXNvbHZlQW5kTm9ybWFsaXplIChwYXRoaXRlbSkge1xuICBpZiAoaXNGYWxzeShwYXRoaXRlbSkgfHwgcGF0aGl0ZW0udHJpbSgpID09PSAnJykge1xuICAgIHJldHVybiAnJ1xuICB9XG4gIGxldCByZXN1bHQgPSBwYXRoLnJlc29sdmUocGF0aC5ub3JtYWxpemUocGF0aGl0ZW0pKVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGhvbWUgKCkge1xuICByZXR1cm4gb3NIb21lZGlyKClcbn1cblxuZXhwb3J0IGRlZmF1bHQgeyBleHBhbmQsIHJlc29sdmVBbmROb3JtYWxpemUsIGhvbWUgfVxuIl19
//# sourceURL=/Users/james/.atom/packages/go-config/lib/pathhelper.js
