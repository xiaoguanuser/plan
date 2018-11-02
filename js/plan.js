window.onload = function(){
    new Engine();
}

 function Engine(){
    this.init();
}
Engine.prototype.init= function(){
    var _this = this;
    //保存父级的大盒子
    this.bodyMain = QFTools.$("#body_main");
    //找到所有点击难度的ul;
    this.options = QFTools.$("#options");
    //绑定点事件，使用事件委派
    this.options.onclick = function(e){
        e = e || event;
        var target = e.target || e.srcElement;
        if(target.nodeName === "LI"){
            //获取难度
            _this.diff = target.value;
            //让options移除
            _this.bodyMain.removeChild(_this.options);
            //进入开场的动画
            _this.startAnimation();
        }
    }
}

    Engine.prototype.startAnimation = function(){
        //让背景图动起来
        var top = 0;
        setInterval(function(){
            top -= 10;
            this.bodyMain.style.backgroundPositionY = top + "px";
        }.bind(this),30);
        //创建logo 
        var logo = QFTools.createDiv("logo");
        //创建小飞机放屁
        var loading = QFTools.createDiv("loading");
        var n = 0;
        var timer = setInterval(function(){
            n++;
            loading.style.background = "url(images/loading"+ (n%3+1) +".png)";
            if(n>4){
                //开场动画结束
                clearInterval(timer);
                //移除logo和loading
                document.body.removeChild(logo);
                document.body.removeChild(loading);
                this.startGame();
            }
        }.bind(this),500);
    }

    Engine.prototype.startGame = function(){
        //创建敌机和战集;
        myPlane.init(this.bodyMain).fire(this.diff);//链式操作；
        //创建敌机
        //40% 小敌机
        //20% 中敌机
        //5%  大敌机
        //35%  不出现敌机
        setInterval(()=>{
            var rand = Math.random().toFixed(2);
            if(rand < 0.4) new  Enemy(1,this.bodyMain);
            else if(rand < 0.6) new Enemy(2,this.bodyMain);
            else if(rand < 0.65) new Enemy(3,this.bodyMain);
        },500);
    }
    //我方飞机
    var myPlane = {
        aBulltes:[],
        init: function(bodyMain){
            //Engine对象传过来的bodyMain;
            this.bodyMain = bodyMain;
            //创建战绩的DOM元素
            this.ele = QFTools.createDiv("my-warplain");
            //左右居中
            this.ele.style.left = (QFTools.getBody().width - this.ele.offsetWidth)/2 + "px";
            //垂直居底
            this.ele.style.top = QFTools.getBody().height - this.ele.offsetHeight + "px";
            this.move();
            //返回this是为了实现链式调用；
            return this;
        },
        move: function(){
            //飞机跟随鼠标移动
            QFTools.on(document.body,"mousemove",function(e){
                e = e || event;
                //鼠标的中心点跟随鼠标移动
                this.ele.style.top = e.clientY - this.ele.offsetHeight/2 + "px";
                var _left = e.clientX - this.ele.offsetWidth/2;
                //判断左右边界
                if(_left < this.bodyMain.offsetLeft) _left = this.bodyMain.offsetLeft;
                if(_left > this.bodyMain.offsetLeft + this.bodyMain.offsetWidth - this.ele.offsetWidth)
                    _left = this.bodyMain.offsetLeft + this.bodyMain.offsetWidth - this.ele.offsetWidth;
                    this.ele.style.left = _left + "px";
            }.bind(this),false);
        },
        fire: function(diff){
            //创建子弹
            //创建子弹的时间间隔根据难度决定，难度值越小，游戏难度越大，时间间隔越大
            this.duration = 500/diff;
            setInterval(()=>{
            this.aBulltes.push (new Bullet().init(this.ele));
            //创建实例，调用init，push到aBullets数组里面；相当于下面这句话
                //var bull = new Bullet();
                //bull.init(this.ele);
                //this.aBulltes.push(bull);

            },this.duration);
            
        }
    }
    function Bullet(){

    }

    Bullet.prototype = {
        //改变整个原型指向的时候，要把constructor指回构造函数本身
        //constructor: Bullet,
        constructor:Bullet,
        init: function(plane){
            //创建子弹元素
            this.ele = QFTools.createDiv("bullet");
            //给子弹出事坐标
            this.ele.style.top = plane.offsetTop - this.ele.offsetHeight + "px";
            this.ele.style.left = plane.offsetLeft +plane.offsetWidth/2 - this.ele.offsetWidth/2 + "px";
            this.move();
            return this;
        },
        move:function(){
            this.timer = setInterval(()=>{
                this.ele.style.top = this.ele.offsetTop - 8 + "px";
                //判断是否超出边界
                if(this.ele.offsetTop < -10) this.die();
            },30);
        },
        die: function(){
            //document.body.removeChild(this.ele);
            clearInterval(this.timer);
            //执行爆炸动画
            this.ele.className = "bullet_die";
            setTimeout(()=>{
                this.ele.className = "bullet_die2";
                setTimeout(()=>{
                    //爆炸动画结束之后100毫秒再从DOM中移除元素
                    document.body.removeChild(this.ele);
                },100);
            },100);
            //从aBullets数组里把当前子弹移除
            //这一段代码放在定时器外面同步执行
            for(var i = 0; i < myPlane.aBulltes.length;i++){
                //this就是指当前的子对象
                //查找this处于数组里面的第几个
                if(this === myPlane.aBulltes[i]){
                    myPlane.aBulltes.splice(i,1);
                }
            }
        }
    }
    class Enemy{
        constructor(type,bodyMain){
            this.type = type;
            this.bodyMain = bodyMain;
            this.init();
        }
        init(){
            //type = 1; 小敌机  speed = 5//小敌机的速度为5  blood = 1;
            //type = 2; 大敌机  speed = 3//中敌机的速度为3  blood = 7;
            //type = 3; 大敌机  speed = 1//大敌机的速度为1  blood = 15;
            switch(this.type){
                case 1:
                    this.ele = QFTools.createDiv("enemy-small");
                    this.speed = 5;
                    this.blood = 1;
                break;
                case 2:
                    this.ele = QFTools.createDiv("enemy-middle");
                    this.speed = 3;
                    this.blood = 7;
                break;
                case 3:
                    this.ele = QFTools.createDiv("enemy-large");
                    this.speed = 1;
                    this.blood = 15;
                break;
            }
            //计算敌机的初始left值，在游戏区范围内随机生成
            var min = this.bodyMain.offsetLeft;
            var max = this.bodyMain.offsetLeft + this.bodyMain.offsetWidth - this.ele.offsetWidth;
            var _left = parseInt(Math.random()*(max-min))+min;
            //top值为刚好隐藏自己的位置 -height
            var _top = -this.ele.offsetHeight;
            this.ele.style.top = _top + "px";
            this.ele.style.left = _left + "px";
            this.move();
        }
        move(){
            this.timer = setInterval(()=>{
                //每个敌机根据自己的速度移动
                this.ele.style.top = this.ele.offsetTop + this.speed + "px";
                //判断移动边界
                if(this.ele.offsetTop > this.bodyMain.offsetHeight) this.die();
                //判断敌机跟我方战机的碰撞
                //前面四句代码是我方飞机的位置
                //后四句是敌方的位置
                var mLeft = myPlane.ele.offsetLeft,
                    mRight = mLeft + myPlane.ele.offsetWidth,
                    mTop = myPlane.ele.offsetTop,
                    mBottom = mTop + myPlane.ele.offsetHeight,
                    eLeft = this.ele.offsetLeft,
                    eRight = eLeft + this.ele.offsetWidth,
                    eTop = this.ele.offsetTop,
                    eBottom = eTop + this.ele.offsetHeight;
                if(!(eBottom < mTop || mRight < eLeft || mBottom < eTop || eRight < mLeft)){
                    //得到所有没有碰到的结果取反
                    //如果敌机跟战机撞上了
                    if(confirm("你死了，需要重新开始吗？")){
                        window.location.reload(true);
                    }
                }
                //检测敌机跟所有子弹的碰撞
                for(var i = 0; i < myPlane.aBulltes.length;i++){
                    var bLeft = myPlane.aBulltes[i].ele.offsetLeft,
                        bRight = bLeft + myPlane.aBulltes[i].ele.offsetWidth,
                        bTop = myPlane.aBulltes[i].ele.offsetTop,
                        bBottom = bTop + myPlane.aBulltes[i].ele.offsetHeight;
                    if(!(eBottom < bTop || bRight < eLeft || bBottom < eTop || eRight < bLeft)){
                        console.log(this);
                        //敌机跟子弹发生碰撞了
                        myPlane.aBulltes[i].die();
                        //如果血量减到0，那么就die；
                        if(--this.blood === 0){
                            this.die();
                        }
                    }    
                }
            },30);
        }
        die(){
            document.body.removeChild(this.ele);
            clearInterval(this.timer);
        }
    }