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
    core.preload("img/keys.png", "img/volume-base.png", "img/volume-button.png", "img/volume-level.png");
    core.fps = 60;
    core.onload = function () {
        var KEY_WIDTH = 40;
        var KEY_HEIGHT = 200;
        var KEY_BLACK_HEIGHT = 120;
        var KEYBOARD_LEFT = (DISPLAY_WIDTH / 2) - (4 * KEY_WIDTH);
        var KEYBOARD_TOP = (DISPLAY_HEIGHT / 2) - (KEY_HEIGHT / 2);
        var VOLUME_TOP = KEYBOARD_TOP + KEY_HEIGHT + 10;
        var VOLUME_WIDTH = 160;

        var volume = 0.5;

        var playSE = function (name) {
            var se = getSoundByName(name);
            switch (enchant.ENV.BROWSER) {
                case "firefox":
                    se.play();
                    se.volume = volume;
                    break;
                case "ie":
                    // IE 10 以下では clone() の負荷が高く遅延が目立つため、既存の Sound オブジェクトを再利用します。
                    // 既存の Sound が再生中の場合は一度 stop します。
                    if (/MSIE/.test(navigator.userAgent)) {
                        se.stop();
                        se.play();
                        se.volume = volume;
                    } else {
                        var newSE = se.clone();
                        newSE.play();
                        newSE.volume = volume;
                    }
                    break;
                default:
                    var newSE = se.clone();
                    newSE.play();
                    newSE.volume = volume;
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
                this.isPressed = false;
            },
            push: function () {
                if (this.isPressed) {
                    return;
                }
                if (this.frame % 2 === 0) {
                    this.frame++;
                }
                playSE(this.soundName);
                this.isPressed = true;
            },
            release: function () {
                this.isPressed = false;
                if (this.frame % 2) {
                    this.frame--;
                }
            }
        });
        var noop = function () {};
        var blankNote = {push: noop, release: noop};

        var getDistance = function (x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        };
        var Finger = Class.create({
            initialize: function (x, y) {
                this.x = x;
                this.y = y;
                var n = this.getTouchingNote(x, y);
                n.push();
                this.note = n;
            },
            getTouchingNote: function (x, y) {
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
            }
        });
        var nullFinger = {
            x: 0,
            y: 0,
            note: blankNote,
            getTouchingNote: function () {
                return blankNote;
            }
        };
        var Hand = (function () {
            var getFingerIndex = function (hand, x, y) {
                var distanceList = hand.fingers.map(function (f) {
                    return getDistance(x, y, f.x, f.y);
                });
                return distanceList.indexOf(Math.min.apply(null, distanceList));
            };
            return Class.create({
                initialize: function () {
                    this.fingers = [];
                },
                touch: function (x, y) {
                    var finger = new Finger(x, y);
                    this.fingers.push(finger);
                },
                swipe: function (x, y) {
                    var index = getFingerIndex(this, x, y);
                    if (index === -1) {
                        return;
                    }
                    var finger = this.fingers[index];
                    var currentNote = finger.note;
                    var newNote = finger.getTouchingNote(x, y);
                    if (currentNote === newNote) {
                        return;
                    }
                    if (newNote === blankNote) {
                        this.fingers.splice(index, 1);
                    } else {
                        finger.note = newNote;
                        newNote.push();
                    }
                    if (!this.isTouching(currentNote)) {
                        currentNote.release();
                    }
                },
                release: function (x, y) {
                    var index = getFingerIndex(this, x, y);
                    if (index === -1) {
                        return nullFinger;
                    }
                    var finger = this.fingers[index];
                    var note = finger.note;
                    this.fingers.splice(index, 1);
                    if (!this.isTouching(note)) {
                        note.release();
                    }
                    return finger;
                },
                isTouching: function (note) {
                    for (var i = 0; i < this.fingers.length; i++) {
                        if (this.fingers[i].note === note) {
                            return true;
                        }
                    }
                    return false;
                }
            });
        })();
        var hand = new Hand();

        /**
         * 最後に離された Finger です。(誤発火防止対策）
         * @type Finger
         */
        var previousFinger = nullFinger;

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

            /**
             * 発火したイベントが誤検知かどうかを判定します。
             * 同じ場所で短期間 (1 フレーム以内) に連打された場合は誤検知とみなします。
             * 
             * @param {Event} e 検知したイベント
             * @returns {Boolean} 誤検知の場合は false, そうでない場合は true
             */
            var validateEvent = function (e) {
                var prevX = previousFinger.x;
                var prevY = previousFinger.y;
                if (5 < getDistance(e.x, e.y, prevX, prevY)) {
                    return true;
                }
                return (1 < sprite.age - lastReleasedTime);
            };

            sprite.addEventListener(Event.TOUCH_START, function (e) {
                if (!validateEvent(e)) {
                    return;
                }
                hand.touch(e.x, e.y);
            });
            sprite.addEventListener(Event.TOUCH_MOVE, function (e) {
                if (!validateEvent(e)) {
                    return;
                }
                hand.swipe(e.x, e.y);
            });
            sprite.addEventListener(Event.TOUCH_END, function (e) {
                if (!validateEvent(e)) {
                    return;
                }
                var finger = hand.release(e.x, e.y);
                previousFinger = finger;
                lastReleasedTime = sprite.age;
            });
            return sprite;
        })();
        var volumeBase = (function () {
            var width = VOLUME_WIDTH;
            var height = 40;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/volume-base.png"];
            sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
            sprite.y = VOLUME_TOP;
            return sprite;
        })();
        var volumeButton = (function () {
            var width = 64;
            var height = 64;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/volume-button.png"];
            sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
            sprite.y = VOLUME_TOP - 12;
            var baseHalf = VOLUME_WIDTH / 2;
            var buttonHalf = width / 2;
            var xMin = (DISPLAY_WIDTH / 2) - baseHalf;
            var xMax = (DISPLAY_WIDTH / 2) + baseHalf;
            var getVolumeLevelFrame = function (volume) {
                if (volume === 0) {
                    return 0;
                }
                if (volume < 0.15) {
                    return 1;
                }
                if (volume < 0.45) {
                    return 2;
                }
                if (volume < 0.7) {
                    return 3;
                }
                return 4;
            };
            sprite.addEventListener(Event.TOUCH_MOVE, function (e) {
                var x = e.x;
                var newX = Math.max(Math.min(x, xMax), xMin);
                this.x = newX - buttonHalf;
                volume = (newX - xMin) / (xMax - xMin);
                volumeLevel.frame = getVolumeLevelFrame(volume);
            });
            return sprite;
        })();
        var volumeLevel = (function () {
            var width = 64;
            var height = 64;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/volume-level.png"];
            sprite.x = (DISPLAY_WIDTH / 2) - (VOLUME_WIDTH / 2) - width;
            sprite.y = VOLUME_TOP - 12;
            sprite.frame = 3;
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
        scene.addChild(volumeLevel);
        scene.addChild(volumeBase);
        scene.addChild(volumeButton);
    };
    core.start();
}

window.onload = main;
