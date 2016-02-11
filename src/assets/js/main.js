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

	for (var i = 0; i < elementNumberAll; i++ ) {
		elementsMas[i] = Math.floor(Math.random() * 60);
		elementsPositions[i] = -elementHeight * ( elementNumberAll - elementNumberOnScreen - i );
	}

	var text = new createjs.Text(elementsMas[0], "40px Arial", "#222222");

	console.log(elementsPositions);

}
