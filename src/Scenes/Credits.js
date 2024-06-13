class creditsScene extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        
    }

    create() {
        //key to move back to title screen
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        //load looping credits song
        this.creditsSong = this.sound.add("creditsMusic");
        this.creditsSong.play({"loop" : true});

        //Create text
        my.text.title = this.add.text(720, 150, "CREDITS", {fontFamily: "'Jersey 15'", fontSize: 72, color: "#fff"}).setOrigin(0.5);
        my.text.dev = this.add.text(720, 300, "All implementation created by: Alejandro Montoreano", {fontFamily: "'Jersey 15'", fontSize: 60, color: "#fff"}).setOrigin(0.5);
        my.text.kenney = this.add.text(720, 400, "Special thanks to Kenney Assets for providing", {fontFamily: "'Jersey 15'", fontSize: 60, color: "#fff"}).setOrigin(0.5);
        my.text.music = this.add.text(720, 600, "Special thanks to INCOMPETECH for", {fontFamily: "'Jersey 15'", fontSize: 60, color: "#fff"}).setOrigin(0.5);
        my.text.kenney = this.add.text(720, 450, "Royalty Free Sprites and SFX", {fontFamily: "'Jersey 15'", fontSize: 60, color: "#fff"}).setOrigin(0.5);
        my.text.music = this.add.text(720, 650, "providing Royalty Free Soundtracks", {fontFamily: "'Jersey 15'", fontSize: 60, color: "#fff"}).setOrigin(0.5);
        my.text.direction = this.add.text(1000, 850, "Press P to Return to Title Screen", {fontFamily: "'Jersey 15'", fontSize: 50, color: "#fff"}).setOrigin(0.5);
    }

    update() {
        //key listener to move back to title screen
        if (this.pKey.isDown) {
            this.creditsSong.stop();
            this.scene.start("startScene");
        }
    }

}