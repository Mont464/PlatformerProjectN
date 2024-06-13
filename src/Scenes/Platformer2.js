class Platformer2 extends Phaser.Scene {
    constructor() {
        super("platformer2Scene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 350;
        this.VELOCITY = 150;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 800;
        this.JUMP_VELOCITY = -270;
        this.PARTICLE_VELOCITY = 50;
        this.JUMP_DRAG = 70;
        this.jumpsDone = 0;
        this.maxJumps = 1;
        this.SCALE = 5.65;
        this.coinCollect = 0;
        this.respawn = [22, 240];
        this.dead = false;
        this.walkCtr = 0;
        this.tempCheck = [];
        my.sprite.enemies = [];
        my.sprite.enemyBullet = [];
        this.enemyBulletCooldownCounter = 0;
        this.bulletGroup;
        this.bulletVals = [];
        this.aimDir = "right";
        this.attackCooldown = 0;
        this.groundLayer;
        this.hasSword = true;
        this.levelSong;
        this.hasDash = false;
        this.dashCooldown = 0;
        this.lives = this.scene.get("lifeScene");
        this.dashing = 0;
    }

    create() {
        //start playing the level song
        this.levelSong = this.sound.add("lev2Music");
        this.levelSong.play({"loop" : true});

        //store the current level in UI handler
        this.lives.setOwner(this);

        // Create a new tilemap game object
        this.map = this.add.tilemap("platformer-level-2", 16, 16, 80, 10);
        this.physics.world.setBounds(0, 0, 100*16, 20*16);
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("World-1-D-packed", "tilemap_tiles");

        // Create a layers
        this.background = this.map.createLayer("Background", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.detailLayer = this.map.createLayer("Foliage-n-Design", this.tileset, 0, 0);

        // Make ground collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        //change collision for platforms
        for(let i of this.groundLayer.layer.data) {
            for(let j of i) {
                if(j.properties.platform) {
                    j.collideDown = false;
                }
            }
        }

        //for group of coins
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 20
        });
        //for group of exits
        this.door = this.map.createFromObjects("Exit", {
            name: "door",
            key: "tilemap_sheet",
            frame: 56
        });

        //for group of spikes
        this.kill = this.map.createFromObjects("Spikes", {
            name: "kill",
            key: "tilemap_sheet",
            frame: 122
        });

        //for group of checkpoints
        this.checkpoint = this.map.createFromObjects("Checkpoints", {
            name: "torch",
            key: "tilemap_sheet",
            frame: 248
        });

        //for group of dash collectibles
        this.dash = this.map.createFromObjects("Dash", {
            name: "dash",
            key: "tilemap_sheet",
            frame: 102
        });

        //for group of double jump collectibles
        this.dJump = this.map.createFromObjects("Double Jump", {
            name: "double",
            key: "tilemap_sheet",
            frame: 62
        });

        //to be filled in bullet group
        this.bullets = [];

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(22, 240, "Tiles/Transparent/tile_0260b.png").setScale(0.66);
        my.sprite.player.setSize(16, 16, true);
        my.sprite.player.setOffset(0, 0);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.body.setMaxVelocityX(this.VELOCITY);

        //set up attack sprite
        my.sprite.slash = this.physics.add.sprite(my.sprite.player.x + 6, my.sprite.player.y, "slash1").setScale(0.05);
        my.sprite.slash.body.setAllowGravity(false);
        my.sprite.slash.setCircle(200, 50, 50);
        my.sprite.slash.visible = false;


        // animated checkpoint fire sprite
        my.sprite.fire = this.add.sprite(game.config.width, game.config.height/12, "fire1");
        my.sprite.fire.visible = false;
        my.sprite.fire.setScale(0.04);

        // enemy paths
        this.smallPoints = [
            23, 138,
            23, 118
        ];
        this.smallCurve = new Phaser.Curves.Spline(this.smallPoints);

        this.vertPoints = [
            407, 58,
            407, 23
        ];
        this.vertCurve = new Phaser.Curves.Spline(this.vertPoints);

        this.vert2Points = [
            1417.5, 26,
            1417.5, 74
        ];
        this.vert2Curve = new Phaser.Curves.Spline(this.vert2Points);

        this.horizPoints = [
            1285, 22,
            1333, 22
        ];
        this.horizCurve = new Phaser.Curves.Spline(this.horizPoints);

        //create sprites and add them to the sprite array                                          
        let enemy1 = this.add.follower(this.smallCurve, 23, 139, "enemyFrame1");
        my.sprite.enemies.push({"sprite":enemy1, "coolDown":25, "shotDir":"right"});
        let enemy2 = this.add.follower(this.vertCurve, 407, 58, "enemyFrame1");
        my.sprite.enemies.push({"sprite":enemy2, "coolDown":35, "shotDir":"left"});
        let enemy3 = this.add.follower(this.horizCurve, 1285, 22, "enemyFrame1").setScale(0.75);
        my.sprite.enemies.push({"sprite":enemy3, "coolDown":40, "shotDir":"down"});
        //let enemy4 = this.add.follower(this.vert3Curve, 1558, 74, "enemyFrame1").setScale(0.75);
        //my.sprite.enemies.push({"sprite":enemy4, "coolDown":40, "shotDir":"left"}); 

        //start animations on enemies and make them follow their splines
        for (let e of my.sprite.enemies) {
            e["sprite"].anims.play("enemy");
            e["sprite"].startFollow({from: 0, to: 1, delay: 0, duration: 5000, repeat: -1, yoyo: true, rotateToPath: false, rotationOffset: -90});
        }


        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        //turn the object groups into static physics groups
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.kill, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.checkpoint, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.dash, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.dJump, Phaser.Physics.Arcade.STATIC_BODY);

        //create vfx for player events
        my.vfx.walking = this.add.particles(5, 5, "kenny-particles", {
            frame: ['star_05.png', 'star_01.png'],
            scale: {start: 0.01, end: 0.03},
            lifespan: 250,
            gravityY: -100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping = this.add.particles(5, 5, "kenny-particles", {
            frame: ['star_02.png', 'star_09.png'],
            random: true,
            scale: {start: 0.01, end: 0.05},
            lifespan: 150,
            gravityY: -100,
            alpha: {start: 1, end: 0.1},
            duration: 150 
        });

        my.vfx.dashing = this.add.particles(5, 5, "kenny-particles", {
            frame: ['scorch_01.png', 'scorch_02.png', 'scorch_03.png'],
            random: true,
            scale: {start: 0, end: 0.06, ease: 'elastic.in'},
            lifespan: 250,
            gravityY: -100,
            alpha: {start: 0.1, end: 1},
            duration: 200 
        });

        my.vfx.death = this.add.particles(-5, -5, "kenny-particles", {
            frame: ['star_01.png', 'star_02.png', 'star_03.png'],
            scale: {start: 0.1, end: 0.3},
            lifespan: 150,
            alpha: {start: 1, end: 0.1},
            duration: 150,
        });

        my.vfx.walking.stop();
        my.vfx.jumping.stop();
        my.vfx.death.stop();
        my.vfx.dashing.stop();

        // Create a Phaser group out of the physics arrays
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        this.doorGroup = this.add.group(this.door);

        this.killGroup = this.add.group(this.kill);

        this.checkGroup = this.add.group(this.checkpoint);

        this.bulletGroup =  this.add.group(this.bullets);

        this.dashGroup = this.add.group(this.dash);

        this.dJumpGroup = this.add.group(this.dJump);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        //set up alternate movement with WASD and SPACE
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        //set up click for attack
        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            if (this.attackCooldown == 0 && this.hasSword == true) {
                my.sprite.slash.visible = true;
                my.sprite.slash.anims.play("slash", false);
                this.attackCooldown = 25;
                this.sound.play("slashSfx");
            }
        });

        // debug key listener (assigned to N key)
        this.input.keyboard.on('keydown-N', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
            console.log(my.sprite.player.x);
            console.log(my.sprite.player.y);
        }, this);

        //set up camera bounds
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        //this.cameras.main.setDeadzone(0, 100);
        this.cameras.main.setZoom(this.SCALE);

        // Handle collision detection with the physics groups
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
                this.levelSong.stop();
                this.sound.play("exitSfx");
                this.lives.winClear();
            }
        });

        this.physics.add.overlap(my.sprite.player, this.dashGroup, (obj1, obj2) => {
            this.hasDash = true;
            obj2.destroy(); // remove coin on overlap
            obj2.visible = false;
            obj2.y = -100
            this.sound.play("coinSfx");
            my.text.teachJump = this.add.text(997, 135, "DASH (SHIFT)", {fontFamily: "'Jersey 15'", fontSize: 80, color: "#fff"}).setOrigin(0.5).setScale(0.1);
        });

        this.physics.add.overlap(my.sprite.player, this.dJumpGroup, (obj1, obj2) => {
            this.maxJumps = 2;
            obj2.destroy(); // remove coin on overlap
            obj2.visible = false;
            obj2.y = -100
            this.sound.play("coinSfx");
            my.text.teachJump = this.add.text(360, 120, "DOUBLE JUMP", {fontFamily: "'Jersey 15'", fontSize: 80, color: "#fff"}).setOrigin(0.5).setScale(0.1);
        });

        this.physics.add.overlap(my.sprite.player, this.killGroup, (s1, s2) => {
            this.dead = true;
        });

        this.physics.add.overlap(my.sprite.player, this.bulletGroup, (s1, s2) => {
            if(!this.dead) {
                s2.y = -100;
                this.bulletGroup.remove(s2, false, true);
                this.bulletVals.splice(this.bulletGroup.children.entries.indexOf(s2), 1);
                this.dead = true;
            }
        });
        
        this.physics.add.collider(this.bulletGroup, this.groundLayer, (s1, s2) => {
            s1.y = -100;
            this.bulletGroup.remove(s1, false, true);
            this.bulletVals.splice(this.bulletGroup.children.entries.indexOf(s1), 1);
        });

        this.physics.add.overlap(this.bulletGroup, my.sprite.slash, (s1, s2) => {
            if (my.sprite.slash.visible) {
                s1.y = -100;
                this.bulletGroup.remove(s1, false, true);
                this.bulletVals.splice(this.bulletGroup.children.entries.indexOf(s1), 1);
                this.sound.play("breakBulletSfx");
            }
        });

        this.physics.add.overlap(my.sprite.player, this.checkGroup, (s1, s2) => {
            if(this.respawn[1] != s2.y - 3 || this.respawn[0] != s2.x) {
                my.sprite.fire.anims.play("fire");
                my.sprite.fire.visible = true;
                my.sprite.fire.x = s2.x;
                my.sprite.fire.y = s2.y - 9;
                this.sound.play("checkSfx");
                this.respawn = [s2.x, s2.y - 3];
            }
        });
    }

    //collides for enemies
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/10)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/10)) return false;
        return true;
    }

    update() {

        //update bullet cooldown
        this.enemyBulletCooldownCounter += 0.5;
        if (this.enemyBulletCooldownCounter > 12) {
            this.enemyBulletCooldownCounter == 1
        }

        //update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        //update dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown--;
        }

        //update dash active duration
        if (this.dashing >= 0) {
            this.dashing--;
        }

        //update walk sfx counter
        this.walkCtr++;
        if (this.walkCtr >= 30) {
            this.walkCtr = 0;
        }

        //manage animations for coins
        for(let c of this.coins) {
            if(c.active == true) {
                c.anims.play('coin', true);
            }
        }

        //check if enemy can shoot and create a bullet if it can
        for (let i = 0; i < my.sprite.enemies.length; i++) {
            let enemy = my.sprite.enemies[i];
            if(this.enemyBulletCooldownCounter % enemy.coolDown == 0) {
                let tempShot = this.physics.add.sprite(enemy.sprite.x, enemy.sprite.y, "enemyShot").setScale(0.03);
                tempShot.body.setAllowGravity(false);
                tempShot.setCircle(64, 230, 230);
                tempShot.setCollideWorldBounds(true);
                if (enemy.shotDir == "right") {
                    tempShot.body.setVelocityX(70);
                }
                else if (enemy.shotDir == "left") {
                    tempShot.body.setVelocityX(-70);
                }
                else if (enemy.shotDir == "down") {
                    tempShot.body.setVelocityY(70);
                }

                this.bulletGroup.add(tempShot);
                this.bulletVals.push({"life":0});
            }
        }

        //move bullets forward and rotate them as they go
        for(let i = 0; i < this.bulletGroup.getLength(); i++) {
            let bullet = this.bulletGroup.children.entries[i];
            let vals = this.bulletVals[i];

            bullet.angle += 2;
            vals.life += 1;
        }

        //check if the player has hit an enemy
        for (let i = 0; i < my.sprite.enemies.length; i++) {
            let enemy = my.sprite.enemies[i].sprite;
            if (this.collides(my.sprite.player, enemy)) {
                this.dead = true;
                break;
            }
        }

        //check if player is dead but the animation has not started
        if(this.dead && my.sprite.player.visible == true) {
            my.vfx.death.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2, false);
            my.vfx.death.start();
            my.sprite.player.visible = false;
            this.sound.play("deadSfx");
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setVelocityX(0);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            this.lives.loseLife();
            setTimeout(() => { 
                my.vfx.death.stop();
                my.sprite.player.x = this.respawn[0];
                my.sprite.player.y = this.respawn[1];
                my.sprite.player.visible = true;
                this.dead = false;
            }, 200);
        }
        
        //handle player input if the player is alive
        else {
            if(Phaser.Input.Keyboard.JustDown(this.shiftKey)) { //handle dashing before movement
                if (this.hasDash && this.dashCooldown == 0) {
                    this.dashCooldown = 50;
                    this.dashing = 12;
                    my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-5, my.sprite.player.displayHeight/2-5, false);
                    my.vfx.dashing.start();
                    if (this.aimDir == "right") {
                        my.sprite.player.setVelocityX(300);
                        my.sprite.player.body.setMaxVelocityX(300);
                    }
                    else if (this.aimDir == "left") {
                        my.sprite.player.setVelocityX(-300);
                        my.sprite.player.body.setMaxVelocityX(300);
                    }
                    else if (this.aimDir == "up") {
                        my.sprite.player.setVelocityY(-150);
                    }
                    else if (this.aimDir == "left") {
                        my.sprite.player.setVelocityY(100);
                    }
                }
            }

            if (this.dashing == 0) {
                my.sprite.player.body.setMaxVelocityX(this.VELOCITY);
                my.vfx.dashing.stop();
            }

            if(cursors.left.isDown || this.aKey.isDown) {                   //handle left move
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                this.aimDir = "left";

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

            } else if(cursors.right.isDown || this.dKey.isDown) {           //handle right move
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                this.aimDir = "right";

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

            } else if(cursors.up.isDown || this.wKey.isDown) {           //handle aiming up
                this.aimDir = "up";
            } else if(cursors.down.isDown || this.sKey.isDown) {         //handle aiming down
                this.aimDir = "down";
            } else {                                                     //handle no input
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
                my.vfx.walking.stop();
            }

            // player jump
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
                my.sprite.player.body.setDragY(this.JUMP_DRAG);
            }
            else {                                  //in the case that double jump is aquired
                this.jumpsDone = 0;
            }
            if(Phaser.Input.Keyboard.JustDown(this.spaceKey)) {           //jump initial input
                if (this.jumpsDone < this.maxJumps) {
                    my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                    my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                    this.sound.play("jumpSfx");

                    my.vfx.jumping.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
                    my.vfx.jumping.start();
                    this.jumpsDone++;
                }
            }

            //handle slash aiming
            if (this.aimDir == "right") {
                my.sprite.slash.x = my.sprite.player.x + 8;
                my.sprite.slash.y = my.sprite.player.y;
                my.sprite.slash.angle = -20;
                //console.log("right: " + my.sprite.slash.x);
            } else if (this.aimDir == "left") {
                my.sprite.slash.x = my.sprite.player.x - 8;
                my.sprite.slash.y = my.sprite.player.y;
                my.sprite.slash.angle = 160;
                //console.log("left: " + my.sprite.slash.x);
            } else if (this.aimDir == "up") {
                my.sprite.slash.x = my.sprite.player.x;
                my.sprite.slash.y = my.sprite.player.y - 8;
                my.sprite.slash.angle = -110;
                //console.log("up: " + my.sprite.slash.angle);
            } else if (this.aimDir == "down" && !my.sprite.player.body.blocked.down) {
                my.sprite.slash.x = my.sprite.player.x;
                my.sprite.slash.y = my.sprite.player.y + 8;
                my.sprite.slash.angle = 70;
                //console.log("down: " + my.sprite.slash.angle);
            }
        }
    }
}