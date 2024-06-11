class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 350;
        this.VELOCITY = 150;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 800;
        this.JUMP_VELOCITY = -250;
        this.PARTICLE_VELOCITY = 50;
        this.JUMP_DRAG = 70;
        this.jumpsDone = 0;
        this.maxJumps = 1;
        this.SCALE = 5.65;
        this.coinCollect = 0;
        this.respawn = [game.config.width/40, game.config.height/12];
        this.dead = false;
        this.walkCtr = 0;
        this.tempCheck = [];
        my.sprite.enemies = [];
        this.playerLives = [];
        my.sprite.enemyBullet = [];
        this.enemyBulletCooldownCounter = 0;
        this.bulletGroup;
        this.bulletVals = [];
        this.aimDir = "right";
        this.attackCooldown = 0;
        this.groundLayer;
        this.hasSword = false;
        this.levelSong;
    }

    create() {
        this.levelSong = this.sound.add("lev1Music");
        this.levelSong.play({"loop" : true});

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 16, 16, 80, 10);
        this.physics.world.setBounds(0, 0, 120*16, 10*16);
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("World-1-D-packed", "tilemap_tiles");

        // Create a layer
        this.background = this.map.createLayer("Background", this.tileset, 0, 0);
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

        this.chest = this.map.createFromObjects("Chest", {
            name: "chest",
            key: "tilemap_sheet",
            frame: 389
        });

        this.bullets = [];

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/40, game.config.height/12, "Tiles/Transparent/tile_0260b.png").setScale(0.66);
        my.sprite.player.setSize(16, 16, true);
        my.sprite.player.setOffset(0, 0);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.body.setMaxVelocityX(this.VELOCITY);

        for (let i = 0; i < 3; i++) {
            this.playerLives.push(this.add.sprite(10 + (20 * i), 10, "lives"));
        }

        my.sprite.slash = this.physics.add.sprite(my.sprite.player.x + 6, my.sprite.player.y, "slash1").setScale(0.05);
        //my.sprite.slash.angle += 20;
        //console.log(my.sprite.slash.angle);
        my.sprite.slash.body.setAllowGravity(false);
        my.sprite.slash.setCircle(200, 50, 50);
        my.sprite.slash.visible = false;


        // animated checkpoint fire sprite
        my.sprite.fire = this.add.sprite(game.config.width, game.config.height/12, "fire1");
        my.sprite.fire.visible = false;
        my.sprite.fire.setScale(0.04);

        // enemy paths
        this.smallPoints = [
            937.5, game.config.height/40,
            1000, game.config.height/40
        ];
        this.smallCurve = new Phaser.Curves.Spline(this.smallPoints);

        this.vertPoints = [
            905.5, game.config.height/6.6,
            905.5, game.config.height/8
        ];
        this.vertCurve = new Phaser.Curves.Spline(this.vertPoints);

        //console.log(game.config.height);

        this.vert2Points = [
            1417.5, 26,
            1417.5, 74
        ];
        this.vert2Curve = new Phaser.Curves.Spline(this.vert2Points);

        this.vert3Points = [
            1558, 74,
            1558, 26
        ];
        this.vert3Curve = new Phaser.Curves.Spline(this.vert3Points);

        let enemy1 = this.add.follower(this.smallCurve, 937.5, game.config.height/40, "enemyFrame1");
        my.sprite.enemies.push({"sprite":enemy1, "coolDown":25, "shotDir":"down"});
        let enemy2 = this.add.follower(this.vertCurve, 905.5, game.config.height/6.6, "enemyFrame1");
        my.sprite.enemies.push({"sprite":enemy2, "coolDown":35, "shotDir":"right"});
        let enemy3 = this.add.follower(this.vert2Curve, 1417.5, 26, "enemyFrame1").setScale(0.75);
        my.sprite.enemies.push({"sprite":enemy3, "coolDown":40, "shotDir":"right"});
        let enemy4 = this.add.follower(this.vert3Curve, 1558, 74, "enemyFrame1").setScale(0.75);
        my.sprite.enemies.push({"sprite":enemy4, "coolDown":40, "shotDir":"left"}); 


        for (let e of my.sprite.enemies) {
            e["sprite"].anims.play("enemy");
            e["sprite"].startFollow({from: 0, to: 1, delay: 0, duration: 5000, repeat: -1, yoyo: true, rotateToPath: false, rotationOffset: -90});
        }


        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.kill, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.checkpoint, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.chest, Phaser.Physics.Arcade.STATIC_BODY);

        //this.physics.world.enable(this.bullets, Phaser.Physics.Arcade.STATIC_BODY);
        
        my.vfx.walking = this.add.particles(5, 5, "kenny-particles", {
            frame: ['star_05.png', 'star_01.png'],
            // TODO: Try: add random: true
            scale: {start: 0.01, end: 0.03},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 250,
            // TODO: Try: gravityY: -400,
            gravityY: -100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping = this.add.particles(5, 5, "kenny-particles", {
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
            scale: {start: 0.1, end: 0.3},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 150,
            // TODO: Try: gravityY: -400,
            //gravityY: -100,
            alpha: {start: 1, end: 0.1},
            duration: 150,
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

        this.bulletGroup =  this.add.group(this.bullets);

        this.chestGroup = this.add.group(this.chest);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            if (this.attackCooldown == 0 && this.hasSword == true) {
                my.sprite.slash.visible = true;
                my.sprite.slash.anims.play("slash", false);
                this.attackCooldown = 25;
                this.sound.play("slashSfx");
            }
        });

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-N', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
            console.log(my.sprite.player.x);
            console.log(my.sprite.player.y);
        }, this);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(0, 100);
        this.cameras.main.setZoom(this.SCALE);

        //console.log(this.cameras.main);

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
                this.levelSong.stop();
                this.sound.play("exitSfx");
                this.scene.start("endScene");
            }
        });

        this.physics.add.overlap(my.sprite.player, this.chestGroup, (s1, s2) => {
            if(s2.frame.name == 389) {
                this.sound.play("chestSfx");
                this.chestGroup.children.entries[0].setFrame(390);
                this.hasSword = true;
                my.text.teach = this.add.text(1816, 50, "SWORD AQUIRED", {fontFamily: "'Jersey 15'", fontSize: 150, color: "#fff"}).setOrigin(0.5).setScale(0.1);
                my.text.teachSword = this.add.text(1816, 70, "Press Mouse1 to Attack", {fontFamily: "'Jersey 15'", fontSize: 100, color: "#fff"}).setOrigin(0.5).setScale(0.1);
            }
        });

        this.physics.add.overlap(my.sprite.player, this.killGroup, (s1, s2) => {
            this.dead = true;
        });

        this.physics.add.overlap(my.sprite.player, this.bulletGroup, (s1, s2) => {
            if(!this.dead) {
                console.log(s2);
                s2.y = -100;
                s2.destroy();
                s2.visible = false;
                this.bulletGroup.children.entries.splice(this.bulletGroup.children.entries.indexOf(s2), 1);
                this.bulletVals.splice(this.bulletGroup.children.entries.indexOf(s2), 1);
                this.dead = true;
            }
            //console.log(this.bulletGroup);
        });
        
        //console.log(this.groundLayer);
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

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/10)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/10)) return false;
        return true;
    }

    update() {
        
        //console.log(this.bulletGroup)

        //console.log(this.bulletGroup.children.entries[0]);

        this.enemyBulletCooldownCounter += 0.5;
        if (this.enemyBulletCooldownCounter > 12) {
            this.enemyBulletCooldownCounter == 1
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        this.walkCtr++;
        if (this.walkCtr >= 30) {
            this.walkCtr = 0;
        }

        for(let c of this.coins) {
            if(c.active == true) {
                c.anims.play('coin', true);
            }
        }

        for (let i = 0; i < my.sprite.enemies.length; i++) {
            let enemy = my.sprite.enemies[i];
            //console.log(enemy);
            //console.log(enemy.texture.key);
            if(this.enemyBulletCooldownCounter % enemy.coolDown == 0) {
                let tempShot = this.physics.add.sprite(enemy.sprite.x, enemy.sprite.y, "enemyShot").setScale(0.03);
                tempShot.body.setAllowGravity(false);
                tempShot.setCircle(64, 230, 230);
                tempShot.setCollideWorldBounds(true);
                //console.log(tempShot);
                if (enemy.shotDir == "right") {
                    tempShot.body.setVelocityX(70);
                }
                else if (enemy.shotDir == "left") {
                    tempShot.body.setVelocityX(-70);
                }
                else if (enemy.shotDir == "down") {
                    //console.log("setting velocity");
                    tempShot.body.setVelocityY(70);
                }

                //my.sprite.enemyBullet.push({"sprite":tempShot,"dir":enemy.shotDir, "life":0});
                this.bulletGroup.add(tempShot);
                this.bulletVals.push({"life":0});
                //this.bulletGroup.children.entries[this.bulletGroup.children.entries.length-1].anims.play("shot");
            }
        }

        for(let i = 0; i < this.bulletGroup.getLength(); i++) {
            let bullet = this.bulletGroup.children.entries[i];
            let vals = this.bulletVals[i];

            bullet.angle += 2;
            vals.life += 1;
        }

        for (let i = 0; i < my.sprite.enemies.length; i++) {
            let enemy = my.sprite.enemies[i].sprite;
            if (this.collides(my.sprite.player, enemy)) {
                this.dead = true;
                break;
            }
        }

        if(this.dead && my.sprite.player.visible == true) {
            my.vfx.death.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2, false);
            my.vfx.death.start();
            my.sprite.player.visible = false;
            this.sound.play("deadSfx");
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setVelocityX(0);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            this.playerLives[this.playerLives.length - 1].y = -200;
            this.playerLives[this.playerLives.length - 1].destroy();
            this.playerLives.splice(this.playerLives.length - 1, 1);
            if (this.playerLives.length == 0) {
                this.levelSong.stop();
                this.scene.start("failScene");
            }
            setTimeout(() => { 
                my.vfx.death.stop();
                my.sprite.player.x = this.respawn[0];
                my.sprite.player.y = this.respawn[1];
                my.sprite.player.visible = true;
                this.dead = false;
            }, 200);
        }

        else {
            if(cursors.left.isDown || this.aKey.isDown) {
                // TODO: have the player accelerate to the left
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                //my.sprite.player.body.setVelocityX(-this.VELOCITY);
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

            } else if(cursors.right.isDown || this.dKey.isDown) {
                // TODO: have the player accelerate to the right
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                //my.sprite.player.body.setVelocityX(this.VELOCITY);
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

            } else if(cursors.up.isDown || this.wKey.isDown) {
                this.aimDir = "up";
            } else if(cursors.down.isDown || this.sKey.isDown) {
                this.aimDir = "down";
            } else {
                // TODO: set acceleration to 0 and have DRAG take over
                my.sprite.player.body.setAccelerationX(0);
                //my.sprite.player.body.setVelocityX(0);
                my.sprite.player.body.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
                my.vfx.walking.stop();
            }

            for (let i = 0; i < this.playerLives.length; i++) {
                this.playerLives[i].x = this.cameras.main.worldView.x + 10 + (20 * i);
            }

            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
                my.sprite.player.body.setDragY(this.JUMP_DRAG);
            }
            else {
                this.jumpsDone = 0;
            }
            if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
                if (this.jumpsDone < this.maxJumps) {
                    my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                    my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                    this.sound.play("jumpSfx");

                    my.vfx.jumping.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
                    my.vfx.jumping.start();
                }
            }

            if (this.aimDir == "right") {
                my.sprite.slash.x = my.sprite.player.x + 8;
                my.sprite.slash.y = my.sprite.player.y;
                my.sprite.slash.angle = -30;
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