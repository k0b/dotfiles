var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _libMain = require('../lib/main');

var _libMain2 = _interopRequireDefault(_libMain);

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

var _libMinimapElement = require('../lib/minimap-element');

var _libMinimapElement2 = _interopRequireDefault(_libMinimapElement);

var _helpersWorkspace = require('./helpers/workspace');

var _helpersEvents = require('./helpers/events');

'use babel';

function realOffsetTop(o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetTop + transform.m42
  return o.offsetTop;
}

function realOffsetLeft(o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetLeft + transform.m41
  return o.offsetLeft;
}

function sleep(duration) {
  var t = new Date();
  waitsFor(function () {
    return new Date() - t > duration;
  });
}

function createPlugin() {
  var plugin = {
    active: false,
    activatePlugin: function activatePlugin() {
      this.active = true;
    },
    deactivatePlugin: function deactivatePlugin() {
      this.active = false;
    },
    isActive: function isActive() {
      return this.active;
    }
  };
  return plugin;
}

describe('MinimapElement', function () {
  var _ref = [];
  var editor = _ref[0];
  var minimap = _ref[1];
  var largeSample = _ref[2];
  var mediumSample = _ref[3];
  var smallSample = _ref[4];
  var jasmineContent = _ref[5];
  var editorElement = _ref[6];
  var minimapElement = _ref[7];
  var dir = _ref[8];

  beforeEach(function () {
    // Comment after body below to leave the created text editor and minimap
    // on DOM after the test run.
    jasmineContent = document.body.querySelector('#jasmine-content');

    atom.config.set('minimap.charHeight', 4);
    atom.config.set('minimap.charWidth', 2);
    atom.config.set('minimap.interline', 1);
    atom.config.set('minimap.textOpacity', 1);
    atom.config.set('minimap.smoothScrolling', true);
    atom.config.set('minimap.plugins', {});

    _libMinimapElement2['default'].registerViewProvider(_libMinimap2['default']);

    editor = atom.workspace.buildTextEditor({});
    editorElement = atom.views.getView(editor);
    jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);
    editorElement.setHeight(50);
    // editor.setLineHeightInPixels(10)

    minimap = new _libMinimap2['default']({ textEditor: editor });
    dir = atom.project.getDirectories()[0];

    largeSample = _fsPlus2['default'].readFileSync(dir.resolve('large-file.coffee')).toString();
    mediumSample = _fsPlus2['default'].readFileSync(dir.resolve('two-hundred.txt')).toString();
    smallSample = _fsPlus2['default'].readFileSync(dir.resolve('sample.coffee')).toString();

    editor.setText(largeSample);

    minimapElement = atom.views.getView(minimap);
  });

  it('has been registered in the view registry', function () {
    expect(minimapElement).toExist();
  });

  it('has stored the minimap as its model', function () {
    expect(minimapElement.getModel()).toBe(minimap);
  });

  it('has a canvas in a shadow DOM', function () {
    expect(minimapElement.shadowRoot.querySelector('canvas')).toExist();
  });

  it('has a div representing the visible area', function () {
    expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
  });

  //       ###    ######## ########    ###     ######  ##     ##
  //      ## ##      ##       ##      ## ##   ##    ## ##     ##
  //     ##   ##     ##       ##     ##   ##  ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##       #########
  //    #########    ##       ##    ######### ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  //    ##     ##    ##       ##    ##     ##  ######  ##     ##

  describe('when attached to the text editor element', function () {
    var _ref2 = [];
    var noAnimationFrame = _ref2[0];
    var nextAnimationFrame = _ref2[1];
    var requestAnimationFrameSafe = _ref2[2];
    var canvas = _ref2[3];
    var visibleArea = _ref2[4];

    beforeEach(function () {
      noAnimationFrame = function () {
        throw new Error('No animation frame requested');
      };
      nextAnimationFrame = noAnimationFrame;

      requestAnimationFrameSafe = window.requestAnimationFrame;
      spyOn(window, 'requestAnimationFrame').andCallFake(function (fn) {
        nextAnimationFrame = function () {
          nextAnimationFrame = noAnimationFrame;
          fn();
        };
      });
    });

    beforeEach(function () {
      canvas = minimapElement.shadowRoot.querySelector('canvas');
      editorElement.setWidth(200);
      editorElement.setHeight(50);

      editorElement.setScrollTop(1000);
      editorElement.setScrollLeft(200);
      minimapElement.attach();
    });

    afterEach(function () {
      minimap.destroy();
      window.requestAnimationFrame = requestAnimationFrameSafe;
    });

    it('takes the height of the editor', function () {
      expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight);

      expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 10, 0);
    });

    it('knows when attached to a text editor', function () {
      expect(minimapElement.attachedToTextEditor).toBeTruthy();
    });

    it('resizes the canvas to fit the minimap', function () {
      expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
      expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
    });

    it('requests an update', function () {
      expect(minimapElement.frameRequested).toBeTruthy();
    });

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    describe('with css filters', function () {
      describe('when a hue-rotate filter is applied to a rgb color', function () {
        var _ref3 = [];
        var additionnalStyleNode = _ref3[0];

        beforeEach(function () {
          minimapElement.invalidateDOMStylesCache();

          additionnalStyleNode = document.createElement('style');
          additionnalStyleNode.textContent = '\n            ' + _helpersWorkspace.stylesheet + '\n\n            .editor {\n              color: red;\n              -webkit-filter: hue-rotate(180deg);\n            }\n          ';

          jasmineContent.appendChild(additionnalStyleNode);
        });

        it('computes the new color by applying the hue rotation', function () {
          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual('rgb(0, ' + 0x6d + ', ' + 0x6d + ')');
          });
        });
      });

      describe('when a hue-rotate filter is applied to a rgba color', function () {
        var _ref4 = [];
        var additionnalStyleNode = _ref4[0];

        beforeEach(function () {
          minimapElement.invalidateDOMStylesCache();

          additionnalStyleNode = document.createElement('style');
          additionnalStyleNode.textContent = '\n            ' + _helpersWorkspace.stylesheet + '\n\n            .editor {\n              color: rgba(255, 0, 0, 0);\n              -webkit-filter: hue-rotate(180deg);\n            }\n          ';

          jasmineContent.appendChild(additionnalStyleNode);
        });

        it('computes the new color by applying the hue rotation', function () {
          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual('rgba(0, ' + 0x6d + ', ' + 0x6d + ', 0)');
          });
        });
      });
    });

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    describe('when the update is performed', function () {
      beforeEach(function () {
        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          visibleArea = minimapElement.shadowRoot.querySelector('.minimap-visible-area');
        });
      });

      it('sets the visible area width and height', function () {
        expect(visibleArea.offsetWidth).toEqual(minimapElement.clientWidth);
        expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorScaledHeight(), 0);
      });

      it('sets the visible visible area offset', function () {
        expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);
        expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0);
      });

      it('offsets the canvas when the scroll does not match line height', function () {
        editorElement.setScrollTop(1004);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(realOffsetTop(canvas)).toBeCloseTo(-2, -1);
        });
      });

      it('does not fail to update render the invisible char when modified', function () {
        atom.config.set('editor.showInvisibles', true);
        atom.config.set('editor.invisibles', { cr: '*' });

        expect(function () {
          nextAnimationFrame();
        }).not.toThrow();
      });

      it('renders the decorations based on the order settings', function () {
        atom.config.set('minimap.displayPluginsControls', true);

        var pluginFoo = createPlugin();
        var pluginBar = createPlugin();

        _libMain2['default'].registerPlugin('foo', pluginFoo);
        _libMain2['default'].registerPlugin('bar', pluginBar);

        atom.config.set('minimap.plugins.fooDecorationsZIndex', 1);

        var calls = [];
        spyOn(minimapElement, 'drawLineDecoration').andCallFake(function (d) {
          calls.push(d.getProperties().plugin);
        });
        spyOn(minimapElement, 'drawHighlightDecoration').andCallFake(function (d) {
          calls.push(d.getProperties().plugin);
        });

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'line', color: '#0000FF', plugin: 'bar' });
        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'highlight-under', color: '#0000FF', plugin: 'foo' });

        editorElement.setScrollTop(0);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(calls).toEqual(['bar', 'foo']);

          atom.config.set('minimap.plugins.fooDecorationsZIndex', -1);

          calls.length = 0;
        });

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });

        runs(function () {
          nextAnimationFrame();

          expect(calls).toEqual(['foo', 'bar']);

          _libMain2['default'].unregisterPlugin('foo');
          _libMain2['default'].unregisterPlugin('bar');
        });
      });

      it('renders the visible line decorations', function () {
        spyOn(minimapElement, 'drawLineDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'line', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), { type: 'line', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), { type: 'line', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawLineDecoration).toHaveBeenCalled();
          expect(minimapElement.drawLineDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible highlight decorations', function () {
        spyOn(minimapElement, 'drawHighlightDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 4]]), { type: 'highlight-under', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[2, 20], [2, 30]]), { type: 'highlight-over', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), { type: 'highlight-under', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawHighlightDecoration).toHaveBeenCalled();
          expect(minimapElement.drawHighlightDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible outline decorations', function () {
        spyOn(minimapElement, 'drawHighlightOutlineDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), { type: 'highlight-outline', color: '#0000ff' });
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), { type: 'highlight-outline', color: '#0000ff' });
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), { type: 'highlight-outline', color: '#0000ff' });

        editorElement.setScrollTop(0);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawHighlightOutlineDecoration).toHaveBeenCalled();
          expect(minimapElement.drawHighlightOutlineDecoration.calls.length).toEqual(4);
        });
      });

      it('renders the visible custom foreground decorations', function () {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough();

        var renderRoutine = jasmine.createSpy('renderRoutine');

        var properties = {
          type: 'foreground-custom',
          render: renderRoutine
        };

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties);

        editorElement.setScrollTop(0);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled();
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4);

          expect(renderRoutine).toHaveBeenCalled();
          expect(renderRoutine.calls.length).toEqual(4);
        });
      });

      it('renders the visible custom background decorations', function () {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough();

        var renderRoutine = jasmine.createSpy('renderRoutine');

        var properties = {
          type: 'background-custom',
          render: renderRoutine
        };

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties);

        editorElement.setScrollTop(0);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled();
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4);

          expect(renderRoutine).toHaveBeenCalled();
          expect(renderRoutine.calls.length).toEqual(4);
        });
      });

      describe('when the editor is scrolled', function () {
        beforeEach(function () {
          editorElement.setScrollTop(2000);
          editorElement.setScrollLeft(50);

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('updates the visible area', function () {
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);
          expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0);
        });
      });

      describe('when the editor is resized to a greater size', function () {
        beforeEach(function () {
          editorElement.style.width = '800px';
          editorElement.style.height = '500px';

          minimapElement.measureHeightAndWidth();

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('detects the resize and adjust itself', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, 0);
          expect(minimapElement.offsetHeight).toEqual(editorElement.offsetHeight);

          expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
          expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
        });
      });

      describe('when the editor visible content is changed', function () {
        beforeEach(function () {
          editorElement.setScrollLeft(0);
          editorElement.setScrollTop(1400);
          editor.setSelectedBufferRange([[101, 0], [102, 20]]);

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            spyOn(minimapElement, 'drawLines').andCallThrough();
            editor.insertText('foo');
          });
        });

        it('rerenders the part that have changed', function () {
          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            expect(minimapElement.drawLines).toHaveBeenCalled();
            expect(minimapElement.drawLines.argsForCall[0][0]).toEqual(100);
            expect(minimapElement.drawLines.argsForCall[0][1]).toEqual(101);
          });
        });
      });

      describe('when the editor visibility change', function () {
        it('does not modify the size of the canvas', function () {
          var canvasWidth = minimapElement.getFrontCanvas().width;
          var canvasHeight = minimapElement.getFrontCanvas().height;
          editorElement.style.display = 'none';

          minimapElement.measureHeightAndWidth();

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            expect(minimapElement.getFrontCanvas().width).toEqual(canvasWidth);
            expect(minimapElement.getFrontCanvas().height).toEqual(canvasHeight);
          });
        });

        describe('from hidden to visible', function () {
          beforeEach(function () {
            editorElement.style.display = 'none';
            minimapElement.checkForVisibilityChange();
            spyOn(minimapElement, 'requestForcedUpdate');
            editorElement.style.display = '';
            minimapElement.pollDOM();
          });

          it('requests an update of the whole minimap', function () {
            expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
          });
        });
      });
    });

    //     ######   ######  ########   #######  ##       ##
    //    ##    ## ##    ## ##     ## ##     ## ##       ##
    //    ##       ##       ##     ## ##     ## ##       ##
    //     ######  ##       ########  ##     ## ##       ##
    //          ## ##       ##   ##   ##     ## ##       ##
    //    ##    ## ##    ## ##    ##  ##     ## ##       ##
    //     ######   ######  ##     ##  #######  ######## ########

    describe('mouse scroll controls', function () {
      beforeEach(function () {
        editorElement.setWidth(400);
        editorElement.setHeight(400);
        editorElement.setScrollTop(0);
        editorElement.setScrollLeft(0);

        nextAnimationFrame();

        minimapElement.measureHeightAndWidth();

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      describe('using the mouse scrollwheel over the minimap', function () {
        it('relays the events to the editor view', function () {
          spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function () {});

          (0, _helpersEvents.mousewheel)(minimapElement, 0, 15);

          expect(editorElement.component.presenter.setScrollTop).toHaveBeenCalled();
        });

        describe('when the independentMinimapScroll setting is true', function () {
          var previousScrollTop = undefined;

          beforeEach(function () {
            atom.config.set('minimap.independentMinimapScroll', true);
            atom.config.set('minimap.scrollSensitivity', 0.5);

            spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function () {});

            previousScrollTop = minimap.getScrollTop();

            (0, _helpersEvents.mousewheel)(minimapElement, 0, -15);
          });

          it('does not relay the events to the editor', function () {
            expect(editorElement.component.presenter.setScrollTop).not.toHaveBeenCalled();
          });

          it('scrolls the minimap instead', function () {
            expect(minimap.getScrollTop()).not.toEqual(previousScrollTop);
          });

          it('clamp the minimap scroll into the legit bounds', function () {
            (0, _helpersEvents.mousewheel)(minimapElement, 0, -100000);

            expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());

            (0, _helpersEvents.mousewheel)(minimapElement, 0, 100000);

            expect(minimap.getScrollTop()).toEqual(0);
          });
        });
      });

      describe('middle clicking the minimap', function () {
        var _ref5 = [];
        var canvas = _ref5[0];
        var visibleArea = _ref5[1];
        var originalLeft = _ref5[2];
        var maxScroll = _ref5[3];

        beforeEach(function () {
          canvas = minimapElement.getFrontCanvas();
          visibleArea = minimapElement.visibleArea;
          originalLeft = visibleArea.getBoundingClientRect().left;
          maxScroll = minimap.getTextEditorMaxScrollTop();
        });

        it('scrolls to the top using the middle mouse button', function () {
          (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: 0, btn: 1 });
          expect(editorElement.getScrollTop()).toEqual(0);
        });

        describe('scrolling to the middle using the middle mouse button', function () {
          var canvasMidY = undefined;

          beforeEach(function () {
            var editorMidY = editorElement.getHeight() / 2.0;

            var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

            var top = _canvas$getBoundingClientRect.top;
            var height = _canvas$getBoundingClientRect.height;

            canvasMidY = top + height / 2.0;
            var actualMidY = Math.min(canvasMidY, editorMidY);
            (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: actualMidY, btn: 1 });
          });

          it('scrolls the editor to the middle', function () {
            var middleScrollTop = Math.round(maxScroll / 2.0);
            expect(editorElement.getScrollTop()).toEqual(middleScrollTop);
          });

          it('updates the visible area to be centered', function () {
            waitsFor(function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();

              var _visibleArea$getBoundingClientRect = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect.top;
              var height = _visibleArea$getBoundingClientRect.height;

              var visibleCenterY = top + height / 2;
              expect(visibleCenterY).toBeCloseTo(200, 0);
            });
          });
        });

        describe('scrolling the editor to an arbitrary location', function () {
          var _ref6 = [];
          var scrollTo = _ref6[0];
          var scrollRatio = _ref6[1];

          beforeEach(function () {
            scrollTo = 101; // pixels
            scrollRatio = (scrollTo - minimap.getTextEditorScaledHeight() / 2) / (minimap.getVisibleHeight() - minimap.getTextEditorScaledHeight());
            scrollRatio = Math.max(0, scrollRatio);
            scrollRatio = Math.min(1, scrollRatio);

            (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: scrollTo, btn: 1 });

            waitsFor(function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('scrolls the editor to an arbitrary location', function () {
            var expectedScroll = maxScroll * scrollRatio;
            expect(editorElement.getScrollTop()).toBeCloseTo(expectedScroll, 0);
          });

          describe('dragging the visible area with middle mouse button ' + 'after scrolling to the arbitrary location', function () {
            var _ref7 = [];
            var originalTop = _ref7[0];

            beforeEach(function () {
              originalTop = visibleArea.getBoundingClientRect().top;
              (0, _helpersEvents.mousemove)(visibleArea, { x: originalLeft + 1, y: scrollTo + 40, btn: 1 });

              waitsFor(function () {
                return nextAnimationFrame !== noAnimationFrame;
              });
              runs(function () {
                nextAnimationFrame();
              });
            });

            afterEach(function () {
              minimapElement.endDrag();
            });

            it('scrolls the editor so that the visible area was moved down ' + 'by 40 pixels from the arbitrary location', function () {
              var _visibleArea$getBoundingClientRect2 = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect2.top;

              expect(top).toBeCloseTo(originalTop + 40, -1);
            });
          });
        });
      });

      describe('pressing the mouse on the minimap canvas (without scroll animation)', function () {
        var canvas = undefined;

        beforeEach(function () {
          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', false);

          canvas = minimapElement.getFrontCanvas();
        });

        it('scrolls the editor to the line below the mouse', function () {
          (0, _helpersEvents.mousedown)(canvas);
          expect(editorElement.getScrollTop()).toBeCloseTo(480);
        });

        describe('when independentMinimapScroll setting is enabled', function () {
          beforeEach(function () {
            minimap.setScrollTop(1000);
            atom.config.set('minimap.independentMinimapScroll', true);
          });

          it('scrolls the editor to the line below the mouse', function () {
            (0, _helpersEvents.mousedown)(canvas);
            expect(editorElement.getScrollTop()).toBeCloseTo(480);
          });
        });
      });

      describe('pressing the mouse on the minimap canvas (with scroll animation)', function () {
        var canvas = undefined;

        beforeEach(function () {
          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', true);
          atom.config.set('minimap.scrollAnimationDuration', 300);

          canvas = minimapElement.getFrontCanvas();
        });

        it('scrolls the editor gradually to the line below the mouse', function () {
          (0, _helpersEvents.mousedown)(canvas);
          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          // wait until all animations run out
          waitsFor(function () {
            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
            return editorElement.getScrollTop() >= 480;
          });
        });

        it('stops the animation if the text editor is destroyed', function () {
          (0, _helpersEvents.mousedown)(canvas);
          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });

          runs(function () {
            editor.destroy();

            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();

            expect(nextAnimationFrame === noAnimationFrame);
          });
        });

        describe('when independentMinimapScroll setting is enabled', function () {
          beforeEach(function () {
            minimap.setScrollTop(1000);
            atom.config.set('minimap.independentMinimapScroll', true);
          });

          it('scrolls the editor gradually to the line below the mouse', function () {
            (0, _helpersEvents.mousedown)(canvas);
            waitsFor(function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            // wait until all animations run out
            waitsFor(function () {
              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
              return editorElement.getScrollTop() >= 480;
            });
          });

          it('stops the animation if the text editor is destroyed', function () {
            (0, _helpersEvents.mousedown)(canvas);
            waitsFor(function () {
              return nextAnimationFrame !== noAnimationFrame;
            });

            runs(function () {
              editor.destroy();

              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();

              expect(nextAnimationFrame === noAnimationFrame);
            });
          });
        });
      });

      describe('dragging the visible area', function () {
        var _ref8 = [];
        var visibleArea = _ref8[0];
        var originalTop = _ref8[1];

        beforeEach(function () {
          visibleArea = minimapElement.visibleArea;
          var o = visibleArea.getBoundingClientRect();
          var left = o.left;
          originalTop = o.top;

          (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: originalTop + 10 });
          (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: originalTop + 50 });

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        afterEach(function () {
          minimapElement.endDrag();
        });

        it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
          var _visibleArea$getBoundingClientRect3 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect3.top;

          expect(top).toBeCloseTo(originalTop + 40, -1);
        });

        it('stops the drag gesture when the mouse is released outside the minimap', function () {
          var _visibleArea$getBoundingClientRect4 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect4.top;
          var left = _visibleArea$getBoundingClientRect4.left;

          (0, _helpersEvents.mouseup)(jasmineContent, { x: left - 10, y: top + 80 });

          spyOn(minimapElement, 'drag');
          (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });

          expect(minimapElement.drag).not.toHaveBeenCalled();
        });
      });

      describe('dragging the visible area using touch events', function () {
        var _ref9 = [];
        var visibleArea = _ref9[0];
        var originalTop = _ref9[1];

        beforeEach(function () {
          visibleArea = minimapElement.visibleArea;
          var o = visibleArea.getBoundingClientRect();
          var left = o.left;
          originalTop = o.top;

          (0, _helpersEvents.touchstart)(visibleArea, { x: left + 10, y: originalTop + 10 });
          (0, _helpersEvents.touchmove)(visibleArea, { x: left + 10, y: originalTop + 50 });

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        afterEach(function () {
          minimapElement.endDrag();
        });

        it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
          var _visibleArea$getBoundingClientRect5 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect5.top;

          expect(top).toBeCloseTo(originalTop + 40, -1);
        });

        it('stops the drag gesture when the mouse is released outside the minimap', function () {
          var _visibleArea$getBoundingClientRect6 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect6.top;
          var left = _visibleArea$getBoundingClientRect6.left;

          (0, _helpersEvents.mouseup)(jasmineContent, { x: left - 10, y: top + 80 });

          spyOn(minimapElement, 'drag');
          (0, _helpersEvents.touchmove)(visibleArea, { x: left + 10, y: top + 50 });

          expect(minimapElement.drag).not.toHaveBeenCalled();
        });
      });

      describe('when the minimap cannot scroll', function () {
        var _ref10 = [];
        var visibleArea = _ref10[0];
        var originalTop = _ref10[1];

        beforeEach(function () {
          var sample = _fsPlus2['default'].readFileSync(dir.resolve('seventy.txt')).toString();
          editor.setText(sample);
          editorElement.setScrollTop(0);
        });

        describe('dragging the visible area', function () {
          beforeEach(function () {
            waitsFor(function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();

              visibleArea = minimapElement.visibleArea;

              var _visibleArea$getBoundingClientRect7 = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect7.top;
              var left = _visibleArea$getBoundingClientRect7.left;

              originalTop = top;

              (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: top + 10 });
              (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });
            });

            waitsFor(function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          afterEach(function () {
            minimapElement.endDrag();
          });

          it('scrolls based on a ratio adjusted to the minimap height', function () {
            var _visibleArea$getBoundingClientRect8 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect8.top;

            expect(top).toBeCloseTo(originalTop + 40, -1);
          });
        });
      });

      describe('when scroll past end is enabled', function () {
        beforeEach(function () {
          atom.config.set('editor.scrollPastEnd', true);

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        describe('dragging the visible area', function () {
          var _ref11 = [];
          var originalTop = _ref11[0];
          var visibleArea = _ref11[1];

          beforeEach(function () {
            visibleArea = minimapElement.visibleArea;

            var _visibleArea$getBoundingClientRect9 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect9.top;
            var left = _visibleArea$getBoundingClientRect9.left;

            originalTop = top;

            (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: top + 10 });
            (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });

            waitsFor(function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          afterEach(function () {
            minimapElement.endDrag();
          });

          it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
            var _visibleArea$getBoundingClientRect10 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect10.top;

            expect(top).toBeCloseTo(originalTop + 40, -1);
          });
        });
      });
    });

    //     ######  ########    ###    ##    ## ########
    //    ##    ##    ##      ## ##   ###   ## ##     ##
    //    ##          ##     ##   ##  ####  ## ##     ##
    //     ######     ##    ##     ## ## ## ## ##     ##
    //          ##    ##    ######### ##  #### ##     ##
    //    ##    ##    ##    ##     ## ##   ### ##     ##
    //     ######     ##    ##     ## ##    ## ########
    //
    //       ###    ##        #######  ##    ## ########
    //      ## ##   ##       ##     ## ###   ## ##
    //     ##   ##  ##       ##     ## ####  ## ##
    //    ##     ## ##       ##     ## ## ## ## ######
    //    ######### ##       ##     ## ##  #### ##
    //    ##     ## ##       ##     ## ##   ### ##
    //    ##     ## ########  #######  ##    ## ########

    describe('when the model is a stand-alone minimap', function () {
      beforeEach(function () {
        minimap.setStandAlone(true);
      });

      it('has a stand-alone attribute', function () {
        expect(minimapElement.hasAttribute('stand-alone')).toBeTruthy();
      });

      it('sets the minimap size when measured', function () {
        minimapElement.measureHeightAndWidth();

        expect(minimap.width).toEqual(minimapElement.clientWidth);
        expect(minimap.height).toEqual(minimapElement.clientHeight);
      });

      it('removes the controls div', function () {
        expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toBeNull();
      });

      it('removes the visible area', function () {
        expect(minimapElement.visibleArea).toBeUndefined();
      });

      it('removes the quick settings button', function () {
        atom.config.set('minimap.displayPluginsControls', true);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          expect(minimapElement.openQuickSettings).toBeUndefined();
        });
      });

      it('removes the scroll indicator', function () {
        editor.setText(mediumSample);
        editorElement.setScrollTop(50);

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
          atom.config.set('minimap.minimapScrollIndicator', true);
        });

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toBeNull();
        });
      });

      describe('pressing the mouse on the minimap canvas', function () {
        beforeEach(function () {
          jasmineContent.appendChild(minimapElement);

          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', false);

          canvas = minimapElement.getFrontCanvas();
          (0, _helpersEvents.mousedown)(canvas);
        });

        it('does not scroll the editor to the line below the mouse', function () {
          expect(editorElement.getScrollTop()).toEqual(1000);
        });
      });

      describe('and is changed to be a classical minimap again', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', true);
          atom.config.set('minimap.minimapScrollIndicator', true);

          minimap.setStandAlone(false);
        });

        it('recreates the destroyed elements', function () {
          expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
        });
      });
    });

    //    ########  ########  ######  ######## ########   #######  ##    ##
    //    ##     ## ##       ##    ##    ##    ##     ## ##     ##  ##  ##
    //    ##     ## ##       ##          ##    ##     ## ##     ##   ####
    //    ##     ## ######    ######     ##    ########  ##     ##    ##
    //    ##     ## ##             ##    ##    ##   ##   ##     ##    ##
    //    ##     ## ##       ##    ##    ##    ##    ##  ##     ##    ##
    //    ########  ########  ######     ##    ##     ##  #######     ##

    describe('when the model is destroyed', function () {
      beforeEach(function () {
        minimap.destroy();
      });

      it('detaches itself from its parent', function () {
        expect(minimapElement.parentNode).toBeNull();
      });

      it('stops the DOM polling interval', function () {
        spyOn(minimapElement, 'pollDOM');

        sleep(200);

        runs(function () {
          expect(minimapElement.pollDOM).not.toHaveBeenCalled();
        });
      });
    });

    //     ######   #######  ##    ## ######## ####  ######
    //    ##    ## ##     ## ###   ## ##        ##  ##    ##
    //    ##       ##     ## ####  ## ##        ##  ##
    //    ##       ##     ## ## ## ## ######    ##  ##   ####
    //    ##       ##     ## ##  #### ##        ##  ##    ##
    //    ##    ## ##     ## ##   ### ##        ##  ##    ##
    //     ######   #######  ##    ## ##       ####  ######

    describe('when the atom styles are changed', function () {
      beforeEach(function () {
        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          spyOn(minimapElement, 'invalidateDOMStylesCache').andCallThrough();

          var styleNode = document.createElement('style');
          styleNode.textContent = 'body{ color: #233 }';
          atom.styles.emitter.emit('did-add-style-element', styleNode);
        });

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
      });

      it('forces a refresh with cache invalidation', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        expect(minimapElement.invalidateDOMStylesCache).toHaveBeenCalled();
      });
    });

    describe('when minimap.textOpacity is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.textOpacity', 0.3);

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.displayCodeHighlights is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.displayCodeHighlights', true);

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.charWidth is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.charWidth', 1);

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.charHeight is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.charHeight', 1);

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.interline is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.interline', 2);

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.displayMinimapOnLeft setting is true', function () {
      it('moves the attached minimap to the left', function () {
        atom.config.set('minimap.displayMinimapOnLeft', true);
        expect(minimapElement.classList.contains('left')).toBeTruthy();
      });

      describe('when the minimap is not attached yet', function () {
        beforeEach(function () {
          editor = atom.workspace.buildTextEditor({});
          editorElement = atom.views.getView(editor);
          editorElement.setHeight(50);
          editor.setLineHeightInPixels(10);

          minimap = new _libMinimap2['default']({ textEditor: editor });
          minimapElement = atom.views.getView(minimap);

          jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);

          atom.config.set('minimap.displayMinimapOnLeft', true);
          minimapElement.attach();
        });

        it('moves the attached minimap to the left', function () {
          expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
      });
    });

    describe('when minimap.adjustMinimapWidthToSoftWrap is true', function () {
      beforeEach(function () {
        atom.config.set('editor.softWrap', true);
        atom.config.set('editor.softWrapAtPreferredLineLength', true);
        atom.config.set('editor.preferredLineLength', 2);

        atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('adjusts the width of the minimap canvas', function () {
        expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4);
      });

      it('offsets the minimap by the difference', function () {
        expect(realOffsetLeft(minimapElement)).toBeCloseTo(editorElement.clientWidth - 4, -1);
        expect(minimapElement.clientWidth).toEqual(4);
      });

      describe('the dom polling routine', function () {
        it('does not change the value', function () {
          atom.views.performDocumentPoll();

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4);
          });
        });
      });

      describe('when the editor is resized', function () {
        beforeEach(function () {
          atom.config.set('editor.preferredLineLength', 6);
          editorElement.style.width = '100px';
          editorElement.style.height = '100px';

          atom.views.performDocumentPoll();

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('makes the minimap smaller than soft wrap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(12, -1);
          expect(minimapElement.style.marginRight).toEqual('');
        });
      });

      describe('and when minimap.minimapScrollIndicator setting is true', function () {
        beforeEach(function () {
          editor.setText(mediumSample);
          editorElement.setScrollTop(50);

          waitsFor(function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
            atom.config.set('minimap.minimapScrollIndicator', true);
          });

          waitsFor(function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('offsets the scroll indicator by the difference', function () {
          var indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
          expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1);
        });
      });

      describe('and when minimap.displayPluginsControls setting is true', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', true);
        });

        it('offsets the scroll indicator by the difference', function () {
          var openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          expect(realOffsetLeft(openQuickSettings)).not.toBeCloseTo(2, -1);
        });
      });

      describe('and then disabled', function () {
        beforeEach(function () {
          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false);

          waitsFor(function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the width of the minimap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
          expect(minimapElement.style.width).toEqual('');
        });
      });

      describe('and when preferredLineLength >= 16384', function () {
        beforeEach(function () {
          atom.config.set('editor.preferredLineLength', 16384);

          waitsFor(function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the width of the minimap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
          expect(minimapElement.style.width).toEqual('');
        });
      });
    });

    describe('when minimap.minimapScrollIndicator setting is true', function () {
      beforeEach(function () {
        editor.setText(mediumSample);
        editorElement.setScrollTop(50);

        waitsFor(function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });

        atom.config.set('minimap.minimapScrollIndicator', true);
      });

      it('adds a scroll indicator in the element', function () {
        expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
      });

      describe('and then deactivated', function () {
        it('removes the scroll indicator from the element', function () {
          atom.config.set('minimap.minimapScrollIndicator', false);
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
        });
      });

      describe('on update', function () {
        beforeEach(function () {
          editorElement.style.height = '500px';

          atom.views.performDocumentPoll();

          waitsFor(function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the size and position of the indicator', function () {
          var indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');

          var height = editorElement.getHeight() * (editorElement.getHeight() / minimap.getHeight());
          var scroll = (editorElement.getHeight() - height) * minimap.getTextEditorScrollRatio();

          expect(indicator.offsetHeight).toBeCloseTo(height, 0);
          expect(realOffsetTop(indicator)).toBeCloseTo(scroll, 0);
        });
      });

      describe('when the minimap cannot scroll', function () {
        beforeEach(function () {
          editor.setText(smallSample);

          waitsFor(function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('removes the scroll indicator', function () {
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
        });

        describe('and then can scroll again', function () {
          beforeEach(function () {
            editor.setText(largeSample);

            waitsFor(function () {
              return minimapElement.frameRequested;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('attaches the scroll indicator', function () {
            waitsFor(function () {
              return minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
            });
          });
        });
      });
    });

    describe('when minimap.absoluteMode setting is true', function () {
      beforeEach(function () {
        atom.config.set('minimap.absoluteMode', true);
      });

      it('adds a absolute class to the minimap element', function () {
        expect(minimapElement.classList.contains('absolute')).toBeTruthy();
      });

      describe('when minimap.displayMinimapOnLeft setting is true', function () {
        it('also adds a left class to the minimap element', function () {
          atom.config.set('minimap.displayMinimapOnLeft', true);
          expect(minimapElement.classList.contains('absolute')).toBeTruthy();
          expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
      });
    });

    describe('when the smoothScrolling setting is disabled', function () {
      beforeEach(function () {
        atom.config.set('minimap.smoothScrolling', false);
      });
      it('does not offset the canvas when the scroll does not match line height', function () {
        editorElement.setScrollTop(1004);

        waitsFor(function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(realOffsetTop(canvas)).toEqual(0);
        });
      });
    });

    //     #######  ##     ## ####  ######  ##    ##
    //    ##     ## ##     ##  ##  ##    ## ##   ##
    //    ##     ## ##     ##  ##  ##       ##  ##
    //    ##     ## ##     ##  ##  ##       #####
    //    ##  ## ## ##     ##  ##  ##       ##  ##
    //    ##    ##  ##     ##  ##  ##    ## ##   ##
    //     ##### ##  #######  ####  ######  ##    ##
    //
    //     ######  ######## ######## ######## #### ##    ##  ######    ######
    //    ##    ## ##          ##       ##     ##  ###   ## ##    ##  ##    ##
    //    ##       ##          ##       ##     ##  ####  ## ##        ##
    //     ######  ######      ##       ##     ##  ## ## ## ##   ####  ######
    //          ## ##          ##       ##     ##  ##  #### ##    ##        ##
    //    ##    ## ##          ##       ##     ##  ##   ### ##    ##  ##    ##
    //     ######  ########    ##       ##    #### ##    ##  ######    ######

    describe('when minimap.displayPluginsControls setting is true', function () {
      var _ref12 = [];
      var openQuickSettings = _ref12[0];
      var quickSettingsElement = _ref12[1];
      var workspaceElement = _ref12[2];

      beforeEach(function () {
        atom.config.set('minimap.displayPluginsControls', true);
      });

      it('has a div to open the quick settings', function () {
        expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
      });

      describe('clicking on the div', function () {
        beforeEach(function () {
          workspaceElement = atom.views.getView(atom.workspace);
          jasmineContent.appendChild(workspaceElement);

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          (0, _helpersEvents.mousedown)(openQuickSettings);

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
        });

        afterEach(function () {
          minimapElement.quickSettingsElement.destroy();
        });

        it('opens the quick settings view', function () {
          expect(quickSettingsElement).toExist();
        });

        it('positions the quick settings view next to the minimap', function () {
          var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();
          var settingsBounds = quickSettingsElement.getBoundingClientRect();

          expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
          expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.left - settingsBounds.width, 0);
        });
      });

      describe('when the displayMinimapOnLeft setting is enabled', function () {
        describe('clicking on the div', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);

            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            (0, _helpersEvents.mousedown)(openQuickSettings);

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });

          afterEach(function () {
            minimapElement.quickSettingsElement.destroy();
          });

          it('positions the quick settings view next to the minimap', function () {
            var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();

            expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
            expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
          });
        });
      });

      describe('when the adjustMinimapWidthToSoftWrap setting is enabled', function () {
        var _ref13 = [];
        var controls = _ref13[0];

        beforeEach(function () {
          atom.config.set('editor.softWrap', true);
          atom.config.set('editor.softWrapAtPreferredLineLength', true);
          atom.config.set('editor.preferredLineLength', 2);

          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);
          nextAnimationFrame();

          controls = minimapElement.shadowRoot.querySelector('.minimap-controls');
          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');

          editorElement.style.width = '1024px';

          atom.views.performDocumentPoll();
          waitsFor(function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the size of the control div to fit in the minimap', function () {
          expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio);
        });

        it('positions the controls div over the canvas', function () {
          var controlsRect = controls.getBoundingClientRect();
          var canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect();
          expect(controlsRect.left).toEqual(canvasRect.left);
          expect(controlsRect.right).toEqual(canvasRect.right);
        });

        describe('when the displayMinimapOnLeft setting is enabled', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);
          });

          it('adjusts the size of the control div to fit in the minimap', function () {
            expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio);
          });

          it('positions the controls div over the canvas', function () {
            var controlsRect = controls.getBoundingClientRect();
            var canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect();
            expect(controlsRect.left).toEqual(canvasRect.left);
            expect(controlsRect.right).toEqual(canvasRect.right);
          });

          describe('clicking on the div', function () {
            beforeEach(function () {
              workspaceElement = atom.views.getView(atom.workspace);
              jasmineContent.appendChild(workspaceElement);

              openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
              (0, _helpersEvents.mousedown)(openQuickSettings);

              quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
            });

            afterEach(function () {
              minimapElement.quickSettingsElement.destroy();
            });

            it('positions the quick settings view next to the minimap', function () {
              var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();

              expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
              expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
            });
          });
        });
      });

      describe('when the quick settings view is open', function () {
        beforeEach(function () {
          workspaceElement = atom.views.getView(atom.workspace);
          jasmineContent.appendChild(workspaceElement);

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          (0, _helpersEvents.mousedown)(openQuickSettings);

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
        });

        it('sets the on right button active', function () {
          expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
        });

        describe('clicking on the code highlight item', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('li.code-highlights');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the code highlights on the minimap element', function () {
            expect(minimapElement.displayCodeHighlights).toBeTruthy();
          });

          it('requests an update', function () {
            expect(minimapElement.frameRequested).toBeTruthy();
          });
        });

        describe('clicking on the absolute mode item', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('li.absolute-mode');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the absolute-mode setting', function () {
            expect(atom.config.get('minimap.absoluteMode')).toBeTruthy();
            expect(minimapElement.absoluteMode).toBeTruthy();
          });
        });

        describe('clicking on the on left button', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('.btn:first-child');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
          });
        });

        describe('core:move-left', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-left');
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
          });
        });

        describe('core:move-right when the minimap is on the right', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);
            atom.commands.dispatch(quickSettingsElement, 'core:move-right');
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeFalsy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
          });
        });

        describe('clicking on the open settings button again', function () {
          beforeEach(function () {
            (0, _helpersEvents.mousedown)(openQuickSettings);
          });

          it('closes the quick settings view', function () {
            expect(workspaceElement.querySelector('minimap-quick-settings')).not.toExist();
          });

          it('removes the view from the element', function () {
            expect(minimapElement.quickSettingsElement).toBeNull();
          });
        });

        describe('when an external event destroys the view', function () {
          beforeEach(function () {
            minimapElement.quickSettingsElement.destroy();
          });

          it('removes the view reference from the element', function () {
            expect(minimapElement.quickSettingsElement).toBeNull();
          });
        });
      });

      describe('then disabling it', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', false);
        });

        it('removes the div', function () {
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).not.toExist();
        });
      });

      describe('with plugins registered in the package', function () {
        var _ref14 = [];
        var minimapPackage = _ref14[0];
        var pluginA = _ref14[1];
        var pluginB = _ref14[2];

        beforeEach(function () {
          waitsForPromise(function () {
            return atom.packages.activatePackage('minimap').then(function (pkg) {
              minimapPackage = pkg.mainModule;
            });
          });

          runs(function () {
            var Plugin = (function () {
              function Plugin() {
                _classCallCheck(this, Plugin);

                this.active = false;
              }

              _createClass(Plugin, [{
                key: 'activatePlugin',
                value: function activatePlugin() {
                  this.active = true;
                }
              }, {
                key: 'deactivatePlugin',
                value: function deactivatePlugin() {
                  this.active = false;
                }
              }, {
                key: 'isActive',
                value: function isActive() {
                  return this.active;
                }
              }]);

              return Plugin;
            })();

            pluginA = new Plugin();
            pluginB = new Plugin();

            minimapPackage.registerPlugin('dummyA', pluginA);
            minimapPackage.registerPlugin('dummyB', pluginB);

            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            (0, _helpersEvents.mousedown)(openQuickSettings);

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });
        });

        it('creates one list item for each registered plugin', function () {
          expect(quickSettingsElement.querySelectorAll('li').length).toEqual(5);
        });

        it('selects the first item of the list', function () {
          expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
        });

        describe('core:confirm', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:confirm');
          });

          it('disable the plugin of the selected item', function () {
            expect(pluginA.isActive()).toBeFalsy();
          });

          describe('triggered a second time', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('enable the plugin of the selected item', function () {
              expect(pluginA.isActive()).toBeTruthy();
            });
          });

          describe('on the code highlight item', function () {
            var _ref15 = [];
            var initial = _ref15[0];

            beforeEach(function () {
              initial = minimapElement.displayCodeHighlights;
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(minimapElement.displayCodeHighlights).toEqual(!initial);
            });
          });

          describe('on the absolute mode item', function () {
            var _ref16 = [];
            var initial = _ref16[0];

            beforeEach(function () {
              initial = atom.config.get('minimap.absoluteMode');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(atom.config.get('minimap.absoluteMode')).toEqual(!initial);
            });
          });
        });

        describe('core:move-down', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-down');
          });

          it('selects the second item', function () {
            expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
          });

          describe('reaching a separator', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });

            it('moves past the separator', function () {
              expect(quickSettingsElement.querySelector('li.code-highlights.selected')).toExist();
            });
          });

          describe('then core:move-up', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });

            it('selects again the first item of the list', function () {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
            });
          });
        });

        describe('core:move-up', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-up');
          });

          it('selects the last item', function () {
            expect(quickSettingsElement.querySelector('li.selected:last-child')).toExist();
          });

          describe('reaching a separator', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });

            it('moves past the separator', function () {
              expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
            });
          });

          describe('then core:move-down', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });

            it('selects again the first item of the list', function () {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
            });
          });
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYW1lcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1lbGVtZW50LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3NCQUVlLFNBQVM7Ozs7dUJBQ1AsYUFBYTs7OzswQkFDVixnQkFBZ0I7Ozs7aUNBQ1Qsd0JBQXdCOzs7O2dDQUMxQixxQkFBcUI7OzZCQUNpQyxrQkFBa0I7O0FBUGpHLFdBQVcsQ0FBQTs7QUFTWCxTQUFTLGFBQWEsQ0FBRSxDQUFDLEVBQUU7OztBQUd6QixTQUFPLENBQUMsQ0FBQyxTQUFTLENBQUE7Q0FDbkI7O0FBRUQsU0FBUyxjQUFjLENBQUUsQ0FBQyxFQUFFOzs7QUFHMUIsU0FBTyxDQUFDLENBQUMsVUFBVSxDQUFBO0NBQ3BCOztBQUVELFNBQVMsS0FBSyxDQUFFLFFBQVEsRUFBRTtBQUN4QixNQUFJLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBO0FBQ2xCLFVBQVEsQ0FBQyxZQUFNO0FBQUUsV0FBTyxJQUFJLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUE7R0FBRSxDQUFDLENBQUE7Q0FDckQ7O0FBRUQsU0FBUyxZQUFZLEdBQUk7QUFDdkIsTUFBTSxNQUFNLEdBQUc7QUFDYixVQUFNLEVBQUUsS0FBSztBQUNiLGtCQUFjLEVBQUMsMEJBQUc7QUFBRSxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtLQUFFO0FBQ3hDLG9CQUFnQixFQUFDLDRCQUFHO0FBQUUsVUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7S0FBRTtBQUMzQyxZQUFRLEVBQUMsb0JBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7S0FBRTtHQUNuQyxDQUFBO0FBQ0QsU0FBTyxNQUFNLENBQUE7Q0FDZDs7QUFFRCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBTTthQUNxRixFQUFFO01BQWpILE1BQU07TUFBRSxPQUFPO01BQUUsV0FBVztNQUFFLFlBQVk7TUFB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VSxDQUFDLFlBQU07QUFDZixrQkFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTthQUMvRCxDQUFDLENBQUE7O0FBRUYsY0FBRSxDQUFDLDBDQUEwQyxFQUFFLFlBQU07QUFDbkQsb0JBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO2FBQ2hGLENBQUMsQ0FBQTtXQUNILENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtZWxlbWVudC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5pbXBvcnQgTWFpbiBmcm9tICcuLi9saWIvbWFpbidcbmltcG9ydCBNaW5pbWFwIGZyb20gJy4uL2xpYi9taW5pbWFwJ1xuaW1wb3J0IE1pbmltYXBFbGVtZW50IGZyb20gJy4uL2xpYi9taW5pbWFwLWVsZW1lbnQnXG5pbXBvcnQge3N0eWxlc2hlZXR9IGZyb20gJy4vaGVscGVycy93b3Jrc3BhY2UnXG5pbXBvcnQge21vdXNlbW92ZSwgbW91c2Vkb3duLCBtb3VzZXVwLCBtb3VzZXdoZWVsLCB0b3VjaHN0YXJ0LCB0b3VjaG1vdmV9IGZyb20gJy4vaGVscGVycy9ldmVudHMnXG5cbmZ1bmN0aW9uIHJlYWxPZmZzZXRUb3AgKG8pIHtcbiAgLy8gdHJhbnNmb3JtID0gbmV3IFdlYktpdENTU01hdHJpeCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShvKS50cmFuc2Zvcm1cbiAgLy8gby5vZmZzZXRUb3AgKyB0cmFuc2Zvcm0ubTQyXG4gIHJldHVybiBvLm9mZnNldFRvcFxufVxuXG5mdW5jdGlvbiByZWFsT2Zmc2V0TGVmdCAobykge1xuICAvLyB0cmFuc2Zvcm0gPSBuZXcgV2ViS2l0Q1NTTWF0cml4IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG8pLnRyYW5zZm9ybVxuICAvLyBvLm9mZnNldExlZnQgKyB0cmFuc2Zvcm0ubTQxXG4gIHJldHVybiBvLm9mZnNldExlZnRcbn1cblxuZnVuY3Rpb24gc2xlZXAgKGR1cmF0aW9uKSB7XG4gIGxldCB0ID0gbmV3IERhdGUoKVxuICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXcgRGF0ZSgpIC0gdCA+IGR1cmF0aW9uIH0pXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBsdWdpbiAoKSB7XG4gIGNvbnN0IHBsdWdpbiA9IHtcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfSxcbiAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gIH1cbiAgcmV0dXJuIHBsdWdpblxufVxuXG5kZXNjcmliZSgnTWluaW1hcEVsZW1lbnQnLCAoKSA9PiB7XG4gIGxldCBbZWRpdG9yLCBtaW5pbWFwLCBsYXJnZVNhbXBsZSwgbWVkaXVtU2FtcGxlLCBzbWFsbFNhbXBsZSwgamFzbWluZUNvbnRlbnQsIGVkaXRvckVsZW1lbnQsIG1pbmltYXBFbGVtZW50LCBkaXJdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAvLyBDb21tZW50IGFmdGVyIGJvZHkgYmVsb3cgdG8gbGVhdmUgdGhlIGNyZWF0ZWQgdGV4dCBlZGl0b3IgYW5kIG1pbmltYXBcbiAgICAvLyBvbiBET00gYWZ0ZXIgdGhlIHRlc3QgcnVuLlxuICAgIGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcblxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFySGVpZ2h0JywgNClcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhcldpZHRoJywgMilcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW50ZXJsaW5lJywgMSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAudGV4dE9wYWNpdHknLCAxKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zbW9vdGhTY3JvbGxpbmcnLCB0cnVlKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zJywge30pXG5cbiAgICBNaW5pbWFwRWxlbWVudC5yZWdpc3RlclZpZXdQcm92aWRlcihNaW5pbWFwKVxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHt9KVxuICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgIGphc21pbmVDb250ZW50Lmluc2VydEJlZm9yZShlZGl0b3JFbGVtZW50LCBqYXNtaW5lQ29udGVudC5maXJzdENoaWxkKVxuICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDUwKVxuICAgIC8vIGVkaXRvci5zZXRMaW5lSGVpZ2h0SW5QaXhlbHMoMTApXG5cbiAgICBtaW5pbWFwID0gbmV3IE1pbmltYXAoe3RleHRFZGl0b3I6IGVkaXRvcn0pXG4gICAgZGlyID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF1cblxuICAgIGxhcmdlU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdsYXJnZS1maWxlLmNvZmZlZScpKS50b1N0cmluZygpXG4gICAgbWVkaXVtU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCd0d28taHVuZHJlZC50eHQnKSkudG9TdHJpbmcoKVxuICAgIHNtYWxsU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdzYW1wbGUuY29mZmVlJykpLnRvU3RyaW5nKClcblxuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgbWluaW1hcEVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcobWluaW1hcClcbiAgfSlcblxuICBpdCgnaGFzIGJlZW4gcmVnaXN0ZXJlZCBpbiB0aGUgdmlldyByZWdpc3RyeScsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcEVsZW1lbnQpLnRvRXhpc3QoKVxuICB9KVxuXG4gIGl0KCdoYXMgc3RvcmVkIHRoZSBtaW5pbWFwIGFzIGl0cyBtb2RlbCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0TW9kZWwoKSkudG9CZShtaW5pbWFwKVxuICB9KVxuXG4gIGl0KCdoYXMgYSBjYW52YXMgaW4gYSBzaGFkb3cgRE9NJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpKS50b0V4aXN0KClcbiAgfSlcblxuICBpdCgnaGFzIGEgZGl2IHJlcHJlc2VudGluZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXZpc2libGUtYXJlYScpKS50b0V4aXN0KClcbiAgfSlcblxuICAvLyAgICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgICAgIyMjICAgICAjIyMjIyMgICMjICAgICAjI1xuICAvLyAgICAgICMjICMjICAgICAgIyMgICAgICAgIyMgICAgICAjIyAjIyAgICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAgIyMgICAjIyAgICAgIyMgICAgICAgIyMgICAgICMjICAgIyMgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjIyMjIyMjI1xuICAvLyAgICAjIyMjIyMjIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICAjIyMjIyMgICMjICAgICAjI1xuXG4gIGRlc2NyaWJlKCd3aGVuIGF0dGFjaGVkIHRvIHRoZSB0ZXh0IGVkaXRvciBlbGVtZW50JywgKCkgPT4ge1xuICAgIGxldCBbbm9BbmltYXRpb25GcmFtZSwgbmV4dEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTYWZlLCBjYW52YXMsIHZpc2libGVBcmVhXSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIG5vQW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7IHRocm93IG5ldyBFcnJvcignTm8gYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3RlZCcpIH1cbiAgICAgIG5leHRBbmltYXRpb25GcmFtZSA9IG5vQW5pbWF0aW9uRnJhbWVcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lU2FmZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgIHNweU9uKHdpbmRvdywgJ3JlcXVlc3RBbmltYXRpb25GcmFtZScpLmFuZENhbGxGYWtlKChmbikgPT4ge1xuICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lID0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIGZuKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDIwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDUwKVxuXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDIwMClcbiAgICAgIG1pbmltYXBFbGVtZW50LmF0dGFjaCgpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICBtaW5pbWFwLmRlc3Ryb3koKVxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZVNhZmVcbiAgICB9KVxuXG4gICAgaXQoJ3Rha2VzIHRoZSBoZWlnaHQgb2YgdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRIZWlnaHQpLnRvRXF1YWwoZWRpdG9yRWxlbWVudC5jbGllbnRIZWlnaHQpXG5cbiAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oZWRpdG9yRWxlbWVudC5jbGllbnRXaWR0aCAvIDEwLCAwKVxuICAgIH0pXG5cbiAgICBpdCgna25vd3Mgd2hlbiBhdHRhY2hlZCB0byBhIHRleHQgZWRpdG9yJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmF0dGFjaGVkVG9UZXh0RWRpdG9yKS50b0JlVHJ1dGh5KClcbiAgICB9KVxuXG4gICAgaXQoJ3Jlc2l6ZXMgdGhlIGNhbnZhcyB0byBmaXQgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoY2FudmFzLm9mZnNldEhlaWdodCAvIGRldmljZVBpeGVsUmF0aW8pLnRvQmVDbG9zZVRvKG1pbmltYXBFbGVtZW50Lm9mZnNldEhlaWdodCArIG1pbmltYXAuZ2V0TGluZUhlaWdodCgpLCAwKVxuICAgICAgZXhwZWN0KGNhbnZhcy5vZmZzZXRXaWR0aCAvIGRldmljZVBpeGVsUmF0aW8pLnRvQmVDbG9zZVRvKG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoLCAwKVxuICAgIH0pXG5cbiAgICBpdCgncmVxdWVzdHMgYW4gdXBkYXRlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkKS50b0JlVHJ1dGh5KClcbiAgICB9KVxuXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgICMjIyMjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgIyMgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAgICAgIyMjIyMjICAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgICAgICAgICAgIyMgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcblxuICAgIGRlc2NyaWJlKCd3aXRoIGNzcyBmaWx0ZXJzJywgKCkgPT4ge1xuICAgICAgZGVzY3JpYmUoJ3doZW4gYSBodWUtcm90YXRlIGZpbHRlciBpcyBhcHBsaWVkIHRvIGEgcmdiIGNvbG9yJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2FkZGl0aW9ubmFsU3R5bGVOb2RlXSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIG1pbmltYXBFbGVtZW50LmludmFsaWRhdGVET01TdHlsZXNDYWNoZSgpXG5cbiAgICAgICAgICBhZGRpdGlvbm5hbFN0eWxlTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICAgICAgICBhZGRpdGlvbm5hbFN0eWxlTm9kZS50ZXh0Q29udGVudCA9IGBcbiAgICAgICAgICAgICR7c3R5bGVzaGVldH1cblxuICAgICAgICAgICAgLmVkaXRvciB7XG4gICAgICAgICAgICAgIGNvbG9yOiByZWQ7XG4gICAgICAgICAgICAgIC13ZWJraXQtZmlsdGVyOiBodWUtcm90YXRlKDE4MGRlZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYFxuXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQoYWRkaXRpb25uYWxTdHlsZU5vZGUpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2NvbXB1dGVzIHRoZSBuZXcgY29sb3IgYnkgYXBwbHlpbmcgdGhlIGh1ZSByb3RhdGlvbicsICgpID0+IHtcbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmV0cmlldmVTdHlsZUZyb21Eb20oWycuZWRpdG9yJ10sICdjb2xvcicpKS50b0VxdWFsKGByZ2IoMCwgJHsweDZkfSwgJHsweDZkfSlgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBhIGh1ZS1yb3RhdGUgZmlsdGVyIGlzIGFwcGxpZWQgdG8gYSByZ2JhIGNvbG9yJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2FkZGl0aW9ubmFsU3R5bGVOb2RlXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuaW52YWxpZGF0ZURPTVN0eWxlc0NhY2hlKClcblxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlLnRleHRDb250ZW50ID0gYFxuICAgICAgICAgICAgJHtzdHlsZXNoZWV0fVxuXG4gICAgICAgICAgICAuZWRpdG9yIHtcbiAgICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAwLCAwLCAwKTtcbiAgICAgICAgICAgICAgLXdlYmtpdC1maWx0ZXI6IGh1ZS1yb3RhdGUoMTgwZGVnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBgXG5cbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZChhZGRpdGlvbm5hbFN0eWxlTm9kZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnY29tcHV0ZXMgdGhlIG5ldyBjb2xvciBieSBhcHBseWluZyB0aGUgaHVlIHJvdGF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXRyaWV2ZVN0eWxlRnJvbURvbShbJy5lZGl0b3InXSwgJ2NvbG9yJykpLnRvRXF1YWwoYHJnYmEoMCwgJHsweDZkfSwgJHsweDZkfSwgMClgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICAgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gICAgLy8gICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgdXBkYXRlIGlzIHBlcmZvcm1lZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtdmlzaWJsZS1hcmVhJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzZXRzIHRoZSB2aXNpYmxlIGFyZWEgd2lkdGggYW5kIGhlaWdodCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHZpc2libGVBcmVhLm9mZnNldFdpZHRoKS50b0VxdWFsKG1pbmltYXBFbGVtZW50LmNsaWVudFdpZHRoKVxuICAgICAgICBleHBlY3QodmlzaWJsZUFyZWEub2Zmc2V0SGVpZ2h0KS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSwgMClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzZXRzIHRoZSB2aXNpYmxlIHZpc2libGUgYXJlYSBvZmZzZXQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKHZpc2libGVBcmVhKSkudG9CZUNsb3NlVG8obWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsVG9wKCkgLSBtaW5pbWFwLmdldFNjcm9sbFRvcCgpLCAwKVxuICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQodmlzaWJsZUFyZWEpKS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxMZWZ0KCksIDApXG4gICAgICB9KVxuXG4gICAgICBpdCgnb2Zmc2V0cyB0aGUgY2FudmFzIHdoZW4gdGhlIHNjcm9sbCBkb2VzIG5vdCBtYXRjaCBsaW5lIGhlaWdodCcsICgpID0+IHtcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwNClcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKGNhbnZhcykpLnRvQmVDbG9zZVRvKC0yLCAtMSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkb2VzIG5vdCBmYWlsIHRvIHVwZGF0ZSByZW5kZXIgdGhlIGludmlzaWJsZSBjaGFyIHdoZW4gbW9kaWZpZWQnLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJywgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IuaW52aXNpYmxlcycsIHtjcjogJyonfSlcblxuICAgICAgICBleHBlY3QoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KS5ub3QudG9UaHJvdygpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgZGVjb3JhdGlvbnMgYmFzZWQgb24gdGhlIG9yZGVyIHNldHRpbmdzJywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG5cbiAgICAgICAgY29uc3QgcGx1Z2luRm9vID0gY3JlYXRlUGx1Z2luKClcbiAgICAgICAgY29uc3QgcGx1Z2luQmFyID0gY3JlYXRlUGx1Z2luKClcblxuICAgICAgICBNYWluLnJlZ2lzdGVyUGx1Z2luKCdmb28nLCBwbHVnaW5Gb28pXG4gICAgICAgIE1haW4ucmVnaXN0ZXJQbHVnaW4oJ2JhcicsIHBsdWdpbkJhcilcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucy5mb29EZWNvcmF0aW9uc1pJbmRleCcsIDEpXG5cbiAgICAgICAgY29uc3QgY2FsbHMgPSBbXVxuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdMaW5lRGVjb3JhdGlvbicpLmFuZENhbGxGYWtlKChkKSA9PiB7XG4gICAgICAgICAgY2FsbHMucHVzaChkLmdldFByb3BlcnRpZXMoKS5wbHVnaW4pXG4gICAgICAgIH0pXG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0hpZ2hsaWdodERlY29yYXRpb24nKS5hbmRDYWxsRmFrZSgoZCkgPT4ge1xuICAgICAgICAgIGNhbGxzLnB1c2goZC5nZXRQcm9wZXJ0aWVzKCkucGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEsIDBdLCBbMSwgMTBdXSksIHt0eXBlOiAnbGluZScsIGNvbG9yOiAnIzAwMDBGRicsIHBsdWdpbjogJ2Jhcid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2hpZ2hsaWdodC11bmRlcicsIGNvbG9yOiAnIzAwMDBGRicsIHBsdWdpbjogJ2Zvbyd9KVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QoY2FsbHMpLnRvRXF1YWwoWydiYXInLCAnZm9vJ10pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucy5mb29EZWNvcmF0aW9uc1pJbmRleCcsIC0xKVxuXG4gICAgICAgICAgY2FsbHMubGVuZ3RoID0gMFxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QoY2FsbHMpLnRvRXF1YWwoWydmb28nLCAnYmFyJ10pXG5cbiAgICAgICAgICBNYWluLnVucmVnaXN0ZXJQbHVnaW4oJ2ZvbycpXG4gICAgICAgICAgTWFpbi51bnJlZ2lzdGVyUGx1Z2luKCdiYXInKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIHZpc2libGUgbGluZSBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3TGluZURlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgMF0sIFsxLCAxMF1dKSwge3R5cGU6ICdsaW5lJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwLCAwXSwgWzEwLCAxMF1dKSwge3R5cGU6ICdsaW5lJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgMF0sIFsxMDAsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdMaW5lRGVjb3JhdGlvbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdMaW5lRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGhpZ2hsaWdodCBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3SGlnaGxpZ2h0RGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDRdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LXVuZGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzIsIDIwXSwgWzIsIDMwXV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdmVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LXVuZGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3SGlnaGxpZ2h0RGVjb3JhdGlvbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdIaWdobGlnaHREZWNvcmF0aW9uLmNhbGxzLmxlbmd0aCkudG9FcXVhbCgyKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIHZpc2libGUgb3V0bGluZSBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3SGlnaGxpZ2h0T3V0bGluZURlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgNF0sIFszLCA2XV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdXRsaW5lJywgY29sb3I6ICcjMDAwMGZmJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzYsIDBdLCBbNiwgN11dKSwge3R5cGU6ICdoaWdobGlnaHQtb3V0bGluZScsIGNvbG9yOiAnIzAwMDBmZid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMDAsIDNdLCBbMTAwLCA1XV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdXRsaW5lJywgY29sb3I6ICcjMDAwMGZmJ30pXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3SGlnaGxpZ2h0T3V0bGluZURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3SGlnaGxpZ2h0T3V0bGluZURlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBjdXN0b20gZm9yZWdyb3VuZCBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3Q3VzdG9tRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBjb25zdCByZW5kZXJSb3V0aW5lID0gamFzbWluZS5jcmVhdGVTcHkoJ3JlbmRlclJvdXRpbmUnKVxuXG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7XG4gICAgICAgICAgdHlwZTogJ2ZvcmVncm91bmQtY3VzdG9tJyxcbiAgICAgICAgICByZW5kZXI6IHJlbmRlclJvdXRpbmVcbiAgICAgICAgfVxuXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEsIDRdLCBbMywgNl1dKSwgcHJvcGVydGllcylcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbNiwgMF0sIFs2LCA3XV0pLCBwcm9wZXJ0aWVzKVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMDAsIDNdLCBbMTAwLCA1XV0pLCBwcm9wZXJ0aWVzKVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0N1c3RvbURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3Q3VzdG9tRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICAgIGV4cGVjdChyZW5kZXJSb3V0aW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QocmVuZGVyUm91dGluZS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGN1c3RvbSBiYWNrZ3JvdW5kIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdDdXN0b21EZWNvcmF0aW9uJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIGNvbnN0IHJlbmRlclJvdXRpbmUgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVuZGVyUm91dGluZScpXG5cbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHtcbiAgICAgICAgICB0eXBlOiAnYmFja2dyb3VuZC1jdXN0b20nLFxuICAgICAgICAgIHJlbmRlcjogcmVuZGVyUm91dGluZVxuICAgICAgICB9XG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgNF0sIFszLCA2XV0pLCBwcm9wZXJ0aWVzKVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1s2LCAwXSwgWzYsIDddXSksIHByb3BlcnRpZXMpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHByb3BlcnRpZXMpXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3Q3VzdG9tRGVjb3JhdGlvbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdDdXN0b21EZWNvcmF0aW9uLmNhbGxzLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgICAgZXhwZWN0KHJlbmRlclJvdXRpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChyZW5kZXJSb3V0aW5lLmNhbGxzLmxlbmd0aCkudG9FcXVhbCg0KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciBpcyBzY3JvbGxlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMjAwMClcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoNTApXG5cbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgndXBkYXRlcyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKHZpc2libGVBcmVhKSkudG9CZUNsb3NlVG8obWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsVG9wKCkgLSBtaW5pbWFwLmdldFNjcm9sbFRvcCgpLCAwKVxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdCh2aXNpYmxlQXJlYSkpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKSwgMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBlZGl0b3IgaXMgcmVzaXplZCB0byBhIGdyZWF0ZXIgc2l6ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS53aWR0aCA9ICc4MDBweCdcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmhlaWdodCA9ICc1MDBweCdcblxuICAgICAgICAgIG1pbmltYXBFbGVtZW50Lm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG5cbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZGV0ZWN0cyB0aGUgcmVzaXplIGFuZCBhZGp1c3QgaXRzZWxmJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oZWRpdG9yRWxlbWVudC5vZmZzZXRXaWR0aCAvIDEwLCAwKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRIZWlnaHQpLnRvRXF1YWwoZWRpdG9yRWxlbWVudC5vZmZzZXRIZWlnaHQpXG5cbiAgICAgICAgICBleHBlY3QoY2FudmFzLm9mZnNldFdpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbykudG9CZUNsb3NlVG8obWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgsIDApXG4gICAgICAgICAgZXhwZWN0KGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRIZWlnaHQgKyBtaW5pbWFwLmdldExpbmVIZWlnaHQoKSwgMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBlZGl0b3IgdmlzaWJsZSBjb250ZW50IGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgwKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDE0MDApXG4gICAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1sxMDEsIDBdLCBbMTAyLCAyMF1dKVxuXG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdMaW5lcycpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmb28nKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3JlcmVuZGVycyB0aGUgcGFydCB0aGF0IGhhdmUgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZXMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdMaW5lcy5hcmdzRm9yQ2FsbFswXVswXSkudG9FcXVhbCgxMDApXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0xpbmVzLmFyZ3NGb3JDYWxsWzBdWzFdKS50b0VxdWFsKDEwMSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciB2aXNpYmlsaXR5IGNoYW5nZScsICgpID0+IHtcbiAgICAgICAgaXQoJ2RvZXMgbm90IG1vZGlmeSB0aGUgc2l6ZSBvZiB0aGUgY2FudmFzJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBjYW52YXNXaWR0aCA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkud2lkdGhcbiAgICAgICAgICBsZXQgY2FudmFzSGVpZ2h0ID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5oZWlnaHRcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICAgICAgIG1pbmltYXBFbGVtZW50Lm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG5cbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLndpZHRoKS50b0VxdWFsKGNhbnZhc1dpZHRoKVxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuaGVpZ2h0KS50b0VxdWFsKGNhbnZhc0hlaWdodClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdmcm9tIGhpZGRlbiB0byB2aXNpYmxlJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5jaGVja0ZvclZpc2liaWxpdHlDaGFuZ2UoKVxuICAgICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJylcbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnXG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5wb2xsRE9NKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlcXVlc3RzIGFuIHVwZGF0ZSBvZiB0aGUgd2hvbGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgIyMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAgICAjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgIyMgICAgICAgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgICAjI1xuICAgIC8vICAgICAgICAgICMjICMjICAgICAgICMjICAgIyMgICAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgIyMgICAgICMjICAjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjI1xuXG4gICAgZGVzY3JpYmUoJ21vdXNlIHNjcm9sbCBjb250cm9scycsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDQwMClcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNDAwKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoMClcblxuICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgIG1pbmltYXBFbGVtZW50Lm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3VzaW5nIHRoZSBtb3VzZSBzY3JvbGx3aGVlbCBvdmVyIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICBpdCgncmVsYXlzIHRoZSBldmVudHMgdG8gdGhlIGVkaXRvciB2aWV3JywgKCkgPT4ge1xuICAgICAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnByZXNlbnRlciwgJ3NldFNjcm9sbFRvcCcpLmFuZENhbGxGYWtlKCgpID0+IHt9KVxuXG4gICAgICAgICAgbW91c2V3aGVlbChtaW5pbWFwRWxlbWVudCwgMCwgMTUpXG5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jb21wb25lbnQucHJlc2VudGVyLnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGluZGVwZW5kZW50TWluaW1hcFNjcm9sbCBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHByZXZpb3VzU2Nyb2xsVG9wXG5cbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbmRlcGVuZGVudE1pbmltYXBTY3JvbGwnLCB0cnVlKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNjcm9sbFNlbnNpdGl2aXR5JywgMC41KVxuXG4gICAgICAgICAgICBzcHlPbihlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5wcmVzZW50ZXIsICdzZXRTY3JvbGxUb3AnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgICAgcHJldmlvdXNTY3JvbGxUb3AgPSBtaW5pbWFwLmdldFNjcm9sbFRvcCgpXG5cbiAgICAgICAgICAgIG1vdXNld2hlZWwobWluaW1hcEVsZW1lbnQsIDAsIC0xNSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2RvZXMgbm90IHJlbGF5IHRoZSBldmVudHMgdG8gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5wcmVzZW50ZXIuc2V0U2Nyb2xsVG9wKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBtaW5pbWFwIGluc3RlYWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkubm90LnRvRXF1YWwocHJldmlvdXNTY3JvbGxUb3ApXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdjbGFtcCB0aGUgbWluaW1hcCBzY3JvbGwgaW50byB0aGUgbGVnaXQgYm91bmRzJywgKCkgPT4ge1xuICAgICAgICAgICAgbW91c2V3aGVlbChtaW5pbWFwRWxlbWVudCwgMCwgLTEwMDAwMClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwobWluaW1hcC5nZXRNYXhTY3JvbGxUb3AoKSlcblxuICAgICAgICAgICAgbW91c2V3aGVlbChtaW5pbWFwRWxlbWVudCwgMCwgMTAwMDAwKVxuXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgwKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnbWlkZGxlIGNsaWNraW5nIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2NhbnZhcywgdmlzaWJsZUFyZWEsIG9yaWdpbmFsTGVmdCwgbWF4U2Nyb2xsXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgY2FudmFzID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKVxuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWFcbiAgICAgICAgICBvcmlnaW5hbExlZnQgPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0XG4gICAgICAgICAgbWF4U2Nyb2xsID0gbWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2Nyb2xscyB0byB0aGUgdG9wIHVzaW5nIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uJywgKCkgPT4ge1xuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMsIHt4OiBvcmlnaW5hbExlZnQgKyAxLCB5OiAwLCBidG46IDF9KVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKDApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3Njcm9sbGluZyB0byB0aGUgbWlkZGxlIHVzaW5nIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBjYW52YXNNaWRZXG5cbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBlZGl0b3JNaWRZID0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIDIuMFxuICAgICAgICAgICAgbGV0IHt0b3AsIGhlaWdodH0gPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGNhbnZhc01pZFkgPSB0b3AgKyAoaGVpZ2h0IC8gMi4wKVxuICAgICAgICAgICAgbGV0IGFjdHVhbE1pZFkgPSBNYXRoLm1pbihjYW52YXNNaWRZLCBlZGl0b3JNaWRZKVxuICAgICAgICAgICAgbW91c2Vkb3duKGNhbnZhcywge3g6IG9yaWdpbmFsTGVmdCArIDEsIHk6IGFjdHVhbE1pZFksIGJ0bjogMX0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgdG8gdGhlIG1pZGRsZScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBtaWRkbGVTY3JvbGxUb3AgPSBNYXRoLnJvdW5kKChtYXhTY3JvbGwpIC8gMi4wKVxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwobWlkZGxlU2Nyb2xsVG9wKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndXBkYXRlcyB0aGUgdmlzaWJsZSBhcmVhIHRvIGJlIGNlbnRlcmVkJywgKCkgPT4ge1xuICAgICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgICAgbGV0IHt0b3AsIGhlaWdodH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICAgICAgICAgIGxldCB2aXNpYmxlQ2VudGVyWSA9IHRvcCArIChoZWlnaHQgLyAyKVxuICAgICAgICAgICAgICBleHBlY3QodmlzaWJsZUNlbnRlclkpLnRvQmVDbG9zZVRvKDIwMCwgMClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnc2Nyb2xsaW5nIHRoZSBlZGl0b3IgdG8gYW4gYXJiaXRyYXJ5IGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBbc2Nyb2xsVG8sIHNjcm9sbFJhdGlvXSA9IFtdXG5cbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIHNjcm9sbFRvID0gMTAxIC8vIHBpeGVsc1xuICAgICAgICAgICAgc2Nyb2xsUmF0aW8gPSAoc2Nyb2xsVG8gLSBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSAvIDIpIC8gKG1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpIC0gbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpXG4gICAgICAgICAgICBzY3JvbGxSYXRpbyA9IE1hdGgubWF4KDAsIHNjcm9sbFJhdGlvKVxuICAgICAgICAgICAgc2Nyb2xsUmF0aW8gPSBNYXRoLm1pbigxLCBzY3JvbGxSYXRpbylcblxuICAgICAgICAgICAgbW91c2Vkb3duKGNhbnZhcywge3g6IG9yaWdpbmFsTGVmdCArIDEsIHk6IHNjcm9sbFRvLCBidG46IDF9KVxuXG4gICAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIGFuIGFyYml0cmFyeSBsb2NhdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBleHBlY3RlZFNjcm9sbCA9IG1heFNjcm9sbCAqIHNjcm9sbFJhdGlvXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9CZUNsb3NlVG8oZXhwZWN0ZWRTY3JvbGwsIDApXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhIHdpdGggbWlkZGxlIG1vdXNlIGJ1dHRvbiAnICtcbiAgICAgICAgICAnYWZ0ZXIgc2Nyb2xsaW5nIHRvIHRoZSBhcmJpdHJhcnkgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW29yaWdpbmFsVG9wXSA9IFtdXG5cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBvcmlnaW5hbFRvcCA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgICAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBvcmlnaW5hbExlZnQgKyAxLCB5OiBzY3JvbGxUbyArIDQwLCBidG46IDF9KVxuXG4gICAgICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSB9KVxuICAgICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBzbyB0aGF0IHRoZSB2aXNpYmxlIGFyZWEgd2FzIG1vdmVkIGRvd24gJyArXG4gICAgICAgICAgICAnYnkgNDAgcGl4ZWxzIGZyb20gdGhlIGFyYml0cmFyeSBsb2NhdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHt0b3B9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgncHJlc3NpbmcgdGhlIG1vdXNlIG9uIHRoZSBtaW5pbWFwIGNhbnZhcyAod2l0aG91dCBzY3JvbGwgYW5pbWF0aW9uKScsICgpID0+IHtcbiAgICAgICAgbGV0IGNhbnZhc1xuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGxldCB0ID0gMFxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZ2V0VGltZScpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBuID0gdFxuICAgICAgICAgICAgdCArPSAxMDBcbiAgICAgICAgICAgIHJldHVybiBuXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RVcGRhdGUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nLCBmYWxzZSlcblxuICAgICAgICAgIGNhbnZhcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0JlQ2xvc2VUbyg0ODApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXAuc2V0U2Nyb2xsVG9wKDEwMDApXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsJywgdHJ1ZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciB0byB0aGUgbGluZSBiZWxvdyB0aGUgbW91c2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvQmVDbG9zZVRvKDQ4MClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3ByZXNzaW5nIHRoZSBtb3VzZSBvbiB0aGUgbWluaW1hcCBjYW52YXMgKHdpdGggc2Nyb2xsIGFuaW1hdGlvbiknLCAoKSA9PiB7XG4gICAgICAgIGxldCBjYW52YXNcblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBsZXQgdCA9IDBcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2dldFRpbWUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRcbiAgICAgICAgICAgIHQgKz0gMTAwXG4gICAgICAgICAgICByZXR1cm4gblxuICAgICAgICAgIH0pXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0VXBkYXRlJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJywgdHJ1ZSlcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24nLCAzMDApXG5cbiAgICAgICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBncmFkdWFsbHkgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgICAgLy8gd2FpdCB1bnRpbCBhbGwgYW5pbWF0aW9ucyBydW4gb3V0XG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lICYmIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICByZXR1cm4gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSA+PSA0ODBcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdG9wcyB0aGUgYW5pbWF0aW9uIGlmIHRoZSB0ZXh0IGVkaXRvciBpcyBkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuXG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgJiYgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgZXhwZWN0KG5leHRBbmltYXRpb25GcmFtZSA9PT0gbm9BbmltYXRpb25GcmFtZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIGluZGVwZW5kZW50TWluaW1hcFNjcm9sbCBzZXR0aW5nIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwLnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmluZGVwZW5kZW50TWluaW1hcFNjcm9sbCcsIHRydWUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgZ3JhZHVhbGx5IHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICAgIC8vIHdhaXQgdW50aWwgYWxsIGFuaW1hdGlvbnMgcnVuIG91dFxuICAgICAgICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgJiYgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgPj0gNDgwXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc3RvcHMgdGhlIGFuaW1hdGlvbiBpZiB0aGUgdGV4dCBlZGl0b3IgaXMgZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSB9KVxuXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuXG4gICAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSAmJiBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgICAgIGV4cGVjdChuZXh0QW5pbWF0aW9uRnJhbWUgPT09IG5vQW5pbWF0aW9uRnJhbWUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnZHJhZ2dpbmcgdGhlIHZpc2libGUgYXJlYScsICgpID0+IHtcbiAgICAgICAgbGV0IFt2aXNpYmxlQXJlYSwgb3JpZ2luYWxUb3BdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgbGV0IG8gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIGxldCBsZWZ0ID0gby5sZWZ0XG4gICAgICAgICAgb3JpZ2luYWxUb3AgPSBvLnRvcFxuXG4gICAgICAgICAgbW91c2Vkb3duKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiBvcmlnaW5hbFRvcCArIDEwfSlcbiAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IG9yaWdpbmFsVG9wICsgNTB9KVxuXG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5lbmREcmFnKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHNvIHRoYXQgdGhlIHZpc2libGUgYXJlYSB3YXMgbW92ZWQgZG93biBieSA0MCBwaXhlbHMnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHt0b3B9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBleHBlY3QodG9wKS50b0JlQ2xvc2VUbyhvcmlnaW5hbFRvcCArIDQwLCAtMSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc3RvcHMgdGhlIGRyYWcgZ2VzdHVyZSB3aGVuIHRoZSBtb3VzZSBpcyByZWxlYXNlZCBvdXRzaWRlIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgIGxldCB7dG9wLCBsZWZ0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbW91c2V1cChqYXNtaW5lQ29udGVudCwge3g6IGxlZnQgLSAxMCwgeTogdG9wICsgODB9KVxuXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmFnJylcbiAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IHRvcCArIDUwfSlcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmFnKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnZHJhZ2dpbmcgdGhlIHZpc2libGUgYXJlYSB1c2luZyB0b3VjaCBldmVudHMnLCAoKSA9PiB7XG4gICAgICAgIGxldCBbdmlzaWJsZUFyZWEsIG9yaWdpbmFsVG9wXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgdmlzaWJsZUFyZWEgPSBtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYVxuICAgICAgICAgIGxldCBvID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBsZXQgbGVmdCA9IG8ubGVmdFxuICAgICAgICAgIG9yaWdpbmFsVG9wID0gby50b3BcblxuICAgICAgICAgIHRvdWNoc3RhcnQodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IG9yaWdpbmFsVG9wICsgMTB9KVxuICAgICAgICAgIHRvdWNobW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogb3JpZ2luYWxUb3AgKyA1MH0pXG5cbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3Igc28gdGhhdCB0aGUgdmlzaWJsZSBhcmVhIHdhcyBtb3ZlZCBkb3duIGJ5IDQwIHBpeGVscycsICgpID0+IHtcbiAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIGV4cGVjdCh0b3ApLnRvQmVDbG9zZVRvKG9yaWdpbmFsVG9wICsgNDAsIC0xKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdG9wcyB0aGUgZHJhZyBnZXN0dXJlIHdoZW4gdGhlIG1vdXNlIGlzIHJlbGVhc2VkIG91dHNpZGUgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnR9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBtb3VzZXVwKGphc21pbmVDb250ZW50LCB7eDogbGVmdCAtIDEwLCB5OiB0b3AgKyA4MH0pXG5cbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYWcnKVxuICAgICAgICAgIHRvdWNobW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYWcpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBtaW5pbWFwIGNhbm5vdCBzY3JvbGwnLCAoKSA9PiB7XG4gICAgICAgIGxldCBbdmlzaWJsZUFyZWEsIG9yaWdpbmFsVG9wXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbGV0IHNhbXBsZSA9IGZzLnJlYWRGaWxlU3luYyhkaXIucmVzb2x2ZSgnc2V2ZW50eS50eHQnKSkudG9TdHJpbmcoKVxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KHNhbXBsZSlcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgICAgIGxldCB7dG9wLCBsZWZ0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgIG9yaWdpbmFsVG9wID0gdG9wXG5cbiAgICAgICAgICAgICAgbW91c2Vkb3duKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyAxMH0pXG4gICAgICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyBiYXNlZCBvbiBhIHJhdGlvIGFkanVzdGVkIHRvIHRoZSBtaW5pbWFwIGhlaWdodCcsICgpID0+IHtcbiAgICAgICAgICAgIGxldCB7dG9wfSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBleHBlY3QodG9wKS50b0JlQ2xvc2VUbyhvcmlnaW5hbFRvcCArIDQwLCAtMSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gc2Nyb2xsIHBhc3QgZW5kIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNjcm9sbFBhc3RFbmQnLCB0cnVlKVxuXG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2RyYWdnaW5nIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IFtvcmlnaW5hbFRvcCwgdmlzaWJsZUFyZWFdID0gW11cblxuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgdmlzaWJsZUFyZWEgPSBtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYVxuICAgICAgICAgICAgbGV0IHt0b3AsIGxlZnR9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIG9yaWdpbmFsVG9wID0gdG9wXG5cbiAgICAgICAgICAgIG1vdXNlZG93bih2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgMTB9KVxuICAgICAgICAgICAgbW91c2Vtb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyA1MH0pXG5cbiAgICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5lbmREcmFnKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBzbyB0aGF0IHRoZSB2aXNpYmxlIGFyZWEgd2FzIG1vdmVkIGRvd24gYnkgNDAgcGl4ZWxzJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHt0b3B9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGV4cGVjdCh0b3ApLnRvQmVDbG9zZVRvKG9yaWdpbmFsVG9wICsgNDAsIC0xKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjICAjIyMjIyMjIyAgICAjIyMgICAgIyMgICAgIyMgIyMjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAgICAjIyAgICAgICMjICMjICAgIyMjICAgIyMgIyMgICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgICAgIyMgICAgICMjICAgIyMgICMjIyMgICMjICMjICAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAjIyAjIyAjIyAjIyAgICAgIyNcbiAgICAvLyAgICAgICAgICAjIyAgICAjIyAgICAjIyMjIyMjIyMgIyMgICMjIyMgIyMgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgICMjICMjICAgIyMjICMjICAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAjIyAgICAjIyAjIyMjIyMjI1xuICAgIC8vXG4gICAgLy8gICAgICAgIyMjICAgICMjICAgICAgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjI1xuICAgIC8vICAgICAgIyMgIyMgICAjIyAgICAgICAjIyAgICAgIyMgIyMjICAgIyMgIyNcbiAgICAvLyAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAjIyMjIyNcbiAgICAvLyAgICAjIyMjIyMjIyMgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICMjIyAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyNcblxuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBtb2RlbCBpcyBhIHN0YW5kLWFsb25lIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbWluaW1hcC5zZXRTdGFuZEFsb25lKHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnaGFzIGEgc3RhbmQtYWxvbmUgYXR0cmlidXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuaGFzQXR0cmlidXRlKCdzdGFuZC1hbG9uZScpKS50b0JlVHJ1dGh5KClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzZXRzIHRoZSBtaW5pbWFwIHNpemUgd2hlbiBtZWFzdXJlZCcsICgpID0+IHtcbiAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICBleHBlY3QobWluaW1hcC53aWR0aCkudG9FcXVhbChtaW5pbWFwRWxlbWVudC5jbGllbnRXaWR0aClcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuaGVpZ2h0KS50b0VxdWFsKG1pbmltYXBFbGVtZW50LmNsaWVudEhlaWdodClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBjb250cm9scyBkaXYnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLWNvbnRyb2xzJykpLnRvQmVOdWxsKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgcXVpY2sgc2V0dGluZ3MgYnV0dG9uJywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9wZW5RdWlja1NldHRpbmdzKS50b0JlVW5kZWZpbmVkKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yJywgKCkgPT4ge1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dChtZWRpdW1TYW1wbGUpXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDUwKVxuXG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCB0cnVlKVxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS50b0JlTnVsbCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgncHJlc3NpbmcgdGhlIG1vdXNlIG9uIHRoZSBtaW5pbWFwIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQobWluaW1hcEVsZW1lbnQpXG5cbiAgICAgICAgICBsZXQgdCA9IDBcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2dldFRpbWUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRcbiAgICAgICAgICAgIHQgKz0gMTAwXG4gICAgICAgICAgICByZXR1cm4gblxuICAgICAgICAgIH0pXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0VXBkYXRlJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJywgZmFsc2UpXG5cbiAgICAgICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpXG4gICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZG9lcyBub3Qgc2Nyb2xsIHRoZSBlZGl0b3IgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKDEwMDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIGlzIGNoYW5nZWQgdG8gYmUgYSBjbGFzc2ljYWwgbWluaW1hcCBhZ2FpbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCB0cnVlKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgdHJ1ZSlcblxuICAgICAgICAgIG1pbmltYXAuc2V0U3RhbmRBbG9uZShmYWxzZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVjcmVhdGVzIHRoZSBkZXN0cm95ZWQgZWxlbWVudHMnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtY29udHJvbHMnKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtdmlzaWJsZS1hcmVhJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpKS50b0V4aXN0KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICMjICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICAgIyMjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyMjIyMgICAgIyMjIyMjICAgICAjIyAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAgICAgICMjICAgICMjICAgICMjICAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjI1xuICAgIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjICAgICAjIyAgICAjIyAgICAgIyMgICMjIyMjIyMgICAgICMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgbW9kZWwgaXMgZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIG1pbmltYXAuZGVzdHJveSgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnZGV0YWNoZXMgaXRzZWxmIGZyb20gaXRzIHBhcmVudCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnBhcmVudE5vZGUpLnRvQmVOdWxsKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzdG9wcyB0aGUgRE9NIHBvbGxpbmcgaW50ZXJ2YWwnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncG9sbERPTScpXG5cbiAgICAgICAgc2xlZXAoMjAwKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4geyBleHBlY3QobWluaW1hcEVsZW1lbnQucG9sbERPTSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKSB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMgICMjIyMjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyMgICAjIyAjIyAgICAgICAgIyMgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICMjICAgICAgICAjIyAgIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgIyMgIyMgIyMjIyMjICAgICMjICAjIyAgICMjIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgIyMgICAgICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICMjIyAjIyAgICAgICAgIyMgICMjICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjICAgICAgICMjIyMgICMjIyMjI1xuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIGF0b20gc3R5bGVzIGFyZSBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2ludmFsaWRhdGVET01TdHlsZXNDYWNoZScpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICAgIGxldCBzdHlsZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgICAgc3R5bGVOb2RlLnRleHRDb250ZW50ID0gJ2JvZHl7IGNvbG9yOiAjMjMzIH0nXG4gICAgICAgICAgYXRvbS5zdHlsZXMuZW1pdHRlci5lbWl0KCdkaWQtYWRkLXN0eWxlLWVsZW1lbnQnLCBzdHlsZU5vZGUpXG4gICAgICAgIH0pXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdmb3JjZXMgYSByZWZyZXNoIHdpdGggY2FjaGUgaW52YWxpZGF0aW9uJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC50ZXh0T3BhY2l0eSBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnRleHRPcGFjaXR5JywgMC4zKVxuXG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlcXVlc3RzIGEgY29tcGxldGUgdXBkYXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cycsIHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuY2hhcldpZHRoIGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhcldpZHRoJywgMSlcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5jaGFySGVpZ2h0IGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhckhlaWdodCcsIDEpXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuaW50ZXJsaW5lIGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW50ZXJsaW5lJywgMilcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBpdCgnbW92ZXMgdGhlIGF0dGFjaGVkIG1pbmltYXAgdG8gdGhlIGxlZnQnLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2xlZnQnKSkudG9CZVRydXRoeSgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgbWluaW1hcCBpcyBub3QgYXR0YWNoZWQgeWV0JywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNTApXG4gICAgICAgICAgZWRpdG9yLnNldExpbmVIZWlnaHRJblBpeGVscygxMClcblxuICAgICAgICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcjogZWRpdG9yfSlcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuaW5zZXJ0QmVmb3JlKGVkaXRvckVsZW1lbnQsIGphc21pbmVDb250ZW50LmZpcnN0Q2hpbGQpXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCB0cnVlKVxuICAgICAgICAgIG1pbmltYXBFbGVtZW50LmF0dGFjaCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ21vdmVzIHRoZSBhdHRhY2hlZCBtaW5pbWFwIHRvIHRoZSBsZWZ0JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2xlZnQnKSkudG9CZVRydXRoeSgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcCcsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJywgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDIpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnLCB0cnVlKVxuXG4gICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ2FkanVzdHMgdGhlIHdpZHRoIG9mIHRoZSBtaW5pbWFwIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkud2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0VxdWFsKDQpXG4gICAgICB9KVxuXG4gICAgICBpdCgnb2Zmc2V0cyB0aGUgbWluaW1hcCBieSB0aGUgZGlmZmVyZW5jZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KG1pbmltYXBFbGVtZW50KSkudG9CZUNsb3NlVG8oZWRpdG9yRWxlbWVudC5jbGllbnRXaWR0aCAtIDQsIC0xKVxuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xpZW50V2lkdGgpLnRvRXF1YWwoNClcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd0aGUgZG9tIHBvbGxpbmcgcm91dGluZScsICgpID0+IHtcbiAgICAgICAgaXQoJ2RvZXMgbm90IGNoYW5nZSB0aGUgdmFsdWUnLCAoKSA9PiB7XG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcblxuICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLndpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbykudG9FcXVhbCg0KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZWRpdG9yIGlzIHJlc2l6ZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCA2KVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAwcHgnXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTAwcHgnXG5cbiAgICAgICAgICBhdG9tLnZpZXdzLnBlcmZvcm1Eb2N1bWVudFBvbGwoKVxuXG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ21ha2VzIHRoZSBtaW5pbWFwIHNtYWxsZXIgdGhhbiBzb2Z0IHdyYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbygxMiwgLTEpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnN0eWxlLm1hcmdpblJpZ2h0KS50b0VxdWFsKCcnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCB3aGVuIG1pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvciBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KG1lZGl1bVNhbXBsZSlcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCg1MClcblxuICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCB0cnVlKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdvZmZzZXRzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGJ5IHRoZSBkaWZmZXJlbmNlJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBpbmRpY2F0b3IgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKVxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdChpbmRpY2F0b3IpKS50b0JlQ2xvc2VUbygyLCAtMSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgd2hlbiBtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ29mZnNldHMgdGhlIHNjcm9sbCBpbmRpY2F0b3IgYnkgdGhlIGRpZmZlcmVuY2UnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQob3BlblF1aWNrU2V0dGluZ3MpKS5ub3QudG9CZUNsb3NlVG8oMiwgLTEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHRoZW4gZGlzYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwJywgZmFsc2UpXG5cbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQub2Zmc2V0V2lkdGggLyAxMCwgLTEpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnN0eWxlLndpZHRoKS50b0VxdWFsKCcnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCB3aGVuIHByZWZlcnJlZExpbmVMZW5ndGggPj0gMTYzODQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCAxNjM4NClcblxuICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHdpZHRoIG9mIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oZWRpdG9yRWxlbWVudC5vZmZzZXRXaWR0aCAvIDEwLCAtMSlcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc3R5bGUud2lkdGgpLnRvRXF1YWwoJycpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3Igc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KG1lZGl1bVNhbXBsZSlcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoNTApXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCB0cnVlKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2FkZHMgYSBzY3JvbGwgaW5kaWNhdG9yIGluIHRoZSBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJykpLnRvRXhpc3QoKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCB0aGVuIGRlYWN0aXZhdGVkJywgKCkgPT4ge1xuICAgICAgICBpdCgncmVtb3ZlcyB0aGUgc2Nyb2xsIGluZGljYXRvciBmcm9tIHRoZSBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgZmFsc2UpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnb24gdXBkYXRlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmhlaWdodCA9ICc1MDBweCdcblxuICAgICAgICAgIGF0b20udmlld3MucGVyZm9ybURvY3VtZW50UG9sbCgpXG5cbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnYWRqdXN0cyB0aGUgc2l6ZSBhbmQgcG9zaXRpb24gb2YgdGhlIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgICBsZXQgaW5kaWNhdG9yID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJylcblxuICAgICAgICAgIGxldCBoZWlnaHQgPSBlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpICogKGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLyBtaW5pbWFwLmdldEhlaWdodCgpKVxuICAgICAgICAgIGxldCBzY3JvbGwgPSAoZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIGhlaWdodCkgKiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY3JvbGxSYXRpbygpXG5cbiAgICAgICAgICBleHBlY3QoaW5kaWNhdG9yLm9mZnNldEhlaWdodCkudG9CZUNsb3NlVG8oaGVpZ2h0LCAwKVxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKGluZGljYXRvcikpLnRvQmVDbG9zZVRvKHNjcm9sbCwgMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBtaW5pbWFwIGNhbm5vdCBzY3JvbGwnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuXG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVtb3ZlcyB0aGUgc2Nyb2xsIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnYW5kIHRoZW4gY2FuIHNjcm9sbCBhZ2FpbicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdhdHRhY2hlcyB0aGUgc2Nyb2xsIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHsgcmV0dXJuIG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuYWJzb2x1dGVNb2RlIHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJywgdHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdhZGRzIGEgYWJzb2x1dGUgY2xhc3MgdG8gdGhlIG1pbmltYXAgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnYWJzb2x1dGUnKSkudG9CZVRydXRoeSgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgaXQoJ2Fsc28gYWRkcyBhIGxlZnQgY2xhc3MgdG8gdGhlIG1pbmltYXAgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCB0cnVlKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2Fic29sdXRlJykpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2xlZnQnKSkudG9CZVRydXRoeSgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgc21vb3RoU2Nyb2xsaW5nIHNldHRpbmcgaXMgZGlzYWJsZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNtb290aFNjcm9sbGluZycsIGZhbHNlKVxuICAgICAgfSlcbiAgICAgIGl0KCdkb2VzIG5vdCBvZmZzZXQgdGhlIGNhbnZhcyB3aGVuIHRoZSBzY3JvbGwgZG9lcyBub3QgbWF0Y2ggbGluZSBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMDQpXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChjYW52YXMpKS50b0VxdWFsKDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMgICMjIyMjIyAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgIyMgICAgIyMgIyMgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjIyAgICAgICAjIyAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgIyMgICAgICAgIyMjIyNcbiAgICAvLyAgICAjIyAgIyMgIyMgIyMgICAgICMjICAjIyAgIyMgICAgICAgIyMgICMjXG4gICAgLy8gICAgIyMgICAgIyMgICMjICAgICAjIyAgIyMgICMjICAgICMjICMjICAgIyNcbiAgICAvLyAgICAgIyMjIyMgIyMgICMjIyMjIyMgICMjIyMgICMjIyMjIyAgIyMgICAgIyNcbiAgICAvL1xuICAgIC8vICAgICAjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMgIyMgICAgIyMgICMjIyMjIyAgICAjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjIyAgICMjICMjICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjIyAgIyMgIyMgICAgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgIyMjIyMjICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAjIyAjIyAjIyAgICMjIyMgICMjIyMjI1xuICAgIC8vICAgICAgICAgICMjICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMgICMjIyMgIyMgICAgIyMgICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgICMjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAjIyMjIyMjIyAgICAjIyAgICAgICAjIyAgICAjIyMjICMjICAgICMjICAjIyMjIyMgICAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgbGV0IFtvcGVuUXVpY2tTZXR0aW5ncywgcXVpY2tTZXR0aW5nc0VsZW1lbnQsIHdvcmtzcGFjZUVsZW1lbnRdID0gW11cbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnaGFzIGEgZGl2IHRvIG9wZW4gdGhlIHF1aWNrIHNldHRpbmdzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJykpLnRvRXhpc3QoKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBkaXYnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgIH0pXG5cbiAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudC5kZXN0cm95KClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnb3BlbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50KS50b0V4aXN0KClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncG9zaXRpb25zIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IG5leHQgdG8gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IG1pbmltYXBCb3VuZHMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IHNldHRpbmdzQm91bmRzID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy50b3AsIDApXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy5sZWZ0IC0gc2V0dGluZ3NCb3VuZHMud2lkdGgsIDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGRpdicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG5cbiAgICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgncG9zaXRpb25zIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IG5leHQgdG8gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbWluaW1hcEJvdW5kcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnRvcCwgMClcbiAgICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdChxdWlja1NldHRpbmdzRWxlbWVudCkpLnRvQmVDbG9zZVRvKG1pbmltYXBCb3VuZHMucmlnaHQsIDApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBhZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgbGV0IFtjb250cm9sc10gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcCcsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnLCB0cnVlKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCAyKVxuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnLCB0cnVlKVxuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBjb250cm9scyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtY29udHJvbHMnKVxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcblxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAyNHB4J1xuXG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSBzaXplIG9mIHRoZSBjb250cm9sIGRpdiB0byBmaXQgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGNvbnRyb2xzLmNsaWVudFdpZHRoKS50b0VxdWFsKG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuY2xpZW50V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIGNvbnRyb2xzIGRpdiBvdmVyIHRoZSBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGNvbnRyb2xzUmVjdCA9IGNvbnRyb2xzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IGNhbnZhc1JlY3QgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgZXhwZWN0KGNvbnRyb2xzUmVjdC5sZWZ0KS50b0VxdWFsKGNhbnZhc1JlY3QubGVmdClcbiAgICAgICAgICBleHBlY3QoY29udHJvbHNSZWN0LnJpZ2h0KS50b0VxdWFsKGNhbnZhc1JlY3QucmlnaHQpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdhZGp1c3RzIHRoZSBzaXplIG9mIHRoZSBjb250cm9sIGRpdiB0byBmaXQgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoY29udHJvbHMuY2xpZW50V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5jbGllbnRXaWR0aCAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIGNvbnRyb2xzIGRpdiBvdmVyIHRoZSBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29udHJvbHNSZWN0ID0gY29udHJvbHMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGxldCBjYW52YXNSZWN0ID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xzUmVjdC5sZWZ0KS50b0VxdWFsKGNhbnZhc1JlY3QubGVmdClcbiAgICAgICAgICAgIGV4cGVjdChjb250cm9sc1JlY3QucmlnaHQpLnRvRXF1YWwoY2FudmFzUmVjdC5yaWdodClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBkaXYnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudC5kZXN0cm95KClcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgbmV4dCB0byB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IG1pbmltYXBCb3VuZHMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnRvcCwgMClcbiAgICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy5yaWdodCwgMClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IGlzIG9wZW4nLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3NldHMgdGhlIG9uIHJpZ2h0IGJ1dHRvbiBhY3RpdmUnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGNvZGUgaGlnaGxpZ2h0IGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLmNvZGUtaGlnaGxpZ2h0cycpXG4gICAgICAgICAgICBtb3VzZWRvd24oaXRlbSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRpc3BsYXlDb2RlSGlnaGxpZ2h0cykudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZXF1ZXN0cyBhbiB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBhYnNvbHV0ZSBtb2RlIGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLmFic29sdXRlLW1vZGUnKVxuICAgICAgICAgICAgbW91c2Vkb3duKGl0ZW0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBhYnNvbHV0ZS1tb2RlIHNldHRpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5hYnNvbHV0ZU1vZGUpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBvbiBsZWZ0IGJ1dHRvbicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bjpmaXJzdC1jaGlsZCcpXG4gICAgICAgICAgICBtb3VzZWRvd24oaXRlbSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2hhbmdlcyB0aGUgYnV0dG9ucyBhY3RpdmF0aW9uIHN0YXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOm1vdmUtbGVmdCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtbGVmdCcpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBkaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2NoYW5nZXMgdGhlIGJ1dHRvbnMgYWN0aXZhdGlvbiBzdGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmxhc3QtY2hpbGQnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY29yZTptb3ZlLXJpZ2h0IHdoZW4gdGhlIG1pbmltYXAgaXMgb24gdGhlIHJpZ2h0JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtcmlnaHQnKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnKSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2NoYW5nZXMgdGhlIGJ1dHRvbnMgYWN0aXZhdGlvbiBzdGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmxhc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIG9wZW4gc2V0dGluZ3MgYnV0dG9uIGFnYWluJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbW91c2Vkb3duKG9wZW5RdWlja1NldHRpbmdzKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2xvc2VzIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQpLnRvQmVOdWxsKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIGFuIGV4dGVybmFsIGV2ZW50IGRlc3Ryb3lzIHRoZSB2aWV3JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZW1vdmVzIHRoZSB2aWV3IHJlZmVyZW5jZSBmcm9tIHRoZSBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50KS50b0JlTnVsbCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd0aGVuIGRpc2FibGluZyBpdCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCBmYWxzZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVtb3ZlcyB0aGUgZGl2JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3dpdGggcGx1Z2lucyByZWdpc3RlcmVkIGluIHRoZSBwYWNrYWdlJywgKCkgPT4ge1xuICAgICAgICBsZXQgW21pbmltYXBQYWNrYWdlLCBwbHVnaW5BLCBwbHVnaW5CXSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ21pbmltYXAnKS50aGVuKChwa2cpID0+IHtcbiAgICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UgPSBwa2cubWFpbk1vZHVsZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBjbGFzcyBQbHVnaW4ge1xuICAgICAgICAgICAgICBhY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICBhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gdHJ1ZSB9XG4gICAgICAgICAgICAgIGRlYWN0aXZhdGVQbHVnaW4gKCkgeyB0aGlzLmFjdGl2ZSA9IGZhbHNlIH1cbiAgICAgICAgICAgICAgaXNBY3RpdmUgKCkgeyByZXR1cm4gdGhpcy5hY3RpdmUgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwbHVnaW5BID0gbmV3IFBsdWdpbigpXG4gICAgICAgICAgICBwbHVnaW5CID0gbmV3IFBsdWdpbigpXG5cbiAgICAgICAgICAgIG1pbmltYXBQYWNrYWdlLnJlZ2lzdGVyUGx1Z2luKCdkdW1teUEnLCBwbHVnaW5BKVxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15QicsIHBsdWdpbkIpXG5cbiAgICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdjcmVhdGVzIG9uZSBsaXN0IGl0ZW0gZm9yIGVhY2ggcmVnaXN0ZXJlZCBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJykubGVuZ3RoKS50b0VxdWFsKDUpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3NlbGVjdHMgdGhlIGZpcnN0IGl0ZW0gb2YgdGhlIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOmNvbmZpcm0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2Rpc2FibGUgdGhlIHBsdWdpbiBvZiB0aGUgc2VsZWN0ZWQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChwbHVnaW5BLmlzQWN0aXZlKCkpLnRvQmVGYWxzeSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCd0cmlnZ2VyZWQgYSBzZWNvbmQgdGltZScsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdlbmFibGUgdGhlIHBsdWdpbiBvZiB0aGUgc2VsZWN0ZWQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHBsdWdpbkEuaXNBY3RpdmUoKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnb24gdGhlIGNvZGUgaGlnaGxpZ2h0IGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW2luaXRpYWxdID0gW11cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBpbml0aWFsID0gbWluaW1hcEVsZW1lbnQuZGlzcGxheUNvZGVIaWdobGlnaHRzXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZGlzcGxheUNvZGVIaWdobGlnaHRzKS50b0VxdWFsKCFpbml0aWFsKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ29uIHRoZSBhYnNvbHV0ZSBtb2RlIGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW2luaXRpYWxdID0gW11cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBpbml0aWFsID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpKS50b0VxdWFsKCFpbml0aWFsKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOm1vdmUtZG93bicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzZWxlY3RzIHRoZSBzZWNvbmQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpudGgtY2hpbGQoMiknKSkudG9FeGlzdCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCdyZWFjaGluZyBhIHNlcGFyYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ21vdmVzIHBhc3QgdGhlIHNlcGFyYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLmNvZGUtaGlnaGxpZ2h0cy5zZWxlY3RlZCcpKS50b0V4aXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCd0aGVuIGNvcmU6bW92ZS11cCcsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdzZWxlY3RzIGFnYWluIHRoZSBmaXJzdCBpdGVtIG9mIHRoZSBsaXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NvcmU6bW92ZS11cCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2VsZWN0cyB0aGUgbGFzdCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLnNlbGVjdGVkOmxhc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCdyZWFjaGluZyBhIHNlcGFyYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnbW92ZXMgcGFzdCB0aGUgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6bnRoLWNoaWxkKDIpJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3RoZW4gY29yZTptb3ZlLWRvd24nLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdzZWxlY3RzIGFnYWluIHRoZSBmaXJzdCBpdGVtIG9mIHRoZSBsaXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuIl19
//# sourceURL=/Users/james/.atom/packages/minimap/spec/minimap-element-spec.js
