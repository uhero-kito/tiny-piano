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

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    core.preload("img/keys.png");
    core.fps = 60;
    core.onload = function () {
        var KEY_WIDTH = 40;
        var KEY_HEIGHT = 200;
        var KEYBOARD_LEFT = (DISPLAY_WIDTH / 2) - (4 * KEY_WIDTH);
        var KEYBOARD_TOP = (DISPLAY_HEIGHT / 2) - (KEY_HEIGHT / 2);
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

        var scene = core.rootScene;
        scene.addChild(background);
        keys.white.map(function (key) {
            scene.addChild(key);
        });
        keys.black.map(function (key) {
            scene.addChild(key);
        });
    };
    core.start();
}

window.onload = main;
