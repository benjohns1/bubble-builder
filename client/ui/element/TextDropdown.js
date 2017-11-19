class UI_Element_TextDropdown extends Phaser.Sprite {
    
        constructor(game, x, y, options, selectedOption, onSelectCallback, onSelectContext, width = undefined, height = undefined, cornerRadius = 2, textStyle = {}, padding = { "top": 0, "left": 0, "right": 0, "bottom": 0 }, textOffset = { "x": 0, "y": 0 }) {
            super(game, x, y);
            this.padding = padding;
            this.options = options;
            this.optionObjects = {};
            this.selectedOption = undefined;
            this.textStyle = textStyle;
            this.cornerRadius = cornerRadius;
            this.onSelectCallback = onSelectCallback;
            this.onSelectContext = onSelectContext;
            this.menuWidth = 0;
            this.lineWidth = 1;
            
            // Create main button text
            this.text = new Phaser.Text(this.game, textOffset.x + this.padding.left, textOffset.y + this.padding.top, (this.options.hasOwnProperty(selectedOption) ? "" : selectedOption), this.textStyle);
            width = width === undefined ? this.text.width : (width || 0);
            height = height === undefined ? this.text.height : (height || 0);

            // Main button setup
            const buttonHeight = this.padding.top + height + this.padding.bottom,
                triangleWidth = 15,
                triangleHeight = 8,
                triangleLeftPadding = (this.padding.right / 2);
                
            // Initialize dropdown menu
            this.initDropdown(width, triangleLeftPadding + triangleWidth, buttonHeight);

            this.selectOption(selectedOption);

            // Dropdown triangle setup
            const triangleLeft = this.menuWidth - this.padding.left - triangleWidth,
                triangleTop = (buttonHeight / 2) - (triangleHeight / 2);

            // Create main button graphics
            const g = new Phaser.Graphics(this.game);
            g.beginFill(0xaaaaaa);
            g.drawPolygon([
                triangleLeft, triangleTop,
                triangleLeft + triangleWidth, triangleTop,
                triangleLeft + (triangleWidth / 2), triangleTop + triangleHeight
            ]);
            g.endFill();
            g.beginFill(0xffffff, 0);
            g.lineStyle(1, 0xaaaaaa);
            g.drawRoundedRect(0, 0, this.menuWidth, buttonHeight, this.cornerRadius);
            g.endFill();

            // Create main button object
            this.button = new Phaser.Button(this.game, 0, 0, g.generateTexture(), this.toggleDropdown, this);
            this.button.addChild(this.text);
            this.addChild(this.button);
        }

        toggleDropdown() {
            if (this.menu.visible) {
                this.closeDropdown();
            }
            else {
                this.openDropdown();
            }
        }

        closeDropdown() {
            this.menu.visible = false;
        }

        openDropdown() {
            this.menu.visible = true;
        }

        initDropdown(width, extraWidth, buttonHeight) {

            // Create option text objects
            let currentY = 0;
            let maxWidth = width;
            for (let key in this.options) {
                let option = this.options[key];
                let textObj = new Phaser.Text(this.game, this.padding.left, this.padding.top, option, this.textStyle);
                let height = this.padding.top + textObj.height + this.padding.bottom;

                this.optionObjects[key] = {
                    textObj: textObj,
                    text: option,
                    key: key,
                    x: 0,
                    y: currentY,
                    height: height,
                    selected: (key === this.selectedOption)
                };
                
                currentY += height;

                if (textObj.width > maxWidth) {
                    maxWidth = textObj.width;
                }

            }

            // Create menu background
            const g = new Phaser.Graphics(this.game);
            this.menuWidth = this.padding.left + maxWidth + extraWidth + this.padding.right;
            let menuHeight = currentY + this.padding.bottom;
            g.beginFill(0xffffff);
            g.lineStyle(this.lineWidth, 0xaaaaaa);
            g.drawRoundedRect(0, 0, this.menuWidth, menuHeight, this.cornerRadius);
            g.endFill();

            // Create menu and add option objects
            this.menu = new Phaser.Sprite(this.game, 0, buttonHeight, g.generateTexture());
            this.menu.visible = false;
            Object.entries(this.optionObjects).forEach(entry => {
                let key = entry[0], option = entry[1];
                g.clear();
                g.lineStyle(this.lineWidth, 0xffffff);
                g.drawRoundedRect(0, 0, this.menuWidth - (this.lineWidth * 2), option.height, this.cornerRadius);
                g.endFill();

                let optionButton = new Phaser.Button(this.game, option.x + this.lineWidth, option.y, g.generateTexture(), () => {
                    this.selectOption(key);
                    this.closeDropdown();
                });
                if (this.onSelectCallback) {
                    // Add user callback
                    optionButton.events.onInputUp.add(this.onSelectCallback, this.onSelectContext, 0, key, this.options);
                }
                optionButton.addChild(option.textObj);
                option.button = optionButton;
                this.menu.addChild(optionButton);
            });
            this.addChild(this.menu);
            this.selectOption(this.selectedOption);
        }

        selectOption(key) {
            if (this.selectedOption === key) {
                return; // re-selected current selection, do nothing
            }
            
            const g = new Phaser.Graphics(this.game);
            g.lineStyle(this.lineWidth, 0xffffff);
            
            // Deselect previous option
            if (this.selectedOption && this.optionObjects.hasOwnProperty(this.selectedOption)) {
                const prevOption = this.optionObjects[this.selectedOption];
                g.beginFill(0xffffff);
                g.drawRoundedRect(0, 0, this.menuWidth - (this.lineWidth * 2), prevOption.height, this.cornerRadius);
                g.endFill();
                prevOption.button.setTexture(g.generateTexture(), true);
                g.clear();
                prevOption.selected = false;
            }

            if (this.optionObjects.hasOwnProperty(key)) {

                // Select new option
                const currOption = this.optionObjects[key];
                g.beginFill(0xaaaaaa);
                g.drawRoundedRect(0, 0, this.menuWidth - (this.lineWidth * 2), currOption.height, this.cornerRadius);
                g.endFill();
                currOption.button.setTexture(g.generateTexture(), true);
                currOption.selected = true;

                // Show this option on main button
                this.text.text = currOption.text;
                this.selectedOption = key;

                return;
            }

            // No valid option, use key as main button display
            this.text.text = key;
            this.selectedOption = undefined;
        }

        get width() {
            return this.button.width;
        }

        get height() {
            return this.button.height;
        }
    }