var JsonGenerator = function () {};
module.exports = JsonGenerator;

var mapHeight = 6;
var minLand = 4;
var maxGap = 3;
var tileWidth = 45;
var tileHeight = 45;
var mapWidth = 300;

JsonGenerator.prototype = {


    recreateInitialJson: function () {
        var layers = [];
        var tilesets = [];
        var background = new Array(mapWidth * mapHeight);
        background.fill(139);

        layers.push(this.makeLayer(background, mapHeight, "backgroundLayer", 1, "tilelayer", true, mapWidth, 0, 0));
        layers.push(this.makeLayer(this.makeMapBase(), mapHeight, "blockedLayer", 1, "tilelayer", true, mapWidth, 0, 0));

        tilesets.push(this.makeTileset(1, "..\/images\/tiles_spritesheet.png", 934, 790, 0, "tiles_spritesheet", 2,
            tileWidth, tileHeight));

        return this.generate(mapHeight, mapWidth, tileWidth, tileHeight, tilesets, layers);
    },
    makeTileset: function (firstgid, imageLocation, imageHeight, imageWidth, margin, name, spacing, tileHeight, tileWidth) {
        return {
            "firstgid": firstgid,
            "image": imageLocation,
            "imageheight": imageHeight,
            "imagewidth": imageWidth,
            "margin": margin,
            "name": name,
            "properties": {},
            "spacing": spacing,
            "tileheight": tileHeight,
            "tilewidth": tileWidth
        };
    },
    makeMapBase: function () {
        var utils = require('./utils');
        var gapCount = 0;
        var landCount = 5;
        var mapBase = new Array(mapWidth * mapHeight);
        mapBase.fill(0);

        var startIndex = (mapHeight - 1) * mapWidth;
        var maxIndex = mapWidth * mapHeight;

        mapBase.fill(1, startIndex, startIndex + 15);
        mapBase.fill(1, maxIndex - 15, maxIndex);

        // Generate array for map
        // 1 = land, 0 = gap
        for (i = startIndex + 15; i < maxIndex - 15; i++) {
            if (landCount < minLand && landCount > 0) {
                mapBase[i] = 1;
                landCount++;
                gapCount = 0;
            } else {
                if (utils.getRandomInt(0, 1) == 1) {
                    gapCount++;
                    mapBase[i] = 0;
                    landCount = 0;
                } else {
                    mapBase[i] = 1;
                    landCount++;
                    gapCount = 0;
                }
            }
        }
        return mapBase;
    },
    makeLayer: function (data, height, name, opacity, type, visible, width, x, y, objects) {
        layer = {
            "height": height,
            "name": name,
            "opacity": opacity,
            "type": type,
            "visible": visible,
            "width": width,
            "x": x,
            "y": y
        };

        if (data) {
            layer.data = data;
        }

        if (objects) {
            layer.objects = (objects);
        }

        return layer;

    },
    generate: function (height, width, tilewidth, tileheight, tilesets, layers) {
        return json = {
            "height": height,
            "layers": layers,
            "orientation": "orthogonal",
            "properties": {},
            "tileheight": tileheight,
            "tilesets": tilesets,
            "tilewidth": tilewidth,
            "version": 1,
            "width": width
        }

    }
};