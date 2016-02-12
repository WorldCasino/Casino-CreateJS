var stage;
function init() {
	stage = new createjs.Stage("canvas");

	var rowNumber = 5,
			rowWidth = stage.canvas.width/rowNumber;

	var elementNumberAll = 60,
			elementNumberOnScreen = 3,
			elementWidth = rowWidth,
			elementHeight = stage.canvas.height/elementNumberOnScreen;

	var elementsMas = [],
			elementsPositions = [];

	var rows = [],
	 		currentScreen = [];

	function getFirstRow() {
		var row = new createjs.Container();

		for (var i = 0; i < elementNumberOnScreen; i++ ) {
			elementsMas[i] = Math.floor(Math.random() * 60);
			elementsPositions[i] = elementHeight * i;

			var text = new createjs.Text(elementsMas[i], elementHeight*0.6 +"px Arial", "#222222");
			text.lineHeight = elementHeight;
			text.textBaseline = "top";
			text.x = 10;
			text.y = elementsPositions[i];

			row.addChild(text);
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
			elementsMas[i] = Math.floor(Math.random() * 60);
			elementsPositions[i] = -elementHeight * ( elementNumberAll - elementNumberOnScreen - i );

			var text = new createjs.Text(elementsMas[i], elementHeight*0.6 +"px Arial", "#222222");
			text.lineHeight = elementHeight;
			text.textBaseline = "top";
			text.x = 10;
			text.y = elementsPositions[i];

			row.addChild(text);
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

		for (var i = 0; i < rows.length; i++) {
			var time = 1500*3 + Math.random()*500*3;
			createjs.Tween.get(rows[i], {loop: false})
				.to({ y: -elementsPositions[0] }, time , createjs.Ease.getPowInOut(2.2));
		}

	});

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", stage);

}
