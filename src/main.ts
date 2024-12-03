import Phaser from 'phaser';

class MyGame extends Phaser.Scene {
    constructor() {
        super('game');
    }

    preload() {
        this.load.image('background', './Background.png');
        this.load.image('field', './Field.png');
        this.load.image('sunflower1', './Sunflower1.png');
        this.load.image('sunflower2', './Sunflower2.png');
        this.load.image('sunflower3', './Sunflower3.png');
        this.load.image('herb1', './Herb1.png');
        this.load.image('herb2', './Herb2.png');
        this.load.image('herb3', './Herb3.png');
        this.load.image('farmer', './farmer.png');
    }

    create() {
        let background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        background.setScale(0.86, 0.86);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 512,
    height: 512,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 200 },
      },
    },
    scene: MyGame
};

new Phaser.Game(config);
