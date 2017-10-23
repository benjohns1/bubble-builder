class MenuState extends Phaser.State {

    create() {
        const banner = this.add.text(this.world.centerX, this.world.centerY - 50, "Game Menu", {
            fontSize: 40,
            fill: '#ffffff',
            smoothed: false
        });
        banner.anchor.setTo(0.5);
        const textStyle = {
            fontSize: 16,
            fill: '#ffffff',
            align: 'center',
            smoothed: false,
        };

        const sprite = this.game.add.button(this.world.centerX, this.world.centerY + 20, 'button', function() {
            this.state.start('Game');
        }, this);
        sprite.anchor.setTo(0.5);
        const buttonText = this.game.add.text(0, 3, "Play", textStyle);
        buttonText.anchor.setTo(0.5);
        sprite.addChild(buttonText);
    }
}