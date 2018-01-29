import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/BootState'
import SplashState from './states/SplashState'
import MenuState from './states/MenuState'
import GameState from './states/GameState'

class Game extends Phaser.Game {
  constructor () {
    super(window.innerWidth, window.innerHeight, Phaser.AUTO, 'app', null, false, false, null)
    window.PhaserGlobal = {
        hideBanner: true
    };

    this.state.add('Boot', BootState, false)
    this.state.add('Splash', SplashState, false)
    this.state.add('Menu', MenuState, false)
    this.state.add('Game', GameState, false)

    this.state.start('Boot')
  }
}

window.game = new Game()