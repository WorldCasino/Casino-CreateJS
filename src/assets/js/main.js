var stage,
		WIDTH = 1280,
		HEIGHT = 720;

function init() {

	stage = new createjs.Stage("canvas");
	// Выставляем нужные размеры для правильной прорисовки холста
	stage.canvas.width = WIDTH;
	stage.canvas.height = HEIGHT;
	// Определяем параметры для линий
	var rowNumber = 5,
			rowWidth = stage.canvas.width/rowNumber,
	// Определяем параметры для элементов
			elementNumberAll = 60,
			elementNumberOnScreen = 3,
			elementWidth = rowWidth,
			elementHeight = stage.canvas.height/elementNumberOnScreen,
	// Массивы элементов и их позиций
			elementsMas = [],
			elementsPositions = [],
	// Массивы линий, этого и следующего экранов
			rows = [],
	 		currentScreen = [],
			nextScreen = [],
			name = "SomeName", // Имя игрока
			url = "http://192.168.0.250/JSON/SlotService.svc/", // URL сервера
			sessionID, // ID игровой сессии
			gameID = 0, // ID игры
			wheels = []; // Масиив линий барабана
	// Добавляем перерисовку с FPS = 60
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", stage);

	function resizeCanvas() {
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
	}
	// Изменяем размер холста
	resizeCanvas();

	function preloadSlots() {
		var preload, i;
		preload = new createjs.LoadQueue();
		preload.on("fileload", function(){
			stage.update();
		});
		// Загружаем наши картинки
		for(i = 1; i <= 10; i++) {
			preload.loadFile("img/game/" + i + ".png");
			preload.loadFile("img/game/blur/" + i + "b.png");
			preload.loadFile("img/reelsbg.png");
			preload.loadFile("img/gamebg.png");
		}
	}
	// Производим предварительную загрузку изображений
	preloadSlots();

	function drawBG() {
		var slotBG;
		slotBG = new createjs.Bitmap("img/reelsbg.png");
		slotBG.x = slotBG.y = 0;
		slotBG.width = WIDTH;
		slotBG.height = HEIGHT;
		stage.addChild(slotBG);
		stage.update();
	}
	drawBG();

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
														console.log("It is all right!");
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
	// Инициализируем игру по имени name
	startGame(name);

	var spinButton = document.getElementById('spinButton');
	spinButton.addEventListener("click", function() {
		getSpin();
	});

	function showStartScreen(wheels) {

		for (var i = 0; i < wheels.length; i++) {
			wheels[i] = wheels[i].split("@");
			renameLine(wheels[i]);
		}

		console.log(wheels);
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
			if (line[i] === "sw") {line[i] = 11; line.splice(i, 0, 11, 11)}
		}
	}

	function getFirstRow(currentRow) {
		var row, img, i;
		// Создаем новый контейнер (линию)
		row = new createjs.Container();
		// В каждую линию записуем по 5 картинок (3 на экране и по одной по боках)
		for (i = 0; i < elementNumberOnScreen + 2; i++) {
			// Записываем элементы полученные из ответа сервера (wheels)
			elementsMas[i] = currentScreen[currentRow][i];
			// Расчитываем позиции элементов по высоте (первый элемент будет за верхним краем)
			elementsPositions[i] = elementHeight * (i - 1);
			// Создаем нужную картинку
			img = new createjs.Bitmap("img/game/" + elementsMas[i] + ".png");
			// Позиционируем картинку
			img.y = elementsPositions[i];
			// Добавляем ее в линию
			row.addChild(img);
		}
		stage.update();
		// Возвращаем линию
		return row;
	}

	function getFirstScreen() {
		for (var i = 0; i < rowNumber; i++) {
			// Создаем 5 новых линий
			rows[i] = getFirstRow(i);
			// Позиционируем их гозизонтально
			rows[i].x = rowWidth*i;
			// И добавляем в холст
			stage.addChild(rows[i]);
		}
		stage.update();
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
		stage.update();
		// Возвращаем линию
		return row;
	}

	function getNewScreen() {
		for (var i = 0; i < rowNumber; i++) {
			stage.removeChild(rows[i])
			// Создаем 5 новых линий
			rows[i] = getNewRow(i);
			// Позиционируем их гозизонтально
			rows[i].x = rowWidth*i;
			// И добавляем в холст
			stage.addChild(rows[i]);
		}
		stage.update();
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
							console.log(data.Result.LinesResult);
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
							for (var i = 0; i < 5; i++) {
								for (var j = 0; j < 5; j++) {
									currentScreen[i][j] = nextScreen[i][j];
								}
							}
						}
					});// _Roll AJAX End
				}
			}
		});// _Ready AJAX End
	}

}; // Конец функции Init()
