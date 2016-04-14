(function() {
  var Color;

  require('./helpers/matchers');

  Color = require('../lib/color');

  describe('Color', function() {
    var color;
    color = [][0];
    beforeEach(function() {
      return color = new Color('#66ff6933');
    });
    describe('created with separated components', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color(255, 127, 64, 0.5)).toBeColor(255, 127, 64, 0.5);
      });
    });
    describe('created with a hexa rgb string', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color('#ff6933')).toBeColor(255, 105, 51, 1);
      });
    });
    describe('created with a hexa argb string', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color('#66ff6933')).toBeColor(255, 105, 51, 0.4);
      });
    });
    describe('created with the name of a svg color', function() {
      return it('creates the color using its name', function() {
        return expect(new Color('orange')).toBeColor('#ffa500');
      });
    });
    describe('::isValid', function() {
      it('returns true when all the color components are valid', function() {
        return expect(new Color).toBeValid();
      });
      it('returns false when one component is NaN', function() {
        expect(new Color(NaN, 0, 0, 1)).not.toBeValid();
        expect(new Color(0, NaN, 0, 1)).not.toBeValid();
        expect(new Color(0, 0, NaN, 1)).not.toBeValid();
        return expect(new Color(0, 0, 1, NaN)).not.toBeValid();
      });
      return it('returns false when the color has the invalid flag', function() {
        color = new Color;
        color.invalid = true;
        return expect(color).not.toBeValid();
      });
    });
    describe('::isLiteral', function() {
      it('returns true when the color does not rely on variables', function() {
        return expect(new Color('orange').isLiteral()).toBeTruthy();
      });
      return it('returns false when the color does rely on variables', function() {
        color = new Color(0, 0, 0, 1);
        color.variables = ['foo'];
        return expect(color.isLiteral()).toBeFalsy();
      });
    });
    describe('::rgb', function() {
      it('returns an array with the color components', function() {
        return expect(color.rgb).toBeComponentArrayCloseTo([color.red, color.green, color.blue]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.rgb = [1, 2, 3];
        return expect(color).toBeColor(1, 2, 3, 0.4);
      });
    });
    describe('::rgba', function() {
      it('returns an array with the color and alpha components', function() {
        return expect(color.rgba).toBeComponentArrayCloseTo([color.red, color.green, color.blue, color.alpha]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.rgba = [1, 2, 3, 0.7];
        return expect(color).toBeColor(1, 2, 3, 0.7);
      });
    });
    describe('::argb', function() {
      it('returns an array with the alpha and color components', function() {
        return expect(color.argb).toBeComponentArrayCloseTo([color.alpha, color.red, color.green, color.blue]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.argb = [0.7, 1, 2, 3];
        return expect(color).toBeColor(1, 2, 3, 0.7);
      });
    });
    describe('::hsv', function() {
      it('returns an array with the hue, saturation and value components', function() {
        return expect(color.hsv).toBeComponentArrayCloseTo([16, 80, 100]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsv = [200, 50, 50];
        return expect(color).toBeColor(64, 106, 128, 0.4);
      });
    });
    describe('::hsva', function() {
      it('returns an array with the hue, saturation, value and alpha components', function() {
        return expect(color.hsva).toBeComponentArrayCloseTo([16, 80, 100, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsva = [200, 50, 50, 0.7];
        return expect(color).toBeColor(64, 106, 128, 0.7);
      });
    });
    describe('::hsl', function() {
      it('returns an array with the hue, saturation and luminosity components', function() {
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 100, 60]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsl = [200, 50, 50];
        return expect(color).toBeColor(64, 149, 191, 0.4);
      });
    });
    describe('::hsla', function() {
      it('returns an array with the hue, saturation, luminosity and alpha components', function() {
        return expect(color.hsla).toBeComponentArrayCloseTo([16, 100, 60, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsla = [200, 50, 50, 0.7];
        return expect(color).toBeColor(64, 149, 191, 0.7);
      });
    });
    describe('::hwb', function() {
      it('returns an array with the hue, whiteness and blackness components', function() {
        return expect(color.hwb).toBeComponentArrayCloseTo([16, 20, 0]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hwb = [210, 40, 40];
        return expect(color).toBeColor(102, 128, 153, 0.4);
      });
    });
    describe('::hwba', function() {
      it('returns an array with the hue, whiteness, blackness and alpha components', function() {
        return expect(color.hwba).toBeComponentArrayCloseTo([16, 20, 0, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hwba = [210, 40, 40, 0.7];
        return expect(color).toBeColor(102, 128, 153, 0.7);
      });
    });
    describe('::hex', function() {
      it('returns the color as a hexadecimal string', function() {
        return expect(color.hex).toEqual('ff6933');
      });
      return it('parses the string and sets the color components accordingly', function() {
        color.hex = '00ff00';
        return expect(color).toBeColor(0, 255, 0, 0.4);
      });
    });
    describe('::hexARGB', function() {
      it('returns the color component as a hexadecimal string', function() {
        return expect(color.hexARGB).toEqual('66ff6933');
      });
      return it('parses the string and sets the color components accordingly', function() {
        color.hexARGB = 'ff00ff00';
        return expect(color).toBeColor(0, 255, 0, 1);
      });
    });
    describe('::hue', function() {
      it('returns the hue component', function() {
        return expect(color.hue).toEqual(color.hsl[0]);
      });
      return it('sets the hue component', function() {
        color.hue = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([20, 100, 60]);
      });
    });
    describe('::saturation', function() {
      it('returns the saturation component', function() {
        return expect(color.saturation).toEqual(color.hsl[1]);
      });
      return it('sets the saturation component', function() {
        color.saturation = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 20, 60]);
      });
    });
    describe('::lightness', function() {
      it('returns the lightness component', function() {
        return expect(color.lightness).toEqual(color.hsl[2]);
      });
      return it('sets the lightness component', function() {
        color.lightness = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 100, 20]);
      });
    });
    describe('::clone', function() {
      return it('returns a copy of the current color', function() {
        expect(color.clone()).toBeColor(color);
        return expect(color.clone()).not.toBe(color);
      });
    });
    describe('::toCSS', function() {
      describe('when the color alpha channel is not 1', function() {
        return it('returns the color as a rgba() color', function() {
          return expect(color.toCSS()).toEqual('rgba(255,105,51,0.4)');
        });
      });
      describe('when the color alpha channel is 1', function() {
        return it('returns the color as a rgb() color', function() {
          color.alpha = 1;
          return expect(color.toCSS()).toEqual('rgb(255,105,51)');
        });
      });
      return describe('when the color have a CSS name', function() {
        return it('only returns the color name', function() {
          color = new Color('orange');
          return expect(color.toCSS()).toEqual('rgb(255,165,0)');
        });
      });
    });
    describe('::interpolate', function() {
      return it('blends the passed-in color linearly based on the passed-in ratio', function() {
        var colorA, colorB, colorC;
        colorA = new Color('#ff0000');
        colorB = new Color('#0000ff');
        colorC = colorA.interpolate(colorB, 0.5);
        return expect(colorC).toBeColor('#7f007f');
      });
    });
    describe('::blend', function() {
      return it('blends the passed-in color based on the passed-in blend function', function() {
        var colorA, colorB, colorC;
        colorA = new Color('#ff0000');
        colorB = new Color('#0000ff');
        colorC = colorA.blend(colorB, function(a, b) {
          return a / 2 + b / 2;
        });
        return expect(colorC).toBeColor('#800080');
      });
    });
    describe('::transparentize', function() {
      return it('returns a new color whose alpha is the passed-in value', function() {
        expect(color.transparentize(1)).toBeColor(255, 105, 51, 1);
        expect(color.transparentize(0.7)).toBeColor(255, 105, 51, 0.7);
        return expect(color.transparentize(0.1)).toBeColor(255, 105, 51, 0.1);
      });
    });
    return describe('::luma', function() {
      return it('returns the luma value of the color', function() {
        return expect(color.luma).toBeCloseTo(0.31, 1);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvY29sb3Itc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsS0FBQTs7QUFBQSxFQUFBLE9BQUEsQ0FBUSxvQkFBUixDQUFBLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGNBQVIsQ0FGUixDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLFFBQUEsS0FBQTtBQUFBLElBQUMsUUFBUyxLQUFWLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxLQUFBLEdBQVksSUFBQSxLQUFBLENBQU0sV0FBTixFQURIO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQUtBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBLEdBQUE7YUFDNUMsRUFBQSxDQUFHLGdEQUFILEVBQXFELFNBQUEsR0FBQTtlQUNuRCxNQUFBLENBQVcsSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsRUFBaEIsRUFBb0IsR0FBcEIsQ0FBWCxDQUFvQyxDQUFDLFNBQXJDLENBQStDLEdBQS9DLEVBQW9ELEdBQXBELEVBQXlELEVBQXpELEVBQTZELEdBQTdELEVBRG1EO01BQUEsQ0FBckQsRUFENEM7SUFBQSxDQUE5QyxDQUxBLENBQUE7QUFBQSxJQVNBLFFBQUEsQ0FBUyxnQ0FBVCxFQUEyQyxTQUFBLEdBQUE7YUFDekMsRUFBQSxDQUFHLGdEQUFILEVBQXFELFNBQUEsR0FBQTtlQUNuRCxNQUFBLENBQVcsSUFBQSxLQUFBLENBQU0sU0FBTixDQUFYLENBQTRCLENBQUMsU0FBN0IsQ0FBdUMsR0FBdkMsRUFBNEMsR0FBNUMsRUFBaUQsRUFBakQsRUFBcUQsQ0FBckQsRUFEbUQ7TUFBQSxDQUFyRCxFQUR5QztJQUFBLENBQTNDLENBVEEsQ0FBQTtBQUFBLElBYUEsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUEsR0FBQTthQUMxQyxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO2VBQ25ELE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSxXQUFOLENBQVgsQ0FBOEIsQ0FBQyxTQUEvQixDQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxFQUFuRCxFQUF1RCxHQUF2RCxFQURtRDtNQUFBLENBQXJELEVBRDBDO0lBQUEsQ0FBNUMsQ0FiQSxDQUFBO0FBQUEsSUFpQkEsUUFBQSxDQUFTLHNDQUFULEVBQWlELFNBQUEsR0FBQTthQUMvQyxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO2VBQ3JDLE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSxRQUFOLENBQVgsQ0FBMkIsQ0FBQyxTQUE1QixDQUFzQyxTQUF0QyxFQURxQztNQUFBLENBQXZDLEVBRCtDO0lBQUEsQ0FBakQsQ0FqQkEsQ0FBQTtBQUFBLElBcUJBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUNwQixNQUFBLEVBQUEsQ0FBRyxzREFBSCxFQUEyRCxTQUFBLEdBQUE7ZUFDekQsTUFBQSxDQUFPLEdBQUEsQ0FBQSxLQUFQLENBQWlCLENBQUMsU0FBbEIsQ0FBQSxFQUR5RDtNQUFBLENBQTNELENBQUEsQ0FBQTtBQUFBLE1BR0EsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUEsR0FBQTtBQUM1QyxRQUFBLE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsQ0FBWCxFQUFjLENBQWQsRUFBaUIsQ0FBakIsQ0FBWCxDQUE4QixDQUFDLEdBQUcsQ0FBQyxTQUFuQyxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFXLElBQUEsS0FBQSxDQUFNLENBQU4sRUFBUyxHQUFULEVBQWMsQ0FBZCxFQUFpQixDQUFqQixDQUFYLENBQThCLENBQUMsR0FBRyxDQUFDLFNBQW5DLENBQUEsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQVcsSUFBQSxLQUFBLENBQU0sQ0FBTixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLENBQWpCLENBQVgsQ0FBOEIsQ0FBQyxHQUFHLENBQUMsU0FBbkMsQ0FBQSxDQUZBLENBQUE7ZUFHQSxNQUFBLENBQVcsSUFBQSxLQUFBLENBQU0sQ0FBTixFQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsR0FBZixDQUFYLENBQThCLENBQUMsR0FBRyxDQUFDLFNBQW5DLENBQUEsRUFKNEM7TUFBQSxDQUE5QyxDQUhBLENBQUE7YUFTQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQSxHQUFBO0FBQ3RELFFBQUEsS0FBQSxHQUFRLEdBQUEsQ0FBQSxLQUFSLENBQUE7QUFBQSxRQUNBLEtBQUssQ0FBQyxPQUFOLEdBQWdCLElBRGhCLENBQUE7ZUFFQSxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsR0FBRyxDQUFDLFNBQWxCLENBQUEsRUFIc0Q7TUFBQSxDQUF4RCxFQVZvQjtJQUFBLENBQXRCLENBckJBLENBQUE7QUFBQSxJQW9DQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsTUFBQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQSxHQUFBO2VBQzNELE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSxRQUFOLENBQWUsQ0FBQyxTQUFoQixDQUFBLENBQVgsQ0FBdUMsQ0FBQyxVQUF4QyxDQUFBLEVBRDJEO01BQUEsQ0FBN0QsQ0FBQSxDQUFBO2FBR0EsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUEsR0FBQTtBQUN4RCxRQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxDQUFOLEVBQVEsQ0FBUixFQUFVLENBQVYsRUFBWSxDQUFaLENBQVosQ0FBQTtBQUFBLFFBQ0EsS0FBSyxDQUFDLFNBQU4sR0FBa0IsQ0FBQyxLQUFELENBRGxCLENBQUE7ZUFHQSxNQUFBLENBQU8sS0FBSyxDQUFDLFNBQU4sQ0FBQSxDQUFQLENBQXlCLENBQUMsU0FBMUIsQ0FBQSxFQUp3RDtNQUFBLENBQTFELEVBSnNCO0lBQUEsQ0FBeEIsQ0FwQ0EsQ0FBQTtBQUFBLElBOENBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLFNBQUEsR0FBQTtBQUNoQixNQUFBLEVBQUEsQ0FBRyw0Q0FBSCxFQUFpRCxTQUFBLEdBQUE7ZUFDL0MsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFiLENBQWlCLENBQUMseUJBQWxCLENBQTRDLENBQzFDLEtBQUssQ0FBQyxHQURvQyxFQUUxQyxLQUFLLENBQUMsS0FGb0MsRUFHMUMsS0FBSyxDQUFDLElBSG9DLENBQTVDLEVBRCtDO01BQUEsQ0FBakQsQ0FBQSxDQUFBO2FBT0EsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUEsR0FBQTtBQUM1RCxRQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVksQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsQ0FBWixDQUFBO2VBRUEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLFNBQWQsQ0FBd0IsQ0FBeEIsRUFBMEIsQ0FBMUIsRUFBNEIsQ0FBNUIsRUFBOEIsR0FBOUIsRUFINEQ7TUFBQSxDQUE5RCxFQVJnQjtJQUFBLENBQWxCLENBOUNBLENBQUE7QUFBQSxJQTJEQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsTUFBQSxFQUFBLENBQUcsc0RBQUgsRUFBMkQsU0FBQSxHQUFBO2VBQ3pELE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBYixDQUFrQixDQUFDLHlCQUFuQixDQUE2QyxDQUMzQyxLQUFLLENBQUMsR0FEcUMsRUFFM0MsS0FBSyxDQUFDLEtBRnFDLEVBRzNDLEtBQUssQ0FBQyxJQUhxQyxFQUkzQyxLQUFLLENBQUMsS0FKcUMsQ0FBN0MsRUFEeUQ7TUFBQSxDQUEzRCxDQUFBLENBQUE7YUFRQSxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQSxHQUFBO0FBQzVELFFBQUEsS0FBSyxDQUFDLElBQU4sR0FBYSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxFQUFPLEdBQVAsQ0FBYixDQUFBO2VBRUEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLFNBQWQsQ0FBd0IsQ0FBeEIsRUFBMEIsQ0FBMUIsRUFBNEIsQ0FBNUIsRUFBOEIsR0FBOUIsRUFINEQ7TUFBQSxDQUE5RCxFQVRpQjtJQUFBLENBQW5CLENBM0RBLENBQUE7QUFBQSxJQXlFQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsTUFBQSxFQUFBLENBQUcsc0RBQUgsRUFBMkQsU0FBQSxHQUFBO2VBQ3pELE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBYixDQUFrQixDQUFDLHlCQUFuQixDQUE2QyxDQUMzQyxLQUFLLENBQUMsS0FEcUMsRUFFM0MsS0FBSyxDQUFDLEdBRnFDLEVBRzNDLEtBQUssQ0FBQyxLQUhxQyxFQUkzQyxLQUFLLENBQUMsSUFKcUMsQ0FBN0MsRUFEeUQ7TUFBQSxDQUEzRCxDQUFBLENBQUE7YUFRQSxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQSxHQUFBO0FBQzVELFFBQUEsS0FBSyxDQUFDLElBQU4sR0FBYSxDQUFDLEdBQUQsRUFBSyxDQUFMLEVBQU8sQ0FBUCxFQUFTLENBQVQsQ0FBYixDQUFBO2VBRUEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLFNBQWQsQ0FBd0IsQ0FBeEIsRUFBMEIsQ0FBMUIsRUFBNEIsQ0FBNUIsRUFBOEIsR0FBOUIsRUFINEQ7TUFBQSxDQUE5RCxFQVRpQjtJQUFBLENBQW5CLENBekVBLENBQUE7QUFBQSxJQXVGQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxFQUFBLENBQUcsZ0VBQUgsRUFBcUUsU0FBQSxHQUFBO2VBQ25FLE1BQUEsQ0FBTyxLQUFLLENBQUMsR0FBYixDQUFpQixDQUFDLHlCQUFsQixDQUE0QyxDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsR0FBVCxDQUE1QyxFQURtRTtNQUFBLENBQXJFLENBQUEsQ0FBQTthQUdBLEVBQUEsQ0FBRyx5REFBSCxFQUE4RCxTQUFBLEdBQUE7QUFDNUQsUUFBQSxLQUFLLENBQUMsR0FBTixHQUFZLENBQUMsR0FBRCxFQUFLLEVBQUwsRUFBUSxFQUFSLENBQVosQ0FBQTtlQUVBLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxTQUFkLENBQXdCLEVBQXhCLEVBQTRCLEdBQTVCLEVBQWlDLEdBQWpDLEVBQXNDLEdBQXRDLEVBSDREO01BQUEsQ0FBOUQsRUFKZ0I7SUFBQSxDQUFsQixDQXZGQSxDQUFBO0FBQUEsSUFnR0EsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsRUFBQSxDQUFHLHVFQUFILEVBQTRFLFNBQUEsR0FBQTtlQUMxRSxNQUFBLENBQU8sS0FBSyxDQUFDLElBQWIsQ0FBa0IsQ0FBQyx5QkFBbkIsQ0FBNkMsQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLEdBQVQsRUFBYyxHQUFkLENBQTdDLEVBRDBFO01BQUEsQ0FBNUUsQ0FBQSxDQUFBO2FBR0EsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUEsR0FBQTtBQUM1RCxRQUFBLEtBQUssQ0FBQyxJQUFOLEdBQWEsQ0FBQyxHQUFELEVBQUssRUFBTCxFQUFRLEVBQVIsRUFBVyxHQUFYLENBQWIsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxTQUFkLENBQXdCLEVBQXhCLEVBQTRCLEdBQTVCLEVBQWlDLEdBQWpDLEVBQXNDLEdBQXRDLEVBSDREO01BQUEsQ0FBOUQsRUFKaUI7SUFBQSxDQUFuQixDQWhHQSxDQUFBO0FBQUEsSUF5R0EsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLE1BQUEsRUFBQSxDQUFHLHFFQUFILEVBQTBFLFNBQUEsR0FBQTtlQUN4RSxNQUFBLENBQU8sS0FBSyxDQUFDLEdBQWIsQ0FBaUIsQ0FBQyx5QkFBbEIsQ0FBNEMsQ0FBQyxFQUFELEVBQUssR0FBTCxFQUFVLEVBQVYsQ0FBNUMsRUFEd0U7TUFBQSxDQUExRSxDQUFBLENBQUE7YUFHQSxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQSxHQUFBO0FBQzVELFFBQUEsS0FBSyxDQUFDLEdBQU4sR0FBWSxDQUFDLEdBQUQsRUFBSyxFQUFMLEVBQVEsRUFBUixDQUFaLENBQUE7ZUFFQSxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsU0FBZCxDQUF3QixFQUF4QixFQUE0QixHQUE1QixFQUFpQyxHQUFqQyxFQUFzQyxHQUF0QyxFQUg0RDtNQUFBLENBQTlELEVBSmdCO0lBQUEsQ0FBbEIsQ0F6R0EsQ0FBQTtBQUFBLElBa0hBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUEsR0FBQTtBQUNqQixNQUFBLEVBQUEsQ0FBRyw0RUFBSCxFQUFpRixTQUFBLEdBQUE7ZUFDL0UsTUFBQSxDQUFPLEtBQUssQ0FBQyxJQUFiLENBQWtCLENBQUMseUJBQW5CLENBQTZDLENBQUMsRUFBRCxFQUFLLEdBQUwsRUFBVSxFQUFWLEVBQWMsR0FBZCxDQUE3QyxFQUQrRTtNQUFBLENBQWpGLENBQUEsQ0FBQTthQUdBLEVBQUEsQ0FBRyx5REFBSCxFQUE4RCxTQUFBLEdBQUE7QUFDNUQsUUFBQSxLQUFLLENBQUMsSUFBTixHQUFhLENBQUMsR0FBRCxFQUFLLEVBQUwsRUFBUSxFQUFSLEVBQVksR0FBWixDQUFiLENBQUE7ZUFFQSxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsU0FBZCxDQUF3QixFQUF4QixFQUE0QixHQUE1QixFQUFpQyxHQUFqQyxFQUFzQyxHQUF0QyxFQUg0RDtNQUFBLENBQTlELEVBSmlCO0lBQUEsQ0FBbkIsQ0FsSEEsQ0FBQTtBQUFBLElBMkhBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLFNBQUEsR0FBQTtBQUNoQixNQUFBLEVBQUEsQ0FBRyxtRUFBSCxFQUF3RSxTQUFBLEdBQUE7ZUFDdEUsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFiLENBQWlCLENBQUMseUJBQWxCLENBQTRDLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxDQUFULENBQTVDLEVBRHNFO01BQUEsQ0FBeEUsQ0FBQSxDQUFBO2FBR0EsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUEsR0FBQTtBQUM1RCxRQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVksQ0FBQyxHQUFELEVBQUssRUFBTCxFQUFRLEVBQVIsQ0FBWixDQUFBO2VBRUEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLFNBQWQsQ0FBd0IsR0FBeEIsRUFBNkIsR0FBN0IsRUFBa0MsR0FBbEMsRUFBdUMsR0FBdkMsRUFINEQ7TUFBQSxDQUE5RCxFQUpnQjtJQUFBLENBQWxCLENBM0hBLENBQUE7QUFBQSxJQW9JQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsTUFBQSxFQUFBLENBQUcsMEVBQUgsRUFBK0UsU0FBQSxHQUFBO2VBQzdFLE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBYixDQUFrQixDQUFDLHlCQUFuQixDQUE2QyxDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsQ0FBVCxFQUFZLEdBQVosQ0FBN0MsRUFENkU7TUFBQSxDQUEvRSxDQUFBLENBQUE7YUFHQSxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQSxHQUFBO0FBQzVELFFBQUEsS0FBSyxDQUFDLElBQU4sR0FBYSxDQUFDLEdBQUQsRUFBSyxFQUFMLEVBQVEsRUFBUixFQUFXLEdBQVgsQ0FBYixDQUFBO2VBRUEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLFNBQWQsQ0FBd0IsR0FBeEIsRUFBNkIsR0FBN0IsRUFBa0MsR0FBbEMsRUFBdUMsR0FBdkMsRUFINEQ7TUFBQSxDQUE5RCxFQUppQjtJQUFBLENBQW5CLENBcElBLENBQUE7QUFBQSxJQTZJQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO2VBQzlDLE1BQUEsQ0FBTyxLQUFLLENBQUMsR0FBYixDQUFpQixDQUFDLE9BQWxCLENBQTBCLFFBQTFCLEVBRDhDO01BQUEsQ0FBaEQsQ0FBQSxDQUFBO2FBR0EsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUEsR0FBQTtBQUNoRSxRQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVksUUFBWixDQUFBO2VBRUEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLFNBQWQsQ0FBd0IsQ0FBeEIsRUFBMEIsR0FBMUIsRUFBOEIsQ0FBOUIsRUFBZ0MsR0FBaEMsRUFIZ0U7TUFBQSxDQUFsRSxFQUpnQjtJQUFBLENBQWxCLENBN0lBLENBQUE7QUFBQSxJQXNKQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsTUFBQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQSxHQUFBO2VBQ3hELE1BQUEsQ0FBTyxLQUFLLENBQUMsT0FBYixDQUFxQixDQUFDLE9BQXRCLENBQThCLFVBQTlCLEVBRHdEO01BQUEsQ0FBMUQsQ0FBQSxDQUFBO2FBR0EsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUEsR0FBQTtBQUNoRSxRQUFBLEtBQUssQ0FBQyxPQUFOLEdBQWdCLFVBQWhCLENBQUE7ZUFFQSxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsU0FBZCxDQUF3QixDQUF4QixFQUEwQixHQUExQixFQUE4QixDQUE5QixFQUFnQyxDQUFoQyxFQUhnRTtNQUFBLENBQWxFLEVBSm9CO0lBQUEsQ0FBdEIsQ0F0SkEsQ0FBQTtBQUFBLElBK0pBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLFNBQUEsR0FBQTtBQUNoQixNQUFBLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBLEdBQUE7ZUFDOUIsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFiLENBQWlCLENBQUMsT0FBbEIsQ0FBMEIsS0FBSyxDQUFDLEdBQUksQ0FBQSxDQUFBLENBQXBDLEVBRDhCO01BQUEsQ0FBaEMsQ0FBQSxDQUFBO2FBR0EsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVksRUFBWixDQUFBO2VBRUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFiLENBQWlCLENBQUMseUJBQWxCLENBQTRDLENBQUMsRUFBRCxFQUFLLEdBQUwsRUFBVSxFQUFWLENBQTVDLEVBSDJCO01BQUEsQ0FBN0IsRUFKZ0I7SUFBQSxDQUFsQixDQS9KQSxDQUFBO0FBQUEsSUF3S0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUEsR0FBQTtlQUNyQyxNQUFBLENBQU8sS0FBSyxDQUFDLFVBQWIsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyxLQUFLLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBM0MsRUFEcUM7TUFBQSxDQUF2QyxDQUFBLENBQUE7YUFHQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLFFBQUEsS0FBSyxDQUFDLFVBQU4sR0FBbUIsRUFBbkIsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxLQUFLLENBQUMsR0FBYixDQUFpQixDQUFDLHlCQUFsQixDQUE0QyxDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxDQUE1QyxFQUhrQztNQUFBLENBQXBDLEVBSnVCO0lBQUEsQ0FBekIsQ0F4S0EsQ0FBQTtBQUFBLElBaUxBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixNQUFBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBLEdBQUE7ZUFDcEMsTUFBQSxDQUFPLEtBQUssQ0FBQyxTQUFiLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0MsS0FBSyxDQUFDLEdBQUksQ0FBQSxDQUFBLENBQTFDLEVBRG9DO01BQUEsQ0FBdEMsQ0FBQSxDQUFBO2FBR0EsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxRQUFBLEtBQUssQ0FBQyxTQUFOLEdBQWtCLEVBQWxCLENBQUE7ZUFFQSxNQUFBLENBQU8sS0FBSyxDQUFDLEdBQWIsQ0FBaUIsQ0FBQyx5QkFBbEIsQ0FBNEMsQ0FBQyxFQUFELEVBQUssR0FBTCxFQUFVLEVBQVYsQ0FBNUMsRUFIaUM7TUFBQSxDQUFuQyxFQUpzQjtJQUFBLENBQXhCLENBakxBLENBQUE7QUFBQSxJQTBMQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7YUFDbEIsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxRQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTixDQUFBLENBQVAsQ0FBcUIsQ0FBQyxTQUF0QixDQUFnQyxLQUFoQyxDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFQLENBQXFCLENBQUMsR0FBRyxDQUFDLElBQTFCLENBQStCLEtBQS9CLEVBRndDO01BQUEsQ0FBMUMsRUFEa0I7SUFBQSxDQUFwQixDQTFMQSxDQUFBO0FBQUEsSUErTEEsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLE1BQUEsUUFBQSxDQUFTLHVDQUFULEVBQWtELFNBQUEsR0FBQTtlQUNoRCxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO2lCQUN4QyxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFQLENBQXFCLENBQUMsT0FBdEIsQ0FBOEIsc0JBQTlCLEVBRHdDO1FBQUEsQ0FBMUMsRUFEZ0Q7TUFBQSxDQUFsRCxDQUFBLENBQUE7QUFBQSxNQUlBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBLEdBQUE7ZUFDNUMsRUFBQSxDQUFHLG9DQUFILEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxVQUFBLEtBQUssQ0FBQyxLQUFOLEdBQWMsQ0FBZCxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTixDQUFBLENBQVAsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixpQkFBOUIsRUFGdUM7UUFBQSxDQUF6QyxFQUQ0QztNQUFBLENBQTlDLENBSkEsQ0FBQTthQVNBLFFBQUEsQ0FBUyxnQ0FBVCxFQUEyQyxTQUFBLEdBQUE7ZUFDekMsRUFBQSxDQUFHLDZCQUFILEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxVQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxRQUFOLENBQVosQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFQLENBQXFCLENBQUMsT0FBdEIsQ0FBOEIsZ0JBQTlCLEVBRmdDO1FBQUEsQ0FBbEMsRUFEeUM7TUFBQSxDQUEzQyxFQVZrQjtJQUFBLENBQXBCLENBL0xBLENBQUE7QUFBQSxJQThNQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7YUFDeEIsRUFBQSxDQUFHLGtFQUFILEVBQXVFLFNBQUEsR0FBQTtBQUNyRSxZQUFBLHNCQUFBO0FBQUEsUUFBQSxNQUFBLEdBQWEsSUFBQSxLQUFBLENBQU0sU0FBTixDQUFiLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBYSxJQUFBLEtBQUEsQ0FBTSxTQUFOLENBRGIsQ0FBQTtBQUFBLFFBRUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE1BQW5CLEVBQTJCLEdBQTNCLENBRlQsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxTQUFmLENBQXlCLFNBQXpCLEVBTHFFO01BQUEsQ0FBdkUsRUFEd0I7SUFBQSxDQUExQixDQTlNQSxDQUFBO0FBQUEsSUFzTkEsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQSxHQUFBO2FBQ2xCLEVBQUEsQ0FBRyxrRUFBSCxFQUF1RSxTQUFBLEdBQUE7QUFDckUsWUFBQSxzQkFBQTtBQUFBLFFBQUEsTUFBQSxHQUFhLElBQUEsS0FBQSxDQUFNLFNBQU4sQ0FBYixDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQWEsSUFBQSxLQUFBLENBQU0sU0FBTixDQURiLENBQUE7QUFBQSxRQUVBLE1BQUEsR0FBUyxNQUFNLENBQUMsS0FBUCxDQUFhLE1BQWIsRUFBcUIsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO2lCQUFTLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBQSxHQUFJLEVBQXJCO1FBQUEsQ0FBckIsQ0FGVCxDQUFBO2VBSUEsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLFNBQWYsQ0FBeUIsU0FBekIsRUFMcUU7TUFBQSxDQUF2RSxFQURrQjtJQUFBLENBQXBCLENBdE5BLENBQUE7QUFBQSxJQThOQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO2FBQzNCLEVBQUEsQ0FBRyx3REFBSCxFQUE2RCxTQUFBLEdBQUE7QUFDM0QsUUFBQSxNQUFBLENBQU8sS0FBSyxDQUFDLGNBQU4sQ0FBcUIsQ0FBckIsQ0FBUCxDQUErQixDQUFDLFNBQWhDLENBQTBDLEdBQTFDLEVBQThDLEdBQTlDLEVBQWtELEVBQWxELEVBQXFELENBQXJELENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxjQUFOLENBQXFCLEdBQXJCLENBQVAsQ0FBaUMsQ0FBQyxTQUFsQyxDQUE0QyxHQUE1QyxFQUFnRCxHQUFoRCxFQUFvRCxFQUFwRCxFQUF1RCxHQUF2RCxDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sS0FBSyxDQUFDLGNBQU4sQ0FBcUIsR0FBckIsQ0FBUCxDQUFpQyxDQUFDLFNBQWxDLENBQTRDLEdBQTVDLEVBQWdELEdBQWhELEVBQW9ELEVBQXBELEVBQXVELEdBQXZELEVBSDJEO01BQUEsQ0FBN0QsRUFEMkI7SUFBQSxDQUE3QixDQTlOQSxDQUFBO1dBb09BLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUEsR0FBQTthQUNqQixFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO2VBQ3hDLE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBYixDQUFrQixDQUFDLFdBQW5CLENBQStCLElBQS9CLEVBQXFDLENBQXJDLEVBRHdDO01BQUEsQ0FBMUMsRUFEaUI7SUFBQSxDQUFuQixFQXJPZ0I7RUFBQSxDQUFsQixDQUpBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/james/.atom/packages/pigments/spec/color-spec.coffee
