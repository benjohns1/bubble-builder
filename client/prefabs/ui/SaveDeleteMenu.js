class UI_SaveDeleteMenu extends Prefab {
    
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

            // Create delete button for each existing save
            let saveKeys = this.gameState.getSaveGameKeys();
            saveKeys.reverse();
            if (saveKeys) {
                for (let key in saveKeys) {
                    let save = saveKeys[key];
                    if (!save) {
                        continue;
                    }
                    let btnDelete = this.gameState.uiFactory.textButton.create(save.title, () => {
                        this.gameState.deleteSave(key);
                        this.gameState.subMenu.close();
                    }, this, 0, currentY);
                    this.addChild(btnDelete);
                    currentY += btnDelete.height + this.properties.elementPadding.y;
                }

                // @TODO: scrollbars
            }

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