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
			name = "SomeName", // Имя игрока
			url = "http://192.168.0.250/JSON/SlotService.svc/", // URL сервера
			sessionID, // ID игровой сессии
			gameID = 0, // ID игры
      bet = 2, // Ставка
			wheels = []; // Масиив линий барабана
	// Добавляем перерисовку с FPS = 60
	createjs.Ticker.setFPS(60);
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
		preload.loadFile("img/mainbg.jpg");
		preload.loadFile("img/mainfg.png");
		preload.loadFile("img/Tuchi.png");
		preload.loadFile("img/fonarverh2.png");
		preload.loadFile("img/fonarverh3.png");
		preload.loadFile("img/fonarniz.png");
		preload.loadFile("img/spin.png");
		preload.loadFile("img/autoplay.png");
		preload.loadFile("img/max_bet.png");
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
		preload.loadFile("img/reelsbg.png");
	}
	// Производим предварительную загрузку изображений
	preloadSlots();

	function drawBG() {
		var slotBG = new createjs.Bitmap("img/reelsbg.png");
		var mainBG = new createjs.Bitmap("img/mainbg.jpg");
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
		middleStage.enableMouseOver(10);
		var spinButton = new createjs.Bitmap("img/spin.png");
		spinButton.x = 1141; spinButton.y = 869;
		var autoplayButton = new createjs.Bitmap("img/autoplay.png");
		autoplayButton.x = 945; autoplayButton.y = 920;
		var maxBetButton = new createjs.Bitmap("img/max_bet.png");
		maxBetButton.x = 1317; maxBetButton.y = 920;
    spinButton.cursor = maxBetButton.cursor = autoplayButton.cursor = "pointer";
		middleStage.addChild(spinButton, autoplayButton, maxBetButton);
		spinButton.on("mouseover", function(){
			// console.log("it is spin button!");
		});
		spinButton.on("click", function(){
			// console.log("You have clicked SPIN!");
			getSpin();
		});
		autoplayButton.on("mouseover", function(){
			// console.log("it is autoplay button!");
		});
		maxBetButton.on("mouseover", function(){
			// console.log("it is max BEt button!");
		});
	}
	drawButtons();

	function drawLines() {
		for(var i = 1; i <= 21; i++) {
			var img = new createjs.Bitmap("img/Lines/Line" + i + ".png");
      img.alpha = 0;
      gameStage.addChild(img);
			lines.push(img);
			var imgLight = new createjs.Bitmap("img/Lines/Line" + i + "gl.png");
			imgLight.alpha = 0;
			imgLight.x = -10;
			linesLight.push(imgLight);
		}
		lines[0].y = 332;
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
		var numbers = [];
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
										// В случае успеха загружаем барабаны
										for (var i = 0; i < 5; i++) {
											$.ajax({
												url: url + '_GetWheels/' + sessionID + "/" + i,
												dataType: 'JSONP',
												type: 'GET',
												success: function (data) {
													// Складываем линии в массив (здесь ошибка - линии могут быть не в нужном порядке!!!)
													wheels.push(data);
													if(wheels.length === 5) {
														// И загружаем первый экран
														showStartScreen(wheels);
													}
												}
											});
										}
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
                    })
									}
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

	// var spinButton = document.getElementById('spinButton');
	// spinButton.addEventListener("click", function() {
	// 	getSpin();
	// });

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
			// gameStage.removeChild(linesLight[j]);
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
    for(var i = 0; i < rowNumber; i++) {
      // gameStage.removeChild(rows[i]);
      winRows[i] = getFirstRow(i, "win/", 0);
      winRows[i].x = rowWidth*i;
      gameStage.addChild(winRows[i]);
    }

    // console.log(newURL);
    for(var i = 0; i < numbersOfLines.length; i++) {
      var numberOfCurrentLine = numbersOfLines[i][0];
      var numberOfCurrentElements = numbersOfLines[i][1];
      for(var j = 0; j < numberOfCurrentElements; j++) {
        var currentRowNumber = linesCoords[numberOfCurrentLine-1][j][0];
        var currentElementNumber = +linesCoords[numberOfCurrentLine-1][j][1] + 1;
        var currentElement = rows[currentRowNumber].children[currentElementNumber];
        var currentPositionY = currentElement.y;
        var currentURL = currentElement.image.currentSrc;
        var currentElementImageNumber = currentURL.substr(currentURL.indexOf(".png") - 1, 1);
        if(currentElementImageNumber){
          var newImg = new createjs.Bitmap("img/game/win/" + currentElementImageNumber + ".png");
          newImg.y = currentPositionY;
          rows[currentRowNumber].children.splice(currentElementNumber, 1, newImg);
          // console.log(currentPositionY);

        }
      }
      showLine(numberOfCurrentLine);
    }
    // console.log(numbersOfLines);
  }

}); // Конец функции Init()
