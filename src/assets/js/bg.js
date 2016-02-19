var bgStage,
    middleStage,
    BGWIDTH = 1920,
    BGHEIGHT = 1080;

function bgInit(){
  bgStage = new createjs.Stage("bgCanvas");
  bgStage.canvas.width = BGWIDTH;
  bgStage.canvas.height = BGHEIGHT;

  middleStage = new createjs.Stage("middleCanvas");
  middleStage.canvas.width = BGWIDTH;
  middleStage.canvas.height = BGHEIGHT;

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", bgStage);
  createjs.Ticker.addEventListener("tick", middleStage);

  // Изменяем размер холста
  resizeCanvas("bgCanvas", BGWIDTH, 1, 0.5625);
  resizeCanvas("middleCanvas", BGWIDTH, 1, 0.5625);

  function preloadBG(){
    var preload, i;
    preload = new createjs.LoadQueue();
    preload.on("fileload", function(){
      bgStage.update();
    });
    preload.loadFile("img/gamebg.png");
    preload.loadFile("img/mainbg.jpg");
  }
  preloadBG();

  var mainBG = new createjs.Bitmap("img/mainbg.jpg");
  var gameBG = new createjs.Bitmap("img/gamebg.png");

  mainBG.x = mainBG.y = gameBG.x = gameBG.y = 0;
  mainBG.width = gameBG.width = BGWIDTH;
  mainBG.height = gameBG.height = BGHEIGHT;
  bgStage.addChild(mainBG);
  middleStage.addChild(gameBG);

}
