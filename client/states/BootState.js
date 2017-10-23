class BootState extends Phaser.State {

    init() {
        this.loaded = false;
        
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        
        this.game.state.add('Splash', SplashState, false);
        this.game.state.add('Menu', MenuState, false);
        this.game.state.add('Game', GameState, false);
    }

    preload() {
        this.load.image('loadingBarBg', './assets/images/loading-bar-bg.png');
        this.load.image('loadingBar', './assets/images/loading-bar.png');
    }

    create() {
        this.state.start('Splash');
    }
}