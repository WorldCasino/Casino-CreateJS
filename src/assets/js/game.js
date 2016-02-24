var bgStage,
    middleStage,
		gameStage,

		WIDTH = 1280,
		HEIGHT = 720,
		BGWIDTH = 1920,
    BGHEIGHT = 1080,

    linesCoords,
		lines = [],
		linesLight = [],
		winLines = [];

function resizeCanvas(canvasID, width, percent, heightToWidth) {
  // Берем холст
  var bgCanvas = document.getElementById(canvasID);
  // Изменяем его ширину чтобы он занимал 100% экрана и при этом не больше 1280 пикселей !!!!! Число 13 - это костыль(((
  bgCanvas.style.width = (document.getElementById("game").clientWidth + 13)*percent + "px";
  if(parseInt(bgCanvas.style.width) > width){bgCanvas.style.width = width + "px"}
  // Делаем соответствующую высоту холста
  bgCanvas.style.height = parseInt(bgCanvas.style.width)*heightToWidth + "px";

  // Проделываем все эти операции при любом изменении размеров экрана
  $(window).on("resize", function(event) {
    bgCanvas.style.width = document.getElementById("game").clientWidth*percent + "px";
    if(parseInt(bgCanvas.style.width) > width){bgCanvas.style.width = width + "px"}
    bgCanvas.style.height = parseInt(bgCanvas.style.width)*heightToWidth + "px";
  });
}

