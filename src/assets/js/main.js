var stage;
function init() {
	var canvas = document.getElementById("canvas");
	canvas.style.width = document.documentElement.clientWidth*0.8 + "px";
	canvas.style.height = parseInt(canvas.style.width)*0.5625 + "px";

	if(parseInt(canvas.style.width) > 1280){canvas.style.width = "1280px"}
	var canvasWidth = parseInt(canvas.style.width),
			canvasHeight = parseInt(canvas.style.height);

	window.onresize = function() {
		canvas.style.width = document.documentElement.clientWidth*0.8 + "px";
		if(parseInt(canvas.style.width) > 1280){canvas.style.width = "1280px"}
		canvas.style.height = parseInt(canvas.style.width)*0.5625 + "px";
		canvasWidth = parseInt(canvas.style.width),
		canvasHeight = parseInt(canvas.style.height);
	}




	stage = new createjs.Stage("canvas");
	stage.canvas.width = canvasWidth;
	stage.canvas.height = canvasHeight;
	var rowNumber = 5,
			rowWidth = canvasWidth/rowNumber;

	var elementNumberAll = 60,
			elementNumberOnScreen = 3,
			elementWidth = rowWidth,
			elementHeight = canvasHeight/elementNumberOnScreen;

	var elementsMas = [],
			elementsPositions = [];

	var rows = [],
	 		currentScreen = [];

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

$.ajax({
    url: 'http://192.168.0.250/JSON/SlotService.svc/Hello',
    dataType: 'JSONP',
    jsonpCallback: 'callback',
    type: 'GET',
    success: function (data) {
        console.log(data);
    }
});
