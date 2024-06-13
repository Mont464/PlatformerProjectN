class startScene extends Phaser.Scene {
    constructor() {
        super("startScene");
        this.titleMusic;
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        
    }

    create() {
        //input keys
        this.zeroKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
        this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.nineKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE);
        this.titleSong = this.sound.add("titleMusic");
        this.titleSong.play({"loop" : true});
        my.text.title = this.add.text(720, 200, "NOCTRIA", {fontFamily: "'Jersey 15'", fontSize: 72, color: "#fff"}).setOrigin(0.5);
        my.text.title.setScale(2);
        my.text.level1 = this.add.text(720, 500, "Press 1: Level 1 - LOST", {fontFamily: "'Jersey 15'", fontSize: 64, color: "#fff"}).setOrigin(0.5);
        my.text.tutorial = this.add.text(720, 400, "Press 0: Tutorial", {fontFamily: "'Jersey 15'", fontSize: 64, color: "#fff"}).setOrigin(0.5);
        my.text.level2 = this.add.text(720, 600, "Press 2: Level 2 - CHAINS", {fontFamily: "'Jersey 15'", fontSize: 64, color: "#fff"}).setOrigin(0.5);
        my.text.credits = this.add.text(720, 800, "Press 9: Credits", {fontFamily: "'Jersey 15'", fontSize: 64, color: "#fff"}).setOrigin(0.5);
    }

    update() {
        if (this.oneKey.isDown) {
            this.titleSong.stop();
                this.scene.start("platformerScene");
            this.scene.start("lifeScene");
        }

        if (this.zeroKey.isDown) {
            this.titleSong.stop();
            this.scene.start("tutorialScene");
        }

        if (this.twoKey.isDown) {
            this.titleSong.stop();
                this.scene.start("platformer2Scene");
            this.scene.start("lifeScene");
        }

        if (this.nineKey.isDown) {
            this.titleSong.stop();
            this.scene.start("creditsScene");
        }
    }

}