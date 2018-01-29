class UI_ConfirmDialog extends Prefab {
    
        constructor(gameState, name, x, y, properties, id) {
            super(gameState, name, x, y, properties, id);
    
            // Set property defaults
            this.elementPadding = this.properties.elementPadding || { "x": 0, "y": 0 };
    
            let currentY = 0;

            this.onConfirm = new Phaser.Signal();
            this.onCancel = new Phaser.Signal();
    
            // Title
            this.title = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.title, this.properties.titleStyle);
            this.addChild(this.title);
            currentY += this.title.height + this.properties.elementPadding.y;
            
            // Confirm button
            let btnConfirm = this.gameState.uiFactory.textButton.create(this.properties.confirmLabel, () => {
                this.onConfirm.dispatch();
                this.gameState.subMenu.close();
            }, this, 0, currentY);
            this.addChild(btnConfirm);
            currentY += btnConfirm.height + this.properties.elementPadding.y;
            
            // Cancel button
            let btnCancel = this.gameState.uiFactory.textButton.create(this.properties.cancelLabel, () => {
                this.onCancel.dispatch();
                this.gameState.subMenu.close();
            }, this, 0, currentY);
            this.addChild(btnCancel);
            currentY += btnCancel.height + this.properties.elementPadding.y;
            
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