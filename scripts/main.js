let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 550,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game( config );

let platforms, player, stars, scoreText, bombs, starsCollectedText;
let score = 0;
let starsCollected = 0;

let colors = [ '0xFFFFFF', '0xff0000', '0xffa500', '0xffff00', '0x00ff00', '0x0000ff', '0x4b0082', '0x9400d3' ];
let currentColor = 0;


function preload() {
    this.load.image( 'layer1', '../assets/background/layer1.png' );
    this.load.image( 'layer2', '../assets/background/layer2.png' );
    this.load.image( 'layer3', '../assets/background/layer3.png' );
    this.load.image( 'layer4', '../assets/background/layer4.png' );
    this.load.image( 'layer5', '../assets/background/layer5.png' );
    this.load.image( 'layer6', '../assets/background/layer6.png' );
    this.load.image( 'ground', '../assets/background/ground.png' );
    this.load.image( 'ground2', '../assets/background/ground2.png' );
    this.load.image( 'star', '../assets/objects/coin.png' );
    this.load.image( 'bomb', '../assets/objects/trap.png' );
    this.load.spritesheet( 'dude', '../assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 } );
    this.load.spritesheet( 'wizard', '../assets/sprites/wizard.png', { frameWidth: 32, frameHeight: 48 } );
}

function create() {
    this.add.image( 0, 0, 'layer1' ).setOrigin( 0, 0 ).setScale( 0.5 );
    this.add.image( 0, 0, 'layer2' ).setOrigin( 0, 0 ).setScale( 0.5 );
    this.add.image( 0, 0, 'layer3' ).setOrigin( 0, 0 ).setScale( 0.5 );
    this.add.image( 0, 0, 'layer4' ).setOrigin( 0, 0 ).setScale( 0.5 );
    this.add.image( 0, 0, 'layer5' ).setOrigin( 0, 0 ).setScale( 0.5 );
    this.add.image( 0, 0, 'layer6' ).setOrigin( 0, 0 ).setScale( 0.5 );


    platforms = this.physics.add.staticGroup();

    platforms.create( 450, 490, 'ground2' ).setScale( 0.5 ).refreshBody();

    platforms.create( 100, 280, 'ground' );
    platforms.create( 620, 350, 'ground' );
    platforms.create( 800, 220, 'ground' );


    player = this.physics.add.sprite( 100, 350, 'dude' );

    player.setBounce( 0.2 );
    player.setCollideWorldBounds( true );

    this.anims.create( {
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider( player, platforms );


    cursors = this.input.keyboard.createCursorKeys();


    stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 50, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);


    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    starsCollectedText = this.add.text( 530, 16, 'Stars collected: 0', { fontSize: '32px', fill: '#000' });


    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);


}

function update() {
    if (cursors.left.isDown)
        {
            player.setVelocityX(-160);
        
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);
        
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
        
            player.anims.play('turn');
        }
        
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText( 'Score: ' + score );

    starsCollected += 1;
    starsCollectedText.setText( 'Stars collected: ' + starsCollected );

    if (starsCollected % 5 == 0) {
        player.setScale(player.scaleX + 0.1, player.scaleY + 0.1);
    }

    if ( currentColor < colors.length - 1 ) {
        currentColor++;
    } else {
        currentColor = 0;
    }

    player.setTint( colors[ currentColor ] );

    if (stars.countActive(true) === 0)
        {
            stars.children.iterate(function (child) {
    
                child.enableBody(true, child.x, 0, true, true);
    
            });
    
            let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
            let bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    
        }

    let x = Phaser.Math.Between( 0, 800 );
    let y = Phaser.Math.Between( 0, 100 );
    let newStar = stars.create( x, y, 'star' );
    newStar.setBounceY(Phaser.Math.FloatBetween( 0.4, 0.8 ));

    if ( starsCollected % 10 === 0 && starsCollected !== 0 ) {
        spawnBomb();
    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    alert( "Game over! A trap has caught you!" );
    player.disableBody( true, true );

    gameOver = true;
}

function spawnBomb() {
    let x = Phaser.Math.Between( 0, 800 );
    let bomb = bombs.create( x, 16, 'bomb' );
    bomb.setBounce( 1 );
    bomb.setCollideWorldBounds( true );
    bomb.setVelocity( Phaser.Math.Between( -200, 200 ), 20 );
}