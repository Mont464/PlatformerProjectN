class lifeScene extends Phaser.Scene {
    constructor() {
        super("lifeScene");
        this.playerLives = [];
        this.owner = null;
    }

    create() {
        //create three heart sprites in the top left representing the player's lives
        for (let i = 0; i < 3; i++) {
            this.playerLives.push(this.add.sprite(50 + (100 * i), 50, "lives").setScale(6));
        }
    }

    setOwner(s) {
        //tell the UI which scene it is over
        this.owner = s;
    }

    loseLife() {
        //remove the right heart and handle loss event
        this.playerLives[this.playerLives.length - 1].y = -200;
        this.playerLives[this.playerLives.length - 1].destroy();
        this.playerLives.splice(this.playerLives.length - 1, 1);
        if (this.playerLives.length == 0) {
            this.game.sound.stopAll();
            this.sound.play("deadSfx");
            this.scene.stop(this.owner);
            this.scene.start("failScene");
        }
    }

    winClear() {
        for (let i = 0; i < this.playerLives.length; i++) {
            this.playerLives[i].y = -200;
            this.playerLives[i].destroy();
            this.playerLives.splice(i, 1);
        }
        this.scene.stop(this.owner);
        this.scene.start("endScene");
    }
}