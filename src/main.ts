import Phaser from 'phaser';

interface Field {
  sprite: Phaser.GameObjects.Image;
  waterLevel: number;
  sunLevel: number;
  plantLevel: number;
}

class MyGame extends Phaser.Scene {
    private fields: Field[] = [];

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
      // Add background
        let background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        background.setScale(0.86, 0.86);

      // Define grid parameters
      const gridStartX = 60;
      const gridStartY = 240;
      const gridCols = 7;
      const gridRows = 4;
      const fieldSize = 64;
      
      // Create grid of fields with properties
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const x = gridStartX + col * fieldSize;
          const y = gridStartY + row * fieldSize;

          let fieldSprite = this.add.image(x, y, 'field').setOrigin(0);
          fieldSprite.setScale(0.2, 0.2);
          fieldSprite.setInteractive();

          let field: Field = {
            sprite: fieldSprite,
            waterLevel: 0,
            sunLevel: 0,
            plantLevel: 0
          };

          const fieldIndex = this.fields.push(field) - 1;

          // Add event listener when player clicks on field
          fieldSprite.on('pointerdown', () => {
            console.log(`Selected field: ${fieldIndex}`, field);
          })

          this.fields.push(field);
        }
      }

      console.log(this.fields);
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
