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
    core.fps = 60;
    core.onload = function () {
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
        var scene = core.rootScene;
        scene.addChild(background);
    };
    core.start();
}

window.onload = main;
