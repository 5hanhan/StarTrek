var over = document.getElementById("over");
var Again = document.getElementById("Again");
var end = document.getElementById("end");
var winAgain = document.getElementById("winAgain");
var gGame = null;
//开始游戏
function startGame() {
    gGame = new Game();
    gGame.update();
}
//游戏主场景
function Game() {
    var _this = this;
    this.mine = new Mine();//我自己，飞机
    this.angle = 370;//摇杆角度，控制移动方向
    this.speed = 2;//飞机移动速度
    //存放陨石
    this.meteorite = [new Meteorite(),new Meteorite(),new Meteorite(),new Meteorite(),new Meteorite(),new Meteorite()];
    this.meteoriteFrame = 0;
    this.meteoriteNum = 6;//场景内陨石数量
    this.meteoriteSpeed = 2;
    this.smallmeteorite = [];
    this.bullets = [];//存放子弹
    this.bulletFrame = 0;
    this.CD = 30;
    this.score = 0;//记录打击陨石数
    this.update = function () {
        _this.meteoriteFrame++;
        _this.bulletFrame++;
        ctx.clearRect(0,0,cvs.width,cvs.height);
        _this.mine.drawRocker(_this.angle);//画摇杆
        _this.mine.drawWarplane();//画飞机
        _this.mine.updatePos(_this.angle);//更新位置
        //生成陨石，当生成陨石数量到达100时不再生成
        if(_this.meteorite.length + _this.score < 100) {
            if (_this.meteoriteFrame / 5 == _this.CD) {
                _this.meteorite.push(new Meteorite());
                _this.meteoriteFrame = 0;
                _this.meteoriteNum++;
            }
        }
        //遍历陨石，更新陨石位置，并判断有无撞击飞机，撞击则游戏over
        if(_this.meteorite.length >= 1) {
            _this.meteorite.forEach(function (item,index) {
                item.updatePos(_this.meteoriteSpeed);
                item.drawMeteorite();
                if(Math.pow(Math.abs(item.x - _this.mine.warplaneX),2) + Math.pow(Math.abs(item.y - _this.mine.warplaneY),2)
                    < Math.pow(item.meteoriteRadius + _this.mine.warplaneR / 2,2)){
                    //alert("Game over!");
                    over.open = true;
                    Again.style.cursor = "pointer";
                    Again.onclick = function () {
                        window.location.reload();
                    }
                }
            })
        }
        //遍历小陨石，更新陨石位置，并判断有无撞击飞机，撞击则游戏over
        if(_this.smallmeteorite.length >= 1) {
            _this.smallmeteorite.forEach(function (item,index) {
                item.updatePos();
                item.drawMeteorite();
                if(Math.pow(Math.abs(item.x - _this.mine.warplaneX),2) + Math.pow(Math.abs(item.y - _this.mine.warplaneY),2)
                    < Math.pow(item.smallmeteoriteRadius + _this.mine.warplaneR / 2,2)){
                    //alert("Game over!");
                    over.open = true;
                    Again.style.cursor = "pointer";
                    Again.onclick = function () {
                        window.location.reload();
                    }
                }
            })
        }
        //遍历子弹，子弹打到陨石则两者一起消失，并加分，子弹飞出边界也消失
        if(_this.bullets.length >= 1) {
            _this.bullets.forEach(function (item,index) {
                item.updateStatus();
                _this.meteorite.forEach(function (t,i) {
                    if(Math.abs(item.x - t.x) <= t.meteoriteRadius + item.bulletWidth / 2 &&
                        Math.abs(item.y - t.y) <= t.meteoriteRadius + item.bulletHeight) {
                        for(var j = 0;j < 16;j++){
                            t.explosion();
                        }
                        _this.meteorite.splice(i,1);
                        _this.smallmeteorite.push(new smallMeteorite(t.x,t.y),new smallMeteorite(t.x,t.y));
                        _this.meteoriteNum--;
                        _this.bullets.splice(index,1);
                        _this.score++;
                        _this.meteoriteSpeed = Math.ceil(_this.score / 20) * 2;
                    }
                });
                _this.smallmeteorite.forEach(function (t,i) {
                    if(Math.abs(item.x - t.x) <= t.smallmeteoriteRadius + item.bulletWidth / 2 &&
                        Math.abs(item.y - t.y) <= t.smallmeteoriteRadius + item.bulletHeight) {
                        for(var j = 0;j < 16;j++){
                            t.explosion();
                        }
                        _this.smallmeteorite.splice(i,1);
                        _this.bullets.splice(index,1);
                    }
                });
                if(item.dead){
                    _this.bullets.splice(index,1);
                }
                item.draw();
            })
        }
        //分数打到100则游戏win
        if(_this.score == 10 && _this.smallmeteorite.length == 0 && _this.meteorite.length == 0){
            end.open = true;
            winAgain.style.cursor = "pointer";
            winAgain.onclick = function () {
                location.reload();
            }
        }
        //显示陨石数和得分
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.font = "bold 32px Arial";
        ctx.fillText("大陨石数：" + _this.meteoriteNum,10,40);
        ctx.fillText("打击大陨石得分：" + _this.score,10,90);
        ctx.fill();
        window.requestAnimationFrame(_this.update);
    };
    //点击空格发射子弹
    document.onkeydown = function (e) {
        if(e.keyCode == 32){
            if(_this.bulletFrame * 4 / 3 >= _this.CD) {
                _this.bullets.push(new Bullet(_this.mine.warplaneX,_this.mine.warplaneY));
                _this.bulletFrame = 0;
            }
        }
    };
    //鼠标点击更改方向
    cvs.onmousedown = function (e) {
        if(Math.pow(_this.mine.y - e.pageY + cvs.offsetTop,2) + Math.pow(e.pageX - cvs.offsetLeft - _this.mine.x,2) <= Math.pow(_this.mine.R/2,2)){
            _this.angle = 370;
        }else{
            _this.angle = Math.atan2(_this.mine.y - e.pageY + cvs.offsetTop,e.pageX - cvs.offsetLeft - _this.mine.x)* 180 / Math.PI * -1;
        }
        document.onmousemove = function (e) {
            if(Math.pow(_this.mine.y - e.pageY + cvs.offsetTop,2) + Math.pow(e.pageX - cvs.offsetLeft - _this.mine.x,2) <= Math.pow(_this.mine.R/2,2)){
                _this.angle = 370;
            }else{
                _this.angle = Math.atan2(_this.mine.y - e.pageY + cvs.offsetTop,e.pageX - cvs.offsetLeft - _this.mine.x)* 180 / Math.PI * -1;
            }
        };
    };
    document.onmouseup = function () {
        document.onmousemove = null;
    }
}
function Mine() {
    var _this = this;
    this.R = 50;
    this.r = 15;
    this.x = cvs.width * 5 / 6;
    this.y = cvs.height * 3 / 4;
    this.warplaneSpeed = 4;
    this.warplaneX = cvs.width / 2;
    this.warplaneY = cvs.height * 5 / 6;
    this.warplaneR = 40;
    //画出摇杆
    this.drawRocker = function (angle){
        ctx.save();
        var round = ctx.createRadialGradient(_this.x,_this.y,0,_this.x,_this.y,_this.R);
        round.addColorStop(0,"#FFF");
        round.addColorStop(1,"#4C4C4C");
        ctx.fillStyle = round;
        ctx.beginPath();
        ctx.arc(_this.x,_this.y,_this.R,0,Math.PI / 180 * 360);
        ctx.fill();
        ctx.beginPath();
        ctx.translate(_this.x,_this.y);
        //角度为370时（鼠标点击在摇杆内部一般之内），飞机在原地不动
        if(angle == 370){
            var round2 = ctx.createRadialGradient(0,0,0,0,0,_this.r);
            round2.addColorStop(0,"yellow");
            round2.addColorStop(1,"red");
            ctx.fillStyle = round2;
            ctx.arc(0,0,_this.r,0,Math.PI / 180 * 360);
        }else{
            var round2 = ctx.createRadialGradient(_this.R * Math.cos(angle * Math.PI / 180),
                _this.R * Math.sin(angle * Math.PI / 180),0,
                _this.R * Math.cos(angle * Math.PI / 180), _this.R * Math.sin(angle * Math.PI / 180),_this.r);
            round2.addColorStop(0,"yellow");
            round2.addColorStop(1,"red");
            ctx.fillStyle = round2;
            ctx.arc(_this.R * Math.cos(angle * Math.PI / 180),_this.R * Math.sin(angle * Math.PI / 180),_this.r,0,Math.PI / 180 * 360);
        }
        ctx.fill();
        ctx.restore();
    };
    //画出自己
    this.drawWarplane = function () {
//                ctx.beginPath();
//                ctx.fillStyle = "red";
//                ctx.arc(_this.peopleX,_this.peopleY,_this.peopleR,0,Math.PI / 180 * 360);
//                ctx.fill();
        var plane = new Image();
        plane.src = "img/plane.png";
        ctx.save();
        ctx.beginPath();
        ctx.drawImage(plane,_this.warplaneX - _this.warplaneR,_this.warplaneY - _this.warplaneR, _this.warplaneR * 2, _this.warplaneR * 2) ;//绘制图片
        ctx.restore();
    };
    //更新自己位置
    this.updatePos = function (angle) {
        if(angle == 370){

        }else {
            _this.warplaneX += _this.warplaneSpeed * Math.cos(Math.PI / 180 * angle);
            _this.warplaneY += _this.warplaneSpeed * Math.sin(Math.PI / 180 * angle);
            if (_this.warplaneX >= cvs.width - _this.warplaneR) {
                _this.warplaneX = cvs.width - _this.warplaneR;
            }
            if (_this.warplaneX <= _this.warplaneR) {
                _this.warplaneX = _this.warplaneR;
            }
            if (_this.warplaneY >= cvs.height - _this.warplaneR) {
                _this.warplaneY = cvs.height - _this.warplaneR;
            }
            if (_this.warplaneY <= _this.warplaneR) {
                _this.warplaneY = _this.warplaneR;
            }
        }
    }
}
function Meteorite() {
    var _this = this;
    this.meteoriteRadius = 40;
    this.x = Math.floor(Math.random() * (cvs.width - 2 * _this.meteoriteRadius) + _this.meteoriteRadius);
    this.y = Math.floor(Math.random() * cvs.height / 2 + _this.meteoriteRadius);
    this.angle = Math.floor(Math.random() * 360);
    this.temp1 = 0;
    this.temp2 = 0;
    //画出陨石
    this.drawMeteorite = function () {
        var meteorite = new Image();
        meteorite.src = "img/meteorite.png";
        ctx.save();
        ctx.beginPath(); //开始创建一个路径
        ctx.arc(_this.x,_this.y,_this.meteoriteRadius,0,Math.PI / 180 * 360,false); //画一个圆形裁剪区域
        ctx.clip(); //裁剪
        ctx.drawImage(meteorite,_this.x - _this.meteoriteRadius,_this.y - _this.meteoriteRadius, _this.meteoriteRadius * 2, _this.meteoriteRadius * 2) ;//绘制图片
        ctx.restore() ;//恢复之前保存的绘图上下文
    };
    //更新陨石位置
    this.updatePos = function (meteoriteSpeed) {
        _this.x += meteoriteSpeed * Math.cos(Math.PI / 180 * _this.angle);
        _this.y += meteoriteSpeed * Math.sin(Math.PI / 180 * _this.angle);
        if (_this.x - _this.meteoriteRadius <= 0 || _this.x + _this.meteoriteRadius >= cvs.width
            || _this.y - _this.meteoriteRadius <= 0 || _this.y + _this.meteoriteRadius >= cvs.height) {
            _this.angle += 90;
        }
    };
    this.explosion = function () {
        var explosion = new Image();
        explosion.src = "img/explosion.png";
        ctx.drawImage(explosion, _this.temp1 * explosion.width/8, _this.temp2 * explosion.height/4,
                        explosion.width/8, explosion.height/4, _this.x-50, _this.y-50, 150, 150);
        _this.temp1++;
        if(_this.temp1 == 8){
            _this.temp1 = 0;
            _this.temp2++;
        }
    };
}
function smallMeteorite(x,y) {
    var _this = this;
    this.smallmeteoriteRadius = 20;
    this.x = x;
    this.y = y;
    this.smallmeteoriteSpeed = 5;
    this.angle = Math.floor(Math.random() * 360);
    this.temp1 = 0;
    this.temp2 = 0;
    //画出陨石
    this.drawMeteorite = function () {
        var meteorite = new Image();
        meteorite.src = "img/meteorite.png";
        ctx.save();
        ctx.beginPath(); //开始创建一个路径
        ctx.arc(_this.x,_this.y,_this.smallmeteoriteRadius,0,Math.PI / 180 * 360,false); //画一个圆形裁剪区域
        ctx.clip(); //裁剪
        ctx.drawImage(meteorite,_this.x - _this.smallmeteoriteRadius,_this.y - _this.smallmeteoriteRadius, _this.smallmeteoriteRadius * 2, _this.smallmeteoriteRadius * 2) ;//绘制图片
        ctx.restore() ;//恢复之前保存的绘图上下文
    };
    //更新陨石位置
    this.updatePos = function () {
        _this.x += _this.smallmeteoriteSpeed * Math.cos(Math.PI / 180 * _this.angle);
        _this.y += _this.smallmeteoriteSpeed * Math.sin(Math.PI / 180 * _this.angle);
        if (_this.x - _this.smallmeteoriteRadius <= 0 || _this.x + _this.smallmeteoriteRadius >= cvs.width
            || _this.y - _this.smallmeteoriteRadius <= 0 || _this.y + _this.smallmeteoriteRadius >= cvs.height) {
            _this.angle += 90;
        }
    };
    this.explosion = function () {
        var explosion = new Image();
        explosion.src = "img/explosion.png";
        ctx.drawImage(explosion, _this.temp1 * explosion.width/8, _this.temp2 * explosion.height/4,
            explosion.width/8, explosion.height/4, _this.x-50, _this.y-50, 150, 150);
        _this.temp1++;
        if(_this.temp1 == 8){
            _this.temp1 = 0;
            _this.temp2++;
        }
    };
}
//根据飞机位置画出子弹
function Bullet(x,y) {
    var _this = this;
    this.x = x;
    this.y = y;
    this.bulletWidth = 12;
    this.bulletHeight = 30;
    this.bulletSpeed = 6;
    this.dead = false;
    this.draw = function () {
        var bullet = new Image();
        bullet.src = "img/bullet.png";
        ctx.save();
        ctx.beginPath();
        ctx.drawImage(bullet,_this.x - _this.bulletWidth / 2,_this.y - _this.bulletHeight,
                        _this.bulletWidth, _this.bulletHeight) ;//绘制图片
        ctx.restore();
    };
    this.updateStatus = function () {
        _this.y -= _this.bulletSpeed;
        if(_this.y < -_this.bulletHeight) {
            _this.dead = true;
        }
    }
}