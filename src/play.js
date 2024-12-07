class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
        this.fields = [];
        this.stage3Counter = 0;
        this.dayCounter = 0;
        this.undoStack = []; // Initialize undo stack
        this.redoStack = []; 
        
    }

    preload() {
        this.load.image('background', './assets/Background.png');
        this.load.image('field', './assets/Field.png');
        this.load.image('Sunflower', './assets/Sunflower1.png');
        this.load.image('Sunflower2', './assets/Sunflower2.png');
        this.load.image('Sunflower3', './assets/Sunflower3.png');
        this.load.image('Herb', './assets/Herb1.png');
        this.load.image('Herb2', './assets/Herb2.png');
        this.load.image('Herb3', './assets/Herb3.png');
        this.load.image('Mushroom', './assets/Mush1.png');
        this.load.image('Mushroom2', './assets/Mush2.png');
        this.load.image('Mushroom3', './assets/Mush3.png');
        this.load.image('farmer', './assets/farmer.png');
    }

    create() {
        this.keyA = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.input.keyboard.on('keydown-ONE', () => {
            this.loadGameState(1); // Load slot 1
        });
        
        this.input.keyboard.on('keydown-TWO', () => {
            this.loadGameState(2); // Load slot 2
        });
        
        this.input.keyboard.on('keydown-THREE', () => {
            this.loadGameState(3); // Load slot 3
        });

        let background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        background.setScale(0.86, 0.86);

        const gridStartX = 60;
        const gridStartY = 240;
        const gridCols = 7;
        const gridRows = 4;
        const fieldSize = 64;
        let fieldIndex = 0;

        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const x = gridStartX + col * fieldSize;
                const y = gridStartY + row * fieldSize;
                let fieldSprite = this.add.image(x, y, 'field').setOrigin(0);
                fieldSprite.setScale(0.2, 0.2);
                fieldSprite.setInteractive();

                let field = {
                    index: fieldIndex,
                    sprite: fieldSprite,
                    waterLevel: 0,
                    sunLevel: 0,
                    plantLevel: 0
                };
                this.fields.push(field);
                fieldIndex++;

                fieldSprite.on('pointerdown', () => {
                    if (this.farmer) {
                        const distance = Phaser.Math.Distance.Between(
                            this.farmer.x,
                            this.farmer.y,
                            field.sprite.x + field.sprite.displayWidth / 2,
                            field.sprite.y + field.sprite.displayHeight / 2
                        );
                        const range = 130;
                        if (distance > range) {
                            console.log(`Field ${field.index} is out of range (${distance.toFixed(1)}px).`);
                            return;
                        }
                    }
                    this.handleFieldSelection(field);
                    this.showWaterAndSunText(field);
                });
            }
        }

        this.counterText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 6,
            `Plants at stage 3: ${this.stage3Counter}`,
            { font: '20px Arial' }
        );
        this.counterText.setOrigin(0.5, 1);

        this.farmer = this.add.sprite(75, 75, 'farmer');
        this.farmer.setScale(0.5, 0.5);

        this.dayText = this.add.text(
            50,
            this.cameras.main.height - 6,
            `Days: ${this.dayCounter}`,
            { font: '20px Arial' }
        );
        this.dayText.setOrigin(0.5, 1);

        const button = this.add.text(350, 20, 'Next Day', {
            fontSize: '20px',
            backgroundColor: '#21a99c',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setInteractive();
        button.on('pointerdown', () => {
            this.dayCounter++;
            this.dayText?.setText(`Days: ${this.dayCounter}`);
            this.assignRandomLevels();
            this.saveGameState();
        });

        // Handle prompt for continuing previous game
        this.handleGameStatePrompt();

        // Save/Load buttons
        this.setupSaveLoadButtons();

        setInterval(() => {
            this.saveGameState();
            console.log("Game auto-saved");
        }, 60000);

        // Undo and Redo buttons
        this.setupUndoRedoButtons();

        this.undoStack.push(this.getCurrentState()); // Initialize undo stack
    }

    update() {
        if (this.farmer) {
            const moveSpeed = 3;
            if (this.keyA && this.keyA.isDown) {
                this.farmer.x -= moveSpeed;
            } else if (this.keyD && this.keyD.isDown) {
                this.farmer.x += moveSpeed;
            }
            if (this.keyW && this.keyW.isDown) {
                this.farmer.y -= moveSpeed;
            } else if (this.keyS && this.keyS.isDown) {
                this.farmer.y += moveSpeed;
            }
        }
    
        if (this.fields && this.fields.length > 0) {
            this.fields.forEach(field => {
                const waterThreshold = 50;
                const sunThreshold = 50;
                const finalWaterThreshold = 100;
                const finalSunThreshold = 80;
    
                const neighborsWithPlants = this.getNeighbors(field).filter(neighbor => neighbor.plantLevel > 0).length;
                const adjustedWaterThreshold = waterThreshold + 10 * neighborsWithPlants;
                const finalAdjustedWaterThreshold = finalWaterThreshold + 10 * neighborsWithPlants;
    
                if (field.waterLevel >= adjustedWaterThreshold && field.sunLevel >= sunThreshold) {
                    if (field.plantLevel === 1) {
                        this.updatePlantTexture(field, 2);
                        field.waterLevel -= adjustedWaterThreshold;
                    }
                }
    
                if (field.waterLevel >= finalAdjustedWaterThreshold && field.sunLevel >= finalSunThreshold) {
                    if (field.plantLevel === 2) {
                        this.updatePlantTexture(field, 3);
                        this.incrementCounter();
                        field.waterLevel -= finalWaterThreshold;
                    }
                }
            });
        }
    
        if (this.stage3Counter >= 10) {
            this.winText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                `You Win!`,
                { font: '100px Arial', fontStyle: 'bold', color: '#21a99c' }
            );
            this.winText.setOrigin(0.5, 0.5);
        }
    }
    
    incrementCounter() {
        this.stage3Counter++;
        if (this.counterText) {
            this.counterText.setText(`Plants at stage 3: ${this.stage3Counter}`);
        }
    }

    assignRandomLevels() {
        this.fields.forEach(field => {
            field.waterLevel += Phaser.Math.Between(0, 10);
            field.sunLevel = Phaser.Math.Between(0, 100);
        });
        console.log("Random levels assigned to fields:", this.fields);
    }

    handleFieldSelection(field) {
        // Deselect the previous field
        if (this.reapButton) this.reapButton.destroy();
        if (this.sowButton) this.sowButton.destroy();
        
        // Display Reap and Sow buttons
        const buttonY = field.sprite.y - 20;
        this.reapButton = this.add.text(field.sprite.x - 20, buttonY, 'Reap', {
            fontSize: '14px',
            backgroundColor: '#ff6666',
            padding: { x: 7, y: 3 },
        }).setInteractive();
    
        this.sowButton = this.add.text(field.sprite.x + 30, buttonY, 'Sow', {
            fontSize: '14px',
            backgroundColor: '#66cc66',
            padding: { x: 7, y: 3 },
        }).setInteractive();
    
        // Reap button functionality
        this.reapButton.on('pointerdown', () => {
            console.log(`Reaped field ${field.index}`);
            this.undoStack.push(this.getCurrentState()); // Save the current state before reaping
            this.redoStack = [];  // Clear redo stack after a new action
            field.sprite.setTexture('field');
            
            // Reset plant state
            if (field.plantLevel === 3) {
                this.stage3Counter--;
                this.counterText.setText(`Plants at stage 3: ${this.stage3Counter}`);
            }
            field.plantLevel = 0;
            this.saveGameState();
        });
    
        // Sow button functionality
        this.sowButton.on('pointerdown', () => {
            this.undoStack.push(this.getCurrentState()); // Save the current state before sowing
            this.redoStack = [];
            this.showSowMenu(field);
            this.saveGameState();
        });
    
        // Close buttons if clicking outside
        this.input.on('pointerdown', (_pointer, currentlyOver) => {
            const clickedField = currentlyOver.find(obj => this.fields.some(field => field.sprite === obj));
            if (!clickedField) {
                if (this.reapButton) this.reapButton.destroy();
                if (this.sowButton) this.sowButton.destroy();
            }
            this.saveGameState();
        });
    }
    
    showSowMenu(field) {
        // Show plant choices near the selected field
        const options = ['Sunflower', 'Mushroom', 'Herb'];
        const optionY = field.sprite.y - 20;
        const choiceTexts = [];
    
        options.forEach((key, index) => {
            // Create button for each option
            const choiceText = this.add.text(field.sprite.x + index * 80 - 80, optionY, key, {
                fontSize: '12px',
                backgroundColor: '#358f39',
                padding: { x: 5, y: 2 },
            }).setInteractive();
            
            // Update field with selected plant
            choiceText.on('pointerdown', () => {
                console.log(`Planted ${key} on field ${field.index}`);
                field.sprite.setTexture(key);
                field.plantLevel = 1;
                choiceTexts.forEach(text => text.destroy());  // Remove plant choice buttons
            });
            choiceTexts.push(choiceText);
        });
    }
    
    reap(field) {
        if (field.plantLevel === 3) {
            this.undoStack.push(this.getCurrentState());
            field.plantLevel = 0;
            this.updatePlantTexture(field, 0);
            this.stage3Counter--;
            
            this.redoStack = [];
            this.counterText?.setText(`Plants at stage 3: ${this.stage3Counter}`);
        } else {
            console.log(`No plant to reap in field ${field.index}`);
        }
    }

    sow(field) {
        if (field.plantLevel === 0) {
            // Create plant selection menu
            this.undoStack.push(this.getCurrentState());
            this.createPlantSelectionMenu(field);
            
            this.redoStack = [];
        } else {
            console.log(`Field ${field.index} already has a plant`);
        }
    }

    updatePlantTexture(field, level) {
        let textureKey = '';

        switch (level) {
            case 1:
                textureKey = this.getNextTexture(field.sprite.texture.key, 1);
                console.log("1");
                break;
            case 2:
                textureKey = this.getNextTexture(field.sprite.texture.key, 2);
                console.log("2");
                break;
            case 3:
                textureKey = this.getNextTexture(field.sprite.texture.key, 3);
                console.log("3");
                break;
        }

        if (textureKey) {
            field.sprite.setTexture(textureKey);
            field.plantLevel = level;
            console.log("Next stage: " + field.plantLevel);
            console.log("textureKey: " + textureKey);
        }
    }

    getNextTexture(currentTexture, stage) {
        const plantMap = {
            'Sunflower': ['Sunflower', 'Sunflower2', 'Sunflower3'],
            'Mushroom': ['Mushroom', 'Mushroom2', 'Mushroom3'],
            'Herb': ['Herb', 'Herb2', 'Herb3'],
        };
    
        const plantTextures = plantMap[currentTexture];
    
        if (!plantTextures) {
            console.error(`Texture key "${currentTexture}" not found in plantMap.`);
            return currentTexture; // Return the original texture if not found
        }
    
        if (stage < plantTextures.length) {
            return plantTextures[stage - 1];
        }
        return currentTexture;
    }
    

    getNeighbors(field) {
        const neighbors = [];
        const fieldIndex = field.index;
        const gridCols = 7;
        const gridRows = 4;
        const row = Math.floor(fieldIndex / gridCols);
        const col = fieldIndex % gridCols;
        if (!this.fields || this.fields.length === 0) {
            console.error('Fields array is empty or not initialized!');
            return neighbors;
        }
        // Check neighbors in 4 directions (up, down, left, right)
        if (row > 0) neighbors.push(this.fields[fieldIndex - gridCols]);
        if (row < gridRows - 1) neighbors.push(this.fields[fieldIndex + gridCols]);
        if (col > 0) neighbors.push(this.fields[fieldIndex - 1]);
        if (col < gridCols - 1) neighbors.push(this.fields[fieldIndex + 1]);
        return neighbors;
    }

    saveGameState() {
        const currentState = this.getCurrentState();
        this.undoStack.push(currentState);  // Always push the current state to undo stack
        localStorage.setItem('gameState', JSON.stringify(currentState));  // Save to localStorage
        console.log("Game state saved", currentState);  // For debugging
        this.redoStack = [];  // Clear redo stack after a new action
    }
    
    getCurrentState() {
        return {
            fields: this.fields.map(field => ({
                index: field.index,
                plantLevel: field.plantLevel,
                waterLevel: field.waterLevel,
                sunLevel: field.sunLevel,
                plantTexture: field.sprite.texture.key  // Save the texture key as well
            })),
            farmerPosition: { x: this.farmer.x, y: this.farmer.y },
            dayCounter: this.dayCounter,
            stage3Counter: this.stage3Counter
        };
    }
    
    restoreState(state) {
        // Restore fields
        state.fields.forEach(savedField => {
            const field = this.fields[savedField.index];
            field.plantLevel = savedField.plantLevel;
            field.waterLevel = savedField.waterLevel;
            field.sunLevel = savedField.sunLevel;
            field.sprite.setTexture(savedField.plantTexture); 
            this.counterText?.setText(`Plants at stage 3: ${this.stage3Counter}`);
    this.dayText?.setText(`Days: ${this.dayCounter}`);
    console.log("State restored, updating UI."); // Restore the texture
        });
    
        // Restore farmer position
        if (state.farmerPosition) {
            this.farmer.setPosition(state.farmerPosition.x, state.farmerPosition.y);
        }
    
        // Restore counters
        this.dayCounter = state.dayCounter || 0;
        this.dayText.setText(`Days: ${this.dayCounter}`);
        this.stage3Counter = state.stage3Counter || 0;
        this.counterText.setText(`Plants at stage 3: ${this.stage3Counter}`);
    }
    undo() {
        if (this.undoStack.length > 1) {
            const currentState = this.undoStack.pop(); // Remove the latest state
            this.redoStack.push(currentState); // Save the current state for redo
            const previousState = this.undoStack[this.undoStack.length - 1]; // Peek at the new top of the stack
            this.restoreState(previousState); // Restore the previous state
            console.log('Undo performed.');
        } else {
            console.log("Nothing to undo.");
        }
    }
    
    redo() {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop(); // Get the most recent undone state
            this.undoStack.push(this.getCurrentState()); // Save the current state to the undo stack
            this.restoreState(nextState); // Restore the state
            console.log('Redo performed.');
        } else {
            console.log("Nothing to redo.");
        }
    }
    
    
    handleGameStatePrompt() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const promptText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
                'Do you want to load the saved game? Y/N.', 
                { font: '20px Arial', color: '#ff0000', wordWrap: { width: 500 } }
            ).setOrigin(0.5, 0.5);
    
            this.input.keyboard.once('keydown-Y', () => {
                this.restoreState(JSON.parse(savedState)); // Load the saved state
                promptText.setText('Game Loaded!');
                this.undoStack = [this.getCurrentState()]; // Reset undo stack after loading game state
                this.redoStack = []; // Clear redo stack
                this.time.delayedCall(1000, () => promptText.destroy());
            });
    
            this.input.keyboard.once('keydown-N', () => {
                localStorage.removeItem('gameState'); // Clear saved state
                promptText.setText('Starting a new game...');
                this.undoStack = [this.getCurrentState()]; // Initialize undo stack for new game
                this.redoStack = []; // Reset redo stack
                this.time.delayedCall(1000, () => promptText.destroy());
            });
        } else {
            // Handle case for no saved state
            const promptText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
                'No saved game found. Starting a new game...', 
                { font: '20px Arial', color: '#ff0000', wordWrap: { width: 500 } }
            ).setOrigin(0.5, 0.5);
            
            this.undoStack = [this.getCurrentState()]; // Initialize undo stack for new game
            this.redoStack = []; // Initialize redo stack
            this.time.delayedCall(1000, () => promptText.destroy());
        }
    }
    
    
    setupSaveLoadButtons() {
        for (let slot = 1; slot <= 3; slot++) {
            const saveButton = this.add.text(350, 70 + (slot - 1) * 50, `Save Slot ${slot}`, {
                fontSize: '20px',
                backgroundColor: '#21a99c',
                padding: { x: 20, y: 10 },
                align: 'center'
            }).setInteractive();
    
            saveButton.on('pointerdown', () => {
                const currentState = this.getCurrentState();
                localStorage.setItem(`gameStateSlot${slot}`, JSON.stringify(currentState));
                console.log(`Game saved to slot ${slot}`);
                const promptText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    `Saved to slot ${slot}`,
                    { font: '20px Arial', color: '#ffffff' }
                ).setOrigin(0.5, 0.5);
    
                this.time.delayedCall(1000, () => promptText.destroy()); // Remove text after 1 second
            });
        }
    
        // Load buttons for slots
        for (let slot = 1; slot <= 3; slot++) {
            const loadButton = this.add.text(500, 70 + (slot - 1) * 50, `Load Slot ${slot}`, {
                fontSize: '20px',
                backgroundColor: '#21a99c',
                padding: { x: 20, y: 10 },
                align: 'center'
            }).setInteractive();
    
            loadButton.on('pointerdown', () => {
                this.loadGameState(slot);
            });
        }
    }

    setupUndoRedoButtons() {
        // Create Undo button
        const undoButton = this.add.text(30, 20, 'Undo', {
            fontSize: '20px',
            backgroundColor: 'green',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setInteractive();
    
        undoButton.on('pointerdown', () => {
            this.undo();
            console.log("Undo action performed");
        });
    
        // Create Redo button
        const redoButton = this.add.text(130, 20, 'Redo', {
            fontSize: '20px',
            backgroundColor: '#f0a500',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setInteractive();
    
        redoButton.on('pointerdown', () => {
            this.redo();
            console.log("Redo action performed");
        });
    }
    loadGameState(slot = 1) {
        const savedState = localStorage.getItem(`gameStateSlot${slot}`);
        if (savedState) {
            this.restoreState(JSON.parse(savedState)); // Restore the saved state
            console.log(`Game state loaded from slot ${slot}`);
            const promptText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                `Loaded save slot ${slot}`,
                { font: '20px Arial', color: '#ffffff' }
            ).setOrigin(0.5, 0.5);

            this.time.delayedCall(1000, () => promptText.destroy()); // Remove text after 1 second
        } else {
            console.log(`No saved game found in slot ${slot}`);
            const promptText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                `No save found in slot ${slot}`,
                { font: '20px Arial', color: '#ff0000' }
            ).setOrigin(0.5, 0.5);

            this.time.delayedCall(1000, () => promptText.destroy()); // Remove text after 1 second
        }
    }
showWaterAndSunText(field) {
    if (this.waterText) {
        this.waterText.destroy();
    }
    if (this.sunText) {
        this.sunText.destroy();
    }
    this.waterText = this.add.text(
        20, 
        70, 
        `Water: ${field.waterLevel}`, 
        { font: '14px Arial', fill: 'white' }
    );

    // Display sun level text at a fixed position, just below the water level text
    this.sunText = this.add.text(
        20, 
        90, 
        `Sun: ${field.sunLevel}`,
        { font: '14px Arial', fill: 'white' }
    );
}
}
