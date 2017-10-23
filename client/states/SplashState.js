class SplashState extends Phaser.State {

    preload() {

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

        this.generateGraphics();
    }

    create() {
        this.state.start('Menu');
    }

    generateGraphics() {
        const button = this.game.add.graphics();
        const width = 128, height = 48;
        
        button.beginFill(0x3366ff);
        button.drawRect(0, 0, width, height);
        button.endFill();

        this.game.cache.addImage('button', null, button.generateTexture().baseTexture.source);
        
        button.destroy();
    }
}