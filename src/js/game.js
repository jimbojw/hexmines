/**
 * game.js - hexmines game.
 */
(function(window, hex, $, undefined){

var
  
  // hex game
  hexmines = window.hexmines = {
    
    // size string to value mappings
    sizeValues: {
      small: 4,
      medium: 6,
      large: 8,
      enormous: 12
    },
    
    // difficulty string to density mappings
    difficultyValues: {
      easy: 0.05,
      medium: 0.15,
      hard: 0.20,
      terrifying: 0.30
    }
    
  },
  
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
        
        // initialize game
        init: function() {
          
          var
            
            tileCount = 0,
            mineCount = 0,
            
            size = hexmines.sizeValues[game.size],
            difficulty = hexmines.difficultyValues[game.difficulty];
          
          game.steps = 0;
          
          game.area = hexmines.createArea(size),
          game.areaKeys = Object.keys(game.area),
          
          mines = game.mines = {};
          
          visitArea(game.area, function(x, y) {
            var
              $tile = $('<div class="tile unexplored"></div>'),
              inv = grid.screenpos(x, y);
            $tile.css({
              left: inv.x,
              top: inv.y
            });
            $tile.appendTo(grid.root);
            tiles[hex.key(x, y)] = $tile;
            tileCount += 1;
          });
          
          game.$cursor.appendTo(grid.root);
          
          // add mines until desired difficulty has been achieved
          while (mineCount / tileCount < difficulty) {
            console.log(mineCount / tileCount, difficulty);
            game.addMine();
            mineCount += 1;
          }
          
          game.center();
          
        },
        
        // reset the game
        reset: function() {
          
          var key;
          
          // clear out existing mines
          mines = game.mines = {};
          
          // remove tiles
          for (key in tiles) {
            tiles[key].remove();
          }
          tile = game.tiles = {};
          
          // reinitialize
          game.init();
          
        },
        
        // reorient to center
        center: function() {
          var $elem = $(game.grid.elem);
          game.grid.reorient($elem.width() * 0.5, $elem.height() * 0.5);
        },
        
        // number of steps taken
        steps: 0,
        
        // mines
        mines: null,
        
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
            if (!(key in game.mines)) {
              game.mines[key] = 1;
              done = true;
            }
          }
        },
        
        /**
         * step on a given tile
         */
        step: function(x, y) {
          
          if (!game.region.inside(x, y)) {
            return;
          }
          
          game.steps += 1;
          
          var
            key = hex.key(x, y),
            queue = [[x, y]],
            visited = {};
          
          if (key in game.mines) {
            if (game.steps === 1) {
              // first step was on a mine, find a new home for it and continue
              game.addMine();
              delete game.mines[key];
            } else {
              // sorry, a loser is you :(
              visitArea(game.area, game.reveal);
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
          
          game.checkWin();
          
          
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
          
          if (key in game.mines) {
            return tiles[key].attr('class', 'tile mine');
          }
          
          count = 0;
          visitNeighbors(x, y, function(x, y) {
            count += +(hex.key(x, y) in game.mines);
          });
          tiles[key].attr('class', 'tile n' + count);
          
        },
        
        checkWin: function() {
          // check to see if this is the end game
          var $unexplored = $(game.grid.root).find('.unexplored');
          if ($unexplored.length === Object.keys(game.mines).length) {
            $unexplored.attr('class', 'tile safe');
          }
        }
        
      },
      
      grid = game.grid = config.grid,
      
      // cursor to indicate mouse/touch location
      $cursor = game.$cursor =
        $('<div class="tile cursor" style="display:none"></div>'),
      
      // collection of jQuery result objects, one for each tile
      tiles = game.tiles = {},
      
      // region to match area
      region = game.region = hex.region(grid, {
        inside: function(x, y) {
          return (hex.key(x, y) in game.area);
        }
      });
    
    game.size = config.size || 'small',
    game.difficulty = config.difficulty || 'easy',
    
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
    
    game.init();
    
    return game;
    
  };

})(window, hex, jQuery);
