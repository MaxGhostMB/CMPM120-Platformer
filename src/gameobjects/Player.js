export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // Add player to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Controls
        this.space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.left = scene.input.keyboard.addKey("A");
        this.right = scene.input.keyboard.addKey("D");

        // Movement 
        this.coyote = 0;
        this.grounded = false;
        this.djump = true;
        
        this.body.setSize(16,8);
        this.body.setOffset(0,7);

        // Animation setup
        this.createAnimations(scene);
    }

    createAnimations(scene) {
        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        scene.anims.create({
            key: 'moving',
            frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update(dt) {
        // Horizontal movement
        this.body.setVelocityX(0);
        if (this.left.isDown && !this.right.isDown) {
            this.body.setVelocityX(-200);
            this.setFlipX(true);
        } else if (this.right.isDown && !this.left.isDown) {
            this.body.setVelocityX(200);
            this.setFlipX(false);
        }

        // Jumping
        if(this.grounded) {
            if(this.space.isDown) {
                this.body.setVelocityY(-150);
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.space) && this.djump) {
            //Prevents double jump from automatically happening
            if(this.body.velocity.y > -100) {
                this.body.setVelocityY(-250);
                this.djump = false;
            }
        }

        // Coyote time and grounded logic
        if (!this.body.blocked.down) {
            this.coyote -= dt;
            if (this.coyote < 0) this.grounded = false;
        } else {
            this.coyote = 0.1;
            this.grounded = true;
            this.djump = true;
        }

        // Gravity adjustments
        if (this.grounded) {
            this.body.setGravityY(0);
        } else if (this.body.velocity.y > 0) {
            this.body.setGravityY(800);
        } else {
            this.body.setGravityY(600);
        }

        // Animation
        if (!(this.left.isDown ^ this.right.isDown)) {
            this.anims.play('idle', true);
        } else {
            this.anims.play('moving', true);
        }
    }
}
