class Tutorial extends Phaser.Scene {
    constructor() {
        super("tutorialScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 350;
        this.VELOCITY = 150;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 800;
        this.JUMP_VELOCITY = -250;
        this.PARTICLE_VELOCITY = 50;
        this.JUMP_DRAG = 70
        this.SCALE = 5.65;
        this.coinCollect = 0;
        this.respawn = [game.config.width/35, game.config.height/12];
        this.dead = false;
        this.walkCtr = 0;
        this.tempCheck = [];
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-0", 16, 16, 80, 10);
        this.physics.world.setBounds(0, 0, 120*16, 10*16);
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("World-1-D-packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        //this.groundLayer.setScale(6.0);
        this.detailLayer = this.map.createLayer("Foliage-n-Design", this.tileset, 0, 0);
        //this.detailLayer.setScale(6.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
       

        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 20
        });

        this.door = this.map.createFromObjects("Exit", {
            name: "door",
            key: "tilemap_sheet",
            frame: 56
        });

        this.kill = this.map.createFromObjects("Spikes", {
            name: "kill",
            key: "tilemap_sheet",
            frame: 122
        });

        this.checkpoint = this.map.createFromObjects("Checkpoints", {
            name: "torch",
            key: "tilemap_sheet",
            frame: 248
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/35, game.config.height/12, "Tiles/Transparent/tile_0260b.png").setScale(.66);
        my.sprite.player.setSize(16, 16, true);
        my.sprite.player.setOffset(0, 0);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.body.setMaxVelocityX(this.VELOCITY);

        my.sprite.fire = this.add.sprite(game.config.width, game.config.height/12, "fire1");
        my.sprite.fire.visible = false;
        my.sprite.fire.setScale(0.04);

        my.text.controls = this.add.text(game.config.width/100, game.config.height-850, "Up Arrow: Jump", {fontFamily: "'Jersey 15'", fontSize: 50, color: "#fff"}).setScale(0.15);
        my.text.controls = this.add.text(game.config.width/100, game.config.height-840, "Left Arrow: Left", {fontFamily: "'Jersey 15'", fontSize: 50, color: "#fff"}).setScale(0.15);
        my.text.controls = this.add.text(game.config.width/100, game.config.height-830, "Right Arrow: Right", {fontFamily: "'Jersey 15'", fontSize: 50, color: "#fff"}).setScale(0.15);
        my.text.teach = this.add.text(game.config.width/14, game.config.height-795, "Avoid spikes", {fontFamily: "'Jersey 15'", fontSize: 50, color: "#fff"}).setScale(0.15);
        my.text.teach = this.add.text(game.config.width/7, game.config.height-787, "Checkpoint", {fontFamily: "'Jersey 15'", fontSize: 50, color: "#fff"}).setScale(0.15);
        my.text.teach = this.add.text(game.config.width/7, game.config.height-825, "Coin: Collect 2 to open Exit", {fontFamily: "'Jersey 15'", fontSize: 50, color: "#fff"}).setScale(0.15);
        my.text.teach = this.add.text(game.config.width/4.45, game.config.height-895, "Exit", {fontFamily: "'Jersey 15'", fontSize: 50, color: "#fff"}).setScale(0.15);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.kill, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.checkpoint, Phaser.Physics.Arcade.STATIC_BODY);

        
        my.vfx.walking = this.add.particles(0, 5, "kenny-particles", {
            frame: ['star_05.png', 'star_01.png'],
            // TODO: Try: add random: true
            scale: {start: 0.01, end: 0.03},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 250,
            // TODO: Try: gravityY: -400,
            gravityY: -100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping = this.add.particles(0, 5, "kenny-particles", {
            frame: ['star_02.png', 'star_09.png'],
            // TODO: Try: add random: true
            random: true,
            scale: {start: 0.01, end: 0.05},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 150,
            // TODO: Try: gravityY: -400,
            gravityY: -100,
            alpha: {start: 1, end: 0.1},
            duration: 150 
        });

        my.vfx.death = this.add.particles(-5, -5, "kenny-particles", {
            frame: ['star_01.png', 'star_02.png', 'star_03.png'],
            // TODO: Try: add random: true
            //random: true,
            scale: {start: 0.1, end: 0.2},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 150,
            // TODO: Try: gravityY: -400,
            //gravityY: -100,
            alpha: {start: 1, end: 0.1},
            duration: 1,
        });

        my.vfx.walking.stop();
        my.vfx.jumping.stop();
        my.vfx.death.stop();

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        this.doorGroup = this.add.group(this.door);

        this.killGroup = this.add.group(this.kill);

        this.checkGroup = this.add.group(this.checkpoint);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(0, 100);
        this.cameras.main.setZoom(this.SCALE);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.coinCollect += 1;
            if(this.coinCollect == 2) {
                this.doorGroup.children.entries[0].setFrame(58);
            }
            obj2.destroy(); // remove coin on overlap
            obj2.visible = false;
            obj2.y = -100
            this.sound.play("coinSfx");
        });

        this.physics.add.overlap(my.sprite.player, this.doorGroup, (s1, s2) => {
            if(s2.frame.name == 58) {
                this.sound.play("exitSfx");
                this.scene.start("endScene");
            }
        });

        this.physics.add.overlap(my.sprite.player, this.killGroup, (s1, s2) => {
            this.dead = true;
        });

        this.physics.add.overlap(my.sprite.player, this.checkGroup, (s1, s2) => {
            if(this.respawn[1] != s2.y - 3) {
                my.sprite.fire.anims.play("fire");
                my.sprite.fire.visible = true;
                my.sprite.fire.x = s2.x;
                my.sprite.fire.y = s2.y - 9;
                this.sound.play("checkSfx");
                this.respawn = [s2.x, s2.y - 3];
            }
        });
    }

