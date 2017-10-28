class StaticFloater_Purple extends StaticFloater {
    
    constructor(game) {
        super(game, 0x7b2fa8, 150, 300);
        this.debug = false;
        this.resource.energy = this.radius;
        this.resource.purple = Math.ceil(this.radius / 40);
    }
}