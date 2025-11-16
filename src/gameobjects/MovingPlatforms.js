export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, props) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0);
        this.setImmovable(true);
        this.body.setAllowGravity(false);

        // Tiled properties
        this.startX = x;
        this.startY = y;
        this.distance = props.distance || 64;
        this.speed = props.speed || 60;
        this.direction = props.direction || "horizontal";
        this.currentSpeed = this.speed;
    }

    update(dt) {

        // Move horizontally
        if (this.direction === "horizontal") {
            this.x += this.currentSpeed * dt;

            if (this.x > this.startX + this.distance || this.x < this.startX - this.distance) {
                this.currentSpeed *= -1; // reverse
            }
        }

        // Move vertically incase we want this 
        else if (this.direction === "vertical") {
            this.y += this.currentSpeed * dt;

            if (this.y > this.startY + this.distance || this.y < this.startY - this.distance) {
                this.currentSpeed *= -1;
            }
        }
    }
}