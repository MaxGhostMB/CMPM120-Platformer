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
        this.cur_speed = 0;
        this.acceleration = 300;
        this.drag = 700;
        this.max_speed = 200;
        this.coyote = 0;
        this.grounded = false;
        this.djump = true;
        this.jumpDelay = 0.1
        this.lwClimb = false;
        this.rwClimb = false;
        
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
        if (this.left.isDown && !this.right.isDown) {
            if(this.body.blocked.left && this.cur_speed <= 0) {
                this.cur_speed = 0;
                this.lwClimb = true;
            } else {
                this.lwClimb = false;
                this.cur_speed -= this.acceleration * dt;
                if(this.cur_speed < -this.max_speed) {                    
                    this.cur_speed = -this.max_speed;
                }
                    this.setFlipX(true);
            }
        } else {
            if(this.cur_speed < 0 && this.grounded) {
                this.cur_speed += this.drag * dt;
                if(Math.abs(this.cur_speed) < 10) {
                    this.cur_speed = 0;
                }
            }
        }
            
        if (this.right.isDown && !this.left.isDown) {
            if(this.body.blocked.right && this.cur_speed >= 0) {
                this.cur_speed = 0;
                this.rwClimb = true;
            } else {
                this.rwClimb = false;
                this.cur_speed += this.acceleration * dt;
                if(this.cur_speed > this.max_speed) {
                    this.cur_speed = this.max_speed;
                }
                this.setFlipX(false);
            }
        } else {
            if(this.cur_speed > 0 && this.grounded) {
                this.cur_speed -= this.drag * dt;
                if(Math.abs(this.cur_speed) < 10) {
                    this.cur_speed = 0;
                }
            }
        }
        
        this.body.setVelocityX(this.cur_speed);

        //Old Horizontal Movement
        //this.body.setVelocityX(0);
        //if (this.left.isDown && !this.right.isDown) {
        //    this.body.setVelocityX(-200);
        //    this.setFlipX(true);
        //} else if (this.right.isDown && !this.left.isDown) {
        //    this.body.setVelocityX(200);
        //    this.setFlipX(false);
        //}

        // Jumping
        if(this.grounded) {
            if(this.space.isDown) {
                this.body.setVelocityY(-150);
                this.jumpDelay = 0.1;
            }
        } else {
            if (Phaser.Input.Keyboard.JustDown(this.space) && this.jumpDelay < 0) {
                if(this.djump) {
                    this.body.setVelocityY(-250);
                    this.djump = false;
                    this.jumpDelay = 0.1;
                }
            }
        }

        if(this.jumpDelay > 0) {
            this.jumpDelay -= dt;
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
        } else if (this.body.velocity.y < 0) {
            this.body.setGravityY(600);
        //} else if(this.lwClimb || this.rwClimb) {
        //    this.body.setGravityY(100);
        } else {
            this.body.setGravityY(800);
        }

        // Animation
        if (!(this.left.isDown ^ this.right.isDown)) {
            this.anims.play('idle', true);
        } else {
            this.anims.play('moving', true);
        }
    }
}
