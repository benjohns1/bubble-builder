class BootState extends Phaser.State {

    init(assetFiles, startState) {

        this.game.config.enableDebug = true;
        
        this.assetFiles = assetFiles || {
            "hud": "./assets/hud.json",
            "resources": "./assets/resources.json",
            "structures": "./assets/structures.json",
        };
        this.startState = startState || (this.game.config.enableDebug ? "Game" : "Menu");
        
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        
        this.game.state.add('Splash', SplashState, false);
        this.game.state.add('Menu', MenuState, false);
        this.game.state.add('Game', GameState, false);
    }

    preload() {
        this.load.image('loadingBarBg', './assets/images/loading-bar-bg.png');
        this.load.image('loadingBar', './assets/images/loading-bar.png');

        // Load raw JSON asset file data
        for (let [key, filename] of Object.entries(this.assetFiles)) {
            this.load.text(key, filename);
        }
    }

    create() {
        const rawJsonAssetText = {};
        for (let key of Object.keys(this.assetFiles)) {
            rawJsonAssetText[key] = this.game.cache.getText(key);
        }
        this.state.start('Splash', true, false, rawJsonAssetText, this.startState);
    }
}