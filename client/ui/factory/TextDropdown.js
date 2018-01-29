class UI_Factory_TextDropdown {

    constructor(game, textStyle = { "font": "16px Arial", "fill": "#000000" }, cornerRadius = 2, padding = { "top": 0, "right": 0, "bottom": 0, "left": 0 }, textOffset = { "x": 0, "y": 0 }) {
        this.game = game;
        this.cornerRadius = cornerRadius;
        this.textStyle = textStyle;
        this.padding = padding;
        this.textOffset = textOffset;
    }

    create(options = {}, selectedOption = undefined, onSelectCallback = undefined, onSelectContext = undefined, x = 0, y = 0, width = undefined, height = undefined, cornerRadius = this.cornerRadius, textStyle = this.textStyle, padding = this.padding, textOffset = this.textOffset) {

        // Create dropdown object
        return new UI_Element_TextDropdown(this.game, x, y, options, selectedOption, onSelectCallback, onSelectContext, width, height, cornerRadius, textStyle, padding, textOffset);
    }
}