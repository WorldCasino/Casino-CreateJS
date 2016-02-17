var stage,
		WIDTH = 1280,
		HEIGHT = 720;

function init() {
	// Берем холст
	var canvas = document.getElementById("canvas");
	// Изменяем его ширину чтобы он занимал 80% экрана и при этом не больше 1280 пикселей
	canvas.style.width = document.documentElement.clientWidth*0.8 + "px";
	if(parseInt(canvas.style.width) > 1280){canvas.style.width = WIDTH + "px"}
	// Делаем соответствующую высоту холста
	canvas.style.height = parseInt(canvas.style.width)*0.5625 + "px";

	// Проделываем все эти операции при любом изменении размеров экрана
	window.onresize = function(event) {
		canvas.style.width = document.documentElement.clientWidth*0.8 + "px";
		if(parseInt(canvas.style.width) > 1280){canvas.style.width = WIDTH + "px"}
		canvas.style.height = parseInt(canvas.style.width)*0.5625 + "px";
	}

	stage = new createjs.Stage("canvas");
	// Выставляем нужные размеры для правильной прорисовки холста
	stage.canvas.width = WIDTH;
	stage.canvas.height = HEIGHT;
	// Определяем параметры для линий
	var rowNumber = 5,
			rowWidth = stage.canvas.width/rowNumber;
	// Определяем параметры для элементов
	var elementNumberAll = 60,
			elementNumberOnScreen = 3,
			elementWidth = rowWidth,
			elementHeight = stage.canvas.height/elementNumberOnScreen;
	// Массивы элементов и их позиций
	var elementsMas = [],
			elementsPositions = [];
	// Массивы линий, этого и следующего экранов
	var rows = [],
	 		currentScreen = [],
			nextScreen = [];
	// Производим предварительную загрузку изображений
	var preload = new createjs.LoadQueue();
	preload.addEventListener("fileload", function(){
		stage.update();
	});
	for(var i = 1; i <= 10; i++) {
		preload.loadFile("img/game/" + i + ".png");
	}

	function getFirstRow() {
		var row = new createjs.Container();

		for (var i = 0; i < elementNumberOnScreen; i++ ) {
			elementsMas[i] = Math.ceil(Math.random() * 10);
			elementsPositions[i] = elementHeight * i;
			var img = new createjs.Bitmap("img/game/" + elementsMas[i] + ".png");
			img.y = elementsPositions[i];

			row.addChild(img);
		}
		return row;
	}

	function getFirstScreen() {
		for (var i = 0; i < rowNumber; i++) {
			rows[i] = getFirstRow();
			currentScreen[i] = rows[i].children.slice();
			rows[i].x = rowWidth*i;
			stage.addChild(rows[i]);
		}
		stage.update();
	}

	function getNewRow() {
		var row = new createjs.Container();

		for (var i = 0; i < elementNumberAll; i++ ) {
			elementsMas[i] = Math.ceil(Math.random() * 10);
			elementsPositions[i] = -elementHeight * ( elementNumberAll - elementNumberOnScreen - i );

			var img = new createjs.Bitmap("img/game/" + elementsMas[i] + ".png");
			img.y = elementsPositions[i];
			img.width = elementWidth;
			img.height = elementHeight;

			row.addChild(img);
		}

		return row;
	}

	function getNewSpin() {
		for (var i = 0; i < rowNumber; i++) {
			stage.removeChild(rows[i])
			rows[i] = getNewRow();

// --    Здесь происходит замена новых элементов
//---       на элементы с последнего экрана и
//---          установка их расположения
			for (var j = 0; j < elementNumberOnScreen; j++) {
				currentScreen[i][j].y = elementHeight * j;
			}
			rows[i].children.splice(57, 3);
			Array.prototype.push.apply(rows[i].children, currentScreen[i]);
			currentScreen[i] = rows[i].children.slice(0, 3);


			rows[i].x = rowWidth*i;
			stage.addChild(rows[i]);
		}
		stage.update();
	}

	getFirstScreen();

	var spinButton = document.getElementById('spinButton');
	spinButton.addEventListener("click", function() {
		getNewSpin();
		var spins = [];
		for (var i = 0; i < rows.length; i++) {
			var time = 1500*2 + Math.random()*500*2;
			spins[i] = createjs.Tween.get(rows[i], {loop: false})
				.to({ y: -elementsPositions[0] }, time , createjs.Ease.getPowInOut(2.2));
		}

	});

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", stage);

}

var name = "SomeName",
		url = "http://192.168.0.250/JSON/SlotService.svc/",
		sessionID,
		gameID = 0,
		wheels = [],
		wheelsComplete;
// Функция инциализации игры и загрузки барабанов
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
													wheelsComplete = true;
													// И загружаем первый экран
													showStartScreen(wheels);
												}
											}
										});
									}
								}
							}
						});
					}
				}
			});
		}
	});
}
startGame(name);

function showStartScreen(wheels) {

	for (var i = 0; i < wheels.length; i++) {
		wheels[i] = wheels[i].split("@");
		renameLine(wheels[i]);
		console.log(wheels[i]);
	}

	currentScreen = getFirstPage(wheels);

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
	}
}
