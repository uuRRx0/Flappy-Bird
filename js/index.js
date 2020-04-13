var meun = document.getElementsByClassName("meun")[0];
var success = document.getElementById("success");
var isDebug = false;
if(isDebug) var show = document.createElement("div");

//添加事件监听，开始游戏
function newgame() {
    if (window.game && window.game.restart) {
        window.game.restart();
        return;
    }
    startBtn.innerText = "再来一次";
    var game = new Game();
    window.game = game;
    game.init();
}
startBtn = document.querySelector(".start span");
startBtn.addEventListener("click", newgame)

//获取小鸟的高度
function getTop(dom) {
    var top = window
        .getComputedStyle(dom)
        .getPropertyValue('top');
    return top;
}

//随机数生成，返回 min 到 max（不包括max）的整数，实参一个则 0 为最大值
function getRandom(min, max) {
    max = max || 0;
    return Math.floor(Math.random() * (max - min) + min);
}

function Game() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.isOver = false;
    this.timerId = null;
    this.flapId = null;
    this.defaultVelocity = 450;
    this.velocity = this.defaultVelocity;
    this.maxTop = (420 * 2 + 200 - this.height) / 2;
    this.pipes = new Map();
    this.pipeTranslateY = 0;
    this.mark = 0;
    this.maxPipes = Math.ceil(this.width / (56 + 15 * 16)) + 1; 
    this.bird = document.getElementById("bird");
    this.birdLeft = this.width * 0.4;
    this.birdLeftCordon = this.birdLeft + 30;
    this.birdLeftCordon0 = this.birdLeft + 30 - 56;
    this.gameDom = document.getElementById("game");
    this.box = document.getElementsByClassName("gameContainer")[0];
}

//初始化
Game.prototype.init = function () {
    this.backup = this.box.cloneNode(true);
    this.gameDom.className = "start";
    this.bird.className = "bird";
    this.bird.style.top = 0.5 * this.height + "px";
    //创建pipes
    var i = this.maxPipes;
    while (i--) this.createPipe();
    //添加飞的事件监听
    document.addEventListener("click", () => {
        clearInterval(this.flapId);
        this.flap();
    });
    this.flap();
    this.timerId = setInterval(() => {
        this.drop();
        this.pipeMove();
    }, 16);
    isDebug && (show.className = "show")
    isDebug && this.gameDom.appendChild(show);
}

//下坠
Game.prototype.drop = function () {
    var top = parseFloat((this.bird.style.top || getTop(this.bird))) + this.velocity * 0.016;
    if (top > this.height + 30) {
        this.gameOver();
    }
    this.bird.style.top = top + 'px';    
}

//创建 pipe
Game.prototype.createPipe = function () {
    if(this.maxPipes < this.pipes.size) return;
    var dom = document.createElement("div");
    dom.className = "pipe";
    var left = this.getLeft();
    var top = getRandom.call(this, -this.maxTop, this.maxTop);
    dom.style.left = left + "px";
    dom.style.top = top + "px";
    var pipe = {
        index: ++this.mark,
        dom: dom,
        left: left,
        top: top,
        get: false,
        destory: function(){
            dom.remove();
            return this.index;
        }
    }
    this.pipes.set(this.mark, pipe)
    this.box.appendChild(dom);
}

//获取last pipe left，并返回
Game.prototype.getLeft = function(){
    return this.pipes.size ? this.pipes.get(this.mark).left + 240 : 1000;
}

Game.prototype.pipeMove = function () {
    this.pipes.forEach((item)=>{
        item.left -= 0.016 * 100;
        item.dom.style.left = item.left + "px";
        item.get && item.left < -46 && this.pipes.delete(item.destory()) && this.createPipe();
        !item.get && item.left <= this.birdLeftCordon && this.safety(this.getSafetyValue(item.top));
        !item.get && item.left < this.birdLeftCordon0 && this.getSuccess(item.index,item.get = !item.get);
    })
}

//小鸟拍打翅膀
Game.prototype.flap = function () {
    if (this.isOver) return;
    clearInterval(this.flapId);
    this.velocity = -300;
    this.flapId = setInterval(() => {
        this.velocity = this.velocity + 6;
        if (this.velocity > this.defaultVelocity) {
            this.velocity = this.defaultVelocity;
            clearInterval(this.flapId);
        }
    }, 16);
}

Game.prototype.getSuccess = function(i){
    success.innerText = i;
}

Game.prototype.safety = function (safetyValue = 251) {
    var top = parseFloat(this.bird.style.top);
    if(isDebug) {
        show.style.left = this.birdLeft + "px";
        show.style.top = safetyValue + "px";
    }
    if (top > safetyValue + 170 || top < safetyValue) {
        this.gameOver()
    }
}

Game.prototype.getSafetyValue = function (top) {
    this.pipeTranslateY || (() => {
        var dom = this.pipes.get(this.mark).dom;
        var style = window.getComputedStyle(dom);
        var matrix = new WebKitCSSMatrix(style.webkitTransform);
        this.pipeTranslateY = matrix.m42;
    })();
    return 420 + this.pipeTranslateY + top;
}

Game.prototype.gameOver = function() {
    this.isOver = true;
    clearInterval(this.timerId);
    clearInterval(this.flapId);
    this.gameDom.className = "isOver"
    document.title = "Game Over";
    startBtn.parentElement.className = "start"
}

Game.prototype.restart = function () {
    this.isOver = false;
    this.pipes.forEach((value)=>{
        this.pipes.delete(value.destory())
    })
    this.mark = 0;
    success.innerText = 0;
    this.init();
}




//获取 translate
// function getTranslateY() {
//     var style = window.getComputedStyle(myElement);
//     var matrix = new WebKitCSSMatrix(style.webkitTransform);
//     console.log('translateY: ', matrix.m42);
// }

//获取pipe transform
// var pipe = document.getElementsByClassName("pipe")[0];
// var str = window
//     .getComputedStyle(pipe)
//     .getPropertyValue('transform');
// var translateY = +str.match(/-?(\d+\.)?\d(?=,|\))/g)[5];