//class Greeter {
//	element: HTMLElement;
//	span: HTMLElement;
//	timerToken: number;
//	constructor(element: HTMLElement) {
//		this.element = element;
//		this.element.innerHTML += "The time is: ";
//		this.span = document.createElement('span');
//		this.element.appendChild(this.span);
//		this.span.innerText = new Date().toUTCString();
//	}
//	start() {
//		this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
//	}
//	stop() {
//		clearTimeout(this.timerToken);
//	}
//}
//window.onload = () => {
//	var el = document.getElementById('content');
//	var greeter = new Greeter(el);
//	greeter.start();
//};
//module GameOfLife {
var Model = (function () {
    function Model(width, height, defaults) {
        var _this = this;
        this._width = width;
        this._height = height;
        var length = this._width * this._height;
        this._current = new Array(length);
        for (var index = 0; index < this._current.length; index++) {
            this._current[index] = false;
        }
        if (typeof defaults !== "undefined") {
            defaults.forEach(function (value) { return _this.alive(value.x, value.y, true); });
        }
        this._temp = new Array(length);
        for (var index = 0; index < this._temp.length; index++) {
            this._temp[index] = false;
        }
    }
    Model.prototype.width = function () { return this._width; };
    Model.prototype.height = function () { return this._height; };
    // (x, y) => 配列のindex
    Model.prototype.index = function (x, y) {
        return y * this._width + x;
    };
    Model.prototype.alive = function (x, y, state) {
        var index = this.index(x, y);
        /*
        // todo: x, y range check
        if (index < 0 || index >= this._current.length) {
        }
        */
        if (typeof state === "undefined") {
            return this._current[index];
        }
        else {
            this._current[index] = state;
        }
    };
    // 指定セルの状態を切り替える
    Model.prototype.toggle = function (x, y) {
        this.alive(x, y, !this.alive(x, y));
    };
    // 周囲8セルのうち生きているセルの個数を求める
    Model.prototype.countAlive = function (x, y) {
        var _this = this;
        // 上下左右のセルの位置
        var top = (y - 1 + this._height) % this._height;
        var bottom = (y + 1) % this._height;
        var left = (x - 1 + this._width) % this._width;
        var right = (x + 1) % this._width;
        var count = [
            // 上の行
            { x: left, y: top }, { x: x, y: top }, { x: right, y: top },
            // 真ん中の行
            { x: left, y: y }, { x: right, y: y },
            // 下の行
            { x: left, y: bottom }, { x: x, y: bottom }, { x: right, y: bottom },
        ].filter(function (value) { return _this.alive(value.x, value.y); }).length;
        return count;
    };
    // 次の世代へ
    Model.prototype.next = function () {
        for (var x = 0; x < this._width; x++) {
            for (var y = 0; y < this._height; y++) {
                // 周囲8セルの生存数から次の状態を決定する
                var count = this.countAlive(x, y);
                var alive = false;
                if (this.alive(x, y)) {
                    if (count == 2 || count == 3)
                        alive = true;
                }
                else {
                    if (count == 3)
                        alive = true;
                }
                this._temp[this.index(x, y)] = alive;
            }
        }
        // _currentと_tempを差し替え
        var temp = this._current;
        this._current = this._temp;
        this._temp = temp;
    };
    return Model;
})();
var View = (function () {
    function View(model) {
        this._options = {
            cellSize: 10
        };
        this._model = model;
        this.init();
    }
    View.prototype.model = function () { return this._model; };
    View.prototype.element = function () { return this._element; };
    View.prototype.init = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this._model.width() * this._options.cellSize;
        canvas.height = this._model.height() * this._options.cellSize;
        this._element = canvas;
    };
    View.prototype.render = function () {
        var context = this._element.getContext("2d");
        var width = this._element.width;
        var height = this._element.height;
        context.clearRect(0, 0, width, height);
        context.fillStyle = "rgba(143, 163, 245, 0.3)"; // todo:
        for (var x = 0; x < this._model.width(); x++) {
            for (var y = 0; y < this._model.height(); y++) {
                if (!this._model.alive(x, y))
                    continue;
                context.fillRect(x * this._options.cellSize, y * this._options.cellSize, this._options.cellSize, this._options.cellSize);
            }
        }
    };
    return View;
})();
var Game = (function () {
    function Game(view) {
        this._view = view;
    }
    Game.play = function (view) {
        var game = new Game(view);
        game.play();
        Game._game = game;
    };
    Game.prototype.play = function () {
        var _this = this;
        this._view.render();
        setInterval(function () {
            _this._view.model().next();
            _this._view.render();
        }, 250);
    };
    return Game;
})();
//}
//window.onload = () => {
//    var el = document.getElementById('content');
//    var greeter = new Greeter(el);
//    greeter.start();
//};
window.onload = function () {
    var width = 40;
    var height = 30;
    var defaults = [];
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (Math.random() >= 0.2)
                continue;
            defaults.push({ x: x, y: y });
        }
    }
    //var model = new GameOfLife.Model(width, height, defaults);
    //var view = new GameOfLife.View(model);
    //GameOfLife.Game.play(view);
    var model = new Model(width, height, defaults);
    var view = new View(model);
    Game.play(view);
    document.getElementById("content").appendChild(view.element());
};
