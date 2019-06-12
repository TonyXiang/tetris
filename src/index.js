/**
 * Created by xianglei on 2016/7/27.
 */
window.addEventListener('load', function(){

    var canvas = document.getElementById('Tetris');
    var ctx = canvas.getContext('2d');

    var getPixelRatio = function(context) {
        var backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;

        return (window.devicePixelRatio || 1) / backingStore;
    };

    var ratio = getPixelRatio(ctx);
    console.log(ratio);
    //ratio = 1;

    var width,
        height,
        columnNum = 10,
        rowNum = 15,
        rowNum,
        //blockWidth = width/columnNum,
        blockWidth,
        newShape,
        nextShape,
        game,
        start = false,
        score = 0,
        cleanAmout = 0,
        pageArray,
        colorArray,
        animation;

    function reSize(){
        var w = $(window).width();
        var h = $(window).height();
        var margin;

        $('html, body').css('font-size',w/20 + 'px');

        if(h/w >= 1.5){
            width = w;
            height = 1.5*w;
            margin = (h-height)/2;
            canvas.width =  width*ratio;
            canvas.height = height*ratio;
            $(canvas).css('width', width);
            $(canvas).css('height', height);
            $(canvas).css('margin', margin + 'px 0 0 0');
            blockWidth = width/columnNum;
        }else if(h/w < 1.5) {
            height = h;
            width = h/1.5;
            margin = (w-width)/2;
            canvas.width =  width*ratio;
            canvas.height = height*ratio;
            $(canvas).css('width', width);
            $(canvas).css('height', height);
            $(canvas).css('margin', '0 0 0 ' + margin + 'px');
            blockWidth = width/columnNum;
        }
    }

    $(window).on('resize', function(){
        reSize()
    });

    reSize();

    $('body').on('touchmove touchstart', function (event) {
        event.preventDefault();
    });

    var shapes = [
        {
            matrix: [
                [0, 1, 0],
                [1, 1, 1]
            ],
            color: '#01bf9d'
        },
        {
            matrix: [
                [1, 1],
                [0, 1],
                [0, 1],
            ],
            color: '#1fcf6d'
        },
        {
            matrix: [
                [1, 1],
                [1, 0],
                [1, 0],
            ],
            color: '#5babe6'
        },
        {
            matrix: [
                [1, 1],
                [1, 1]
            ],
            color: '#f3c500'
        },
        {
            matrix: [
                [1, 1 , 1, 1]
            ],
            color: '#e77d03'
        },
        {
            matrix: [
                [1, 1 , 0],
                [0, 1 , 1]
            ],
            color: '#e04db9'
        },
        {
            matrix: [
                [0, 1 , 1],
                [1, 1 , 0]
            ],
            color: '#f72571'
        },
    ];

    /**绘制一个方块
     *@param x ，y  绘制起点的坐标
     * */
    var drawBlock = function(x, y, page){
        var a = 1;
        var radius = 5;

        ctx.beginPath(); // 开始路径绘制
        ctx.moveTo((x*blockWidth + a)*ratio, (y*blockWidth + a + radius)*ratio);
        ctx.arcTo((x*blockWidth + a)*ratio, (y*blockWidth + a)*ratio, ((x+1)*blockWidth - a - radius)*ratio, (y*blockWidth + a)*ratio, radius*ratio);
        ctx.arcTo(((x+1)*blockWidth - a)*ratio, (y*blockWidth + a)*ratio, ((x+1)*blockWidth - a)*ratio, ((y+1)*blockWidth - a + radius)*ratio, radius*ratio);
        ctx.arcTo(((x+1)*blockWidth - a)*ratio, ((y+1)*blockWidth - a)*ratio, (x*blockWidth + a + radius)*ratio, ((y+1)*blockWidth - a)*ratio, radius*ratio);
        ctx.arcTo((x*blockWidth + a)*ratio , ((y+1)*blockWidth - a)*ratio, (x*blockWidth + a)*ratio, (y*blockWidth + a + radius)*ratio, radius*ratio);
        ctx.lineWidth = 1.0; // 设置线宽
        ctx.strokeStyle = '#ffffff'; // 设置线的颜色
        ctx.stroke(); // 进行线的着色，这时整条线才变得可见

        ctx.shadowOffsetX = 0; // 设置水平位移
        ctx.shadowOffsetY = 0; // 设置垂直位移
        ctx.shadowBlur = 5; // 设置模糊度
        ctx.shadowColor = 'rgba(255,255,255,0.5)'; // 设置阴影颜色

        if(!page){
            ctx.fillStyle = shapes[newShape.type].color;
        }else{
            ctx.fillStyle = colorArray[y][x];
        }
        ctx.fill();

    };

    /**绘制页面 */
    var drawPage = function(){

        ctx.globalAlpha=1.0;
        ctx.clearRect(0,0,width*ratio,height*ratio);
        ctx.fillStyle = '#ecf0f1';

        ctx.fillRect(0,0,width*ratio,height*ratio);

        var blocks = getBlocks();
        for(var i = 0; i < blocks.length; i++){
            drawBlock(blocks[i].x, blocks[i].y);
        }
        for(var i = 0; i < pageArray.length; i++){
            for(var j = 0; j < pageArray[i].length; j++){
                if(pageArray[i][j] === 1){
                    drawBlock(j, i, 'page');
                }
            }
        }

        drawNextShape();

        ctx.font = 12*ratio + "px Arial";
        ctx.shadowOffsetX = 0; // 设置水平位移
        ctx.shadowOffsetY = 0; // 设置垂直位移
        ctx.shadowBlur = 0; // 设置模糊度
        ctx.fillStyle = '#333333';
        ctx.globalAlpha=0.7;
        ctx.fillText('得分：' + score,10*ratio,20*ratio);


        if(!localStorage.HighestScore){
            localStorage.HighestScore = 0
        }

        ctx.fillText('最高分：' + localStorage.HighestScore,10*ratio,40*ratio);

        animation = requestAnimationFrame(drawPage);
    };

    var getBlocks = function (swipeType){
        var type = newShape.type,
            rotate = newShape.rotate;
        if(swipeType === 'swipeUp'){
            rotate = rotate + 90;
            if(type === 4){
                if(rotate%360 === 0 || rotate%360 === 180){
                    newShape.x+=1;
                    newShape.y-=1;
                }else if(rotate%360 === 90 || rotate%360 === 270){
                    newShape.x-=1;
                    newShape.y+=1;
                }
            }
        }
        var x = newShape.x,
            y = newShape.y;

        if(swipeType === 'swipeLeft'){
            x -= 1;
        }else if(swipeType === 'swipeRight'){
            x += 1;
        }else if(swipeType === 'game'){
            y += 1;
        }
        var data = shapes[type], dx, dy, blocks = [];
        var maxY = data.matrix[0].length - 1,
            maxX = data.matrix.length - 1;
        for(var i = 0; i < data.matrix.length; i++){
            for(var j = 0; j < data.matrix[i].length; j++){
                if(data.matrix[i][j] === 1){
                    switch (rotate%360){
                        case 0:
                            dx = x + i;
                            dy = y + j;
                            break;
                        case 90:
                            dx = x + maxY - j;
                            dy = y + i;
                            break;
                        case 180:
                            dx = x + maxX - i;
                            dy = y + maxY - j;
                            break;
                        case 270:
                            dx = x + j;
                            dy = y + maxX - i;
                            break;
                    }
                    blocks.push({x: dx, y: dy});
                }
            }
        }
        return blocks;
    };

    function addBlocksToPageArray(blocks){
        for(var i = 0;i < blocks.length; i++){
            var pageX = blocks[i].y- 1,
                pageY = blocks[i].x;
            pageArray[pageX][pageY] = 1;
            colorArray[pageX][pageY] = shapes[newShape.type].color;
        }
        cleanBlocks();
    }

    function cleanBlocks(){
        var cleanRowsNum = 0;
        for(var i = 0; i < pageArray.length; i++){
            var clean = true;
            for(var j = 0; j < pageArray[i].length; j++){
                if(pageArray[i][j] === 0){
                    clean = false;
                    break;
                }
            }
            if(clean){
                pageArray.splice(i, 1);
                var array = [];
                for(var k = 0; k < columnNum; k++){
                    array.push(0);
                }
                pageArray = [array].concat(pageArray);
                cleanRowsNum++;

                colorArray.splice(i, 1);
                var array2 = [];
                for(var k = 0; k < columnNum; k++){
                    array2.push(0);
                }
                colorArray = [array2].concat(colorArray);
            }
        }
        score += cleanRowsNum*cleanRowsNum*100;
        if(cleanRowsNum > 0){
            cleanAmout++;
        }
    }

    function creatNewShape (){
        this.x = parseInt(columnNum/2) - 2;
        this.y = 0;
        this.rotate = parseInt(Math.random()*4,10)*90;
        this.type = parseInt(Math.random()*7,10);

        if(this.rotate === 0 || this.rotate === 180){
            this.y = 1 - shapes[this.type].matrix[0].length;
        }else{
            this.y = 1 - shapes[this.type].matrix.length;
        }

        this.addRotate = function(){
            this.rotate = (this.rotate + 90)%360;
        };
    }

    function drawNextShape(){
        var type = nextShape.type,
            rotate = nextShape.rotate;

        var data = shapes[type], dx, dy, blocks = [];
        var maxY = data.matrix[0].length - 1,
            maxX = data.matrix.length - 1;
        for(var i = 0; i < data.matrix.length; i++){
            for(var j = 0; j < data.matrix[i].length; j++){
                if(data.matrix[i][j] === 1){
                    switch (rotate%360){
                        case 0:
                            dx = i;
                            dy = j;
                            break;
                        case 90:
                            dx = maxY - j;
                            dy = i;
                            break;
                        case 180:
                            dx = maxX - i;
                            dy = maxY - j;
                            break;
                        case 270:
                            dx = j;
                            dy = maxX - i;
                            break;
                    }
                    blocks.push({x: dx, y: dy});
                }
            }
        }

        for(var i = 0; i < blocks.length; i++){
            var x = blocks[i].x,
                y = blocks[i].y;
            var a = 0.1;
            var radius = 0.5;

            var addX = width*0.9;
            var addY = 20;

            ctx.beginPath(); // 开始路径绘制
            ctx.moveTo((x*blockWidth/5 + a + addX)*ratio, (y*blockWidth/5 + a + radius + addY)*ratio);
            ctx.arcTo((x*blockWidth/5 + a + addX)*ratio, (y*blockWidth/5 + a + addY)*ratio, ((x+1)*blockWidth/5 - a - radius + addX)*ratio, (y*blockWidth/5 + a + addY)*ratio, radius*ratio);
            ctx.arcTo(((x+1)*blockWidth/5 - a + addX)*ratio, (y*blockWidth/5 + a + addY)*ratio, ((x+1)*blockWidth/5 - a + addX)*ratio, ((y+1)*blockWidth/5 - a + radius + addY)*ratio, radius*ratio);
            ctx.arcTo(((x+1)*blockWidth/5 - a + addX)*ratio, ((y+1)*blockWidth/5 - a + addY)*ratio, (x*blockWidth/5 + a + radius + addX)*ratio, ((y+1)*blockWidth/5 - a + addY)*ratio, radius*ratio);
            ctx.arcTo((x*blockWidth/5 + a + addX)*ratio, ((y+1)*blockWidth/5 - a + addY)*ratio, (x*blockWidth/5 + a + addX)*ratio, (y*blockWidth/5 + a + radius + addY)*ratio, radius*ratio);
            ctx.lineWidth = 0.1; // 设置线宽
            ctx.strokeStyle = '#ffffff'; // 设置线的颜色
            ctx.stroke(); // 进行线的着色，这时整条线才变得可见

            ctx.shadowOffsetX = 0; // 设置水平位移
            ctx.shadowOffsetY = 0; // 设置垂直位移
            ctx.shadowBlur = 0.55; // 设置模糊度
            ctx.shadowColor = 'rgba(255,255,255,0.5)'; // 设置阴影颜色
            ctx.fillStyle = shapes[nextShape.type].color;
            ctx.fill();
        }
    }

    /**绘制分数 */
    var drawScore = function(){

    };

    var getIntervalTime = function(s){
        var i = Math.floor(s/10);
        if(i > 9){
            i = 9;
        }
        return 1000 - i*100;
    };

    var doGame = function(){
        console.log('doGame');
        var blocks = getBlocks('game');
        var flag = true;
        for(var i = 0; i < blocks.length; i++){
            if(blocks[i].y >= 0  && (blocks[i].y >= rowNum || pageArray[blocks[i].y][blocks[i].x] === 1 )){
                if(newShape.y <= 0){
                    gameOver();
                    return;
                }else{
                    clearInterval(game);
                    game = setInterval(function(){
                        doGame();
                    }, getIntervalTime(cleanAmout));
                    addBlocksToPageArray(blocks);

                    newShape = nextShape;
                    nextShape = new creatNewShape();
                    return;
                }
                flag = false;
            }
        }
        if(flag){
            newShape.y += 1;
        }
    };

    var swipeLeft = function(){
        var blocks = getBlocks('swipeLeft');
        var flag = true;
        for(var i = 0; i < blocks.length; i++){
            if(blocks[i].x < 0 ){
                flag = false;
                break;
            }
            if(pageArray[blocks[i].y] && pageArray[blocks[i].y][blocks[i].x] === 1 ){
                flag = false;
                break;
            }
        }
        if(flag){
            newShape.x -= 1;
        }
    };

    var swipeRight = function(){
        var blocks = getBlocks('swipeRight');
        var flag = true;
        for(var i = 0; i < blocks.length; i++){
            if(blocks[i].x >= columnNum){
                flag = false;
                break;
            }
            if(pageArray[blocks[i].y] && pageArray[blocks[i].y][blocks[i].x] === 1 ){
                flag = false;
                break;
            }
        }
        if(flag){
            newShape.x += 1;
        }
    };

    var swipeUp = function(){
        var flag = false;
        var dx = '';
        var dy = '';
        var maxTime = 4;
        var times = 0;

        while (flag === false && times < maxTime && Math.abs(dx) < 3 && dy < 3){
            if(dx === ''){
                dx = 0;
            }
            if(dy === ''){
                dy = 0;
            }
            var blocks = getBlocks('swipeUp');
            for(var i = 0; i < blocks.length; i++){
                if(blocks[i].x < 0){
                    flag = false;
                    //dx = blocks[i].x;
                    newShape.x+=1;
                    dx += 1;
                    break;
                }else if(blocks[i].x - columnNum + 1 > 0){
                    //dx = blocks[i].x - columnNum + 1;
                    flag = false;
                    newShape.x-=1;
                    dx -= 1;
                    break;
                }

                if(blocks[i].y >= 0  && (blocks[i].y >= rowNum || pageArray[blocks[i].y][blocks[i].x] === 1 )){
                    flag = false;
                    dy -= 1;
                    break;
                }
                flag = true;
            }

            times++;
        }

        if(flag){
            newShape.addRotate();
        }else{
            var rotate = newShape.rotate + 90, type = newShape.type;
            if(type === 4){
                if(rotate%360 === 0 || rotate%360 === 180){
                    newShape.x-=1;
                    newShape.y+=1;
                }else if(rotate%360 === 90 || rotate%360 === 270){
                    newShape.x+=1;
                    newShape.y-=1;
                }
            }

            //newShape.x-=dx;
            //newShape.y+=dy;
        }
    };

    var swipeDown = function(){
        clearInterval(game);

        game = setInterval(function(){
            doGame();
        }, 10);
    };

    function gameOver (){
        cancelAnimationFrame(animation);
        clearInterval(game);
        game = '';
        start = false;
        var HighestScore = localStorage.HighestScore || 0;
        if(score > HighestScore){
            localStorage.HighestScore = score;
        }

        $('.title').html('游戏结束');
        $('.content').html('得分：' + score);
        $('.btn').html('再来一局');

        $('#alert').show();
    }

    function main(){

        if(start === false){
            start = true;
        }else {
            return;
        }

        pageArray = [];
        colorArray = [];

        for(var i = 0; i < rowNum; i++){
            var array = [];
            for(var j = 0; j < columnNum; j++){
                array.push(0);
            }
            pageArray.push(array);
        }

        for(var i = 0; i < rowNum; i++){
            var array = [];
            for(var j = 0; j < columnNum; j++){
                array.push(0);
            }
            colorArray.push(array);
        }

        score = 0;
        cleanAmout = 0;
        newShape = new creatNewShape();
        nextShape = new creatNewShape();

        game = setInterval(function(){
            doGame();
        }, 1000);

        $(canvas).on('swipeLeft', function(e){
            swipeLeft();
        });

        $(canvas).on('swipeRight', function(e){
            swipeRight();
        });

        $(canvas).on('swipeUp', function(e){
            swipeUp();
        });

        $(canvas).on('swipeDown', function(e){
            swipeDown();
        });

        $(window).keydown(function(e){
            if(e.keyCode === 38){
                swipeUp();
            }else if(e.keyCode === 40){
                swipeDown()
            }else if(e.keyCode === 37){
                swipeLeft()
            }else if(e.keyCode === 39){
                swipeRight();
            }
        });

        requestAnimationFrame(drawPage);
    };

    $('.btn').on('tap click', function(){
        $('#alert').hide();
        main();
    })
});
