let config =
{
    type: Phaser.AUTO,
    parent: 'type',
    width: 512,
    height: 512,
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 200 },
        },
      },
    scene: [ Play ],
}
const game = new Phaser.Game(config)
let keyW, keyA, keyS, keyD
