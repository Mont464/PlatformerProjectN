class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
        this.u;
    }

    preload() {
        this.load.setPath("./assets/");

        // Load character frames
        this.load.image("PlayerStill", "Tiles/Transparent/tile_0260p.png");
        this.load.image("PlayerFrame1", "Tiles/Transparent/tile_0261p.png");
        this.load.image("PlayerFrame2", "Tiles/Transparent/tile_0262p.png");
        this.load.image("PlayerFrame3", "Tiles/Transparent/tile_0263p.png");
        this.load.image("PlayerJump", "Tiles/Transparent/tile_0264p.png");

        //load exit frames
        this.load.image("exit", "Tiles/Transparent/tile_0056.png");
        this.load.image("exitOpen", "Tiles/Transparent/tile_0058.png");

        //load lives sprite
        this.load.image("lives", "Tiles/Transparent/tile_0042.png");

        //enemy frames
        this.load.image("enemyFrame1", "Tiles/Transparent/tile_0383.png");
        this.load.image("enemyFrame2", "Tiles/Transparent/tile_0384.png");
        this.load.image("enemyFrame3", "Tiles/Transparent/tile_0385.png");

        //enemy bullet frames
        this.load.image("enemyShot", "PNG (Transparent)/star_08.png");
        this.load.image("enemyShot1", "PNG (Transparent)/star_05.png");
        this.load.image("enemyShot2", "PNG (Transparent)/star_06.png");
        this.load.image("enemyShot3", "PNG (Transparent)/star_04.png");

        //player attack frames
        this.load.image("slash1", "PNG (Transparent)/twirl_01p.png");
        this.load.image("slash2", "PNG (Transparent)/twirl_02p.png");
        this.load.image("slash3", "PNG (Transparent)/twirl_03p.png");

        //coin frames
        this.load.image("coin1", "Tiles/Transparent/tile_0020y.png");
        this.load.image("coin2", "Tiles/Transparent/tile_0021y.png");
        this.load.image("coin3", "Tiles/Transparent/tile_0022y.png");

        //fire frames
        this.load.image("fire1", "PNG (Transparent)/muzzle_02r.png");
        this.load.image("fire2", "PNG (Transparent)/muzzle_03r.png");
        this.load.image("fire3", "PNG (Transparent)/muzzle_04r.png");
        this.load.image("fire4", "PNG (Transparent)/muzzle_05r.png");

        // Load tilemap information
        this.load.image("tilemap_tiles", "Tilemap/monochrome_tilemap_packed.png");      // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "PlatformerLand.tmj");         // Tilemap in JSON
        this.load.tilemapTiledJSON("platformer-level-0", "Tutorial.tmj");
        this.load.tilemapTiledJSON("platformer-level-2", "level2.tmj"); 
        
        // Load the transparent tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "Tilemap/monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Load audio
        this.load.audio("jumpSfx", "Audio/phaseJump1.ogg");
        this.load.audio("walkSfx", "Audio/footstep_concrete_000.ogg");
        this.load.audio("exitSfx", "Audio/doorClose_4.ogg");
        this.load.audio("deadSfx", "Audio/forceField_004.ogg");
        this.load.audio("coinSfx", "Audio/clothBelt2.ogg");
        this.load.audio("checkSfx", "Audio/powerUp5.ogg");
        this.load.audio("chestSfx", "Audio/metalPot2.ogg");
        this.load.audio("slashSfx", "Audio/drawKnife1.ogg");
        this.load.audio("breakBulletSfx", "Audio/impactMining_001.ogg");
        this.load.audio("titleMusic", "Audio/titleSong.mp3");
        this.load.audio("tutorialMusic", "Audio/Bleeping Demo.mp3");
        this.load.audio("lev1Music", "Audio/Floating Cities.mp3");

        //particle multiatlas
        this.u = this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        //walk animation
        this.anims.create({
            key: 'walk',
            //defaultTextureKey: "platformer_characters",
            frames: [
                { key: "PlayerFrame1"},
                { key: "PlayerFrame2"},
                { key: "PlayerFrame3", duration: -1}
            ],
            frameRate: 15,
            repeat: -1
        });

        //idle animation
        this.anims.create({
            key: 'idle',
            //defaultTextureKey: "platformer_characters",
            frames: [
                { key: "PlayerStill", duration: -1 }
            ],
            repeat: -1
        });

        //jump animation
        this.anims.create({
            key: 'jump',
            //defaultTextureKey: "platformer_characters",
            frames: [
                { key: "PlayerJump", duration: -1 }
            ],
        });

        //death animation
        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNames('kenny-particles', {
                prefix: "star_",
                start: 1,
                end: 3,
                suffix: ".png",
                zeroPad: 2
            }),
            frameRate: 10,
            repeat: -1
        });

        //coin animation
        this.anims.create({
            key: 'coin',
            //defaultTextureKey: "platformer_characters",
            frames: [

                { key: "coin1"},
                { key: "coin2"},
                { key: "coin3"},
                { key: "coin2", duration: -1}
            ],
            frameRate: 10,
            repeat: -1
        });

        //active checkpoint animation
        this.anims.create({
            key: 'fire',
            //defaultTextureKey: "platformer_characters",
            frames: [

                { key: "fire1"},
                { key: "fire2"},
                { key: "fire3"},
                { key: "fire4", duration: -1}
            ],
            frameRate: 10,
            repeat: -1
        });

        //enemy animation
        this.anims.create({
            key: 'enemy',
            //defaultTextureKey: "platformer_characters",
            frames: [

                { key: "enemyFrame1"},
                { key: "enemyFrame2", duration: -1},
            ],
            frameRate: 5,
            repeat: -1
        });

        //enemy bullet animation
        this.anims.create({
            key: 'shot',
            //defaultTextureKey: "platformer_characters",
            frames: [

                { key: "enemyShot1"},
                { key: "enemyShot3"},
                { key: "enemyShot2", duration: -1}
            ],
            frameRate: 5,
            repeat: -1,
            yoyo: true
        });

        //player attack animation
        this.anims.create({
            key: 'slash',
            //defaultTextureKey: "platformer_characters",
            frames: [

                { key: "slash1"},
                { key: "slash2"},
                { key: "slash3", duration: -1}
            ],
            frameRate: 15,
            hideOnComplete: true
        });

         //after load go to start screen
         this.scene.start("startScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}