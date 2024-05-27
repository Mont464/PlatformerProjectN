class endScene extends Phaser.Scene {
    constructor() {
        super("endScene");
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        
    }

    create() {
          // update instruction text
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        my.text.title = this.add.text(720, 200, "LEVEL COMPLETE", {fontFamily: "'Jersey 15'", fontSize: 72, color: "#fff"}).setOrigin(0.5);
        my.text.direction = this.add.text(720, 400, "Press P to Return to Title Screen", {fontFamily: "'Jersey 15'", fontSize: 64, color: "#fff"}).setOrigin(0.5);
    }

    update() {
        if (this.pKey.isDown) {
            this.scene.start("startScene");
        }
    }

}