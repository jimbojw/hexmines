/**
 * game.js - hexmines game.
 */
(function(window, hex, $, undefined){

var
  
  // hex game
  hexmines = window.hexmines = {},
  
  /**
   * visit the immediate neighbors of the selected tile.
   *
   * @param {int} x The x-coordinate in skew grig coordinates.
   * @param {int} y The y-coordinate in skew grid coordinates.
   * @param {function} callback The callback to execute at each neighbor.
   */
  visitNeighbors = hexmines.visitNeighbors = function(x, y, callback) {
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
   * create an area map consisting of concentric rings.
   *
   * @param {int} size Distance to the furthest ring from the origin.
   * @return {object} A hash of key/value paris where:
   *  - values are tuples of coordinates (ex: [0, 1])
   *  - keys are stringified versions of same (ex: "0,1")
   */
  createArea = hexmines.createArea = function(size) {
    var
      queue = [[0,0,0]],
      area = {};
    while (queue.length) {
      (function(x, y, distance){
        var key = hex.key(x, y);
        if (!(key in area)) {
          area[key] = [x, y];
          if (distance < size) {
            visitNeighbors(x, y, function(x, y){
              queue.push([x, y, distance + 1]);
            });
          }
        }
      }).apply(null, queue.shift());
    }
    return area;
  },
  
  /**
   * visit all the coordinate tuples in an area.
   */
  visitArea = hexmines.visitArea = function(area, callback) {
    var key;
    for (key in area) {
      callback.apply(null, area[key]);
    }
  },
  
  /**
   * create a new hexmines game.
   *
   * @param {object} config Configuration choices for the game.
   */
  createGame = hexmines.createGame = function(config) {
    
    if (!config.grid) {
      throw Error("A grid must be provided for the game.");
    }
    
    var
      
      game = {
        
        // number of steps taken
        steps: 0,
        
        /**
         * add a mine to the minefield
         */
        addMine: function() {
          var
            done = false,
            areaKeys = game.areaKeys,
            index,
            key;
          while (!done) {
            index = (Math.random() * areaKeys.length) << 0;
            key = areaKeys[index];
            if (!(key in mines)) {
              mines[key] = 1;
              done = true;
            }
          }
        },
        
        /**
         * step on a given tile
         */
        step: function(x, y) {
          
          game.steps += 1;
          
          var
            key = hex.key(x, y),
            queue = [[x, y]],
            visited = {};
          
          if (key in mines) {
            if (game.steps === 1) {
              // first step was on a mine, find a new home for it and continue
              game.addMine();
              delete mines[key];
            } else {
              // sorry, a loser is you :(
              visitArea(area, game.reveal);
              tiles[key].attr('class', 'tile hit');
              return;
            }
          }
          
          // spread out as long as we're encountering empty tiles
          while (queue.length) {
            (function(x, y){
              var key = hex.key(x, y);
              if (!(key in visited)) {
                visited[key] = 1;
                game.reveal(x, y);
                if (tiles[key].hasClass('n0')) {
                  visitNeighbors(x, y, function(x, y){
                    if (region.inside(x, y)) {
                      queue.push([x, y]);
                    }
                  });
                }
              }
            }).apply(null, queue.shift());
          }
          
          // check to see if this is the end game
          var $unexplored = $(grid.root).find('.unexplored');
          console.log($unexplored.length);
          if ($unexplored.length === Object.keys(mines).length) {
            $unexplored.attr('class', 'tile safe');
          }
          
        },
        
        /**
         * show what's under the specified tile coordinates
         */
        reveal: function(x, y) {
          
          var
            key = hex.key(x, y),
            count;
            
          if (!region.inside(x, y)) {
            return;
          }
          
          if (key in mines) {
            return tiles[key].attr('class', 'tile mine');
          }
          
          count = 0;
          visitNeighbors(x, y, function(x, y) {
            count += +(hex.key(x, y) in mines);
          });
          tiles[key].attr('class', 'tile n' + count);
          
        }
        
      },
      
      grid = game.grid = config.grid,
      size = +config.size || 5,
      
      // cursor to indicate mouse/touch location
      $cursor = game.$cursor =
        $('<div class="tile cursor" style="display:none"></div>'),
      
      // game area
      area = game.area = hexmines.createArea(5),
      areaKeys = game.areaKeys = Object.keys(area),
      
      // collection of jQuery result objects, one for each tile
      tiles = game.tiles = {},
      
      // collection of mines
      mines = {},
      
      // region to match area
      region = game.region = hex.region(grid, {
        inside: function(x, y) {
          return (hex.key(x, y) in area);
        }
      });
    
    // move the cursor
    grid.addEvent("tileover", function(e, x, y) {
      var inv = grid.screenpos(x, y);
      $cursor.css('left', inv.x);
      $cursor.css('top', inv.y);
    });
    
    // only show cursor when it's over the play area
    region.addEvent("regionover", function(e, x, y) {
      $cursor.show();
    });
    region.addEvent("regionout", function(e, x, y) {
      $cursor.hide();
    });

    // trigger on tap
    grid.addEvent("tiletap", function(e, x, y) {
      game.step(x, y);
    });

    visitArea(area, function(x, y) {
      var
        $tile = $('<div class="tile unexplored"></div>'),
        inv = grid.screenpos(x, y);
      $tile.css({
        left: inv.x,
        top: inv.y
      });
      $tile.appendTo(grid.root);
      tiles[hex.key(x, y)] = $tile;
    });
    
    $cursor.appendTo(grid.root);
    
    // experimenting, creating mines and setting tiles accordingly
    (function(){
      
      for (var i = 0; i < 10; i++) {
        game.addMine();
      }
      
    })();
    
    return game;
    
  };

})(window, hex, jQuery);
