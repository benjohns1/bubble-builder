export default class UI_LoadMenu extends Prefab {
    
        constructor(gameState, name, x, y, properties, id) {
            super(gameState, name, x, y, properties, id);
    
            // Set property defaults
            this.elementPadding = this.properties.elementPadding || { "x": 0, "y": 0 };
    
            let currentY = 0;
    
            // Title
            this.title = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.title, this.properties.titleStyle);
            this.addChild(this.title);
            currentY += this.title.height + this.properties.elementPadding.y;

            // Subtitle
            this.subtitle = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.subtitle, this.properties.subTitleStyle);
            this.addChild(this.subtitle);
            currentY += this.subtitle.height + this.properties.elementPadding.y;

            // Create load button for each existing save
            let saveKeys = this.gameState.getSaveGameKeys();
            saveKeys.reverse();
            let saveCount = 0;
            if (saveKeys && saveKeys.length > 0) {
                for (let idx in saveKeys) {
                    let save = saveKeys[idx];
                    if (!save) {
                        continue;
                    }
                    saveCount++;
                    let btnLoad = this.gameState.uiFactory.textButton.create(save.title, () => {
                        this.gameState.loadGame(save.key);
                        this.gameState.subMenu.close();
                    }, this, 0, currentY);
                    this.addChild(btnLoad);
                    currentY += btnLoad.height + this.properties.elementPadding.y;
                }

                // @TODO: scrollbars
            }
            
            if (saveCount <= 0) {
                // No save games found
                this.nogames = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.noGamesLabel, this.properties.noGamesLabelStyle);
                this.addChild(this.nogames);
                currentY += this.nogames.height + this.properties.elementPadding.y;
            }
            
            // Load from file
            /*
            let btnRandomRespawn = this.gameState.uiFactory.textButton.create(this.properties.randomLabel, () => {
                this.gameState.respawn();
                this.gameState.subMenu.close();
            }, this, 0, currentY);
            this.addChild(btnRandomRespawn);
            currentY += btnRandomRespawn.height + this.properties.elementPadding.y;*/

            // Resume button
            this.btnResume = this.gameState.uiFactory.textButton.create(this.properties.resumeLabel, this.gameState.subMenu.close, this.gameState.subMenu, 0, currentY);
            this.addChild(this.btnResume);
            currentY += this.btnResume.height + this.properties.elementPadding.y;
            
            // Get height of all elements
            this.realHeight = currentY - this.properties.elementPadding.y;
    
            // Center all controls
            const centerX = this.getWidth() / 2;
            this.children.forEach(child => {
                child.x = centerX - (child.width / 2);
            });
        }
    
        getHeight() {
            return this.realHeight;
        }
    }