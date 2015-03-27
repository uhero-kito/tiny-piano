/* global enchant, Event, Class, Sprite */

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

    /**
     * 引数の basename ("00" など) を、実際のファイル名 ("sound/00.ogg" など) に変換します。
     * 各ブラウザがサポートしているフォーマットの違いを吸収するため、
     * IE と iOS については .mp3, その他のブラウザは .ogg 形式を返します。
     * 
     * @param {type} name ファイルの basename
     * @returns {String} ファイル名
     */
    var getSoundFilename = (function () {
        var ext = null;
        var checkMp3ByBrowser = function (browser, useragent) {
            if (browser === "ie") {
                return true;
            }
            if (/iPhone/.test(useragent)) {
                return true;
            }
            if (/iPad/.test(useragent)) {
                return true;
            }
            return false;
        };
        var func = function (name) {
            if (!ext) {
                ext = checkMp3ByBrowser(enchant.ENV.BROWSER, navigator.userAgent) ? ".mp3" : ".ogg";
            }
            return "sound/" + name + ext;
        };
        return func;
    })();

    /**
     * 指定された名前に対応する Sound オブジェクトを返します。
     * @param {String} name
     * @returns {Sound}
     */
    var getSoundByName = function (name) {
        return core.assets[getSoundFilename(name)];
    };

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(function (filename) {
        core.preload(getSoundFilename(filename));
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
            var se = getSoundByName(name);
            switch (enchant.ENV.BROWSER) {
                case "firefox":
                    se.play();
                    break;
                case "ie":
                    // IE 10 以下では clone() の負荷が高く遅延が目立つため、既存の Sound オブジェクトを再利用します。
                    // 既存の Sound が再生中の場合は一度 stop します。
                    if (/MSIE/.test(navigator.userAgent)) {
                        se.stop();
                        se.play();
                    } else {
                        se.clone().play();
                    }
                    break;
                default:
                    se.clone().play();
                    break;
            }
        };

        var Note = Class.create(Sprite, {
            initialize: function (index, soundName) {
                Sprite.call(this, KEY_WIDTH, KEY_HEIGHT);
                this.image = core.assets["img/keys.png"];
                this.frame = (index % 2) ? 2 : 0;
                this.x = KEYBOARD_LEFT + (index * KEY_WIDTH / 2);
                this.y = KEYBOARD_TOP;
                this.soundName = soundName;
            },
            push: function () {
                if (this.frame % 2 === 0) {
                    this.frame++;
                }
                playSE(this.soundName);
            },
            release: function () {
                if (this.frame % 2) {
                    this.frame--;
                }
            }
        });
        var noop = function () {};
        var blankNote = {push: noop, release: noop};

        /**
         * 現在押されているキーです。
         * @type Sprite
         */
        var currentKey = blankNote;

        /**
         * 最後に押されたキーです。(誤発火防止対策）
         * @type Sprite
         */
        var previousKey = null;

        /**
         * 最後にキーが離された時のフレーム数です。（誤発火防止対策）
         * @type Number
         */
        var lastReleasedTime = 0;

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

        var notes = (function () {
            var whiteArgs = {0: "00", 2: "02", 4: "04", 6: "05", 8: "07", 10: "09", 12: "11", 14: "12"};
            var blackArgs = {1: "01", 3: "03", 7: "06", 9: "08", 11: "10"};
            var notes = {white: [], black: []};
            for (var i in whiteArgs) {
                notes.white.push(new Note(i, whiteArgs[i]));
            }
            for (var i in blackArgs) {
                notes.black.push(new Note(i, blackArgs[i]));
            }
            return notes;
        })();

        var keyboard = (function () {
            var sprite = new Sprite(8 * KEY_WIDTH, KEY_HEIGHT);
            sprite.x = KEYBOARD_LEFT;
            sprite.y = KEYBOARD_TOP;
            var getPressedKey = function (x, y) {
                var localX = x - KEYBOARD_LEFT;
                var whiteIndex = Math.floor(localX / KEY_WIDTH);
                if (whiteIndex < 0 || 8 <= whiteIndex) {
                    return blankNote;
                }
                if (KEYBOARD_TOP + KEY_BLACK_HEIGHT < y) {
                    return notes.white[whiteIndex];
                }
                var blackIndex = Math.floor((localX - (KEY_WIDTH / 2)) / KEY_WIDTH);
                var foundIndex = [0, 1, 3, 4, 5].indexOf(blackIndex);
                return (foundIndex !== -1) ? notes.black[foundIndex] : notes.white[whiteIndex];
            };

            /**
             * 発火したイベントが誤検知かどうかを判定します。
             * 短期間 (1 フレーム以内) に連打された場合は誤検知とみなします。
             * 
             * @param {Sprite} key イベントによって押されたキー
             * @returns {Boolean} 誤検知の場合は false, そうでない場合は true
             */
            var validatePressedKey = function (key) {
                if (!key) {
                    return true;
                }
                if (key !== previousKey) {
                    return true;
                }
                return (1 < sprite.age - lastReleasedTime);
            };

            /**
             * キーボード上をタッチまたはスワイプした際に発火する関数です。
             * 現在押されているキーを判別し、対応する音声ファイルを鳴らします。
             * 
             * @param {Event} e
             */
            var pressedAction = function (e) {
                var pressedKey = getPressedKey(e.x, e.y);
                if (pressedKey === currentKey) {
                    return;
                }
                if (!validatePressedKey(pressedKey)) {
                    return;
                }

                currentKey.release();
                pressedKey.push();
                currentKey = pressedKey;
            };
            sprite.addEventListener(Event.TOUCH_START, pressedAction);
            sprite.addEventListener(Event.TOUCH_MOVE, pressedAction);
            sprite.addEventListener(Event.TOUCH_END, function () {
                currentKey.release();
                previousKey = currentKey;
                lastReleasedTime = sprite.age;
                currentKey = blankNote;
            });
            return sprite;
        })();

        var scene = core.rootScene;
        scene.addChild(background);
        notes.white.map(function (key) {
            scene.addChild(key);
        });
        notes.black.map(function (key) {
            scene.addChild(key);
        });
        scene.addChild(keyboard);
    };
    core.start();
}

window.onload = main;
