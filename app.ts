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
class Model {
    private _width: number;
    private _height: number;
    private _current: boolean[];
    private _temp: boolean[];

    constructor(width: number, height: number, defaults?: { x: number; y: number }[]) {
        this._width = width;
        this._height = height;

        var length = this._width * this._height;
        this._current = new Array<boolean>(length);
        for (var index = 0; index < this._current.length; index++) {
            this._current[index] = false;
        }
        if (typeof defaults !== "undefined") {
            defaults.forEach(value => this.alive(value.x, value.y, true));
        }
        this._temp = new Array<boolean>(length);
        for (var index = 0; index < this._temp.length; index++) {
            this._temp[index] = false;
        }
    }

    width() { return this._width; }
    height() { return this._height; }

    // (x, y) => 配列のindex
    private index(x: number, y: number) {
        return y * this._width + x;
    }

    // 指定セルが生きているかどうか取得・設定
    alive(x: number, y: number): boolean;
    alive(x: number, y: number, state: boolean): void;
    alive(x: number, y: number, state?: boolean) {
        var index = this.index(x, y);
        /*
        // todo: x, y range check
        if (index < 0 || index >= this._current.length) {
        }
        */
        if (typeof state === "undefined") {	// getter
            return this._current[index];
        } else {	// setter
            this._current[index] = state;
        }
    }

    // 指定セルの状態を切り替える
    toggle(x: number, y: number) {
        this.alive(x, y, !this.alive(x, y));
    }

    // 周囲8セルのうち生きているセルの個数を求める
    private countAlive(x: number, y: number) {
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
        ].filter(value => this.alive(value.x, value.y)).length;
        return count;
    }

    // 次の世代へ
    next() {
        for (var x = 0; x < this._width; x++) {
            for (var y = 0; y < this._height; y++) {
                // 周囲8セルの生存数から次の状態を決定する
                var count = this.countAlive(x, y);
                var alive = false;
                if (this.alive(x, y)) {
                    if (count == 2 || count == 3) alive = true;
                } else {
                    if (count == 3) alive = true;
                }
                this._temp[this.index(x, y)] = alive;
            }
        }

        // _currentと_tempを差し替え
        var temp = this._current;
        this._current = this._temp;
        this._temp = temp;
    }
}

class View {
    private _options = {
        cellSize: 10,
    };

    private _model: Model;
    private _element: HTMLCanvasElement;

    constructor(model: Model) {
        this._model = model;
        this.init();
    }

    model() { return this._model; }
    element(): HTMLElement { return this._element; }

    private init() {
        var canvas = document.createElement("canvas");
        canvas.width = this._model.width() * this._options.cellSize;
        canvas.height = this._model.height() * this._options.cellSize;

        this._element = canvas;
    }

    render() {
        var context = this._element.getContext("2d");
        var width = this._element.width;
        var height = this._element.height;

        context.clearRect(0, 0, width, height);

        context.fillStyle = "rgba(143, 163, 245, 0.3)";	// todo:

        for (var x = 0; x < this._model.width(); x++) {
            for (var y = 0; y < this._model.height(); y++) {
                if (!this._model.alive(x, y)) continue;
                context.fillRect(
                    x * this._options.cellSize, y * this._options.cellSize,
                    this._options.cellSize, this._options.cellSize);
            }
        }
    }
}

class Game {
    private static _game: Game;

    static play(view: View) {
        var game = new Game(view);
        game.play();
        Game._game = game;
    }

    private _view: View;

    constructor(view: View) {
        this._view = view;
    }

    private play() {
        this._view.render();

        setInterval(() => {
            this._view.model().next();
            this._view.render();
        }, 250);
    }
}
//}


//window.onload = () => {
//    var el = document.getElementById('content');
//    var greeter = new Greeter(el);
//    greeter.start();
//};


window.onload = () => {
    var width = 40;
    var height = 30;

    var defaults: { x: number; y: number }[] = [];
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (Math.random() >= 0.2) continue;
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
