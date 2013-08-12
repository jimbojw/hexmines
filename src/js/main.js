/**
 * main.js - main JavaScript file for hexmines.
 */
(function(window, hexmines, hex, $, undefined){

hex.debug = true;

var
  
  /**
   * convenience methods for working with local storage
   */
  stor = window.localStorage,
  get = function(key) {
    try {
      return JSON.parse(stor.getItem('hm-' + key));
    } catch (err) {
      return null;
    }
  },
  set = function(key, val) {
    return stor.setItem('hm-' + key, JSON.stringify(val));
  },
  
  // get cached size and difficulty values
  size = get('size') || 'small',
  difficulty = get('difficulty') || 'easy',
  
  // instance of hexmines game
  game;

$('input[name="size"]')
  .change(function(event) {
    game.size = $(this).val();
    set('size', game.size);
    game.reset();
  })
  .filter('[value="' + size + '"]')
    .prop('checked', true);

// check appropriate size/difficulty boxes
$('input[name="difficulty"]')
  .change(function(event) {
    game.difficulty = $(this).val();
    set('difficulty', game.difficulty);
    game.reset();
  })
  .filter('[value="' + difficulty + '"]')
    .prop('checked', true);

game = hexmines.createGame({
  grid: hex.grid($('.minefield')[0]),
  size: size,
  difficulty: difficulty
});

// reorient so the root is centered in the grid element
game.center();

})(window, hexmines, hex, jQuery);
