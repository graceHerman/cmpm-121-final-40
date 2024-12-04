import Phaser from 'phaser';

interface Field {
  index: number;
  sprite: Phaser.GameObjects.Image;
  waterLevel: number;
  sunLevel: number;
  plantLevel: number;
}

class MyGame extends Phaser.Scene {
    private fields: Field[] = [];
    private farmer: Phaser.GameObjects.Sprite | null = null;
    private keyA: Phaser.Input.Keyboard.Key | undefined;
    private keyS: Phaser.Input.Keyboard.Key | undefined;
    private keyD: Phaser.Input.Keyboard.Key | undefined;
    private keyW: Phaser.Input.Keyboard.Key | undefined;
    private stage3Counter: number = 0;
    private counterText: Phaser.GameObjects.Text | undefined;
    private waterText: Phaser.GameObjects.Text | undefined;
    private sunText: Phaser.GameObjects.Text | undefined;
    
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
      //WASD creation
      this.keyA = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);

      // Add background
      let background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
      background.setScale(0.86, 0.86);

      // Define grid parameters
      const gridStartX = 60;
      const gridStartY = 240;
      const gridCols = 7;
      const gridRows = 4;
      const fieldSize = 64;
      let fieldIndex = 0;
      
      // Create grid of fields with properties
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const x = gridStartX + col * fieldSize;
          const y = gridStartY + row * fieldSize;

          let fieldSprite = this.add.image(x, y, 'field').setOrigin(0);
          fieldSprite.setScale(0.2, 0.2);
          fieldSprite.setInteractive();

          let field: Field = {
            index: fieldIndex,
            sprite: fieldSprite,
            waterLevel: 0,
            sunLevel: 0,
            plantLevel: 0
          };

          // Add field object to array
          this.fields.push(field);

          // Increment field index
          fieldIndex++;

          // Add event listener when player clicks on field
          fieldSprite.on('pointerdown', () => {
            if (this.farmer) {
                // Calculate the distance between the farmer and the field
                const distance = Phaser.Math.Distance.Between(
                    this.farmer.x, 
                    this.farmer.y, 
                    field.sprite.x + field.sprite.displayWidth / 2,
                    field.sprite.y + field.sprite.displayHeight / 2,
                );
        
                const range = 130; // Define the range in pixels
                
                // Message if player is out of range
                if (distance > range) {
                    console.log(`Field ${field.index} is out of range (${distance.toFixed(1)}px).`);
                    return;
                }
            }

            // Displays/Destroys water and sun level text
            if (this.waterText) {
                this.waterText.destroy();
            }
            this.waterText = this.add.text(
                this.scale.width / 20,
                this.scale.height / 14,
                `Water Level: ${field.waterLevel}`,
                { color: '#fff', fontSize: 20 }
            );
        
            if (this.sunText) {
                this.sunText.destroy();
            }
            this.sunText = this.add.text(
                this.scale.width / 20,
                this.scale.height / 14 - 20,
                `Sun Level: ${field.sunLevel}`,
                { color: '#fff', fontSize: 20 }
            );
          });

          // Destroys water and sun level text if player clicks off a field
          this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            const clickedField = currentlyOver.find(obj => this.fields.some(field => field.sprite === obj));
    
            if (!clickedField && this.waterText) {
              this.waterText.destroy();
              this.waterText = undefined;
            }

            if (!clickedField && this.sunText) {
              this.sunText.destroy();
              this.sunText = undefined;
            }
          });
        }
      }

      // Stage 3 Plants Counters
      this.counterText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 6,
        `Plants at stage 3: ${this.stage3Counter}`,
        { font: '20px Arial'}
      );
      this.counterText.setOrigin(0.5, 1);

      // Temp counter increase
      this.input?.keyboard?.on('keydown-SPACE', this.incrementCounter, this);
      this.farmer = this.add.sprite(75, 75, 'farmer');
      this.farmer.setScale(0.5, 0.5);

      // Turn button
      const button = this.add.text(400, 300, 'Click Me', {
        fontSize: '32px',
        backgroundColor: '#0088cc',
        padding: { x: 20, y: 10 },
        align: 'center'
      });
      button.setX(this.cameras.main.width - button.width - 10);
      button.setY(10);
      button.setInteractive();

      // Randomize water and sun levels when button is clicked
      button.on('pointerdown', () => {
        console.log('hi');
        this.assignRandomLevels();
      });
    }

    update () {
      //Player Movement
      if (this.farmer) {
      const moveSpeed = 3;
      if (this.keyA!.isDown) {
        this.farmer.x -= moveSpeed;
      } else if (this.keyD!.isDown) {
        this.farmer.x += moveSpeed;
      }
      if (this.keyW!.isDown) {
        this.farmer.y -= moveSpeed;
      } else if (this.keyS!.isDown) {
        this.farmer.y += moveSpeed;
      }
      }
    }

    private incrementCounter() {
      this.stage3Counter++;
      this.counterText?.setText(`Plants at stage 3: ${this.stage3Counter}`);
    }

    // Randomly assigns value to each field's water and sun level
    private assignRandomLevels(): void {
      this.fields.forEach(field => {
          field.waterLevel = Phaser.Math.Between(0, 100);
          field.sunLevel = Phaser.Math.Between(0, 100);
      });
  
      console.log("Random levels assigned to fields:", this.fields);
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
