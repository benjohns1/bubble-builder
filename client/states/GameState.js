class GameState extends Phaser.State {
    constructor() {
        super();
        this.loaded = false;
    }

    preload() {
        const text = this.add.text(this.world.centerX, this.world.centerY, 'Entered Game', { fill: '#ffffff'});
        text.anchor.setTo(0.5);
    }
}