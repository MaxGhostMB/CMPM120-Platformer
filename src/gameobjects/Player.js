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
        
        this.acceleration = 600;
        this.drag = 1000;
        this.max_speed = 200;
        this.maxclingtime = 0.25;

        this.coyote = 0;
        this.grounded = false;
        this.djump = true;
        this.cur_speed = 0;
        this.jumpDelay = 0
        this.wallclimb = false;
        this.wallgrace = 0;
        this.clingtime = 0;
        
        //Make collision match the sprite
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
        //Left movement
        if (this.left.isDown && !this.right.isDown) {
            //if holding left against a wall, cling to it
            if(this.body.blocked.left && this.cur_speed <= 0) {
                //Speed is set to -1 because the blocked check doesn't work if it's 0
                this.cur_speed = -1;
                if(this.body.velocity.y >= 0) {
                    if(this.clingtime < this.maxclingtime) {
                        this.body.velocity.y = 0;
                    }
                    this.wallclimb = true;
                    this.wallgrace = 0.15;
                    this.clingtime += dt;
                }
            //if holding left and you're not against a wall, accelerate
            } else {
                this.cur_speed -= this.acceleration * dt;
                //Cap speed
                if(this.cur_speed < -this.max_speed) {                    
                    this.cur_speed = -this.max_speed;
                }
                this.setFlipX(true);

            }
        } else {
            if(this.cur_speed < 0) {
                //if you're moving left but not holding left and hit a wall, lose all momentum
                if(this.body.blocked.left) {
                    this.cur_speed = 0;
                //if you're moving left but not holding left and on the ground, decelerate
                } else if(this.grounded) {
                    this.cur_speed += this.drag * dt;
                    //prevents deceleration from making the player go right
                    if(Math.abs(this.cur_speed) < 10) {
                        this.cur_speed = 0;
                    }
                }  
            }
        }
         
        //Right movement
        if (this.right.isDown && !this.left.isDown) {
            //if holding right against a wall, cling to it
            if(this.body.blocked.right && this.cur_speed >= 0) {
                //Speed is set to 1 because the blocked check doesn't work if it's 0
                this.cur_speed = 1;
                if(this.body.velocity.y > 0) {
                    if(this.clingtime < this.maxclingtime) {
                        this.body.velocity.y = 0;
                    }
                    this.wallclimb = true;
                    this.wallgrace = 0.15;
                    this.clingtime += dt;
                }
            //if holding right and youre not against a wall, accelerate
            } else {
                this.cur_speed += this.acceleration * dt;
                //Cap speed
                if(this.cur_speed > this.max_speed) {
                    this.cur_speed = this.max_speed;
                }
                this.setFlipX(false);
            }
        } else {
            if(this.cur_speed > 0) {
                //if you are moving right but not holding right and hit a wall, lose all horizontal momentum
                if(this.body.blocked.right) {
                    this.cur_speed = 0;
                //if you are on the ground, moving right but not holding right, decelerate
                } else if (this.grounded) {
                    this.cur_speed -= this.drag * dt;
                    //prevents deceleration from making the player go left
                    if(Math.abs(this.cur_speed) < 10) {
                        this.cur_speed = 0;
                    }
                }
            }
        }
        this.body.setVelocityX(this.cur_speed);

        // Jumping
        if(this.grounded) {
            if(this.space.isDown) {
                this.body.setVelocityY(-150);
                this.jumpDelay = 0.1;
            }
        } else {
            if (Phaser.Input.Keyboard.JustDown(this.space) && this.jumpDelay < 0) {
                if(this.wallclimb && (this.left.isDown ^ this.right.isDown)) {
                    this.body.setVelocityY(-250);
                    this.clingtime = 0;
                    this.cur_speed = 100 * (this.left.isDown - this.right.isDown);
                } else if(this.djump) {
                    this.body.setVelocityY(-250);
                    this.djump = false;
                    this.jumpDelay = 0.1;
                    this.clingtime = 0;
                }
            }
        }
        if(this.jumpDelay > 0) {
            this.jumpDelay -= dt;
        }
        
        //wallgrace allows the player to jump off the wall and go the other direction easier;
        if(this.wallgrace > 0) {
            this.wallgrace -= dt;
        } else {
            this.wallclimb = false;
        }

        // Coyote time and grounded logic
        if (!this.body.blocked.down) {
            this.coyote -= dt;
            if (this.coyote < 0) this.grounded = false;
        } else {
            this.coyote = 0.1;
            this.grounded = true;
            this.djump = true;
            this.clingtime = 0;
        }

        // Gravity adjustments
        if (this.grounded) {
            //If gravity is set to 0 coyote time becomes inconsistent, which also leads to inconsistent jump heights
            this.body.setGravityY(1);
        } else if (this.body.velocity.y < 0) {
            this.body.setGravityY(600);
        } else if(this.wallclimb) {
            this.body.setGravityY(300);
        } else {
            this.body.setGravityY(800);
        }

        // Animation
        if (this.left.isDown ^ this.right.isDown) {
            this.anims.play('moving', true);
        } else {
            this.anims.play('idle', true);
        }
    }
}

//Old Horizontal Movement
        //this.body.setVelocityX(0);
        //if (this.left.isDown && !this.right.isDown) {
        //    this.body.setVelocityX(-200);
        //    this.setFlipX(true);
        //} else if (this.right.isDown && !this.left.isDown) {
        //    this.body.setVelocityX(200);
        //    this.setFlipX(false);
        //}