    update() {
        this.walkCtr++;
        if (this.walkCtr >= 30) {
            this.walkCtr = 0;
        }
        

        for(let c of this.coins) {

            if(c.active == true) {
                c.anims.play('coin', true);
            }
        }

        if(this.dead) {
            my.vfx.death.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2, false);
            my.vfx.death.start();
            my.sprite.player.visible = false;
            this.sound.play("deadSfx");
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setVelocityX(0);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            setTimeout(() => { 
                my.vfx.death.stop();
                my.sprite.player.x = this.respawn[0];
                my.sprite.player.y = this.respawn[1];
                my.sprite.player.visible = true;
                this.dead = false;
            }, 200);
        }

        else {
            if(cursors.left.isDown) {
                // TODO: have the player accelerate to the left
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                //my.sprite.player.body.setVelocityX(-this.VELOCITY);
                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                if(my.sprite.player.body.blocked.down && this.walkCtr % 15 == 0) {
                    this.sound.play("walkSfx");
                }

                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {

                    my.vfx.walking.start();

                }
                else {
                    my.vfx.walking.stop();
                }

            } else if(cursors.right.isDown) {
                // TODO: have the player accelerate to the right
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                //my.sprite.player.body.setVelocityX(this.VELOCITY);
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                if(my.sprite.player.body.blocked.down && this.walkCtr % 15 == 0) {
                    this.sound.play("walkSfx");
                }

                my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {

                    my.vfx.walking.start();

                }
                else {
                    my.vfx.walking.stop();
                }

            } else {
                // TODO: set acceleration to 0 and have DRAG take over
                my.sprite.player.body.setAccelerationX(0);
                //my.sprite.player.body.setVelocityX(0);
                my.sprite.player.body.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
                my.vfx.walking.stop();
            }

            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
                my.sprite.player.body.setDragY(this.JUMP_DRAG);
            }
            if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                this.sound.play("jumpSfx");

                my.vfx.jumping.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
                my.vfx.jumping.start();
            }
        }
    }
}