var curentState=0;
var STATE_IDLE = 0;
var STATE_BOAT_SELECTED = 1;

var myBoard = new Array();
var boardSize = 10;
// save the rotation of the boat
var rotation = 0;
// save the current td we are on
var selectedTd={};
var selectedBoatToBePlaced;
// define the length o the battleships, used and object and not an array so we can have pretty names as indexes
var boats = {
	"mine":{
		"numberOfElements":1,
		"totalNumberAllowed":1
	},
	"boat":{
		"numberOfElements":2,
		"totalNumberAllowed":1
	},
	"destroyer":{
		"numberOfElements":3,
		"totalNumberAllowed":1
	},
	"battleship":{
		"numberOfElements":4,
		"totalNumberAllowed":1
	}
};

// this object will hold the dislocated class names
// since we generate the color for the water tiles randomly we need somewhere to save the name we overrite when we render the boat
// once the boat is out of the way then we can put the colored water tiles back as they were arranged before we dislocated them
var dislocatedClassNames = {};


/**
*	function will be called when the browser gets here. Most of the time will be equivalent to document.ready
*/
(function(){
	console.log("document ready");
	initMyBoard();
	createBoard(boardSize, "content", "myBoard");
	// bind on the document and listen for the R key
	document.body.onkeyup = function(event){
		// if R key is pressed
		if(event.keyCode == 114 || event.keyCode == 82){
			// trigger the mouseOutAction so we can clean the already rendered boat
			mouseOutAction(selectedTd.row, selectedTd.col);
			// change the rotation
			if(rotation == 0){
				rotation = 1;
			} else {
				rotation = 0;
			}
			// render the new boat now rotated
			mouseOverAction(selectedTd.row, selectedTd.col);
		}
	}
})();

/**
*	function will init the whole board with zeroes
*/
function initMyBoard(){
	for(i=0;i<boardSize;i++){
		myBoard[i] = new Array();
		for(j=0;j<boardSize;j++){
		myBoard[i][j]=0;	
		}
	}
}
/**
*	function will print the board in a human readeable format
*	@todo: Finish this !!
*/
function showBoard(board){
	var temp = "";
	for(i=0;i<board.length;i++){
		temp += "\n";
		temp += board[0].join(",");
	}
		console.log(temp);
}
/**
*	function will "draw" the board programmaticaly using a table
*/
function createBoard(length, idOfHtmlElement, idForTable){
	// sanity check see if we have all the data we need
	if(	length == 0 || 
		idOfHtmlElement == undefined || 	
		idForTable == undefined){
		return;
	}

	// get the element where we will "render"
	var content = document.getElementById(idOfHtmlElement);
	
	// check if we actually have a element to render
	if(content == null){
		return;
	}
	
	// we will use bufferHtml as a buffer to store the table till we flush it into the content element
	var bufferHtml="";
	// add the header of the table tag
	bufferHtml='<table cellspacing="0" cellpadding="0" id="'+idForTable+'" class="board">';
	// add another row and col to host the numbers
	length = length + 1;
	
	for(i=0;i<length;i++){
		// add the tr
		bufferHtml+="<tr>";
		for(j=0;j<length;j++){
			//headerClass will set apart the header numbers and letters from normal cells
			var headerClass="";
			
			if(i==0||j==0){
				headerClass="headerClass";
			}
			
			// define 2 vars to host the numbers and letters
			var contentForTdYAxis="";
			var contentForTdXAxis="";
			// if the column is correct set the header for X
			if(j==0 && i!=0){
				contentForTdYAxis=i;
			}
			// if the column is correct set the header for X
			if(i==0 && j!=0){
				contentForTdXAxis=String.fromCharCode(65+j-1);
			}

			//we will hold the class for the watter in this var
			var backgroundClassForCell="";

			if(i!=0 && j!=0){
				var randomNumber = 4*Math.random();
				randomNumber = parseInt(randomNumber);
				backgroundClassForCell = "water"+randomNumber;
			}

			// substracted the value before rendering it in the TD
			var iToRender = i-1;
			var jToRender = j-1;

			// add the td tag (actuall cell)
			bufferHtml+='<td class="'+headerClass+backgroundClassForCell+'" id="'+iToRender+','+jToRender+'"'+
							'onmouseover="mouseOverAction('+iToRender+','+jToRender+')"'+
							'onmouseout="mouseOutAction('+iToRender+','+jToRender+')"'+
							'onclick="clickAction('+iToRender+','+jToRender+')"'+
							'>'+contentForTdYAxis+contentForTdXAxis+'</td>';
		}
		bufferHtml+="</tr>";
	}
	
	bufferHtml+='</table>';
	
	content.innerHTML = bufferHtml;
}

