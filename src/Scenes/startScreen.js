class startScene extends Phaser.Scene {
    constructor() {
        super("startScene");
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        
    }

    create() {
          // update instruction text
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        my.text.title = this.add.text(720, 200, "NOCTRIA", {fontFamily: "'Jersey 15'", fontSize: 72, color: "#fff"}).setOrigin(0.5);
        my.text.title.setScale(2);
        my.text.level1 = this.add.text(720, 500, "P: Level 1 - LOST", {fontFamily: "'Jersey 15'", fontSize: 64, color: "#fff"}).setOrigin(0.5);
        my.text.tutorial = this.add.text(720, 400, "I: Tutorial", {fontFamily: "'Jersey 15'", fontSize: 64, color: "#fff"}).setOrigin(0.5);
    }

    update() {
        if (this.pKey.isDown) {
            this.scene.start("platformerScene");
        }

        if (this.iKey.isDown) {
            this.scene.start("tutorialScene");
        }
    }

}