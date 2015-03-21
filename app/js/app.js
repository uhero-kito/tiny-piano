/* global enchant, Event */

function main() {
    var DISPLAY_WIDTH = 360;
    var DISPLAY_HEIGHT = 360;

    // 表示領域をデバイスの中央に設定します
    (function () {
        var doc = document.documentElement;
        var width = doc.clientWidth;
        var height = doc.clientHeight;
        var canvasAspect = DISPLAY_WIDTH / DISPLAY_HEIGHT;
        var windowAspect = doc.clientWidth / doc.clientHeight;
        var bodyStyle = document.getElementsByTagName("body")[0].style;
        var newWidth = (canvasAspect < windowAspect) ? height * canvasAspect : width;
        var newHeight = (windowAspect < canvasAspect) ? width / canvasAspect : height;
        bodyStyle.width = newWidth + "px";
        bodyStyle.height = newHeight + "px";
    })();

    var getAudioAssetName = function (name) {
        var ext = (enchant.ENV.BROWSER === "ie") ? ".mp3" : ".ogg";
        return "sound/" + name + ext;
    };

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(function (filename) {
        core.preload(getAudioAssetName(filename));
    });
    core.preload("img/keys.png");
    core.fps = 60;
    core.onload = function () {
        var KEY_WIDTH = 40;
        var KEY_HEIGHT = 200;
        var KEY_BLACK_HEIGHT = 120;
        var KEYBOARD_LEFT = (DISPLAY_WIDTH / 2) - (4 * KEY_WIDTH);
        var KEYBOARD_TOP = (DISPLAY_HEIGHT / 2) - (KEY_HEIGHT / 2);

        var playSE = function (name) {
            var se = core.assets[getAudioAssetName(name)];
            se.clone().play();
        };

        /**
         * 現在押されているキーです。
         * @type Sprite
         */
        var currentKey = null;

        var background = (function () {
            var sprite = new Sprite(DISPLAY_WIDTH, DISPLAY_HEIGHT);
            sprite.image = (function () {
                var surface = new Surface(DISPLAY_WIDTH, DISPLAY_HEIGHT);
                var context = surface.context;
                context.fillStyle = (function () {
                    var grad = context.createLinearGradient(0, 0, 0, DISPLAY_HEIGHT);
                    grad.addColorStop(0, "#666666");
                    grad.addColorStop(1, "#333333");
                    return grad;
                })();
                context.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
                return surface;
            })();
            return sprite;
        })();
        var keys = (function () {
            var createKey = function (index, isWhite) {
                var sprite = new Sprite(KEY_WIDTH, KEY_HEIGHT);
                sprite.image = core.assets["img/keys.png"];
                sprite.frame = isWhite ? 0 : 2;
                sprite.x = KEYBOARD_LEFT + (index * KEY_WIDTH / 2);
                sprite.y = KEYBOARD_TOP;
                return sprite;
            };
            return {
                white: [0, 2, 4, 6, 8, 10, 12, 14].map(function (index) {
                    return createKey(index, true);
                }),
                black: [1, 3, 7, 9, 11].map(function (index) {
                    return createKey(index, false);
                })
            };
        })();
        ["00", "02", "04", "05", "07", "09", "11", "12"].map(function (note, index) {
            keys.white[index].note = note;
        });
        ["01", "03", "06", "08", "10"].map(function (note, index) {
            keys.black[index].note = note;
        });

        var keyboard = (function () {
            var sprite = new Sprite(8 * KEY_WIDTH, KEY_HEIGHT);
            sprite.x = KEYBOARD_LEFT;
            sprite.y = KEYBOARD_TOP;
            var getPressedKey = function (x, y) {
                var localX = x - KEYBOARD_LEFT;
                var whiteIndex = Math.floor(localX / KEY_WIDTH);
                if (whiteIndex < 0 || 8 <= whiteIndex) {
                    return null;
                }
                if (KEYBOARD_TOP + KEY_BLACK_HEIGHT < y) {
                    return keys.white[whiteIndex];
                }
                var blackIndex = Math.floor((localX - (KEY_WIDTH / 2)) / KEY_WIDTH);
                var foundIndex = [0, 1, 3, 4, 5].indexOf(blackIndex);
                return (foundIndex !== -1) ? keys.black[foundIndex] : keys.white[whiteIndex];
            };
            var pressedAction = function (e) {
                var pressedKey = getPressedKey(e.x, e.y);
                if (pressedKey === currentKey) {
                    return;
                }

                if (currentKey) {
                    currentKey.frame--;
                }
                if (pressedKey) {
                    pressedKey.frame++;
                    playSE(pressedKey.note);
                }
                currentKey = pressedKey;
            };
            sprite.addEventListener(Event.TOUCH_START, pressedAction);
            sprite.addEventListener(Event.TOUCH_MOVE, pressedAction);
            sprite.addEventListener(Event.TOUCH_END, function () {
                if (currentKey) {
                    currentKey.frame--;
                }
                currentKey = null;
            });
            return sprite;
        })();

        var scene = core.rootScene;
        scene.addChild(background);
        keys.white.map(function (key) {
            scene.addChild(key);
        });
        keys.black.map(function (key) {
            scene.addChild(key);
        });
        scene.addChild(keyboard);
    };
    core.start();
}

window.onload = main;