function clickAction(rowPicked, colPicked){
	// check if I selected the header and if so just exit
	if(rowPicked == -1 || colPicked==-1){
		return;
	}
	
	switch(curentState){
		case 0:
		break;
		
		case STATE_BOAT_SELECTED:
			tryToPlaceBoat(rowPicked, colPicked);
		break;
	}
}

function tryToPlaceBoat(rowPicked, colPicked){
	// loop over the length of the selected boat
	for(i=0;i<selectedBoatToBePlaced;i++){
		// these vars will be used to increment the row or col when we are drawing the boat since we can rotate it too
		var incrementRow = 0;
		var incrementCol = 0;
		
		// check rotation and add the increment to the row or column
		if(rotation == 0){
			incrementRow = i;
		} else {
			incrementCol = i;
		}
		
		myBoard[rowPicked+incrementRow][colPicked+incrementCol]=selectedBoatToBePlaced;
	}
	mouseOverAction(rowPicked, colPicked);
	curentState = STATE_IDLE;
}


function mouseOverAction(rowPicked, colPicked){
	
	if(curentState != STATE_BOAT_SELECTED){
		return;
	}
	
	// check if I selected the header and if so just exit
	if(rowPicked == -1 || colPicked==-1){
		return;
	}
	// save the selected td
	selectedTd.row = rowPicked;
	selectedTd.col = colPicked;

//	console.log(rowPicked+","+ colPicked);
	
	// loop over the length of the selected boat
	for(i=0;i<selectedBoatToBePlaced;i++){
		// these vars will be used to increment the row or col when we are drawing the boat since we can rotate it too
		var incrementRow = 0;
		var incrementCol = 0;
		
		// check rotation and add the increment to the row or column
		if(rotation == 0){
			incrementRow = i;
		} else {
			incrementCol = i;
		}
		// get the target TD we will modify
		var targetTd = document.getElementById((rowPicked+incrementRow)+","+ (colPicked+incrementCol));
		if(targetTd == null){
			continue;
		}

		// get the original class name the water one
		var originalClassForTd = targetTd.className
		// save it in dislocated so we can later put it back
		dislocatedClassNames[i] = originalClassForTd;
		// add the element for the rendered boat
		targetTd.className = originalClassForTd+" hoveredElement";
	}
	
}


function mouseOutAction(rowPicked, colPicked){
	if(curentState != STATE_BOAT_SELECTED){
		return;
	}
	
	// check if I selected the header and if so just exit
	if(rowPicked == -1 || colPicked==-1){
		return;
	}
	
//	console.log(rowPicked+","+ colPicked);
	
	// check rotation and add the increment to the row or column
	for(i=0;i<selectedBoatToBePlaced;i++){
		// these vars will be used to increment the row or col when we are drawing the boat since we can rotate it too
		var incrementRow = 0;
		var incrementCol = 0;

		// check rotation and add the increment to the row or column
		if(rotation == 0){
			incrementRow = i;
		} else {
			incrementCol = i;
		}

		// get the target TD we will modify
		var targetTd = document.getElementById((rowPicked+incrementRow)+","+ (colPicked+incrementCol));
		if(targetTd == null){
			continue;
		}
		// write back the dislocated water classes
		targetTd.className = dislocatedClassNames[i]
	}
	
	
}

function selectBoatToPlace(typeOfBoatToPlace){
	
	if(curentState != STATE_IDLE){
		return;
	}
	
	if(typeOfBoatToPlace == undefined){
		return;
	}
	
	selectedBoatToBePlaced = typeOfBoatToPlace;
	curentState = STATE_BOAT_SELECTED;
}