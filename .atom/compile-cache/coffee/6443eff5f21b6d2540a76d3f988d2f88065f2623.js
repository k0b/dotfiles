(function() {
  var a, colors, ex, k, toCamelCase, tocamelCase, v;

  colors = {
    alice_blue: '#f0f8ff',
    antique_white: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanched_almond: '#ffebcd',
    blue: '#0000ff',
    blue_violet: '#8a2be2',
    brown: '#a52a2a',
    burly_wood: '#deb887',
    cadet_blue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    corn_silk: '#fff8dc',
    cornflower_blue: '#6495ed',
    crimson: '#dc143c',
    cyan: '#00ffff',
    dark_blue: '#00008b',
    dark_cyan: '#008b8b',
    dark_golden_rod: '#b8860b',
    dark_gray: '#a9a9a9',
    dark_green: '#006400',
    dark_grey: '#a9a9a9',
    dark_khaki: '#bdb76b',
    dark_magenta: '#8b008b',
    dark_olive_green: '#556b2f',
    dark_orange: '#ff8c00',
    dark_orchid: '#9932cc',
    dark_red: '#8b0000',
    dark_salmon: '#e9967a',
    dark_seagreen: '#8fbc8f',
    dark_slateblue: '#483d8b',
    dark_slategray: '#2f4f4f',
    dark_slategrey: '#2f4f4f',
    dark_turquoise: '#00ced1',
    dark_violet: '#9400d3',
    deep_pink: '#ff1493',
    deep_skyblue: '#00bfff',
    dim_gray: '#696969',
    dim_grey: '#696969',
    dodger_blue: '#1e90ff',
    fire_brick: '#b22222',
    floral_white: '#fffaf0',
    forest_green: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghost_white: '#f8f8ff',
    gold: '#ffd700',
    golden_rod: '#daa520',
    gray: '#808080',
    green: '#008000',
    green_yellow: '#adff2f',
    grey: '#808080',
    honey_dew: '#f0fff0',
    hot_pink: '#ff69b4',
    indian_red: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavender_blush: '#fff0f5',
    lawn_green: '#7cfc00',
    lemon_chiffon: '#fffacd',
    light_blue: '#add8e6',
    light_coral: '#f08080',
    light_cyan: '#e0ffff',
    light_golden_rod_yellow: '#fafad2',
    light_gray: '#d3d3d3',
    light_green: '#90ee90',
    light_grey: '#d3d3d3',
    light_pink: '#ffb6c1',
    light_salmon: '#ffa07a',
    light_sea_green: '#20b2aa',
    light_sky_blue: '#87cefa',
    light_slate_gray: '#778899',
    light_slate_grey: '#778899',
    light_steel_blue: '#b0c4de',
    light_yellow: '#ffffe0',
    lime: '#00ff00',
    lime_green: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    medium_aquamarine: '#66cdaa',
    medium_blue: '#0000cd',
    medium_orchid: '#ba55d3',
    medium_purple: '#9370db',
    medium_sea_green: '#3cb371',
    medium_slate_blue: '#7b68ee',
    medium_spring_green: '#00fa9a',
    medium_turquoise: '#48d1cc',
    medium_violet_red: '#c71585',
    midnight_blue: '#191970',
    mint_cream: '#f5fffa',
    misty_rose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajo_white: '#ffdead',
    navy: '#000080',
    old_lace: '#fdf5e6',
    olive: '#808000',
    olive_drab: '#6b8e23',
    orange: '#ffa500',
    orange_red: '#ff4500',
    orchid: '#da70d6',
    pale_golden_rod: '#eee8aa',
    pale_green: '#98fb98',
    pale_turquoise: '#afeeee',
    pale_violet_red: '#db7093',
    papaya_whip: '#ffefd5',
    peach_puff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powder_blue: '#b0e0e6',
    purple: '#800080',
    rebecca_purple: '#663399',
    red: '#ff0000',
    rosy_brown: '#bc8f8f',
    royal_blue: '#4169e1',
    saddle_brown: '#8b4513',
    salmon: '#fa8072',
    sandy_brown: '#f4a460',
    sea_green: '#2e8b57',
    sea_shell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    sky_blue: '#87ceeb',
    slate_blue: '#6a5acd',
    slate_gray: '#708090',
    slate_grey: '#708090',
    snow: '#fffafa',
    spring_green: '#00ff7f',
    steel_blue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    white_smoke: '#f5f5f5',
    yellow: '#ffff00',
    yellow_green: '#9acd32'
  };

  module.exports = ex = {
    lower_snake: colors,
    UPPER_SNAKE: {},
    lowercase: {},
    UPPERCASE: {},
    camelCase: {},
    CamelCase: {},
    allCases: {}
  };

  toCamelCase = function(s) {
    return s[0].toUpperCase() + s.slice(1);
  };

  tocamelCase = function(s, i) {
    if (i === 0) {
      return s;
    } else {
      return s[0].toUpperCase() + s.slice(1);
    }
  };

  for (k in colors) {
    v = colors[k];
    a = k.split('_');
    ex.allCases[k] = ex.allCases[a.map(toCamelCase).join('')] = ex.allCases[a.map(tocamelCase).join('')] = ex.allCases[a.join('_').toUpperCase()] = ex.allCases[a.join('')] = ex.allCases[a.join('').toUpperCase()] = ex.CamelCase[a.map(toCamelCase).join('')] = ex.camelCase[a.map(tocamelCase).join('')] = ex.UPPER_SNAKE[a.join('_').toUpperCase()] = ex.lowercase[a.join('')] = ex.UPPERCASE[a.join('').toUpperCase()] = v;
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9zdmctY29sb3JzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2Q0FBQTs7QUFBQSxFQUFBLE1BQUEsR0FDRTtBQUFBLElBQUEsVUFBQSxFQUFZLFNBQVo7QUFBQSxJQUNBLGFBQUEsRUFBZSxTQURmO0FBQUEsSUFFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLElBR0EsVUFBQSxFQUFZLFNBSFo7QUFBQSxJQUlBLEtBQUEsRUFBTyxTQUpQO0FBQUEsSUFLQSxLQUFBLEVBQU8sU0FMUDtBQUFBLElBTUEsTUFBQSxFQUFRLFNBTlI7QUFBQSxJQU9BLEtBQUEsRUFBTyxTQVBQO0FBQUEsSUFRQSxlQUFBLEVBQWlCLFNBUmpCO0FBQUEsSUFTQSxJQUFBLEVBQU0sU0FUTjtBQUFBLElBVUEsV0FBQSxFQUFhLFNBVmI7QUFBQSxJQVdBLEtBQUEsRUFBTyxTQVhQO0FBQUEsSUFZQSxVQUFBLEVBQVksU0FaWjtBQUFBLElBYUEsVUFBQSxFQUFZLFNBYlo7QUFBQSxJQWNBLFVBQUEsRUFBWSxTQWRaO0FBQUEsSUFlQSxTQUFBLEVBQVcsU0FmWDtBQUFBLElBZ0JBLEtBQUEsRUFBTyxTQWhCUDtBQUFBLElBaUJBLFNBQUEsRUFBVyxTQWpCWDtBQUFBLElBa0JBLGVBQUEsRUFBaUIsU0FsQmpCO0FBQUEsSUFtQkEsT0FBQSxFQUFTLFNBbkJUO0FBQUEsSUFvQkEsSUFBQSxFQUFNLFNBcEJOO0FBQUEsSUFxQkEsU0FBQSxFQUFXLFNBckJYO0FBQUEsSUFzQkEsU0FBQSxFQUFXLFNBdEJYO0FBQUEsSUF1QkEsZUFBQSxFQUFpQixTQXZCakI7QUFBQSxJQXdCQSxTQUFBLEVBQVcsU0F4Qlg7QUFBQSxJQXlCQSxVQUFBLEVBQVksU0F6Qlo7QUFBQSxJQTBCQSxTQUFB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

//# sourceURL=/Users/james/.atom/packages/pigments/lib/svg-colors.coffee
