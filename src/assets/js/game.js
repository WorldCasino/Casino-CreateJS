// Набор констант размеров холстов.
var BG_WIDTH = 1920,     // Размеры заднего пална.
    BG_HEIGHT = 1080,
    PANEL_WIDTH = 1920,  // Размеры панели управления.
    PANEL_HEIGHT = 1080,
    GAME_WIDTH = 1280,   // Размеры экрана слотов.
    GAME_HEIGHT = 720;

// Создаем новые Stage для каждого холста.
var	bgStage = new createjs.Stage("bgCanvas"),       // Холст заднего плана.
    panelStage = new createjs.Stage("panelCanvas"), // Холст панели управления.
    gameStage = new createjs.Stage("gameCanvas"),   // Холст экрана слотов.
    doorsStage = new createjs.Stage("doorsCanvas");

// функция которая отвечает за фулскрин.
function launchFullScreen(e) {
    e.requestFullScreen ? e.requestFullScreen() : e.mozRequestFullScreen ? e.mozRequestFullScreen() : e.webkitRequestFullScreen && e.webkitRequestFullScreen()
}

if($("html").hasClass("ios")||$("html").hasClass("iphone")) {
  $(document).bind('touchmove', false);
}

$(document).ready(init);

function init(){

  gameStage.x = 562;
  gameStage.y = 126;
  panelStage.addChild(gameStage);
  // panelStage.alpha = 0;
  bgStage.alpha = 0;

var game = document.getElementById("game");

var lineNumbers = [],  // массив номеров-подсказок линий.
    lineImages = [],   // массив изображений линий-подсказок.
    lineWinImages = [];// массив изображений победных линий.

var coinsValue, coinsSum,           // Монетки - сумма и стоимость монетки.
    betValue, betSum,               // Ставка - количество монеток на одну ставку и уровень ставки.
    cashTotal, betTotal, winTotal,  // Сумма депозита - размер ставки в деньгах, выигрыш в деньгах.
    startCash = 5000;               // Сумма налички которая берется по умолчанию (в дальнейшем будет браться извне).

var spinButton, spinHovButton, spinTachButton,                  // Кнопка SPIN в трех состояниях.
    autoplayButton, autoplayHovButton, autoplayTachButton,      // Кнопка AUTOPLAY в трех состояниях.
    maxBetButton, maxBetHovButton, maxBetTachButton,            // Кнопка MAX_BET в трех состояниях.
    plusCoinsButton, plusCoinsHovButton, plusCoinsTachButton,   // Кнопка PLUS_COINS в трех состояниях.
    minusCoinsButton, minusCoinsHovButton, minusCoinsTachButton,// Кнопка MINUS_COINS в трех состояниях.
    plusBetButton, plusBetHovButton, plusBetTachButton,         // Кнопка PLUS_BET в трех состояниях.
    minusBetButton, minusBetHovButton, minusBetTachButton;      // Кнопка MINUS_BET в трех состояниях.

var spinClicked = false,    // Флаг клика кнопки SPIN.
    timeOfSpin = 3400,      // Время одной крутки.
    autoplayID = [],        // Массив с запущенными автоплеями.
    autoplayIndex = 0;

var   nameOfPlayer = "SomeName" + Math.random()*100,            // Имя игрока (в дальнейшем будет получаться при вводе).
			url = "http://176.105.103.83:99/JSON/SlotService.svc/",   // URL сервера.
			sessionID,                                                // ID игровой сессии (получается при загрузке игры).
			gameID = 0,                                               // ID игры (получается при загрузке игры).
      linesCoords = [];                                         // Массив с координатами элементов в линиях.

var rowWidth = gameStage.canvas.width/5,      // Ширина одной линии барабана.
    elementHeight = gameStage.canvas.height/3,// Высота одного элемента.
    wheels = [],                              // Массив в который будем загружать барабан.
    rows = [],                                // Массив из линий элементов.
    elementsMas = [],                         // Массив номеров элементов (созданы для удобства доступа).
    elementsPositions = [],                   // Массив позиций элементов (созданы для удобства доступа).
    currentScreenData = [],                   // Массив 5*5 теперешнего экрана игры.
    nextScreenData = [];                      // Массив 5*5 выпавшего экрана игры.

var winCoins,             // Это значение выигрыша.
    winText,              // Текст выигрыша.
    winRows = [],         // Победный экран.
    numbersOfLines = [],  // Номера победных линий.
    indexes,
    winLines = [],
    bonusResult;

	// Добавляем перерисовку всех холстов с FPS = 40.
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", bgStage);
	createjs.Ticker.addEventListener("tick", panelStage);
	createjs.Ticker.addEventListener("tick", gameStage);
  createjs.Ticker.addEventListener("tick", doorsStage);


  // Функция resizeCanvas(canvasID, WIDTH, percent, heightToWidth) - изменение размеров холста.
  function resizeCanvas(canvasID, WIDTH, percent, heightToWidth) {
    function mainResizeFunc() {
      // Берем холст c id="canvasID".
      var canvas = document.getElementById(canvasID);
      // Изменяем его ширину чтобы он занимал PERCENT процентов экрана и при этом не больше WIDTH пикселей.
      canvas.style.width = (document.getElementById("game").clientWidth)*percent + "px";
      // Если ширина холста больше граничной ширины WIDTH, то установим ее как WIDTH.
      if(parseInt(canvas.style.width) > WIDTH) {canvas.style.width = WIDTH + "px"}
      // Делаем высоту холста в соответствии с необходимым соотношением HEIGHT/WIDTH = heightToWidth.
      canvas.style.height = parseInt(canvas.style.width)*heightToWidth + "px";
    }
    mainResizeFunc();
    // Проделываем все вышеописанные операции при любом изменении размеров экрана
    $(window).on("resize", mainResizeFunc);
  }
	// Изменяем размеры холстов
  resizeCanvas("bgCanvas", BG_WIDTH, 1, 0.5625);
  resizeCanvas("panelCanvas", PANEL_WIDTH, 1, 0.5625);
  resizeCanvas("gameCanvas", GAME_WIDTH, 0.67, 0.5625);
  resizeCanvas("doorsCanvas", PANEL_WIDTH, 1, 0.5625);

  doorsStage.alpha = 0;


  // Функция preload() - отвечает за предварительную загрузку изображений.
	function preload(){
		var preload, i, j;
    // Создаем очередь загрузки.
		preload = new createjs.LoadQueue();
    // Загружаем изображения фонов для холстов.
    preload.loadFile("img/bg/mainBG.png");
    preload.loadFile("img/bg/cloudsBG.png");
    preload.loadFile("img/bg/mainFG.png");
    preload.loadFile("img/bg/gameBG.png");
    preload.loadFile("img/bg/fogBG.png");
    preload.loadFile("img/bg/panelBG.png");
    preload.loadFile("img/bg/lampBottomBG.png");
    preload.loadFile("img/bg/lampTopBG.png");
    // Загружаем кнопки панели управления в трех состояниях (normal, hover, active)
		preload.loadFile("img/buttons/Spin.png");
    preload.loadFile("img/buttons/Spin_hov.png");
    preload.loadFile("img/buttons/Spin_tach.png");
		preload.loadFile("img/buttons/AutoPlay.png");
    preload.loadFile("img/buttons/AutoPlay_hov.png");
    preload.loadFile("img/buttons/AutoPlay_tach.png");
    preload.loadFile("img/buttons/MaxBet.png");
    preload.loadFile("img/buttons/MaxBet_hov.png");
    preload.loadFile("img/buttons/MaxBet_tach.png");
    preload.loadFile("img/buttons/Minus.png");
    preload.loadFile("img/buttons/Minus_hov.png");
    preload.loadFile("img/buttons/Minus_tach.png");
    preload.loadFile("img/buttons/Plus.png");
    preload.loadFile("img/buttons/Plus_hov.png");
    preload.loadFile("img/buttons/Plus_tach.png");
    // Загружаем изображения слотов - обычные, выигрышные, размытые (для прокрутки).
    for(i = 1; i <= 13; i++) {
      preload.loadFile("img/game/" + i + ".png");
      preload.loadFile("img/game/win/" + i + ".png");
      if(i <= 10) { // Размытой дамы на три слота у нас не будет.
        preload.loadFile("img/game/blur/" + i + "b.png");
      }

    createjs.Sound.registerSound("sound/spinClick.wav", "spinClickSound");
    createjs.Sound.registerSound("sound/click.wav", "buttonClickSound");
    createjs.Sound.registerSound("sound/barabaniKrutyatsa.wav", "spinProcessSound");
    createjs.Sound.registerSound("sound/barabanStop.wav", "spinEndSound");
    }
    // Загружаем выигрышные линии.
    for(j = 1; j <= 21; j++) {
      preload.loadFile("img/lines/Line" + j + ".png");
    }
	}
  // Проведем предварительную загрузку мультимедиа файлов (картинок и звуков).
  preload();

  // Функция drawMainBG() - отвечает за прорисовку фонов, туч, тумана, панели управления и заднего фона слотов.
	function drawMainBG() {
    // Создаем на заднем холсте трехслойную структуру состоящую из:
		var mainBG = new createjs.Bitmap("img/bg/mainBG.png"),     // заднего фона.
        cloudsBG = new createjs.Bitmap("img/bg/cloudsBG.png"), // туч посередине.
		    mainFG = new createjs.Bitmap("img/bg/mainFG.png");     // и переднего фона с прозрачным небом.
    // Задвигаем облака немного за экран.
    cloudsBG.x = -300;
    // И в цикле передвигаем их вправо-влево (по 1-ой минуте).
    createjs.Tween.get(cloudsBG, {loop: true})
      .to({ x: 300}, 60000)
      .to({ x: -300}, 60000);
    // Также у нас на фоне есть туман снизу у брущатки.
    var fogBG = new createjs.Bitmap("img/bg/fogBG.png");
    // Позиционируем его относительно верхнего левого угла заднего плана.
    fogBG.x = -500; fogBG.y = 600;
    // И будем плавно его передвигать вправо-влево (по 20 секунд).
    createjs.Tween.get(fogBG, {loop: true})
    .to({ x: 0}, 20000)
    .to({ x: -500}, 20000);
    // Слева у края экрана есть фонарь, он состоит из двух частей: лампы и всего остального.
    var lampTopBG = new createjs.Bitmap("img/bg/lampTopBG.png"),
        lampBottomBG = new createjs.Bitmap("img/bg/lampBottomBG.png");
    // Проведем их позиционирование относительно того же верхнего угла.
    lampBottomBG.x = -20; lampBottomBG.y = 65;
    lampTopBG.x = 8; lampTopBG.y = 116;
    // Создаем основу панели управления.
    var panelBG = new createjs.Bitmap("img/bg/panelBG.png");

    // И нарисуем все это на холсте bgStage в нужном порядке наложения.
    panelStage.addChild(mainBG, cloudsBG, panelBG, lampTopBG, lampBottomBG, fogBG);

    // Создаем задний фон для слотов.
    var gameBG = new createjs.Bitmap("img/bg/gameBG.png");
    // И рисуем его на холсте gameBG.
		gameStage.addChild(gameBG);
	}
  // Рисуем задний фон для всех трех холстов (bgStage, panelStage, gameStage).
  drawMainBG();

  // На холсте панели управления подключаем hover события мыши.
  panelStage.enableMouseOver(5);

  // Функция drawLines() - отвечает за прорисовку и поведение линий-подсказок и номеров к ним.
  function drawLines() {
    // Рисуем линии.
    drawLineImages();
    // Рисуем номера к линиям.
    drawLineNumbers();
    // Функция drawLineImages() - отвечает за прорисовку и позиционирование линий.
    function drawLineImages() {
      var img, i;
      for(i = 1; i <= 21; i++) {
        // Создаем изображение для 21-ой линии.
        img = new createjs.Bitmap("img/Lines/Line" + i + ".png");
        // Делаем его невидимым.
        img.alpha = 0;
        // Рисуем на игровом холсте.
        gameStage.addChild(img);
        // И добавляем во внешний массив lineImages.
        lineImages.push(img);
      }
      // Позиционируем линии на холсте.
      lineImages[0].y = 334;
      lineImages[1].y = 139;
      lineImages[2].y = 574;
      lineImages[3].y = 54;
      lineImages[4].y = 94;
      lineImages[5].y = 90;
      lineImages[6].y = 335;
      lineImages[7].x = 85;   lineImages[7].y = 144;
      lineImages[8].y = 288;
      lineImages[9].y = 380;
      lineImages[10].y = 108;
      lineImages[11].x = 85;  lineImages[11].y = 105;
      lineImages[12].x = 85;  lineImages[12].y = 45;
      lineImages[13].x = 85;  lineImages[13].y = 104;
      lineImages[14].x = 85;  lineImages[14].y = 92;
      lineImages[15].x = 85;  lineImages[15].y = 99;
      lineImages[16].x = 85;  lineImages[16].y = 184;
      lineImages[17].y = 137;
      lineImages[18].y = 105;
      lineImages[19].y = 379;
      lineImages[20].x = 105; lineImages[20].y = 98;
      // Копируем изображения в массив lineWinImages.
      for(i = 0; i <= 20; i++) {
        lineWinImages.push(lineImages[i].clone());
        gameStage.addChild(lineWinImages[i]);
      }
    }
    // Функция drawLineNumbers()- отвечает за прорисовку номеров к линиям-подсказкам.
    function drawLineNumbers() {
      var text, hit, i;
      for (i = 1; i <= 22; i++) { // Считаем до 22 из-за дублирования 1-го номера.
        // Создаем номера линий.
        text = new createjs.Text(i, "20px Arial", "#ddcb8c");
        // И добавляем их во внешний массив lineNumbers.
        lineNumbers.push(text);
        // Создаем вокруг номеров круги (hitArea) для взаимодействия с мышью.
        hit = new createjs.Shape();
        hit.graphics.beginFill("#000").drawCircle(text.getMeasuredWidth()/2, text.getMeasuredHeight()/2, 19);
        text.hitArea = hit;
        // Когда мышь попадает на номер
        text.on("mouseover", function(){
          //  - мы показываем линию.
          showLine(this.text);
          //  - и делаем тень для номера.
          this.shadow = new createjs.Shadow("#FFFFFF", 1, 1, 2);
        });
        // Когда мышь уходит
        text.on("mouseout", function(){
          //  - мы убираем линию.
          hideLine(this.text);
          //  - и обнуляем тень.
          this.shadow.offsetX = this.shadow.offsetY = this.shadow.blur = 0;
        });
      } // Конец цикла for(i)
      lineNumbers[21].text = 1; // У нас два первых номера.
      // Позиционируем все номера линий относительно верхнего левого угла.
      lineNumbers[0].x = 549; lineNumbers[0].y = 455;
      lineNumbers[1].x = 1855; lineNumbers[1].y = 257;
      lineNumbers[2].x = 1855; lineNumbers[2].y = 697;
      lineNumbers[3].x = 549; lineNumbers[3].y = 165;
      lineNumbers[4].x = 549; lineNumbers[4].y = 789;
      lineNumbers[5].x = 549; lineNumbers[5].y = 210;
      lineNumbers[6].x = 550; lineNumbers[6].y = 744;
      lineNumbers[7].x = 1855; lineNumbers[7].y = 548;
      lineNumbers[8].x = 549; lineNumbers[8].y = 409;
      lineNumbers[9].x = 542; lineNumbers[9].y = 650;
      lineNumbers[10].x = 543; lineNumbers[10].y = 303;
      lineNumbers[11].x = 1848; lineNumbers[11].y = 789;
      lineNumbers[12].x = 1848; lineNumbers[12].y = 165;
      lineNumbers[13].x = 1848; lineNumbers[13].y = 744;
      lineNumbers[14].x = 1848; lineNumbers[14].y = 212;
      lineNumbers[15].x = 1848; lineNumbers[15].y = 651;
      lineNumbers[16].x = 1848; lineNumbers[16].y = 304;
      lineNumbers[17].x = 543; lineNumbers[17].y = 257;
      lineNumbers[18].x = 543; lineNumbers[18].y = 697;
      lineNumbers[19].x = 543; lineNumbers[19].y = 501;
      lineNumbers[20].x = 1850; lineNumbers[20].y = 501;
      lineNumbers[21].x = 1855; lineNumbers[21].y = 455;
      // Рисуем все номера линий на холсте панели управления.
      for (var i = 0; i < lineNumbers.length; i++) {
        panelStage.addChild(lineNumbers[i]);
      }
    }
    // Функция showLine(number) - показ линии-подсказки с номером number.
    function showLine(number) {
      lineImages[number-1].alpha = 1;
    }
    // Функция hideLine(number) - скрывание линии-подсказки с номером number.
    function hideLine(number) {
      lineImages[number-1].alpha = 0;
    }
  }
  // Рисуем линии и номера к ним.
  drawLines();

  // Функция drawPanel() - отвечает за отрисовку и поведение кнопок, и панели управления.
  function drawPanel() {

    // Рисуем статистику на нижней части панели управления.
    drawStatus();
    // Функция drawStatus() - отвечает за отрисовку значений ставок, монет и выигрыша.
    function drawStatus() {
      // Добавляем подписи "BET" и "COINS" на холст panelStage.
      var betText = new createjs.Text("BET", "bold 13px Arial", "#ffffff");
      betText.x = 628;      betText.y = 867;
      var coinsText = new createjs.Text("COINS", "bold 13px Arial", "#ffffff");
      coinsText.x = 1752;   coinsText.y = 867;
      panelStage.addChild(betText, coinsText);

      // Добавляем значения coinsValue, coinsSum, betValue, betSum. Они должны быть доступны внешним функциям.
      coinsValue = new createjs.Text("0.02", "bold 25px Arial", "#dddddd");
      coinsValue.x = 1553;  coinsValue.y = 942;
      coinsSum = new createjs.Text(startCash/+coinsValue.text, "bold 25px Arial", "#dddddd");
      coinsSum.x = 1753;    coinsSum.y = 928;
      betValue = new createjs.Text("1", "bold 25px Arial", "#dddddd");
      betValue.x = 828;     betValue.y = 942;
      betSum = new createjs.Text("15", "bold 25px Arial", "#dddddd");
      betSum.x = 625;       betSum.y = 921;
      panelStage.addChild(coinsValue, coinsSum, betValue, betSum);

      // Добавляем надписи для нижней панели расчетов денег.
      var cashWord = new createjs.Text("Cash: €", "bold 20px Arial", "#dddddd");
      cashWord.x = 890;     cashWord.y = 1046;
      var betWord = new createjs.Text("Bet: €", "bold 20px Arial", "#dddddd");
      betWord.x = 1130;     betWord.y = 1046;
      var winWord = new createjs.Text("Win: €", "bold 20px Arial", "#dddddd");
      winWord.x = 1362;     winWord.y = 1046;
      panelStage.addChild(cashWord, betWord, winWord);

      // Добавляем расчет денег, ставки, выигрыша - cashTotal, betTotal, winTotal.
      cashTotal = new createjs.Text(startCash.toFixed(2)+"", "bold 20px Arial", "#dddddd");
      cashTotal.x = 980;    cashTotal.y = 1046;
      betTotal = new createjs.Text((+betSum.text*+coinsValue.text).toFixed(2)+"", "bold 20px Arial", "#dddddd");
      betTotal.x = 1220;    betTotal.y = 1046;
      winTotal = new createjs.Text("0.00", "bold 20px Arial", "#dddddd");
      winTotal.x = 1450;    winTotal.y = 1046;
      panelStage.addChild(cashTotal, betTotal, winTotal);
    }

    // Рисуем кнопки в трех состояниях.
    drawButtons();
    // Функция drawButtons() - отвечает за отрисовку трех состояний кнопок.
    function drawButtons() {
      // Создаем кнопки в трех состояниях. SPIN
      spinButton = new createjs.Bitmap("img/buttons/Spin.png");
      spinHovButton = new createjs.Bitmap("img/buttons/Spin_hov.png");
      spinTachButton = new createjs.Bitmap("img/buttons/Spin_tach.png");
      // Позиционируем кнопки.
      spinButton.x = 1140;      spinButton.y = 866;
      spinHovButton.x = 1140;   spinHovButton.y = 866;
      spinTachButton.x = 1140;  spinTachButton.y = 866;
      // Видна только основная кнопка.
      spinButton.alpha = 1; spinHovButton.alpha = 0;  spinTachButton.alpha = 0;
      // Курсор как на обычной кнопке.
      spinButton.cursor = spinHovButton.cursor = spinTachButton.cursor = "pointer";
      // Рисуем кнопки на холсте panelStage.
      panelStage.addChild(spinButton, spinHovButton, spinTachButton);

      // Создаем кнопки в трех состояниях. AUTOPLAY
      autoplayButton = new createjs.Bitmap("img/buttons/AutoPlay.png");
      autoplayHovButton = new createjs.Bitmap("img/buttons/AutoPlay_hov.png");
      autoplayTachButton = new createjs.Bitmap("img/buttons/AutoPlay_tach.png");
      // Позиционируем кнопки.
      autoplayButton.x = 944;     autoplayButton.y = 922;
      autoplayHovButton.x = 944;  autoplayHovButton.y = 922;
      autoplayTachButton.x = 944; autoplayTachButton.y = 922;
      // Видна только основная кнопка.
      autoplayButton.alpha = 1; autoplayHovButton.alpha = 0; autoplayTachButton.alpha = 0;
      // Курсор как на обычной кнопке.
      autoplayButton.cursor = autoplayHovButton.cursor = autoplayTachButton.cursor = "pointer";
      // Рисуем кнопки на холсте panelStage.
      panelStage.addChild(autoplayButton, autoplayHovButton, autoplayTachButton);

      // Создаем кнопки в трех состояниях. MAX_BET
      maxBetButton = new createjs.Bitmap("img/buttons/MaxBet.png");
      maxBetHovButton = new createjs.Bitmap("img/buttons/MaxBet_hov.png");
      maxBetTachButton = new createjs.Bitmap("img/buttons/MaxBet_tach.png");
      // Позиционируем кнопки.
      maxBetButton.x = 1314;      maxBetButton.y = 920;
      maxBetHovButton.x = 1314;   maxBetHovButton.y = 920;
      maxBetTachButton.x = 1314;  maxBetTachButton.y = 920;
      // Видна только основная кнопка.
      maxBetButton.alpha = 1; maxBetHovButton.alpha = 0; maxBetTachButton.alpha = 0;
      // Курсор как на обычной кнопке.
      maxBetButton.cursor = maxBetHovButton.cursor = maxBetTachButton.cursor = "pointer";
      // Рисуем кнопки на холсте panelStage.
      panelStage.addChild(maxBetButton, maxBetHovButton, maxBetTachButton);

      // Создаем кнопки в трех состояниях. MINUS_COINS
      minusCoinsButton = new createjs.Bitmap("img/buttons/Minus.png"),
      minusCoinsHovButton = new createjs.Bitmap("img/buttons/Minus_hov.png"),
      minusCoinsTachButton = new createjs.Bitmap("img/buttons/Minus_tach.png");
      // Позиционируем кнопки.
      minusCoinsButton.x = 1494;      minusCoinsButton.y = 937;
      minusCoinsHovButton.x = 1494;   minusCoinsHovButton.y = 937;
      minusCoinsTachButton.x = 1494;  minusCoinsTachButton.y = 937;
      // Видна только основная кнопка.
      minusCoinsButton.alpha = 1; minusCoinsHovButton.alpha = 0; minusCoinsTachButton.alpha = 0;
      // Курсор как на обычной кнопке.
      minusCoinsButton.cursor = minusCoinsHovButton.cursor = minusCoinsTachButton.cursor = "pointer";
      // Рисуем кнопки на холсте panelStage.
      panelStage.addChild(minusCoinsButton, minusCoinsHovButton, minusCoinsTachButton);

      // Создаем кнопки в трех состояниях. PLUS_COINS
      plusCoinsButton = new createjs.Bitmap("img/buttons/Plus.png"),
      plusCoinsHovButton = new createjs.Bitmap("img/buttons/Plus_hov.png"),
      plusCoinsTachButton = new createjs.Bitmap("img/buttons/Plus_tach.png");
      // Позиционируем кнопки.
      plusCoinsButton.x = 1624;     plusCoinsButton.y = 937;
      plusCoinsHovButton.x = 1624;  plusCoinsHovButton.y = 937;
      plusCoinsTachButton.x = 1624; plusCoinsTachButton.y = 937;
      // Видна только основная кнопка.
      plusCoinsButton.alpha = 1; plusCoinsHovButton.alpha = 0; plusCoinsTachButton.alpha = 0;
      // Курсор как на обычной кнопке.
      plusCoinsButton.cursor = plusCoinsHovButton.cursor = plusCoinsTachButton.cursor = "pointer";
      // Рисуем кнопки на холсте panelStage.
      panelStage.addChild(plusCoinsButton, plusCoinsHovButton, plusCoinsTachButton);

      // Клонируем кнопки в трех состояниях. MINUS_BET
      minusBetButton = minusCoinsButton.clone(),
      minusBetHovButton = minusCoinsHovButton.clone(),
      minusBetTachButton = minusCoinsTachButton.clone();
      // Позиционируем кнопки.
      minusBetButton.x = minusBetHovButton.x = minusBetTachButton.x = 750;
      // Рисуем кнопки на холсте panelStage.
      panelStage.addChild(minusBetButton, minusBetHovButton, minusBetTachButton);

      // Клонируем кнопки в трех состояниях. PLUS_BET
      plusBetButton = plusCoinsButton.clone(),
      plusBetHovButton = plusCoinsHovButton.clone(),
      plusBetTachButton = plusCoinsTachButton.clone();
      // Позиционируем кнопки.
      plusBetButton.x = plusBetHovButton.x = plusBetTachButton.x = 880;
      // Рисуем кнопки на холсте panelStage.
      panelStage.addChild(plusBetButton, plusBetHovButton, plusBetTachButton);
    }

    // Поведение кнопок
    controlButtons();
    // Функция controlButtons() - отвечает за настройку поведения кнопок панели управления.
    function controlButtons() {
      // Ховер эффект на кнопке SPIN.
      spinButton.on("rollover", function(){
        spinHovButton.alpha = 1;
      });
      spinButton.on("rollout", function(){
        spinHovButton.alpha = 0;
      });
      spinHovButton.on("rollover", function(){
        spinHovButton.alpha = 1;
      });
      spinHovButton.on("rollout", function(){
        spinHovButton.alpha = 0;
      });
      // Клик на кнопке SPIN.
      spinButton.on("mousedown", function(){
        spinON();
        autoplayOFF();
      });
      spinHovButton.on("mousedown", function(){
        spinON();
        autoplayOFF();
      });
      // SPIN по пробелу.
      $(document).on("keydown", function(event){
        if(event.keyCode === 32 || event.which === 32) { // Если нажат пробел.
          spinON();
          autoplayOFF();
        }
      });

      // var autoplayIndex = 0; // Индекс AUTOPLAY сессии. (нужен для его отключения).
      // Ховер эффект на кнопке AUTOPLAY.
      autoplayButton.on("rollover", function(){
        autoplayHovButton.alpha = 1;
      });
      autoplayButton.on("rollout", function(){
        autoplayHovButton.alpha = 0;
      });
      autoplayHovButton.on("rollover", function(){
        autoplayHovButton.alpha = 1;
      });
      autoplayHovButton.on("rollout", function(){
        autoplayHovButton.alpha = 0;
      });
      // Клик на кнопке AUTOPLAY.
      autoplayHovButton.on("mousedown", function(){
        autoplayTachButton.alpha = 1;
        maxBetTachButton.alpha = 1;
        spinON();
        autoplayID[autoplayIndex] = setInterval(spinON.bind(null), timeOfSpin + 500);
      });
      // Если AUTOPLAY уже работает, то мы его отключим.
      autoplayTachButton.on("mousedown", function(){
        autoplayTachButton.alpha = 0;
        maxBetTachButton.alpha = 0;
        clearInterval(autoplayID[autoplayIndex]);
        autoplayIndex++;
      });

      // Ховер эффект на кнопке MAX_BET.
      maxBetButton.on("rollover", function(){
        maxBetHovButton.alpha = 1;
      });
      maxBetButton.on("rollout", function(){
        maxBetHovButton.alpha = 0;
      });
      maxBetHovButton.on("rollover", function(){
        maxBetHovButton.alpha = 1;
      });
      maxBetHovButton.on("rollout", function(){
        maxBetHovButton.alpha = 0;
      });
      // Клик на кнопке MAX_BET.
      maxBetHovButton.on("mousedown", function(){
        maxBetTachButton.alpha = 1;
        // Изменяем значение уровня ставки на 10.
        betValue.text = 10;
        betValue.x = 822;
        // Пересчитуем сумму монет на ставку на 150.
        betSum.text = (+betValue.text*15).toFixed(0);
        betSum.x = 620; betSum.y = 923;
        betSum.font = "bold 23px Arial";
        // Пересчитуем сумму ставки в деньгах.
        betTotal.text = ((+betSum.text) * (+coinsValue.text)).toFixed(2);
        // Отправляем запрос со значением ставки, и по возврату пробуем запустить SPIN.
        $.ajax({
          url: url + '_SetBet/' + sessionID + '/' + betValue.text,
          dataType: 'JSONP',
          type: 'GET',
          success: function() {
            spinON();
          }
        });
      });
      maxBetHovButton.on("click", function(){
        maxBetTachButton.alpha = 0;
      });

      // Ховер эффект на кнопке MINUS_COINS.
      minusCoinsButton.on("rollover", function(){
        minusCoinsHovButton.alpha = 1;
      });
      minusCoinsButton.on("rollout", function(){
        minusCoinsHovButton.alpha = 0;
      });
      minusCoinsHovButton.on("rollover", function(){
        minusCoinsHovButton.alpha = 1;
      });
      minusCoinsHovButton.on("rollout", function(){
        minusCoinsHovButton.alpha = 0;
      });
      // Клик на кнопке MINUS_COINS.
      minusCoinsHovButton.on("mousedown", function(){
        // Устанавливаем неравномерный шаг уменьшения стоимости монеты.
        if(+coinsValue.text > 0.01) {
          if(+coinsValue.text === 0.02) {coinsValue.text = "0.01";}
          if(+coinsValue.text === 0.05) {coinsValue.text = "0.02";}
          if(+coinsValue.text === 0.10) {coinsValue.text = "0.05";}
          if(+coinsValue.text === 0.20) {coinsValue.text = "0.10";}
          if(+coinsValue.text === 0.50) {coinsValue.text = "0.20";}
          if(+coinsValue.text === 1.00) {coinsValue.text = "0.50";}
          createjs.Sound.play("buttonClickSound");
        }
        // Пересчитываем общую сумму монет.
        coinsSum.text = (+cashTotal.text/+coinsValue.text).toFixed(0);
        // Пересчитываем сумму ставки в деньгах.
        betTotal.text = (+betSum.text*+coinsValue.text).toFixed(2);
        // В зависимости от величины суммы подправляем расположение чтобы цифра была по центру.
        if(+coinsSum.text >= 10 ) {
          coinsSum.x = 1777;
        }
        if(+coinsSum.text >= 100 ) {
          coinsSum.x = 1771;
        }
        if(+coinsSum.text >= 1000 ) {
          coinsSum.x = 1765;
        }
        if(+coinsSum.text >= 10000 ) {
          coinsSum.x = 1759;
        }
      });

      // Ховер эффект на кнопке PLUS_COINS.
      plusCoinsButton.on("rollover", function(){
        plusCoinsHovButton.alpha = 1;
      });
      plusCoinsButton.on("rollout", function(){
        plusCoinsHovButton.alpha = 0;
      });
      plusCoinsHovButton.on("rollover", function(){
        plusCoinsHovButton.alpha = 1;
      });
      plusCoinsHovButton.on("rollout", function(){
        plusCoinsHovButton.alpha = 0;
      });
      // Клик на кнопке PLUS_COINS.
      plusCoinsHovButton.on("mousedown", function(){
        // Устанавливаем неравномерный шаг увеличения стоимости монеты.
        if(+coinsValue.text < 1){
          if(+coinsValue.text === 0.50) {coinsValue.text = "1.00";}
          if(+coinsValue.text === 0.20) {coinsValue.text = "0.50";}
          if(+coinsValue.text === 0.10) {coinsValue.text = "0.20";}
          if(+coinsValue.text === 0.05) {coinsValue.text = "0.10";}
          if(+coinsValue.text === 0.02) {coinsValue.text = "0.05";}
          if(+coinsValue.text === 0.01) {coinsValue.text = "0.02";}
          createjs.Sound.play("buttonClickSound");
        }
        // Пересчитываем общую сумму монет.
        coinsSum.text = (+cashTotal.text/+coinsValue.text).toFixed(0);
        // Пересчитываем сумму ставки в деньгах.
        betTotal.text = (+betSum.text*+coinsValue.text).toFixed(2);
        // В зависимости от величины суммы подправляем расположение чтобы цифра была по центру.
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

      // Ховер эффект на кнопке MINUS_BET.
      minusBetButton.on("rollover", function(){
        minusBetHovButton.alpha = 1;
      });
      minusBetButton.on("rollout", function(){
        minusBetHovButton.alpha = 0;
      });
      minusBetHovButton.on("rollover", function(){
        minusBetHovButton.alpha = 1;
      });
      minusBetHovButton.on("rollout", function(){
        minusBetHovButton.alpha = 0;
      });
      // Клик на кнопке MINUS_BET.
      minusBetHovButton.on("mousedown", function(){
        // Проверяем условие что уровень ставки больше 1.
        if(+betValue.text > 1) {
          betValue.text = +betValue.text - 1;
          createjs.Sound.play("buttonClickSound");
        }
        // Пересчитываем сумму ставки в монетках.
        betSum.text = betValue.text * 15;
        // Пересчитываем сумму ставки в деньгах.
        betTotal.text = (+betSum.text*+coinsValue.text).toFixed(2);
        // Если значения слишком большие , то выравниваем по центру.
        if(+betSum.text < 100) {
          betSum.x = 625; betSum.y = 921;
          betSum.font = "bold 25px Arial";
        }
        if(+betValue.text !== 10) {
          betValue.x = 828;
        }
        // Отправляем на сервер запрос со значением ставки.
        $.ajax({
          url: url + '_SetBet/' + sessionID + '/' + betValue.text,
          dataType: 'JSONP',
          type: 'GET',
          success: function() {
          }
        });
      });

      // Ховер эффект на кнопке PLUS_BET.
      plusBetButton.on("rollover", function(){
        plusBetHovButton.alpha = 1;
      });
      plusBetButton.on("rollout", function(){
        plusBetHovButton.alpha = 0;
      });
      plusBetHovButton.on("rollover", function(){
        plusBetHovButton.alpha = 1;
      });
      plusBetHovButton.on("rollout", function(){
        plusBetHovButton.alpha = 0;
      });
      // Клик на кнопке PLUS_BET.
      plusBetHovButton.on("mousedown", function(){
        // Проверяем что значение уровня ставки меньше 10.
        if(+betValue.text < 10) {
          betValue.text = +betValue.text + 1;
          createjs.Sound.play("buttonClickSound");
        }
        // Пересчитываем сумму ставки в монетках.
        betSum.text = betValue.text * 15;
        // Пересчитываем сумму ставки в деньгах.
        betTotal.text = (+betSum.text*+coinsValue.text).toFixed(2);
        // Если значения слишком большие , то выравниваем по центру.
        if(+betSum.text > 100) {
          betSum.x = 620; betSum.y = 923;
          betSum.font = "bold 23px Arial";
        }
        if(+betValue.text === 10) {
          betValue.x = 822;
        }
        // Отправляем на сервер запрос со значением ставки.
        $.ajax({
          url: url + '_SetBet/' + sessionID + '/' + betValue.text,
          dataType: 'JSONP',
          type: 'GET',
          success: function() {
          }
        });
      });

      // Функция spinOFF() - отвечает за возвращение состояния для следующей крутки.
      function spinOFF() {
        spinTachButton.alpha = 0;
        spinClicked = false;
      }
      // Функция spinON() - отвечает за проверку возможности запуска крутки.
      function spinON() {
        if (!spinClicked){ // Если SPIN не крутится.
          spinClicked = true; // Изменяем флаг - показываем что сейчас происходит SPIN.
          spinTachButton.alpha = 1; // Делаем видимой кнопку при клике.
          setTimeout(spinOFF.bind(null), timeOfSpin); // Когда крутка закончится - состояние вернется к исходному.
          spin(); // Делаем крутку.
        }
      }
      // Функция autoplayOFF() - отвечает за отключение автоплея если он установлен.
      function autoplayOFF() {
        // Снимаем все AUTOPLAY.
        for (var i = 0; i < autoplayID.length; i++) {
          if(autoplayID[i]) {
            clearInterval(autoplayID[i]);
            maxBetTachButton.alpha = 0;
            autoplayTachButton.alpha = 0;
          }
        }
      }
    }

  }
  // Рисуем панель управления.
  drawPanel();

  // Функция startGame(name) - отвечает за инициализацию игры, получение барабанов, координат линии, установки ставки, и загрузки начального экрана.
	function startGame(name) {
		// Запрос по имени пользователя.
		$.ajax({
			url: url + '_Login/' + name,
			dataType: 'JSONP',
			type: 'GET',
			success: function (ID) {
				// Получаем от сервера sessionID.
				sessionID = ID;
				// Запрос на начало игры.
				$.ajax({
					url: url + '_Play/' + sessionID + "/" + gameID,
					dataType: 'JSONP',
					type: 'GET',
					success: function (someRequest) {
						if (someRequest.hPlayResult !== undefined) {
              // Если ответ вменяемый, то -
							// Запрос на проверку Ready.
							$.ajax({
								url: url + '_Ready/' + sessionID,
								dataType: 'JSONP',
								type: 'GET',
								success: function (anotherSomeRequest) {
									if (anotherSomeRequest !== undefined) {
                    // Если ответ вменяемый, то -
                    // Отправляем запросы на получение линий барабана.
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 0,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(line) {
                        var i, counter = 0;
                        // Присваиваем определенному индексу массива wheels полученую линию.
                        wheels[0] = line;
                        // Здесь проводится проверки окончания загрузки всех линий и загружается стартовый экран.
                        for(i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 1,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(line) {
                        var i, counter = 0;
                        // Присваиваем определенному индексу массива wheels полученую линию.
                        wheels[1] = line;
                        // Здесь проводится проверки окончания загрузки всех линий и загружается стартовый экран.
                        for(i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 2,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(line) {
                        var i, counter = 0;
                        // Присваиваем определенному индексу массива wheels полученую линию.
                        wheels[2] = line;
                        // Здесь проводится проверки окончания загрузки всех линий и загружается стартовый экран.
                        for(i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 3,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(line) {
                        var i, counter = 0;
                        // Присваиваем определенному индексу массива wheels полученую линию.
                        wheels[3] = line;
                        // Здесь проводится проверки окончания загрузки всех линий и загружается стартовый экран.
                        for(i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    $.ajax({
                      url: url + '_GetWheels/' + sessionID + "/" + 4,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(line) {
                        var i, counter = 0;
                        // Присваиваем определенному индексу массива wheels полученую линию.
                        wheels[4] = line;
                        // Здесь проводится проверки окончания загрузки всех линий и загружается стартовый экран.
                        for(i = 0; i < 5; i++) {
                          if(wheels[i] !== undefined){counter++}
                        }
                        if (counter === 5) {showStartScreen(wheels)}
                      }
                    });
                    // Отправляем начальную ставку на сервер.
                    $.ajax({
                      url: url + '_SetBet/' + sessionID + '/' + 1,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function() {}
                    });
                    // Отправляем запрос на координаты всех линий.
                    $.ajax({
                      url: url + '_GetLines/' + sessionID,
                      dataType: 'JSONP',
                      type: 'GET',
                      success: function(data) {
                        var i, j;
                        // Координаты каждой линии разделены "|".
                        linesCoords = data.split("|");
                        // Пройдемся по всем линиям и разберем координаты разделенные "@"
                        for(i = 0; i < linesCoords.length; i++) {
                          linesCoords[i] = linesCoords[i].split("@");
                          // Также разберем все координаты на массив [x, y], разделенные ","
                          for (j = 0; j < linesCoords[i].length; j++) {
                            linesCoords[i][j] = linesCoords[i][j].split(",");
                          }
                        }
                      }
                    }); // Конец запроса GetLines
									}
								}
							});// Конец запроса Ready.
						}
					}
				});// Конец запроса Play.
			}
		});// Конец запроса Login.
  }
  // Инициализируем игру по имени nameOfPlayer.
  startGame(nameOfPlayer);

  // Функция showStartScreen(wheels) - отвечает за загрузку первого экрана игры. Параметром принимает массив линий, полученный от сервера.
  function showStartScreen(wheels) {
    var i;
    // Пройдемся по всем линиям.
    for (i = 0; i < wheels.length; i++) {
      // Разделим элементы в массив по разделителю "@".
      wheels[i] = wheels[i].split("@");
      // Проведем переименование элементов полученных от сервера на номера [1..13].
      renameLine(wheels[i]);
    }
    // Получим информацию о номерах текущего экрана.
    currentScreenData = getFirstScreenData(wheels);
    // И отобразим их.
    showFirstScreen();

    // Функция renameLine(line) - отвечает за переименование данных с сервера в более удобные номера [1..13].
    function renameLine(line) {
      var i;
      // Перебираем всю линию.
      for (i = 0; i < line.length; i++) {
        if (line[i] === "j")       {line[i] = 1} // Символ "J".
        if (line[i] === "iJ")      {line[i] = 2} // Символ Дворецкого.
        if (line[i] === "q")       {line[i] = 3} // Символ "Q".
        if (line[i] === "iQ")      {line[i] = 4} // Символ Графини.
        if (line[i] === "k")       {line[i] = 5} // Символ "K".
        if (line[i] === "ik")      {line[i] = 6} // Символ Германа.
        if (line[i] === "a")       {line[i] = 7} // Символ "A".
        if (line[i] === "iA")      {line[i] = 8} // Символ Лизы.
        if (line[i] === "wild")    {line[i] = 9} // Символ Часов.
        if (line[i] === "scatter") {line[i] = 10}// Символ Скаттера.
        if (line[i] === "sw.sw1")  {line[i] = 11}// Верх Тройной Лизы.
        if (line[i] === "sw.sw2")  {line[i] = 12}// Середина Тройной Лизы.
        if (line[i] === "sw.sw3")  {line[i] = 13}// Низ Тройной Лизы.
      }
    }
    // Функция getFirstScreenData(wheels) - отвечает за формирование массива currentScreenData из полученных линий барабана.
    function getFirstScreenData(wheels) {
      var i, result = [];
      // Пройдемся по всем линиям.
      for (i = 0; i < wheels.length; i++){
        // И вырежем первые пять элементов. (5 для того чтобы было по одному элементу по бокам экрана).
        result[i] = wheels[i].slice(0, 5);
      }
      // Вернем массив первого экрана.
      return result;
    }
  }

  // Функция showFirstScreen() - отвечает за рисование первого экрана игры.
  function showFirstScreen() {
      var i;
      for (i = 0; i < 5; i++) {
        // Создаем 5 новых линий
        rows[i] = getFirstRow(i);
        // Позиционируем их гозизонтально
        rows[i].x = rowWidth*i;
        // И добавляем в холст
        gameStage.addChild(rows[i]);
      }

      // Функция getFirstRow(currentRow) - отвечает запостроение линии изображений полученных из currentScreenData.
      function getFirstRow(currentRow) {
        var row, img, i;
        // Создаем новый контейнер (линию)
        row = new createjs.Container();
        // В каждую линию записуем по 5 картинок (3 на экране и по одной по боках)
        for (i = 0; i < 5; i++) {
          elementsMas[i] = currentScreenData[currentRow][i];
          // Расчитываем позиции элементов по высоте (первый элемент будет за верхним краем)
          elementsPositions[i] = elementHeight * (i - 1);
          // Создаем нужную картинку
          img = new createjs.Bitmap("img/game/" + elementsMas[i] + ".png");
          // Позиционируем картинку
          img.y = elementsPositions[i];
          // Добавляем ее в линию
          row.addChild(img);
        }
        // Возвращаем линию
        return row;
      }
    }

  // Функция showNewScreen() - отвечает за отображение нового экрана и столбиков при крутке.
	function showNewScreen() {
    // При загрузке нового экрана мы убираем все линии с экрана и убираем тени с номеров линий.
		for (var j = 0; j < 21; j++) {
			lineImages[j].alpha = 0;
      lineWinImages[j].alpha = 0;
      if (lineNumbers[j].shadow) {lineNumbers[j].shadow.offsetX = lineNumbers[j].shadow.offsetY = lineNumbers[j].shadow.blur = 0}
		}
    // Также убираем текст выигрыша.
    gameStage.removeChild(winText);
    // Создаем новые линии барабана.
		for (var i = 0; i < 5; i++) {
      // Но сначала удаляем все изображения предыдущих линий.
      gameStage.removeChild(rows[i]);
      // И выигрышных линий также.
      gameStage.removeChild(winRows[i]);
			// Создаем 5 новых линий.
      winRows[i] = getNewWinRow(i);
      // Также заготавливаем выигрышный экран.
      rows[i] = getNewRow(i);
			// Позиционируем их гозизонтально.
			rows[i].x = rowWidth*i;
      winRows[i].x = rowWidth*i;
			// И добавляем в холст.
      gameStage.addChild(rows[i]);
      gameStage.addChild(winRows[i]);
		}
    // Функция getNewRow(currentRow) - отвечает за создание новой линии включая по концам результаты nextScreenData и currentScreenData.
    function getNewRow(currentRow) {
      var row, img, i;
      // Создаем новую линию-контейнер
      row = new createjs.Container();
      // Заполняем ее элементами
      for ( i = 0; i < 60; i++ ) {
        if ( i < 5 ) { // В конце линии будут выпадающие стоты
          elementsMas[i] = nextScreenData[currentRow][i];
          img = new createjs.Bitmap("img/game/" + elementsMas[i] + ".png");
        } else
        if ( i > 54) { // В начале линии будут теперешние слоты
          elementsMas[i] = currentScreenData[currentRow][i - 55];
          img = new createjs.Bitmap("img/game/" + elementsMas[i] + ".png");
        } else { // Остальные слоты будут случайными и размытыми
          elementsMas[i] = Math.ceil(Math.random() * 10);
          img = new createjs.Bitmap("img/game/blur/" + elementsMas[i] + "b.png");
        }
        // Рассчитываем позиции элементов с учетом выступов по одному элементу по краях
        elementsPositions[i] = elementHeight * ( i + 1 + 3 - 60 );
        // Позиционирование элементов
        img.y = elementsPositions[i];
        // Добавляем их в линию
        row.addChild(img);
      }
      // Возвращаем линию
      return row;
    }

    // Функция getNewWinRow(currentRow) - отвечает за создание новой победной линии по результам nextScreenData.
    function getNewWinRow(currentRow) {
      var winRow, winImg, j;
      // Создаем новую линию-контейнер.
      winRow = new createjs.Container();
      // Заполняем ее элементами
      for ( j = 0; j < 5; j++ ) {
        elementsMas[j] = nextScreenData[currentRow][j];
        winImg = new createjs.Bitmap("img/game/win/" + elementsMas[j] + ".png");
        // Рассчитываем позиции элементов с учетом выступов по одному элементу по краях
        elementsPositions[j] = elementHeight *  (j-1);
        // Позиционирование элементов
        winImg.y = elementsPositions[j];
        winImg.alpha = 0;
        // Добавляем их в линию
        winRow.addChild(winImg);
      }
      winRow.y = elementsPositions[1];
      // Возвращаем линию
      return winRow;
    }
	}

  // Функция spin() - отвечает за проведение крутки.
	function spin() {
		$.ajax({ // Запрос проверки Ready
			url: url + '_Ready/' + sessionID,
			dataType: 'JSONP',
			type: 'GET',
			success: function(someData) {
				if(someData !== undefined) { // Если есть ответ.
					$.ajax({ // То отравляем запрос-крутку Roll.
						url: url + '_Roll/' + sessionID,
						dataType: 'JSONP',
						type: 'GET',
						success: function(rollData) {
              console.log(rollData.Result);
              // Разбираем результаты.
              indexes = rollData.Result.Indexes;
							winLines = rollData.Result.LinesResult;
              winCoins = rollData.Result.TotalWin;
              bonusResult = rollData.Result.BonusResults;

              // Обнуляем массив с выпавшими линиями.
              numbersOfLines = [];
              // Обнуляем выигрыш.
              winTotal.text = "0.00";
              // Забираем деньги за крутку.
              cashTotal.text = (+cashTotal.text - (+betTotal.text)).toFixed(2);
              // Забираем монеты за крутку.
              coinsSum.text = (+cashTotal.text/(+coinsValue.text)).toFixed(0);

              // Записываем значения конечного экрана.
              getNextScreenData();

							// Отображаем необходимые линии.
							showNewScreen();

              createjs.Sound.play("spinClickSound");
              createjs.Sound.play("spinProcessSound");

              // Прокручиваем линии до нужного нам экрана.
              animateSpin();

							// Делаем перезапись теперешнего экрана.
              copyScreenFromTo (nextScreenData, currentScreenData);

              // Получаем номера выпавших линий.
              getNumbersOfLines();

              // Если у нас есть выпавшие линии, то показываем выигрышный экран.
              if(winLines[0] !== undefined) {
                setTimeout(showWinScreen.bind(null), timeOfSpin - 200);
              }

						}
					});// _Roll AJAX End
				}
			}
		});// _Ready AJAX End

    // Функция animateSpin() - отвечает за анимирование крутки.
    function animateSpin() {
      var i, time = 1000;
      for(i = 0; i < rows.length; i++) {
        time += 400;
        createjs.Tween.get(rows[i])
          .to({ y: -elementsPositions[1]}, time , createjs.Ease.getBackInOut(0.5))
          .call(handleComplete);
      }
      function handleComplete() {
        createjs.Sound.play("spinEndSound");
      }
    }

    // Функция getNumbersOfLines() - отвечает за получение номеров выпавших линий, и количества выпавших элементов.
    function getNumbersOfLines() {
      var i, numberOfElements, indexOfLine, numberOfLine;
      for (i = 0; i < winLines.length; i++) {
        numbersOfLines[i] = [];
        numberOfElements = parseInt(winLines[i]);
        indexOfLine = winLines[i].indexOf("#");
        numberOfLine = winLines[i].substr(indexOfLine + 1);
        numbersOfLines[i].push(+numberOfLine, numberOfElements);
      }
    }

    // Функция getNextScreenData() - отвечает за получение результатов следующего экрана.
    function getNextScreenData() {
      var i, j, counter = 0;
      for (i = 0; i < 5; i++) {
        nextScreenData[i] = [];
        for (j = 0; j < 5; j++) {
          // Если первый индекс равен 0.
          if ( (+indexes[i] === 0)&&(j === 0) ) {
            // То выходящим за пределы символом будет 699-ый
            nextScreenData[i].push(wheels[i][699]);
            // Если индекс будет большим за 696
          } else if(+indexes[i] > 696){
            // И значение не определенно
            if(wheels[i][indexes[i] + j - 1] === undefined) {
              // То мы подгружаем начальные символы
              nextScreenData[i].push(wheels[i][counter]);
              counter++;
            } else {
              // Иначе делаем все по норме.
              nextScreenData[i].push(wheels[i][indexes[i] + j - 1]);
            }
          } else {
            nextScreenData[i].push(wheels[i][indexes[i] + j - 1]);
          }
        }
      }
    }

    // Функция copyScreenFromTo (nextScreenData, currentScreenData) - отвечает за глубокое копирование двумерного массива nextScreenData в currentScreenData.
    function copyScreenFromTo (nextScreenData, currentScreenData) {
      var i, j;
      for (i = 0; i < 5; i++) {
        for (j = 0; j < 5; j++) {
          currentScreenData[i][j] = nextScreenData[i][j];
        }
      }
    }
	}

  // Функция showWinScreen() - отвечает за показ победного экрана.
  function showWinScreen() {
    // Определяем выигрыш в деньгах.
    winTotal.text = +(winCoins*parseFloat(coinsValue.text)).toFixed(2);
    // И общую сумму депозита.
    cashTotal.text = (+parseFloat(cashTotal.text) + +winTotal.text).toFixed(2);

    if(bonusResult[0] !== undefined) {
      doorsLevel(1);
      autoplayTachButton.alpha = 0;
      maxBetTachButton.alpha = 0;
      clearInterval(autoplayID[autoplayIndex]);
      autoplayIndex++;
    }

    // Проходимся по массиву победных линий.
    for(var i = 0; i < numbersOfLines.length; i++) {
      var numberOfCurrentLine = numbersOfLines[i][0]; // Номер текущей линии.
      var numberOfCurrentElements = numbersOfLines[i][1]; // Количество выпавших элементов.
      // В случае выпадения скаттеров.
      if (numberOfCurrentLine === -1) {
        // Пройдемся по выигрышному экрану.
        for (var rowIndex = 0; rowIndex < 5; rowIndex++) {
          for (var elementIndex = 0; elementIndex < 5; elementIndex++) {
            // Если выпал скаттер.
            if(winRows[rowIndex].children[elementIndex].image.currentSrc.indexOf("game/win/10.png") !== -1) {
              var winScatter = winRows[rowIndex].children[elementIndex];
              // То делаем его видимым.
              winScatter.alpha = 1;
              // И запускаем анимацию.
              createjs.Tween.get(winScatter, { loop: true })
              .to({ alpha: 1, scaleX: 1.02, scaleY: 1.02, x: -3}, 500)
              .to({ alpha: 0.9, scaleX: 1, scaleY: 1, x: 0}, 500)
              .to({ alpha: 1, scaleX: 1, scaleY: 1, x: 0}, 300);
            }
          }
        }
      } else { // Если выпала нормальная линия.
        // То мы показываем выигрышную линию.
        showWinLine(numberOfCurrentLine - 1);
        // И подсвечиваем нужный номер линии.
        lineNumbers[numberOfCurrentLine-1].shadow = new createjs.Shadow("#FFFFFF", 1, 1, 2);

        for(var j = 0; j < numberOfCurrentElements; j++) {
          var currentRowNumber, currentElementNumber, currentElement;
          // Находим выигрышные элементы по координатам.
          currentRowNumber = +linesCoords[numberOfCurrentLine-1][j][0];
          currentElementNumber = +linesCoords[numberOfCurrentLine-1][j][1] + 1;
          currentElement = winRows[currentRowNumber].children[currentElementNumber];
          // Отображаем нужный элемент.
          currentElement.alpha = 1;

          // И задаем ему анимацию.
          createjs.Tween.get(currentElement, { loop: true })
          .to({ alpha: 1, scaleX: 1.02, scaleY: 1.02, x: -3}, 500)
          .to({ alpha: 0.9, scaleX: 1, scaleY: 1, x: 0}, 500)
          .to({ alpha: 1, scaleX: 1, scaleY: 1, x: 0}, 300);
        }

      }
    } // Конец обработки выигрышных линий

    // Создаем выигрышную надпись.
    winText = new createjs.Text(winCoins, "bold 120px Arial", "#efe947");
    // Позиционируем ее.
    winText.x = 630;  winText.y = 335;
    winText.scaleX = winText.scaleY = 0;
    // И добавляемей тень.
    winText.shadow = new createjs.Shadow("#000000", 5, 10, 6);
    // Добавляем ее на игровой холст.
    gameStage.addChild(winText);
    // В зависимости от величины выигрыша анимируем надпись.
    if(+winCoins >= 10 && +winCoins < 100) {
      animateWinText(575);
    }
    if(+winCoins < 10) {
      animateWinText(575);
    }

    // Функция animateWinText(textX) - отвечает за анимирование победной надписи.
    function animateWinText(textX) {
      createjs.Tween.get(winText, {loop: true})
      .to({ scaleX: 1, scaleY: 1, x: textX, y: 300}, 300)
      .to({ alpha: 0.75 }, 500)
      .to({ alpha: 1 }, 500)
      .to({ alpha: 0.75 }, 500)
      .to({ alpha: 1 }, 500)
      .to({ alpha: 0.75 }, 500)
      .to({ alpha: 1 }, 500)
      .to({ alpha: 0.75 }, 500)
      .to({ alpha: 1 }, 500);
    }
    // Функция showWinLine(numberOfLine) - отвечает за показ нужных победных линий.
    function showWinLine(numberOfLine) {
      lineWinImages[numberOfLine].alpha = 1;
    }

  }

  function doorsLevel(levelNumber) {

    var door1, door2, door3, door4, door5,
    multiply, bonusNumber, winBonus,
    winIMG, failIMG, win_OR_fail,
    bgIMG, firstDarkness,
    newLevel, counter;

    function preloadDoors() {
      var preload, i, j;
      // Создаем очередь загрузки.
      preload = new createjs.LoadQueue();
      // Загружаем изображения фонов для холстов.
      for ( i = 1; i <= 5; i++ ) {
        var roomPath = "img/bonuses/room" + i + "/";
        preload.loadFile(roomPath + "2.png");
        preload.loadFile(roomPath + "3.png");
        preload.loadFile(roomPath + "4.png");
        preload.loadFile(roomPath + "5.png");
        preload.loadFile(roomPath + "x.png");
        preload.loadFile(roomPath + "bg.png");
        if ( i !== 5 ) {
          preload.loadFile(roomPath + "win.png");
          preload.loadFile(roomPath + "fail.png");
          preload.loadFile(roomPath + "doors2.png");
        }
        if ( i === 1 ) {
          preload.loadFile(roomPath + "door1.png");
          preload.loadFile(roomPath + "door2.png");
          preload.loadFile(roomPath + "door3.png");
          preload.loadFile(roomPath + "door4.png");
          preload.loadFile(roomPath + "door5.png");
        }
        if ( i === 5 ) {
          preload.loadFile(roomPath + "chest1gif.png");
          preload.loadFile(roomPath + "chest3gif.png");
          preload.loadFile(roomPath + "chest5gif.png");
          preload.loadFile(roomPath + "moneti.png");
          preload.loadFile(roomPath + "svet.png");
          preload.loadFile(roomPath + "muha.png");
          preload.loadFile(roomPath + "stolb.png");
        }
      }
    }

    // Очистим экраны.
    counter = 0;

    $("#doorsCanvas").addClass("first");
    gameStage.alpha = 0;
    panelStage.alpha = 0;
    bgStage.alpha = 0;
    doorsStage.alpha = 1;
    doorsStage.removeAllChildren();

    // Создаем и запускаем начальную темноту.
    firstDarkness = new createjs.Shape();
    firstDarkness.graphics.beginFill("#000").drawRect(0, 0, 1920, 1080);
    if (+levelNumber === 1) {
      preloadDoors();
      createjs.Tween.get(firstDarkness)
      .to({alpha: 0}, 3000);
    } else {
      createjs.Tween.get(firstDarkness)
      .to({alpha: 0}, 1000);
    }

    // Здесь мы разбираем массив бонусов.
    var bonusString = bonusResult[0].BonusSteps;
    var bonusArray = bonusString.split(",");
    bonusArray = bonusArray.map(function(bonus){
      return parseInt(bonus);
    });
    console.log(bonusArray);

    bgIMG = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/bg.png");
    // Изображение победы.
    winIMG = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/win.png");
    // Изображение поражения.
    failIMG = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/fail.png");

    // Если есть бонус, то загружаем победный экран, и увеличиваем уровень.
    if (bonusArray[levelNumber - 1]) {doorsStage.addChild(winIMG); newLevel = levelNumber + 1;}
    else {doorsStage.addChild(failIMG)}

    // Создаем бонусную надпись.
    winBonus = new createjs.Container();
    winBonus.scaleX = 0.7; winBonus.scaleY = 0.7;
    winBonus.alpha = 0.2;
    winBonus.x = 732; winBonus.y = 440;
    multiply = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/x.png");
    bonusNumber = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/" + bonusArray[levelNumber - 1] + ".png");;
    bonusNumber.x = 200; bonusNumber.y = -75;
    winBonus.addChild(multiply, bonusNumber);


      // Добавим двери.
      dark1 = new createjs.Shape();
      dark1.graphics.beginFill("#000").drawRect(420, 350, 200, 525);
      dark2 = new createjs.Shape();
      dark2.graphics.beginFill("#000").drawRect(635, 360, 200, 480);
      dark3 = new createjs.Shape();
      dark3.graphics.beginFill("#000").drawRect(845, 380, 205, 468);
      dark4 = new createjs.Shape();
      dark4.graphics.beginFill("#000").drawRect(1070, 370, 223, 480);
      dark5 = new createjs.Shape();
      dark5.graphics.beginFill("#000").drawRect(1295, 355, 201, 525);

      door1 = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/door1.png");
      door1.x = 420; door1.y = 350;
      door2 = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/door2.png");
      door2.x = 635; door2.y = 370;
      door3 = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/door3.png");
      door3.x = 845; door3.y = 380;
      door4 = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/door4.png");
      door4.x = 1070; door4.y = 370;
      door5 = new createjs.Bitmap("img/bonuses/room"+ levelNumber + "/door5.png");
      door5.x = 1295; door5.y = 355;

      door1.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(this)
          .to({ y: this.y - 475}, 600);
          createjs.Tween.get(dark1)
          .to({alpha: 0}, 600);
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 1500);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      door2.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(this)
          .to({ y: this.y - 475}, 600);
          createjs.Tween.get(dark2)
          .to({alpha: 0}, 600);
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 1500);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      door3.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(this)
          .to({ y: this.y - 475}, 600);
          createjs.Tween.get(dark3)
          .to({alpha: 0}, 600);
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 1500);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      door4.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(this)
          .to({ y: this.y - 475}, 600);
          createjs.Tween.get(dark4)
          .to({alpha: 0}, 600);
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 1500);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      door5.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(this)
          .to({ y: this.y - 475}, 600);
          createjs.Tween.get(dark5)
          .to({alpha: 0}, 600);
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 3000, Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });

    if(levelNumber === 1) {
      doorsStage.addChild(dark1, door1, dark2, door2, dark3, door3, dark4, door4, dark5, door5, bgIMG, firstDarkness);
    }


      var room2Data = {
        images: ["img/bonuses/room2/doors2.png"],
        frames: {width: 200, height: 525},
        framerate: 24,
        animations: {
          door1open: [0, 9, "stop"],
          door2open: [1, 9, "stop"],
          door3open: [2, 9, "stop"],
          door4open: [3, 9, "stop"],
          door5open: [4, 9, "stop"],
          stop: 9
        }
      };

      var room2SpriteSheet = new createjs.SpriteSheet(room2Data);
      var room2 = {};
      room2.door1open = new createjs.Sprite(room2SpriteSheet, "door1open");
      room2.door1open.x = 413; room2.door1open.y = 351; room2.door1open.stop();
      room2.door1open.scaleX = 0.95; room2.door1open.scaleY = 0.97; room2.door1open.skewX = 0.5; room2.door1open.rotation = -1;
      room2.door2open = new createjs.Sprite(room2SpriteSheet, "door2open");
      room2.door2open.x = 636; room2.door2open.y = 367; room2.door2open.stop();
      room2.door2open.scaleX = 0.94; room2.door2open.scaleY = 0.91;
      room2.door3open = new createjs.Sprite(room2SpriteSheet, "door3open");
      room2.door3open.x = 859; room2.door3open.y = 370; room2.door3open.stop();
      room2.door3open.scaleX = 0.94; room2.door3open.scaleY = 0.9;
      room2.door4open = new createjs.Sprite(room2SpriteSheet, "door4open");
      room2.door4open.x = 1077; room2.door4open.y = 361; room2.door4open.stop();
      room2.door4open.scaleX = 0.97; room2.door4open.scaleY = 0.93;
      room2.door5open = new createjs.Sprite(room2SpriteSheet, "door5open");
      room2.door5open.x = 1291; room2.door5open.y = 335; room2.door5open.stop();
      room2.door5open.scaleX = 1.04; room2.door5open.scaleY = 1.02; room2.door5open.skewX = -0.5; room2.door5open.rotation = 1;

      room2.door1open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark1)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room2.door2open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark2)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room2.door3open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark3)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room2.door4open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark4)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room2.door5open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark5)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });

    if (levelNumber === 2) {
      doorsStage.addChild(dark1, room2.door1open, dark2, room2.door2open, dark3, room2.door3open, dark4, room2.door4open, dark5, room2.door5open, bgIMG, firstDarkness);
    }


      var room3Data = {
        images: ["img/bonuses/room3/doors2.png"],
        frames: {width: 200, height: 525},
        framerate: 24,
        animations: {
          door1open: [0, 9, "stop"],
          door2open: [1, 9, "stop"],
          door3open: [2, 9, "stop"],
          door4open: [3, 9, "stop"],
          door5open: [4, 9, "stop"],
          stop: 9
        }
      };

      var room3SpriteSheet = new createjs.SpriteSheet(room3Data);
      var room3 = {};
      room3.door1open = new createjs.Sprite(room3SpriteSheet, "door1open");
      room3.door1open.x = 413; room3.door1open.y = 351; room3.door1open.stop();
      room3.door1open.scaleX = 0.95; room3.door1open.scaleY = 0.97; room3.door1open.skewX = 0.5; room3.door1open.rotation = -1;
      room3.door2open = new createjs.Sprite(room3SpriteSheet, "door2open");
      room3.door2open.x = 638; room3.door2open.y = 367; room3.door2open.stop();
      room3.door2open.scaleX = 0.93; room3.door2open.scaleY = 0.91;
      room3.door3open = new createjs.Sprite(room3SpriteSheet, "door3open");
      room3.door3open.x = 859; room3.door3open.y = 370; room3.door3open.stop();
      room3.door3open.scaleX = 0.93; room3.door3open.scaleY = 0.9;
      room3.door4open = new createjs.Sprite(room3SpriteSheet, "door4open");
      room3.door4open.x = 1080; room3.door4open.y = 361; room3.door4open.stop();
      room3.door4open.scaleX = 0.96; room3.door4open.scaleY = 0.93;
      room3.door5open = new createjs.Sprite(room3SpriteSheet, "door5open");
      room3.door5open.x = 1293; room3.door5open.y = 335; room3.door5open.stop();
      room3.door5open.scaleX = 1.04; room3.door5open.scaleY = 1.02; room3.door5open.skewX = -0.5; room3.door5open.rotation = 1;

      room3.door1open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark1)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room3.door2open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark2)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room3.door3open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark3)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room3.door4open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark4)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room3.door5open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark5)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });

    if(levelNumber === 3) {
      doorsStage.addChild(dark1, room3.door1open, dark2, room3.door2open, dark3, room3.door3open, dark4, room3.door4open, dark5, room3.door5open, bgIMG, firstDarkness);
    }


      var room4Data = {
        images: ["img/bonuses/room4/doors2.png"],
        frames: {width: 200, height: 525},
        framerate: 24,
        animations: {
          door1open: [0, 9, "stop"],
          door2open: [1, 9, "stop"],
          door3open: [2, 9, "stop"],
          door4open: [3, 9, "stop"],
          door5open: [4, 9, "stop"],
          stop: 9
        }
      };

      var room4SpriteSheet = new createjs.SpriteSheet(room4Data);
      var room4 = {};
      room4.door1open = new createjs.Sprite(room4SpriteSheet, "door1open");
      room4.door1open.x = 413; room4.door1open.y = 351; room4.door1open.stop();
      room4.door1open.scaleX = 0.95; room4.door1open.scaleY = 0.97; room4.door1open.skewX = 0.5; room4.door1open.rotation = -1;
      room4.door2open = new createjs.Sprite(room4SpriteSheet, "door2open");
      room4.door2open.x = 638; room4.door2open.y = 367; room4.door2open.stop();
      room4.door2open.scaleX = 0.93; room4.door2open.scaleY = 0.91;
      room4.door3open = new createjs.Sprite(room4SpriteSheet, "door3open");
      room4.door3open.x = 859; room4.door3open.y = 370; room4.door3open.stop();
      room4.door3open.scaleX = 0.93; room4.door3open.scaleY = 0.9;
      room4.door4open = new createjs.Sprite(room4SpriteSheet, "door4open");
      room4.door4open.x = 1080; room4.door4open.y = 361; room4.door4open.stop();
      room4.door4open.scaleX = 0.96; room4.door4open.scaleY = 0.93;
      room4.door5open = new createjs.Sprite(room4SpriteSheet, "door5open");
      room4.door5open.x = 1293; room4.door5open.y = 335; room4.door5open.stop();
      room4.door5open.scaleX = 1.04; room4.door5open.scaleY = 1.02; room4.door5open.skewX = -0.5; room4.door5open.rotation = 1;

      room4.door1open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark1)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room4.door2open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark2)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room4.door3open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark3)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }
      });
      room4.door4open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark4)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          } else {
            setTimeout(returnToMainScreen.bind(null), 1500);
          }
        }

      });
      room4.door5open.on("click", function(){
        if (counter === 0) {
          createjs.Tween.get(dark5)
          .to({alpha: 0}, 600);
          this.play();
          counter++;
          if (newLevel) {
            doorsStage.addChild(winBonus);
            createjs.Tween.get(winBonus)
            .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);
            setTimeout(doorsLevel.bind(null, newLevel), 2000);
          }
        }
      });

    if (levelNumber === 4) {
      doorsStage.addChild(dark1, room4.door1open, dark2, room4.door2open, dark3, room4.door3open, dark4, room4.door4open, dark5, room4.door5open, bgIMG, firstDarkness);
    }

    var room5 = {};

    var svetData = {
      images: ["img/bonuses/room5/svet.png"],
      frames: {width: 296, height: 304},
      framerate: 12,
      animations: {
        open: [0, 9]
      }
    };
    room5.svet = new createjs.Sprite(new createjs.SpriteSheet(svetData), "open");
    room5.svet.alpha = 0;
    room5.svet.stop();

    room5.svet1 = room5.svet.clone();
    room5.svet1.x = 375; room5.svet1.y = 520;
    room5.svet2 = room5.svet.clone();
    room5.svet2.x = 590; room5.svet2.y = 510;
    room5.svet3 = room5.svet.clone();
    room5.svet3.x = 815; room5.svet3.y = 510;
    room5.svet4 = room5.svet.clone();
    room5.svet4.x = 1035; room5.svet4.y = 510;
    room5.svet5 = room5.svet.clone();
    room5.svet5.x = 1245; room5.svet5.y = 520;

    room5.stolb = new createjs.Bitmap("img/bonuses/room5/stolb.png");
    room5.stolb.alpha = 0;

    room5.stolb1 = room5.stolb.clone();
    room5.stolb1.x = 410; room5.stolb1.y = -250;
    room5.stolb2 = room5.stolb.clone();
    room5.stolb2.x = 625; room5.stolb2.y = -250;
    room5.stolb3 = room5.stolb.clone();
    room5.stolb3.x = 845; room5.stolb3.y = -250;
    room5.stolb4 = room5.stolb.clone();
    room5.stolb4.x = 1065; room5.stolb4.y = -250;
    room5.stolb5 = room5.stolb.clone();
    room5.stolb5.x = 1275; room5.stolb5.y = -250;

    var monetkiData = {
      images: ["img/bonuses/room5/moneti.png"],
      frames: {width: 129, height: 663},
      framerate: 12,
      animations: {
        open: [0, 21, "stop"],
        stop: 21
      }
    };
    room5.monetki = new createjs.Sprite(new createjs.SpriteSheet(monetkiData), "open");
    room5.monetki.alpha = 0;
    room5.monetki.stop();

    room5.monetki1 = room5.monetki.clone();
    room5.monetki1.x = 445;
    room5.monetki2 = room5.monetki.clone();
    room5.monetki2.x = 660;
    room5.monetki3 = room5.monetki.clone();
    room5.monetki3.x = 880;
    room5.monetki4 = room5.monetki.clone();
    room5.monetki4.x = 1105;
    room5.monetki5 = room5.monetki.clone();
    room5.monetki5.x = 1310;

    var muhaData = {
      images: ["img/bonuses/room5/muha.png"],
      frames: {width: 134, height: 416},
      framerate: 12,
      animations: {
        open: [0, 29, "stop"],
        stop: 29
      }
    };
    room5.muha = new createjs.Sprite(new createjs.SpriteSheet(muhaData), "open");
    room5.muha.alpha = 0;
    room5.muha.stop();

    room5.muha1 = room5.muha.clone();
    room5.muha1.x = 410; room5.muha1.y = 235;
    room5.muha2 = room5.muha.clone();
    room5.muha2.x = 625; room5.muha2.y = 225;
    room5.muha3 = room5.muha.clone();
    room5.muha3.x = 845; room5.muha3.y = 225;
    room5.muha4 = room5.muha.clone();
    room5.muha4.x = 1065; room5.muha4.y = 225;
    room5.muha5 = room5.muha.clone();
    room5.muha5.x = 1275; room5.muha5.y = 235;



    var chest1Data = {
      images: ["img/bonuses/room5/chest1gif.png"],
      frames: {width: 220, height: 220},
      framerate: 12,
      animations: {
        open: [0, 5, "stop"],
        stop: 5
      }
    };
    var chest1SpriteSheet = new createjs.SpriteSheet(chest1Data);
    room5.chest1 = new createjs.Sprite(chest1SpriteSheet, "open");
    room5.chest1.x = 425; room5.chest1.y = 570;
    room5.chest1.scaleX = 0.84; room5.chest1.scaleY = 0.84;
    room5.chest1.stop();
    room5.chest1.on("click", function(){
      if (counter === 0) {
        this.play();
        if (bonusArray[levelNumber - 1]) {
          doorsStage.addChild(room5.svet1, room5.chest1, room5.monetki1, room5.stolb1);
          createjs.Tween.get(room5.svet1)
            .to({alpha: 1}, 200);
          createjs.Tween.get(room5.monetki1)
            .to({alpha: 1}, 500);
          createjs.Tween.get(room5.stolb1)
            .wait(200)
            .to({alpha: 0.8}, 300);

          room5.monetki1.on("change", function(){
            if (+parseInt(room5.monetki1.currentAnimationFrame) === 21) {
              createjs.Tween.get(room5.monetki1)
                .to({alpha: 0}, 200)
            }
          });

          setTimeout(room5.monetki1.play.bind(room5.monetki1), 200);
          room5.svet1.play();

          doorsStage.addChild(winBonus);
          createjs.Tween.get(winBonus)
          .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        else {
          doorsStage.addChild(room5.chest1, room5.muha1);
          createjs.Tween.get(room5.muha1)
          .to({alpha: 1}, 500);
          setTimeout(room5.muha1.play.bind(room5.muha1), 300);
          room5.muha1.on("change", function(){
            if (+parseInt(room5.muha1.currentAnimationFrame) === 29) {
              createjs.Tween.get(room5.muha1)
              .to({alpha: 0}, 200)
            }
          });

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        counter++;
      }
    });


    var chest3Data = {
      images: ["img/bonuses/room5/chest3gif.png"],
      frames: {width: 220, height: 220},
      framerate: 12,
      animations: {
        open: [0, 5, "stop"],
        stop: 5
      }
    };
    var chest3SpriteSheet = new createjs.SpriteSheet(chest3Data);
    room5.chest3 = new createjs.Sprite(chest3SpriteSheet, "open");
    room5.chest3.x = 865; room5.chest3.y = 575;
    room5.chest3.scaleX = 0.8; room5.chest3.scaleY = 0.8;
    room5.chest3.stop();
    room5.chest3.on("click", function(){
      if (counter === 0) {
        this.play();
        if (bonusArray[levelNumber - 1]) {
          doorsStage.addChild(room5.svet3, room5.chest3, room5.monetki3, room5.stolb3);
          createjs.Tween.get(room5.svet3)
            .to({alpha: 1}, 200);
          createjs.Tween.get(room5.monetki3)
            .to({alpha: 1}, 500);
          createjs.Tween.get(room5.stolb3)
            .wait(200)
            .to({alpha: 0.8}, 300);

          room5.monetki3.on("change", function(){
            if (+parseInt(room5.monetki3.currentAnimationFrame) === 21) {
              createjs.Tween.get(room5.monetki3)
                .to({alpha: 0}, 200)
            }
          });

          setTimeout(room5.monetki3.play.bind(room5.monetki3), 200);
          room5.svet3.play();

          doorsStage.addChild(winBonus);
          createjs.Tween.get(winBonus)
          .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        else {
          doorsStage.addChild(room5.chest3, room5.muha3);
          createjs.Tween.get(room5.muha3)
          .to({alpha: 1}, 500);
          setTimeout(room5.muha3.play.bind(room5.muha3), 300);
          room5.muha3.on("change", function(){
            if (+parseInt(room5.muha3.currentAnimationFrame) === 29) {
              createjs.Tween.get(room5.muha3)
              .to({alpha: 0}, 200)
            }
          });

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        counter++;
      }
    });


    room5.chest2 = room5.chest3.clone();
    room5.chest2.x = 645; room5.chest2.y = 575;
    room5.chest2.scaleX = 0.8; room5.chest2.scaleY = 0.8;
    room5.chest2.on("click", function(){
      if (counter === 0) {
        this.play();
        if (bonusArray[levelNumber - 1]) {
          doorsStage.addChild(room5.svet2, room5.chest2, room5.monetki2, room5.stolb2);
          createjs.Tween.get(room5.svet2)
            .to({alpha: 1}, 200);
          createjs.Tween.get(room5.monetki2)
            .to({alpha: 1}, 500);
          createjs.Tween.get(room5.stolb2)
            .wait(200)
            .to({alpha: 0.8}, 300);

          room5.monetki2.on("change", function(){
            if (+parseInt(room5.monetki2.currentAnimationFrame) === 21) {
              createjs.Tween.get(room5.monetki2)
                .to({alpha: 0}, 200)
            }
          });

          setTimeout(room5.monetki2.play.bind(room5.monetki2), 200);
          room5.svet2.play();

          doorsStage.addChild(winBonus);
          createjs.Tween.get(winBonus)
          .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        else {
          doorsStage.addChild(room5.chest2, room5.muha2);
          createjs.Tween.get(room5.muha2)
          .to({alpha: 1}, 500);
          setTimeout(room5.muha2.play.bind(room5.muha2), 300);
          room5.muha2.on("change", function(){
            if (+parseInt(room5.muha2.currentAnimationFrame) === 29) {
              createjs.Tween.get(room5.muha2)
              .to({alpha: 0}, 200)
            }
          });

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        counter++;
      }
    });


    room5.chest4 = room5.chest3.clone();
    room5.chest4.x = 1093; room5.chest4.y = 575;
    room5.chest4.scaleX = 0.8; room5.chest4.scaleY = 0.8;
    room5.chest4.on("click", function(){
      if (counter === 0) {
        this.play();
        if (bonusArray[levelNumber - 1]) {
          doorsStage.addChild(room5.svet4, room5.chest4, room5.monetki4, room5.stolb4);
          createjs.Tween.get(room5.svet4)
            .to({alpha: 1}, 200);
          createjs.Tween.get(room5.monetki4)
            .to({alpha: 1}, 500);
          createjs.Tween.get(room5.stolb4)
            .wait(200)
            .to({alpha: 0.8}, 300);

          room5.monetki4.on("change", function(){
            if (+parseInt(room5.monetki4.currentAnimationFrame) === 21) {
              createjs.Tween.get(room5.monetki4)
                .to({alpha: 0}, 200)
            }
          });

          setTimeout(room5.monetki4.play.bind(room5.monetki4), 200);
          room5.svet4.play();

          doorsStage.addChild(winBonus);
          createjs.Tween.get(winBonus)
          .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        else {
          doorsStage.addChild(room5.chest4, room5.muha4);
          createjs.Tween.get(room5.muha4)
          .to({alpha: 1}, 500);
          setTimeout(room5.muha4.play.bind(room5.muha4), 300);
          room5.muha4.on("change", function(){
            if (+parseInt(room5.muha4.currentAnimationFrame) === 29) {
              createjs.Tween.get(room5.muha4)
              .to({alpha: 0}, 200)
            }
          });

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        counter++;
      }
    });


    var chest5Data = {
      images: ["img/bonuses/room5/chest5gif.png"],
      frames: {width: 220, height: 220},
      framerate: 12,
      animations: {
        open: [0, 5, "stop"],
        stop: 5
      }
    };
    var chest5SpriteSheet = new createjs.SpriteSheet(chest5Data);
    room5.chest5 = new createjs.Sprite(chest5SpriteSheet, "open");
    room5.chest5.x = 1305; room5.chest5.y = 570;
    room5.chest5.scaleX = 0.84; room5.chest5.scaleY = 0.84;
    room5.chest5.stop();
    room5.chest5.on("click", function(){
      if (counter === 0) {
        this.play();
        if (bonusArray[levelNumber - 1]) {
          doorsStage.addChild(room5.svet5, room5.chest5, room5.monetki5, room5.stolb5);
          createjs.Tween.get(room5.svet5)
            .to({alpha: 1}, 200);
          createjs.Tween.get(room5.monetki5)
            .to({alpha: 1}, 500);
          createjs.Tween.get(room5.stolb5)
            .wait(200)
            .to({alpha: 0.8}, 300);

          room5.monetki5.on("change", function(){
            if (+parseInt(room5.monetki5.currentAnimationFrame) === 21) {
              createjs.Tween.get(room5.monetki5)
                .to({alpha: 0}, 200)
            }
          });

          setTimeout(room5.monetki5.play.bind(room5.monetki5), 200);
          room5.svet5.play();

          doorsStage.addChild(winBonus);
          createjs.Tween.get(winBonus)
          .to({scaleX:1, scaleY:1, alpha: 1}, 1000, createjs.Ease.bounceOut);

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        else {
          doorsStage.addChild(room5.chest5, room5.muha5);
          createjs.Tween.get(room5.muha5)
          .to({alpha: 1}, 500);
          setTimeout(room5.muha5.play.bind(room5.muha5), 300);
          room5.muha5.on("change", function(){
            if (+parseInt(room5.muha5.currentAnimationFrame) === 29) {
              createjs.Tween.get(room5.muha5)
              .to({alpha: 0}, 200)
            }
          });

          setTimeout(returnToMainScreen.bind(null), 4000);

        }
        counter++;
      }
    });


    if(levelNumber === 5) {
      doorsStage.addChild(bgIMG, room5.chest1, room5.chest2, room5.chest3, room5.chest4, room5.chest5, firstDarkness);
      bgIMG.on("click", function(){
        setTimeout(returnToMainScreen.bind(null), 1500);
      });
    }

    function returnToMainScreen() {
      $("#doorsCanvas").removeClass("first");
      doorsStage.removeAllChildren();
      doorsStage.alpha = 0;
      gameStage.alpha = 1;
      panelStage.alpha = 1;
      // bgStage.alpha = 1;
    }

  }



  $("#withoutSound").click(function(){
    if(createjs.Sound.muted) {
      createjs.Sound.muted = false;
      $(this)[0].innerHTML = "Выключить звук!!!";
    } else {
      createjs.Sound.muted = true;
      $(this)[0].innerHTML = "Включить звук!!!";
    }
  });

} // Конец функции Init()


function freeSpins() {
  // Очистим экран.
  bgStage.removeAllChildren();
  panelStage.removeAllChildren();
  // gameStage.removeAllChildren();

  var bgIMG = new createjs.Bitmap("img/free spins/bg.png");
  var germanBG = new createjs.Bitmap("img/free spins/germanBG.png");
  var panelBG = new createjs.Bitmap("img/free spins/panelBG.png");
  bgStage.addChild(bgIMG, germanBG);
  panelStage.addChild(panelBG);

  // Функция drawLines() - отвечает за прорисовку и поведение линий-подсказок и номеров к ним.
  function drawLines() {
    // Рисуем линии.
    drawLineImages();
    // Рисуем номера к линиям.
    drawLineNumbers();
    // Функция drawLineImages() - отвечает за прорисовку и позиционирование линий.
    function drawLineImages() {
      var img, i;
      for(i = 1; i <= 21; i++) {
        // Создаем изображение для 21-ой линии.
        img = new createjs.Bitmap("img/Lines/Line" + i + ".png");
        // Делаем его невидимым.
        img.alpha = 0;
        // Рисуем на игровом холсте.
        gameStage.addChild(img);
        // И добавляем во внешний массив lineImages.
        lineImages.push(img);
      }
      // Позиционируем линии на холсте.
      lineImages[0].y = 334;
      lineImages[1].y = 139;
      lineImages[2].y = 574;
      lineImages[3].y = 54;
      lineImages[4].y = 94;
      lineImages[5].y = 90;
      lineImages[6].y = 335;
      lineImages[7].x = 85;   lineImages[7].y = 144;
      lineImages[8].y = 288;
      lineImages[9].y = 380;
      lineImages[10].y = 108;
      lineImages[11].x = 85;  lineImages[11].y = 105;
      lineImages[12].x = 85;  lineImages[12].y = 45;
      lineImages[13].x = 85;  lineImages[13].y = 104;
      lineImages[14].x = 85;  lineImages[14].y = 92;
      lineImages[15].x = 85;  lineImages[15].y = 99;
      lineImages[16].x = 85;  lineImages[16].y = 184;
      lineImages[17].y = 137;
      lineImages[18].y = 105;
      lineImages[19].y = 379;
      lineImages[20].x = 105; lineImages[20].y = 98;
      // Копируем изображения в массив lineWinImages.
      for(i = 0; i <= 20; i++) {
        lineWinImages.push(lineImages[i].clone());
        gameStage.addChild(lineWinImages[i]);
      }
    }
    // Функция drawLineNumbers()- отвечает за прорисовку номеров к линиям-подсказкам.
    function drawLineNumbers() {
      var text, hit, i;
      for (i = 1; i <= 22; i++) { // Считаем до 22 из-за дублирования 1-го номера.
        // Создаем номера линий.
        text = new createjs.Text(i, "20px Arial", "#ddcb8c");
        // И добавляем их во внешний массив lineNumbers.
        lineNumbers.push(text);
        // Создаем вокруг номеров круги (hitArea) для взаимодействия с мышью.
        hit = new createjs.Shape();
        hit.graphics.beginFill("#000").drawCircle(text.getMeasuredWidth()/2, text.getMeasuredHeight()/2, 19);
        text.hitArea = hit;
        // Когда мышь попадает на номер
        text.on("mouseover", function(){
          //  - мы показываем линию.
          showLine(this.text);
          //  - и делаем тень для номера.
          this.shadow = new createjs.Shadow("#FFFFFF", 1, 1, 2);
        });
        // Когда мышь уходит
        text.on("mouseout", function(){
          //  - мы убираем линию.
          hideLine(this.text);
          //  - и обнуляем тень.
          this.shadow.offsetX = this.shadow.offsetY = this.shadow.blur = 0;
        });
      } // Конец цикла for(i)
      lineNumbers[21].text = 1; // У нас два первых номера.
      // Позиционируем все номера линий относительно верхнего левого угла.
      lineNumbers[0].x = 549; lineNumbers[0].y = 455;
      lineNumbers[1].x = 1855; lineNumbers[1].y = 257;
      lineNumbers[2].x = 1855; lineNumbers[2].y = 697;
      lineNumbers[3].x = 549; lineNumbers[3].y = 165;
      lineNumbers[4].x = 549; lineNumbers[4].y = 789;
      lineNumbers[5].x = 549; lineNumbers[5].y = 210;
      lineNumbers[6].x = 550; lineNumbers[6].y = 744;
      lineNumbers[7].x = 1855; lineNumbers[7].y = 548;
      lineNumbers[8].x = 549; lineNumbers[8].y = 409;
      lineNumbers[9].x = 542; lineNumbers[9].y = 650;
      lineNumbers[10].x = 543; lineNumbers[10].y = 303;
      lineNumbers[11].x = 1848; lineNumbers[11].y = 789;
      lineNumbers[12].x = 1848; lineNumbers[12].y = 165;
      lineNumbers[13].x = 1848; lineNumbers[13].y = 744;
      lineNumbers[14].x = 1848; lineNumbers[14].y = 212;
      lineNumbers[15].x = 1848; lineNumbers[15].y = 651;
      lineNumbers[16].x = 1848; lineNumbers[16].y = 304;
      lineNumbers[17].x = 543; lineNumbers[17].y = 257;
      lineNumbers[18].x = 543; lineNumbers[18].y = 697;
      lineNumbers[19].x = 543; lineNumbers[19].y = 501;
      lineNumbers[20].x = 1850; lineNumbers[20].y = 501;
      lineNumbers[21].x = 1855; lineNumbers[21].y = 455;
      // Рисуем все номера линий на холсте панели управления.
      for (var i = 0; i < lineNumbers.length; i++) {
        panelStage.addChild(lineNumbers[i]);
      }
    }
    // Функция showLine(number) - показ линии-подсказки с номером number.
    function showLine(number) {
      lineImages[number-1].alpha = 1;
    }
    // Функция hideLine(number) - скрывание линии-подсказки с номером number.
    function hideLine(number) {
      lineImages[number-1].alpha = 0;
    }
  }

  var lineNumbers = [],  // массив номеров-подсказок линий.
      lineImages = [],   // массив изображений линий-подсказок.
      lineWinImages = [];// массив изображений победных линий.
  // Рисуем линии и номера к ним.
  drawLines();
}