$(document).ready(function(){

	bgStage = new createjs.Stage("bgCanvas");
	bgStage.canvas.width = BGWIDTH;
	bgStage.canvas.height = BGHEIGHT;

	middleStage = new createjs.Stage("middleCanvas");
	middleStage.canvas.width = BGWIDTH;
	middleStage.canvas.height = BGHEIGHT;

	gameStage = new createjs.Stage("gameCanvas");
	gameStage.canvas.width = WIDTH;
	gameStage.canvas.height = HEIGHT;

	// Определяем параметры для линий
	var rowNumber = 5,
			rowWidth = gameStage.canvas.width/rowNumber,
	// Определяем параметры для элементов
			elementNumberAll = 60,
			elementNumberOnScreen = 3,
			elementWidth = rowWidth,
			elementHeight = gameStage.canvas.height/elementNumberOnScreen,
	// Массивы элементов и их позиций
			elementsMas = [],
			elementsPositions = [],
	// Массивы линий, этого и следующего экранов
			rows = [],
	 		currentScreen = [],
			nextScreen = [],
      winRows = [],
      numbersOfLines = [],
      numbers = [],
			name = "SomeName" + Math.random()*100, // Имя игрока
			url = "http://192.168.0.250/JSON/SlotService.svc/", // URL сервера
			sessionID, // ID игровой сессии
			gameID = 0, // ID игры
      bet = 2, // Ставка
			wheels = [], // Масиив линий барабана
      spinButton,
      spinHovButton,
      spinTachButton;
	// Добавляем перерисовку с FPS = 60
	createjs.Ticker.setFPS(40);
	createjs.Ticker.addEventListener("tick", bgStage);
	createjs.Ticker.addEventListener("tick", middleStage);
	createjs.Ticker.addEventListener("tick", gameStage);

	// Изменяем размер холста
	resizeCanvas("gameCanvas", WIDTH, 0.67, 0.5625);
	resizeCanvas("bgCanvas", BGWIDTH, 1, 0.5625);
  resizeCanvas("middleCanvas", BGWIDTH, 1, 0.5625);

	function preloadBG(){
		var preload, i;
		preload = new createjs.LoadQueue();
		preload.on("fileload", function(){
			bgStage.update();
		});
		preload.loadFile("img/gamebg.png");
		preload.loadFile("img/mainbg.png");
		preload.loadFile("img/mainfg.png");
		preload.loadFile("img/Tuchi.png");
		preload.loadFile("img/fonarverh2.png");
		preload.loadFile("img/fonarverh3.png");
		preload.loadFile("img/fonarniz.png");
		preload.loadFile("img/buttons/Spin.png");
    preload.loadFile("img/buttons/Spin_hov.png");
    preload.loadFile("img/buttons/Spin_tach.png");
		preload.loadFile("img/buttons/AutoPlay.png");
    preload.loadFile("img/buttons/AutoPlay_hov.png");
    preload.loadFile("img/buttons/AutoPlay_tach.png");
    preload.loadFile("img/buttons/Max_bet.png");
    preload.loadFile("img/buttons/Max_bet_hov.png");
    preload.loadFile("img/buttons/Max_bet_tach.png");
    preload.loadFile("img/buttons/Minus.png");
    preload.loadFile("img/buttons/Minus_hov.png");
    preload.loadFile("img/buttons/Minus_tach.png");
    preload.loadFile("img/buttons/Plus.png");
    preload.loadFile("img/buttons/Plus_hov.png");
    preload.loadFile("img/buttons/Plus_tach.png");
	}
	preloadBG();
	function preloadSlots() {
		var preload, i, j;
		preload = new createjs.LoadQueue();
		preload.on("fileload", function(){
			gameStage.update();
		});
		// Загружаем наши картинки
		for(i = 1; i <= 10; i++) {
			preload.loadFile("img/game/" + i + ".png");
			preload.loadFile("img/game/blur/" + i + "b.png");
      preload.loadFile("img/game/win/" + i + ".png");
		}
		for(j = 1; j <= 21; j++) {
			preload.loadFile("img/Lines/Line" + j + ".png");
			preload.loadFile("img/Lines/Line" + j + "gl.png");
		}
		preload.loadFile("img/bgwithstrings.png");
	}
	// Производим предварительную загрузку изображений
	preloadSlots();

	function drawBG() {
		var slotBG = new createjs.Bitmap("img/bgwithstrings.png");
		var mainBG = new createjs.Bitmap("img/mainbg.png");
		var mainFG = new createjs.Bitmap("img/mainfg.png");
		var tuchi = new createjs.Bitmap("img/Tuchi.png");
		var tuman = new createjs.Bitmap("img/tuman_niz.png");
		var gameBG = new createjs.Bitmap("img/gamebg.png");
		var fonarNiz = new createjs.Bitmap("img/fonarniz.png");
		var fonarVerh = new createjs.Bitmap("img/fonarverh3.png");
		slotBG.width = WIDTH;
		mainBG.width = gameBG.width = BGWIDTH;
		slotBG.height = HEIGHT;
		mainBG.height = gameBG.height = BGHEIGHT;
		fonarNiz.x = -20; fonarNiz.y = 65;
		fonarVerh.x = 8; fonarVerh.y = 116;
		tuchi.x = -500;
		tuman.x = -500; tuman.y = 600;
    slotBG.x = -16; slotBG.y = -5;
		bgStage.addChild(mainBG, tuchi, mainFG);
		middleStage.addChild(gameBG);
		gameStage.addChild(slotBG);

		createjs.Tween.get(fonarVerh, {loop: true})
			.to({ rotation: 5 }, 1000)
			.to({ rotation: -3 , y: 118}, 2000)
			.to({ rotation: 0, y: 116}, 1000);
		createjs.Tween.get(tuchi, {loop: true})
			.to({ x: 300}, 70000)
			.to({ x: -500}, 70000);
		createjs.Tween.get(tuman, {loop: true})
			.to({ x: 0}, 20000)
			.to({ x: -500}, 20000);

		// Герман
		var germanData = {
			images: ["img/idleGerman.png"],
			frames: {width: 321, height: 600},
			framerate: 24,
			animations: {
				stand: [0, 200]
			}
		};
		var germanSheet = new createjs.SpriteSheet(germanData);
		var germanAnimation = new createjs.Sprite(germanSheet, "stand");
		germanAnimation.gotoAndPlay("stand");
		germanAnimation.scaleX = 1.2; germanAnimation.scaleY = 1.2;
		germanAnimation.x = 110; germanAnimation.y = 340;
		bgStage.addChild(germanAnimation);
		bgStage.addChild(tuman);
		bgStage.addChild(fonarNiz, fonarVerh);
	}
	drawBG();

	function drawButtons() {
    var autoplayID;
    var betText = new createjs.Text("BET", "13px Arial", "#ffffff");
    betText.x = 628; betText.y = 867;
    middleStage.addChild(betText);
    var coinsText = new createjs.Text("COINS", "13px Arial", "#ffffff");
    coinsText.x = 1752; coinsText.y = 867;
    middleStage.addChild(coinsText);
    var coinsValue = new createjs.Text("0.02", "bold 25px Arial", "#ffffff");
    coinsValue.x = 1553; coinsValue.y = 942;
    middleStage.addChild(coinsValue);
    var coinsSum = new createjs.Text("250000", "bold 25px Arial", "#ffffff");
    coinsSum.x = 1753; coinsSum.y = 928;
    middleStage.addChild(coinsSum);
    var betValue = new createjs.Text("1", "bold 25px Arial", "#ffffff");
    betValue.x = 828; betValue.y = 942;
    middleStage.addChild(betValue);

		middleStage.enableMouseOver(10);
		    spinButton = new createjs.Bitmap("img/buttons/Spin.png"),
        spinHovButton = new createjs.Bitmap("img/buttons/Spin_hov.png"),
        spinTachButton = new createjs.Bitmap("img/buttons/Spin_tach.png");
		spinButton.x = 1140; spinButton.y = 866;
    spinHovButton.x = 1140; spinHovButton.y = 866;
    spinTachButton.x = 1140; spinTachButton.y = 866;
    spinHovButton.alpha = 0;
    spinTachButton.alpha = 0;
    spinButton.alpha = 1;
    spinButton.on("mouseover", function(){
      spinButton.alpha = 0.01;
      spinHovButton.alpha = 1;
    });
    spinButton.on("mouseout", function(){
      spinButton.alpha = 1;
      spinHovButton.alpha = 0;
    });
    spinButton.on("mousedown", function(){
      spinButton.alpha = 0.01;
      spinTachButton.alpha = 1;
      getSpin();
    });
    spinButton.on("click", function(){
      spinButton.alpha = 1;
      spinTachButton.alpha = 0;
    });
    middleStage.addChild(spinButton, spinHovButton, spinTachButton);

    var autoplayButton = new createjs.Bitmap("img/buttons/AutoPlay.png"),
        autoplayHovButton = new createjs.Bitmap("img/buttons/AutoPlay_hov.png"),
        autoplayTachButton = new createjs.Bitmap("img/buttons/AutoPlay_tach.png");
    autoplayButton.x = 944; autoplayButton.y = 922;
    autoplayHovButton.x = 944; autoplayHovButton.y = 922;
    autoplayTachButton.x = 944; autoplayTachButton.y = 922;
    autoplayHovButton.alpha = 0;
    autoplayTachButton.alpha = 0;
    autoplayButton.alpha = 1;
    autoplayButton.on("mouseover", function(){
      autoplayButton.alpha = 0.01;
      autoplayHovButton.alpha = 1;
    });
    autoplayButton.on("mouseout", function(){
      autoplayButton.alpha = 1;
      autoplayHovButton.alpha = 0;
    });
    autoplayButton.on("mousedown", function(){
      autoplayButton.alpha = 0.01;
      autoplayTachButton.alpha = 1;
      if(autoplayID) {clearInterval(autoplayID)}
      else{
        getSpin();
        autoplayID = setInterval(getSpin.bind(null), 4000);
      }
    });
    autoplayButton.on("click", function(){
      autoplayButton.alpha = 1;
      autoplayTachButton.alpha = 0;
    });
    middleStage.addChild(autoplayButton, autoplayHovButton, autoplayTachButton);

    var maxBetButton = new createjs.Bitmap("img/buttons/Max_bet.png"),
        maxBetHovButton = new createjs.Bitmap("img/buttons/Max_bet_hov.png"),
        maxBetTachButton = new createjs.Bitmap("img/buttons/Max_bet_tach.png");
		maxBetButton.x = 1314; maxBetButton.y = 920;
    maxBetHovButton.x = 1314; maxBetHovButton.y = 920;
    maxBetTachButton.x = 1314; maxBetTachButton.y = 920;
    maxBetHovButton.alpha = 0;
    maxBetTachButton.alpha = 0;
    maxBetButton.alpha = 1;
    spinButton.cursor = maxBetButton.cursor = autoplayButton.cursor = "pointer";
    maxBetButton.on("mouseover", function(){
      maxBetButton.alpha = 0.01;
      maxBetHovButton.alpha = 1;
    });
    maxBetButton.on("mouseout", function(){
      maxBetButton.alpha = 1;
      maxBetHovButton.alpha = 0;
    });
    maxBetButton.on("mousedown", function(){
      maxBetButton.alpha = 0.01;
      maxBetTachButton.alpha = 1;
      betValue.text = 10;
      betValue.x = 822;
      $.ajax({
        url: url + '_SetBet/' + sessionID + '/' + betValue.text,
        dataType: 'JSONP',
        type: 'GET',
        success: function(data) {
          getSpin();
        }
      });
    });
    maxBetButton.on("click", function(){
      maxBetButton.alpha = 1;
      maxBetTachButton.alpha = 0;
    });
    middleStage.addChild(maxBetButton, maxBetHovButton, maxBetTachButton);

    var minusCoinsButton = new createjs.Bitmap("img/buttons/Minus.png"),
        minusCoinsHovButton = new createjs.Bitmap("img/buttons/Minus_hov.png"),
        minusCoinsTachButton = new createjs.Bitmap("img/buttons/Minus_tach.png");
    minusCoinsButton.x = 1494; minusCoinsButton.y = 937;
    minusCoinsHovButton.x = 1494; minusCoinsHovButton.y = 937;
    minusCoinsTachButton.x = 1494; minusCoinsTachButton.y = 937;
    minusCoinsHovButton.alpha = 0;
    minusCoinsTachButton.alpha = 0;
    minusCoinsButton.alpha = 1;
    minusCoinsButton.on("mouseover", function(){
      minusCoinsButton.alpha = 0.01;
      minusCoinsHovButton.alpha = 1;
    });
    minusCoinsButton.on("mouseout", function(){
      minusCoinsButton.alpha = 1;
      minusCoinsHovButton.alpha = 0;
    });
    minusCoinsButton.on("mousedown", function(){
      minusCoinsButton.alpha = 0.01;
      minusCoinsTachButton.alpha = 1;
      if(+coinsValue.text > 0.01) {
        if(+coinsValue.text === 0.02) {coinsValue.text = "0.01";}
        if(+coinsValue.text === 0.05) {coinsValue.text = "0.02";}
        if(+coinsValue.text === 0.10) {coinsValue.text = "0.05";}
        if(+coinsValue.text === 0.20) {coinsValue.text = "0.10";}
        if(+coinsValue.text === 0.50) {coinsValue.text = "0.20";}
        if(+coinsValue.text === 1.00) {coinsValue.text = "0.50";}
      }
      coinsSum.text = 5000/+coinsValue.text;
      if(+coinsSum.text >= 100 ) {
        coinsSum.x = 1771;
      }
      if(+coinsSum.text >= 1000 ) {
        coinsSum.x = 1765;
      }
      if(+coinsSum.text >= 10000 ) {
        coinsSum.x = 1759;
      }
      if(+coinsSum.text >= 100000 ) {
        coinsSum.x = 1753;
      }
    });
    minusCoinsButton.on("click", function(){
      minusCoinsButton.alpha = 1;
      minusCoinsTachButton.alpha = 0;
    });
    middleStage.addChild(minusCoinsButton, minusCoinsHovButton, minusCoinsTachButton);
    minusCoinsButton.cursor = "pointer";

    var plusCoinsButton = new createjs.Bitmap("img/buttons/Plus.png"),
        plusCoinsHovButton = new createjs.Bitmap("img/buttons/Plus_hov.png"),
        plusCoinsTachButton = new createjs.Bitmap("img/buttons/Plus_tach.png");
    plusCoinsButton.x = 1624; plusCoinsButton.y = 937;
    plusCoinsHovButton.x = 1624; plusCoinsHovButton.y = 937;
    plusCoinsTachButton.x = 1624; plusCoinsTachButton.y = 937;
    plusCoinsHovButton.alpha = 0;
    plusCoinsTachButton.alpha = 0;
    plusCoinsButton.alpha = 1;
    plusCoinsButton.on("mouseover", function(){
      plusCoinsButton.alpha = 0.01;
      plusCoinsHovButton.alpha = 1;
    });
    plusCoinsButton.on("mouseout", function(){
      plusCoinsButton.alpha = 1;
      plusCoinsHovButton.alpha = 0;
    });
    plusCoinsButton.on("mousedown", function(){
      plusCoinsButton.alpha = 0.01;
      plusCoinsTachButton.alpha = 1;
      if(+coinsValue.text < 1){
        if(+coinsValue.text === 0.50) {coinsValue.text = "1.00";}
        if(+coinsValue.text === 0.20) {coinsValue.text = "0.50";}
        if(+coinsValue.text === 0.10) {coinsValue.text = "0.20";}
        if(+coinsValue.text === 0.05) {coinsValue.text = "0.10";}
        if(+coinsValue.text === 0.02) {coinsValue.text = "0.05";}
        if(+coinsValue.text === 0.01) {coinsValue.text = "0.02";}
      }
      coinsSum.text = 5000/+coinsValue.text;
      if(+coinsSum.text < 100000 ) {
        coinsSum.x = 1759;
      }
      if(+coinsSum.text < 10000 ) {
        coinsSum.x = 1765;
      }
      if(+coinsSum.text < 1000 ) {
        coinsSum.x = 1771;
      }
      if(+coinsSum.text < 100 ) {
        coinsSum.x = 1777;
      }
    });
    plusCoinsButton.on("click", function(){
      plusCoinsButton.alpha = 1;
      plusCoinsTachButton.alpha = 0;
    });
    middleStage.addChild(plusCoinsButton, plusCoinsHovButton, plusCoinsTachButton);
    plusCoinsButton.cursor = "pointer";

    var minusBetButton = minusCoinsButton.clone(),
        minusBetHovButton = minusCoinsHovButton.clone(),
        minusBetTachButton = minusCoinsTachButton.clone();
    minusBetButton.x = minusBetHovButton.x = minusBetTachButton.x = 750;
    minusBetButton.on("mouseover", function(){
      minusBetButton.alpha = 0.01;
      minusBetHovButton.alpha = 1;
    });
    minusBetButton.on("mouseout", function(){
      minusBetButton.alpha = 1;
      minusBetHovButton.alpha = 0;
    });
    minusBetButton.on("mousedown", function(){
      minusBetButton.alpha = 0.01;
      minusBetTachButton.alpha = 1;
      if(+betValue.text > 1) {
        betValue.text = +betValue.text - 1;
      }
      if(+betValue.text !== 10) {
        betValue.x = 828;
      }
      $.ajax({
        url: url + '_SetBet/' + sessionID + '/' + betValue.text,
        dataType: 'JSONP',
        type: 'GET',
        success: function(data) {
          // console.log("Ответ на ставку: " + data);
        }
      });
    });
    minusBetButton.on("click", function(){
      minusBetButton.alpha = 1;
      minusBetTachButton.alpha = 0;
    });
    middleStage.addChild(minusBetButton, minusBetHovButton, minusBetTachButton);

    var plusBetButton = plusCoinsButton.clone(),
        plusBetHovButton = plusCoinsHovButton.clone(),
        plusBetTachButton = plusCoinsTachButton.clone();
    plusBetButton.x = plusBetHovButton.x = plusBetTachButton.x = 880;
    plusBetButton.on("mouseover", function(){
      plusBetButton.alpha = 0.01;
      plusBetHovButton.alpha = 1;
    });
    plusBetButton.on("mouseout", function(){
      plusBetButton.alpha = 1;
      plusBetHovButton.alpha = 0;
    });
    plusBetButton.on("mousedown", function(){
      plusBetButton.alpha = 0.01;
      plusBetTachButton.alpha = 1;
      if(+betValue.text < 10) {
        betValue.text = +betValue.text + 1;
      }
      if(+betValue.text === 10) {
        betValue.x = 822;
      }
      $.ajax({
        url: url + '_SetBet/' + sessionID + '/' + betValue.text,
        dataType: 'JSONP',
        type: 'GET',
        success: function(data) {
          // console.log("Ответ на ставку: " + data);
        }
      });
    });
    plusBetButton.on("click", function(){
      plusBetButton.alpha = 1;
      plusBetTachButton.alpha = 0;
    });
    middleStage.addChild(plusBetButton, plusBetHovButton, plusBetTachButton);

	}
	drawButtons();

	function drawLines() {
		for(var i = 1; i <= 21; i++) {
      var imgLight = new createjs.Bitmap("img/Lines/Line" + i + "gl.png");
      imgLight.alpha = 0;
      imgLight.x = -10;
      // gameStage.addChild(imgLight);
      linesLight.push(imgLight);
			var img = new createjs.Bitmap("img/Lines/Line" + i + ".png");
      img.alpha = 0;
      gameStage.addChild(img);
			lines.push(img);
		}
		lines[0].y = 334;
		lines[1].y = 139;
		lines[2].y = 565;
		lines[3].y = 49;
		lines[4].y = 94;
		lines[5].y = 88;
		lines[6].y = 327;
		lines[7].y = 142;
		lines[7].x = 85;
		lines[8].y = 286;
		lines[9].y = 380;
		lines[10].y = 108;
		lines[11].y = 105;
		lines[11].x = 85;
		lines[12].y = 45;
		lines[12].x = 85;
		lines[13].y = 105;
		lines[13].x = 85;
		lines[14].y = 92;
		lines[14].x = 85;
		lines[15].y = 98;
		lines[15].x = 85;
		lines[16].y = 184;
		lines[16].x = 85;
		lines[17].y = 137;
		lines[18].y = 105;
		lines[19].y = 378;
		lines[20].y = 100;
		lines[20].x = 105;
		for(var j = 0; j < linesLight.length; j++) {
			linesLight[j].y = lines[j].y - 13;
			linesLight[j].x = lines[j].x - 10;
		}
	}
	drawLines();

	function drawLineNumbers() {

		middleStage.enableMouseOver(10);
		for (var i = 1; i <= 22; i++) {
			var text = new createjs.Text(i, "20px Arial", "#ddcb8c");
			text.textBaseline = "top";
			numbers.push(text);
			var hit = new createjs.Shape();
			hit.graphics.beginFill("#000").drawCircle(text.getMeasuredWidth()/2, text.getMeasuredHeight()/2, 19);
			text.hitArea = hit;
			text.on("mouseover", function(){
				showLine(this.text);
				this.shadow = new createjs.Shadow("#FFFFFF", 1, 1, 2);
			});
			text.on("mouseout", function(){
				lines[this.text - 1].alpha = 0;
				this.shadow.offsetX = this.shadow.offsetY = this.shadow.blur = 0;
			});
		}
		numbers[21].text = 1;
		numbers[0].x = 549; numbers[0].y = 455;
		numbers[1].x = 1855; numbers[1].y = 257;
		numbers[2].x = 1855; numbers[2].y = 697;
		numbers[3].x = 549; numbers[3].y = 165;
		numbers[4].x = 549; numbers[4].y = 789;
		numbers[5].x = 549; numbers[5].y = 210;
		numbers[6].x = 550; numbers[6].y = 744;
		numbers[7].x = 1855; numbers[7].y = 548;
		numbers[8].x = 549; numbers[8].y = 409;
		numbers[9].x = 542; numbers[9].y = 650;
		numbers[10].x = 543; numbers[10].y = 303;
		numbers[11].x = 1848; numbers[11].y = 789;
		numbers[12].x = 1848; numbers[12].y = 165;
		numbers[13].x = 1848; numbers[13].y = 744;
		numbers[14].x = 1848; numbers[14].y = 212;
		numbers[15].x = 1848; numbers[15].y = 651;
		numbers[16].x = 1848; numbers[16].y = 304;
		numbers[17].x = 543; numbers[17].y = 257;
		numbers[18].x = 543; numbers[18].y = 697;
		numbers[19].x = 543; numbers[19].y = 501;
  	numbers[20].x = 1850; numbers[20].y = 501;
		numbers[21].x = 1855; numbers[21].y = 455;
		for (var i = 0; i < numbers.length; i++) {
			middleStage.addChild(numbers[i]);
		}
	}
	drawLineNumbers();

	function showLine(number) {
		// gameStage.addChild(linesLight[number-1]);
		lines[number-1].alpha = 1;
    // linesLight[number-1].alpha = 1;
		gameStage.update();
		// createjs.Tween.get(linesLight[number-1], {loop: true})
		// 	.to({ alpha: opacity }, 1000)
		// 	.to({ alpha: 0 }, 1000);
	}

	function startGame(name) {
		// Запрос по имени пользователя
		$.ajax({
			url: url + '_Login/' + name,
			dataType: 'JSONP',
			type: 'GET',
			success: function (data) {
				// Получаем ID
				sessionID = data;
				// Запрос на начало игры
				$.ajax({
					url: url + '_Play/' + sessionID + "/" + gameID,
					dataType: 'JSONP',
					type: 'GET',
					success: function (data) {
						if (data.hPlayResult !== undefined) {
							//Запрос на проверку Ready
							$.ajax({
								url: url + '_Ready/' + sessionID,
								dataType: 'JSONP',
								type: 'GET',
								success: function (data) {
									if (data !== undefined) {
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 0,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(data) {
                        var counter = 0;
                        wheels[0] = data;
                        for(var i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 1,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(data) {
                        var counter = 0;
                        wheels[1] = data;
                        for(var i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 2,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(data) {
                        var counter = 0;
                        wheels[2] = data;
                        for(var i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 3,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(data) {
                        var counter = 0;
                        wheels[3] = data;
                        for(var i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 4,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(data) {
                        var counter = 0;
                        wheels[4] = data;
                        for(var i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_SetBet/' + sessionID + '/' + bet,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(data) {
                        // console.log("Ответ на ставку: " + data);
                      }
                    });
                    $.ajax({
                      url: url + '_GetLines/' + sessionID,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(data) {
                        linesCoords = data.split("|");
                        for(var i = 0; i < linesCoords.length; i++) {
                          linesCoords[i] = linesCoords[i].split("@");
                          for (var j = 0; j < linesCoords[i].length; j++) {
                            linesCoords[i][j] = linesCoords[i][j].split(",");
                          }
                        }
                      }
                    });
									}// Запрос Ready отдал нужный ответ
								}
							});
						}
					}
				});
			}
		});
	}
	// Инициализируем игру по имени name
	startGame(name);

  $("body").on("keydown", function(event){
    if(event.keyCode === 32 || event.which === 32) {
      spinButton.alpha = 0.01;
      spinTachButton.alpha = 1;
      getSpin();
    }
  });
  $("body").on("keyup", function(event){
    if(event.keyCode === 32 || event.which === 32) {
      spinButton.alpha = 1;
      spinTachButton.alpha = 0;
     }
  });

	function showStartScreen(wheels) {

		for (var i = 0; i < wheels.length; i++) {
			wheels[i] = wheels[i].split("@");
			renameLine(wheels[i]);
		}

		currentScreen = getFirstPage(wheels);
		getFirstScreen();

	}

	function getFirstPage(wheels) {
		var result = [],
		neededElements = 5;
		for (var i = 0; i < wheels.length; i++){
			result[i] = wheels[i].slice(0, neededElements);
		}
		return result;
	}

	function renameLine(line) {
		for (var i = 0; i < line.length; i++) {
			if (line[i] === "j") {line[i] = 1}
			if (line[i] === "iJ") {line[i] = 2}
			if (line[i] === "q") {line[i] = 3}
			if (line[i] === "iQ") {line[i] = 4}
			if (line[i] === "k") {line[i] = 5}
			if (line[i] === "ik") {line[i] = 6}
			if (line[i] === "a") {line[i] = 7}
			if (line[i] === "iA") {line[i] = 8}
			if (line[i] === "wild") {line[i] = 9}
			if (line[i] === "scatter") {line[i] = 10}
			if (line[i] === "sw") {line[i] = 11}
			if (line[i] === "sw2") {line[i] = 12}
			if (line[i] === "sw3") {line[i] = 13}
		}
	}

	function getFirstRow(currentRow, subURL, opacity) {
		var row, img, i;
    subURL = subURL || "";
		// Создаем новый контейнер (линию)
		row = new createjs.Container();
		// В каждую линию записуем по 5 картинок (3 на экране и по одной по боках)
		for (i = 0; i < elementNumberOnScreen + 2; i++) {
			// Записываем элементы полученные из ответа сервера (wheels)
			elementsMas[i] = currentScreen[currentRow][i];
			// Расчитываем позиции элементов по высоте (первый элемент будет за верхним краем)
			elementsPositions[i] = elementHeight * (i - 1);
			// Создаем нужную картинку
			img = new createjs.Bitmap("img/game/" + subURL + elementsMas[i] + ".png");
			// Позиционируем картинку
			img.y = elementsPositions[i];
      img.alpha = opacity;
			// Добавляем ее в линию
			row.addChild(img);
		}
		gameStage.update();
		// Возвращаем линию
		return row;
	}

	function getFirstScreen() {
		for (var i = 0; i < rowNumber; i++) {
			// Создаем 5 новых линий
			rows[i] = getFirstRow(i, "", 1);
			// Позиционируем их гозизонтально
			rows[i].x = rowWidth*i;
			// И добавляем в холст
			gameStage.addChild(rows[i]);
		}
		gameStage.update();
	}

	function getNewRow(currentRow) {
		var row, img, i;
		// Создаем новую линию-контейнер
		row = new createjs.Container();
		// Заполняем ее элементами
		for ( i = 0; i < elementNumberAll; i++ ) {

			if ( i < 5 ) { // В конце линии будут выпадающие стоты
				elementsMas[i] = nextScreen[currentRow][i];
				img = new createjs.Bitmap("img/game/" + elementsMas[i] + ".png");
			} else if ( i > 54) { // В начале линии будут теперешние слоты
				elementsMas[i] = currentScreen[currentRow][i - 55];
				img = new createjs.Bitmap("img/game/" + elementsMas[i] + ".png");
			} else { // Остальные слоты будут случайными и размытыми
				elementsMas[i] = Math.ceil(Math.random() * 10);
				img = new createjs.Bitmap("img/game/blur/" + elementsMas[i] + "b.png");
			}
			// Рассчитываем позиции элементов с учетом выступов по одному элементу по краях
			elementsPositions[i] = elementHeight * ( i + 1 + elementNumberOnScreen - elementNumberAll );
			// Позиционирование элементов
			img.y = elementsPositions[i];
			// Добавляем их в линию
			row.addChild(img);
		}
		gameStage.update();
		// Возвращаем линию
		return row;
	}

	function getNewScreen() {
		for (var j = 0; j < 21; j++) {
			lines[j].alpha = 0;
      // linesLight[j].alpha = 0;
      if(numbers[j].shadow){numbers[j].shadow.offsetX = numbers[j].shadow.offsetY = numbers[j].shadow.blur = 0;}

		}
		for (var i = 0; i < rowNumber; i++) {
			gameStage.removeChild(rows[i]);
      gameStage.removeChild(winRows[i]);
			// Создаем 5 новых линий
			rows[i] = getNewRow(i);
			// Позиционируем их гозизонтально
			rows[i].x = rowWidth*i;
			// И добавляем в холст
			gameStage.addChild(rows[i]);
		}
		gameStage.update();
	}

	function getSpin() {
		$.ajax({ // Запрос проверки Ready
			url: url + '_Ready/' + sessionID,
			dataType: 'JSONP',
			type: 'GET',
			success: function(data) {
				if(data !== undefined) { // Если есть ответ
					$.ajax({ // То отравляем запрос-крутку Roll
						url: url + '_Roll/' + sessionID,
						dataType: 'JSONP',
						type: 'GET',
						success: function(data) {
              numbersOfLines = [];
							// Забираем нужные нам индексы выпавших слотов
							var indexes = data.Result.Indexes;
							// Показываем выпавшие линии
							winLines = data.Result.LinesResult;
              totalWin = data.Result.TotalWin;
							console.log(winLines);
              console.log(totalWin);
							// Записываем значения конечного экрана
							for (var i = 0; i < 5; i++){
								nextScreen[i] = [];
								for (var j = 0; j < 5; j++){
									nextScreen[i].push(wheels[i][indexes[i] + j - 1]);
								}
							}
							// Отображаем необходимые линии
							getNewScreen();
							// Прокручиваем линии до нужного нам экрана
							var spins = [],
									time = 1000;
							for (var i = 0; i < rows.length; i++) {
								time += 400;
								spins[i] = createjs.Tween.get(rows[i], {loop: false})
									.to({ y: -elementsPositions[1]}, time , createjs.Ease.getBackInOut(0.5));
							}
							// Делаем перезапись теперешнего экрана
              copyScreenFromTo (nextScreen, currentScreen);

							for (var i = 0; i < winLines.length; i++) {
								var someLine = winLines[i];
                var numberOfElements = parseInt(winLines[i]);
                // console.log(numberOfElements);
								var indexOfLine = someLine.indexOf("#");
								var numberOfLine = someLine.substr(indexOfLine + 1);
                numbersOfLines[i] = [];
                numbersOfLines[i].push(+numberOfLine, numberOfElements);
								// if (numberOfLine != -1) {
								// 	setTimeout(showLine.bind(null, numberOfLine, 1), 3200);
								// }
							}
              if(winLines[0] !== undefined) {
                setTimeout(showWinScreen.bind(null), 3200);
              }
						}
					});// _Roll AJAX End
				}
			}
		});// _Ready AJAX End
	}

  function copyScreenFromTo (nextScreen, currentScreen) {
    var i, j;
    for (i = 0; i < 5; i++) {
      for (j = 0; j < 5; j++) {
        currentScreen[i][j] = nextScreen[i][j];
      }
    }
  }

  function showWinScreen() {

    var clockSpriteData = {
      images: ["img/watch.png"],
      frames: {width: 240, height: 225},
      // framerate: 24,
      animations: {
        run: [0, 3]
      }
    };
    var clockSpriteSheet = new createjs.SpriteSheet(clockSpriteData);
    var clockAnimation = new createjs.Sprite(clockSpriteSheet, "run");

    for(var i = 0; i < numbersOfLines.length; i++) {
      var numberOfCurrentLine = numbersOfLines[i][0];
      var numberOfCurrentElements = numbersOfLines[i][1];
      numbers[numberOfCurrentLine-1].shadow = new createjs.Shadow("#FFFFFF", 1, 1, 2);
      for(var j = 0; j < numberOfCurrentElements; j++) {
        var currentRowNumber = linesCoords[numberOfCurrentLine-1][j][0];
        var currentElementNumber = +linesCoords[numberOfCurrentLine-1][j][1] + 1;
        var currentElement = rows[currentRowNumber].children[currentElementNumber];
        var currentPositionY = currentElement.y;
        if(currentElement.image){
          var currentURL = currentElement.image.currentSrc;
          var currentElementImageNumber = currentURL.substr(currentURL.indexOf(".png") - 1, 1);
          // if(currentElementImageNumber == 9) {
          //   console.log("I am here and I am trying to run animation!!!");
          //   var newClock = clockAnimation.clone();
          //   newClock.y = currentPositionY;
          //   newClock.play("run");
          //   rows[currentRowNumber].children.splice(currentElementNumber, 1, newClock);
          // }
          if(currentElementImageNumber){
            var newImg = new createjs.Bitmap("img/game/win/" + currentElementImageNumber + ".png");
            newImg.y = currentPositionY;
            createjs.Tween.get(newImg, { loop: true })
            .to({ alpha: 1, scaleX: 1.02, scaleY: 1.02, x: -3}, 500)
            .to({ alpha: 0.9, scaleX: 1, scaleY: 1, x: 0}, 500)
            .to({ alpha: 1, scaleX: 1, scaleY: 1, x: 0}, 300);
            rows[currentRowNumber].children.splice(currentElementNumber, 1, newImg);
          }

        }
      }
      showLine(numberOfCurrentLine);
    }
    // console.log(numbersOfLines);
  }

}); // Конец функции Init()
