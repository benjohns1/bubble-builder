class MenuState extends Phaser.State {

    init(assetData) {
        this.assetData = assetData;
    }

    create() {
        let locationY = this.world.centerY - 50;

        // Title
        const banner = this.add.text(this.world.centerX, locationY, "Bubble Builder", {
            fontSize: 40,
            fill: '#4286f4',
            smoothed: false
        });
        banner.anchor.setTo(0.5);
        const textStyle = {
            fontSize: 16,
            fill: '#ffffff',
            align: 'center',
            smoothed: false,
        };
        locationY += banner.height + 20;

        // Play button
        const button = this.game.add.button(this.world.centerX, locationY, 'rectangle', function() {
            this.state.start('Game', true, false, this.assetData);
        }, this);
        button.anchor.setTo(0.5);
        const buttonText = this.game.add.text(0, 3, "Play Now", textStyle);
        buttonText.anchor.setTo(0.5);
        button.addChild(buttonText);
        locationY += button.height + 15;

        // Text
        const text = this.add.text(this.world.centerX, locationY, "WASD keys to move (hold SHIFT for slow move)\nESC for game menu\n\nCollect enough resources to build a base!", textStyle);
        text.anchor.setTo(0.5, 0);
    }
}