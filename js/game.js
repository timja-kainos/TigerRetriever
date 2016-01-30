var TigerRetriever = TigerRetriever || {};

TigerRetriever.Game = function(){
    this.INIT_HERD_SIZE = 3;
};

TigerRetriever.Game.prototype = {
    preload: function() {
        this.game.time.advancedTiming = true;
    },
    create: function() {

        this.map = this.game.add.tilemap('level1');

        //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
        this.map.addTilesetImage('tiles_spritesheet', 'gameTiles');

        //create layers
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        //collision on blockedLayer
        this.map.setCollisionBetween(1, 5000, true, 'blockedLayer');

        //resizes the game world to match the layer dimensions
        this.backgroundlayer.resizeWorld();

        //create array of herd members
        this.herd = this.newHerd(this.INIT_HERD_SIZE);

        //the camera will follow the player in the world
        this.game.camera.follow(this.herdLeader());

        //move player with cursor keys
        this.cursors = this.game.input.keyboard.createCursorKeys();
    },

    //find objects in a Tiled layer that containt a property called "type" equal to a certain value
    findObjectsByType: function(type, map, layerName) {
        var result = new Array();
        map.objects[layerName].forEach(function(element){
            if(element.properties.type === type) {
                //Phaser uses top left, Tiled bottom left so we have to adjust
                //also keep in mind that some images could be of different size as the tile size
                //so they might not be placed in the exact position as in Tiled
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },
    //create a sprite from an object
    createFromTiledObject: function(element, group) {
        var sprite = group.create(element.x, element.y, element.properties.sprite);

        //copy all properties to the sprite
        Object.keys(element.properties).forEach(function(key){
            sprite[key] = element.properties[key];
        });
    },
    update: function() {
        //collisions
        this.updateHerd();

        //only respond to keys and keep the speed if the player is alive
        //check herd still living animals
        var alive = false;
        this.herd.forEach(function (animal) {
            if (animal.alive) {
                alive = true;
            }
        });
        if(alive) {
            this.herd.forEach(function (animal) {
                animal.body.velocity.x = 300;
            });

            if(this.cursors.up.isDown) {
                this.jumpHerd(this.herdLeader().body.x);
            }
            else if(this.cursors.down.isDown) {
                this.playersDuck();
            }

            if(!this.cursors.down.isDown && this.herd[0].isDucked && !this.pressingDown) {
                //change image and update the body size for the physics engine
                this.herd.forEach(function (animal) {
                    animal.loadTexture('player');
                    animal.body.setSize(animal.standDimensions.width, animal.standDimensions.height);
                    animal.isDucked = false;
                });
            }

            //restart the game if reaching the edge
            if(this.herd[0].x >= this.game.world.width) {
                this.game.state.start('Game');
            }
        }

    },
    animalHit: function(animal, blockedLayer) {
        //if hits on the right side, die
        if(animal.body.blocked.right) {
            //set to dead (this doesn't affect rendering)
            animal.alive = false;

            //stop moving to the right
            animal.body.velocity.x = 0;

            //change sprite image
            animal.loadTexture('playerDead');

            //check herd still living animals
            var gameOver = true;
            this.herd.forEach(function (animal) {
                if (animal.alive) {
                    gameOver = false;
                }
            });

            //go to gameover after a few miliseconds
            if (gameOver) {
                this.game.time.events.add(1500, this.gameOver, this);
            }
        }
    },
    gameOver: function() {
        this.game.state.start('Game');
    },
    jumpHerd: function(x) {
        this.herd.forEach(function (member) {
            if (member.body.blocked.down) {
                member.jumpPoints.push(x);
            }
        });
    },
    playersDuck: function() {
        this.herd.forEach(function (animal) {
           //change image and update the body size for the physics engine
           animal.loadTexture('playerDuck');
           animal.body.setSize(animal.duckedDimensions.width, animal.duckedDimensions.height);

           //we use this to keep track whether it's ducked or not
           animal.isDucked = true;
        });
    },
    render: function()
    {
        this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");
        //this.herd.forEach(function (animal) {
        //    this .game.debug.bodyInfo(animal, 0, 80);
        //}, this);
    },
    newHerd: function(size)
    {
        var members = [];
        for (i = 0; i < size; i++) {
            //make new member of the herd
            var member = this.game.add.sprite(100 + i * 70, 100, 'player');
            member.animations.add('right', [0,1,2,3,4,5,6], 10, true);

            //enable physics on the member
            this.game.physics.arcade.enable(member);

            //player gravity
            member.body.gravity.y = 1000;

            //properties when the member is ducked and standing, so we can use in update()
            var playerDuckImg = this.game.cache.getImage('playerDuck');
            member.duckedDimensions = {width: playerDuckImg.width, height: playerDuckImg.height};
            member.standDimensions = {width: member.width, height: member.height};
            member.anchor.setTo(0.5, 1);

            member.jumpPoints = [];

            members.push(member);
        }
        return members;
    },
    updateHerd: function() {
        this.herd.forEach(function(member) {
            this.game.physics.arcade.collide(member, this.blockedLayer, this.animalHit, null, this);
            member.animations.play('right');
            //member has pending jumps
            if (member.jumpPoints.length) {
                console.log(member.jumpPoints);
                var nextX = member.jumpPoints[0];
                if (member.body.x > nextX) {
                    member.body.velocity.y -= 500;
                    member.jumpPoints.shift();
                }
            }
        }, this);
    },
    herdLeader: function() {
        var lead = this.herd[0];
        for (i = 1; i < this.herd.length; i++) {
            if (this.herd[i].x > lead.x) {
                lead = this.herd[i];
            }
        }
        return lead;
     }
};