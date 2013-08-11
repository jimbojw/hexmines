/**
 * game.js - main JavaScript file for hexmines.
 */
(function(window, hex, $, undefined){

var
  
  // hex game
  hexmines = window.hexmines = hex.create(hex.evented),
  
  // hex grid for background effect
  $outer = $('.mines-outer'),
  $inner = $outer.find('.mines-inner'),
  grid = hex.grid($outer[0]),
  
  // cursor to indicate mouse/touch location
  $cursor = $('<div class="tile cursor" style="display:none"></div>');

hex.debug = true;

// setup cursor
grid.root.appendChild($cursor[0]);

// move the cursor
grid.addEvent("tileover", function(e, x, y) {
  hex.log([x, y], e.type);
  var inv = grid.screenpos(x, y);
  $cursor.css('left', inv.x);
  $cursor.css('top', inv.y);
});

// trigger on click
grid.addEvent("tiletap", function(e, x, y) {
  hex.log([x, y], e.type);
  //touch(x, y, 1);
});

// show cursor only when mouse is over the grid
grid.addEvent("gridover", function(e, x, y) {
  hex.log([x, y], e.type);
  $cursor.show();
});
grid.addEvent("gridout", function(e, x, y) {
  hex.log([x, y], e.type);
  $cursor.hide();
});

var
  
  /**
   * visit the immediate neighbors of the selected tile.
   */
  visitNeighbors = function(x, y, callback) {
    hex.log(x, y, callback);
    var i, j;
    for (i=-1; i<2; i++) {
      for (j=-1; j<2; j++) {
        if (i!==j) {
          callback(x + i, y + j);
        }
      }
    }
  },
  
  /**
   * visit all the neighbors within the distance limit of the selected tile.
   */
  visitArea = function(x, y, limit, callback) {
    var
      queue = [[0,0,0]],
      visited = {};
    while (queue.length) {
      (function(x, y, depth){
        var key = hex.key(x, y);
        if (!(key in visited)) {
          visited[key] = 1;
          callback(x, y);
          if (depth < limit) {
            visitNeighbors(x, y, function(x, y){
              queue.push([x, y, depth + 1]);
            });
          }
        }
      }).apply(null, queue.shift());
    }
  };

// experimenting - add a mine field
(function(){
  
  // reorient so the root is centered in the grid element
  var size = hex.size(grid.elem);
  grid.reorient(size.x * 0.5, size.y * 0.5);
  
  visitArea(0, 0, 5, function(x, y) {
    var
      $tile = $('<div class="tile"></div>'),
      inv = grid.screenpos(x, y);
    $tile.css({
      left: inv.x,
      top: inv.y
    });
    $tile.appendTo(grid.root);
  });
  
})();

})(window, hex, jQuery);
