class SplashState extends Phaser.State {

    preload() {
        this.showLoadingBar();

        // Load game assets

        this.generateGraphics();
    }

    create() {
        if (this.game.config.enableDebug) {
            this.state.start('Game');
        } else {
            this.state.start('Menu');
        }
    }

    showLoadingBar() {
        
        const barBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loadingBarBg');
        barBg.anchor.setTo(0.5);

        const barImg = this.game.cache.getImage('loadingBar');
        const bar = this.add.sprite(this.game.world.centerX - barImg.width / 2, this.game.world.centerY, 'loadingBar');
        bar.anchor.setTo(0, 0.5);

        const text = this.add.text(this.world.centerX, this.world.centerY - barImg.height - 5, "Loading...", {
            fontSize: 22,
            fill: '#ffffff',
            align: 'center',
            smoothed: false
        });
        text.anchor.setTo(0.5, 1.0);
        
        this.load.setPreloadSprite(bar);
    }

    generateGraphics() {
        const rectangle = this.game.add.graphics();
        const width = 128, height = 48;
        
        rectangle.beginFill(0x3366ff);
        rectangle.drawRect(0, 0, width, height);
        rectangle.endFill();

        this.game.cache.addImage('rectangle', null, rectangle.generateTexture().baseTexture.source);
        
        rectangle.destroy();
    }
}