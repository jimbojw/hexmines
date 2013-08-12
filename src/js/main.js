/**
 * main.js - main JavaScript file for hexmines.
 */
(function(window, hexmines, hex, $, undefined){

hex.debug = true;

var
  
  /**
   * convenience methods for working with local storage
   */
  stor = (function(){
    var stor = window.localStorage;
    try {
      stor.setItem('hm-test', 1);
      if (stor.getItem('hm-test') === 1) {
        return stor;
      }
    } catch (err) {}
    stor = window.sessionStorage;
    try {
      stor.setItem('hm-test', 1);
      if (stor.getItem('hm-test') === 1) {
        return stor;
      }
      return stor;
    } catch (err) {}
    return {
      data: {},
      setItem: function(key, val) {
        this.data[key] = val;
      },
      getItem: function(key) {
        return this.data[key];
      },
      removeItem: function(key) {
        delete this.data[key];
      }
    };
  })(),
  get = function(key) {
    try {
      return JSON.parse(stor.getItem('hm-' + key));
    } catch (err) {
      return null;
    }
  },
  set = function(key, val) {
    stor.removeItem('hm-' + key);
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
  .on('change blur', function(event) {
    var size = $(this).val();
    if (game.size !== size) {
      game.size = size;
      set('size', game.size);
      game.reset();
    }
  })
  .filter('[value="' + size + '"]')
    .prop('checked', true);

// check appropriate difficulty box
$('input[name="difficulty"]')
  .on('change blur', function(event) {
    var difficulty = $(this).val();
    if (game.difficulty !== difficulty) {
      game.difficulty = difficulty;
      set('difficulty', game.difficulty);
      game.reset();
    }
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
