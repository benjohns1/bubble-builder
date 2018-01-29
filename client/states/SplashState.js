class SplashState extends Phaser.State {

    init(rawJsonAssetText, startState) {
        this.rawJsonAssetText = rawJsonAssetText;
        this.startState = startState;
        this.assetData = {};
    }

    preload() {
        this.showLoadingBar();

        this.game.add.plugin(PhaserInput.Plugin);
        this.game.add.plugin(PhaserNineSlice.Plugin);
        
        // Load JSON configured asset data
        for (let [key, rawJsonText] of Object.entries(this.rawJsonAssetText)) {
            this.loadJsonAsset(key, rawJsonText);
        }

        // Load dynamic asset data
        this.generateGraphics();
    }

    create() {
        this.state.start(this.startState, true, false, this.assetData);
    }

    loadJsonAsset(key, rawJsonText) {
        // Load JSON config file
        this.assetData[key] = JSON.parse(rawJsonText);

        if (!this.assetData[key].assets) {
            return;
        }

        // Loop through 'assets' property in config and load assets based on type
        for (let assetType in this.assetData[key].assets) {
            for (let assetName in this.assetData[key].assets[assetType]) {
                this.load[assetType](assetName, ...this.assetData[key].assets[assetType][assetName]);
            }
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