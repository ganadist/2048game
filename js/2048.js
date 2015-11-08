var BLOCK_MAX = 4;
var DEBUG = true;

var KEYCODE_LEFT = 37;
var KEYCODE_UP = 38;
var KEYCODE_RIGHT = 39;
var KEYCODE_DOWN = 40;

function getRandom(max) {
	return Math.floor(Math.random() * max);
}

function getRandomRange(min, max) {
	max = getRandom(max + 1 - min);
	return max + min;
}

function positionToIndex(pos) {
    return pos.y * BLOCK_MAX + pos.x;
}

function indexToPosition(index) {
    var x = index % BLOCK_MAX;
    var y = Math.floor(index / BLOCK_MAX);
    return new Position(x, y);
}

function Position(x, y) {
	this.x = x;
	this.y = y;
}

Position.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
}

function Block(board) {
	this.board = board;
	this.num = Math.pow(2, getRandomRange(1, 3));
	board.addBlock(this);
}

Block.prototype.canMove = function() {
    var index = positionToIndex(this.pos);
    var neighbors = [-1, 1, -BLOCK_MAX, BLOCK_MAX];
    for(var offset in neighbors) {
        var newIndex = index + offset;
        if (newIndex < 0 || newIndex >= BLOCK_MAX * BLOCK_MAX) {
            continue;
        }
        var next = this.board.blockArray[newIndex];
        if (next == undefined) {
            return true;
        }
        if (next.num == this.num) {
            return true;
        }
    }
    return false;
}

Block.prototype.merge = function(block) {
	if (this.num == block.num) {
        if (DEBUG) {
            console.log("%s => %s", block.pos.toString(), this.pos.toString());
        }

        this.num *= 2;
        this.board.removeBlock(block);
		return true;
	}
	return false;
}

Block.prototype.move = function(x, y) {
    var newPos = new Position(x, y);
	var index = positionToIndex(newPos);
	var nextBlock = this.board.blockArray[index];
	if (nextBlock == undefined) {
        if (DEBUG) {
            console.log("%s => %s", this.pos.toString(), newPos.toString());
        }
        var oldIndex = positionToIndex(this.pos);
		this.board.blockArray[index] = this;
		this.board.blockArray[oldIndex] = undefined;
        this.pos = newPos;
		return true;
	} else {
		return nextBlock.merge(this);
	}
}

Block.prototype.moveStep = function(direction) {
	var x = this.pos.x;
	var y = this.pos.y;
	switch (direction) {
		case KEYCODE_RIGHT:
			x += 1;
			break;
		case KEYCODE_LEFT:
			x -= 1;
			break;
		case KEYCODE_UP:
			y -= 1;
			break;
		case KEYCODE_DOWN:
			y += 1;
			break;
	}

    if (x < 0 || x >= BLOCK_MAX || y < 0 || y >= BLOCK_MAX) return false;

	return this.move(x, y);
}

function Board() {
	this.blockArray = undefined;
	this.emptyBlockCount = BLOCK_MAX * BLOCK_MAX;
}


Board.prototype.handleKey = function(keyCode) {
	var inc;
	var start, end;
	var direction;
	switch( keyCode ) { //event.keyCode) {
		case KEYCODE_LEFT:
        case KEYCODE_UP:
            inc = 1;
            start = 0;
            end = BLOCK_MAX * BLOCK_MAX;
            break;
		case KEYCODE_RIGHT:
        case KEYCODE_DOWN:
            inc = -1;
            start = BLOCK_MAX * BLOCK_MAX;
            end = -1;
            break;
		default:
			return;
			break;
	}

	var changed = false;
	for(var i = start; i != end; i += inc) {
		var block = this.blockArray[i];
		if (block != undefined && block.moveStep(keyCode)) {
			changed = true;
		}
	}
	if (changed) {
        // FIXME
		block = new Block(this);
	}
}


Board.prototype.init = function() {
	this.blockArray = new Array(BLOCK_MAX * BLOCK_MAX);
	this.emptyBlockCount = this.blockArray.length;
	var initialBlockCount = getRandomRange(2, 3);
	for (i = 0; i < initialBlockCount; i++) {
		block = new Block(this);
	}
}

Board.prototype.getRandomEmptyPosition = function() {
	// FIXME

	index = getRandomRange(1, this.emptyBlockCount);
	for (i = 0; i < this.blockArray.length; i++) {
		if (this.blockArray[i] == undefined) {
			index -= 1;
			if (index == 0) {
				return i;
			}
		}
	}
}

Board.prototype.addBlock = function(block) {
	var index = this.getRandomEmptyPosition();
    if (DEBUG && this.blockArray[index] != undefined) {
        console.log("ASSERT: block index %d must be undefined but %s", index, block);
    }
	this.blockArray[index] = block;
	block.pos = indexToPosition(index);
	this.emptyBlockCount -= 1;
}

Board.prototype.removeBlock = function(block) {
    var index = positionToIndex(block.pos);
	this.blockArray[index] = undefined;
	this.emptyBlockCount += 1;
}

var gBoard = new Board();
function start() {
	gBoard.init();
}