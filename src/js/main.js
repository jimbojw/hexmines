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

$('.navbar-brand').click(function(event) {
  event.preventDefault();
  game.reset();
});

// check appropriate size box
$('input[name="size"]')
  .change(function(event) {
    game.size = $(this).val();
    set('size', game.size);
    game.reset();
  })
  .filter('[value="' + size + '"]')
    .prop('checked', true);

// check appropriate difficulty box
$('input[name="difficulty"]')
  .change(function(event) {
    game.difficulty = $(this).val();
    set('difficulty', game.difficulty);
    game.reset();
  })
  .filter('[value="' + difficulty + '"]')
    .prop('checked', true);

// create game
game = hexmines.createGame({
  grid: hex.grid($('.minefield')[0]),
  size: size,
  difficulty: difficulty
});

})(window, hexmines, hex, jQuery);
