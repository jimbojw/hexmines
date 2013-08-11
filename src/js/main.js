/**
 * main.js - main JavaScript file for hexmines.
 */
(function(window, hexmines, hex, $, undefined){

hex.debug = true;

var
  
  // hex grid for background effect
  $outer = $('.mines-outer'),
  $inner = $outer.find('.mines-inner'),
  grid = hex.grid($outer[0]),
  
  // create game
  game = hexmines.createGame({
    grid: grid,
    size: 5
  });

// reorient so the root is centered in the grid element
grid.reorient($inner.width() * 0.5, $inner.height() * 0.5);

})(window, hexmines, hex, jQuery);
