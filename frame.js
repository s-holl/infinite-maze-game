const dpr = devicePixelRatio || 1;
const CANVAS_SIZE = 400;
const CELL_SIZE = 40;
const WALL_WIDTH = 2;
const NORTH = 0;
const SOUTH = 1;
const WEST = 2;
const EAST = 3;

class Cell {
    constructor(x, y, rows, cols) {
        this.width = this.height = CELL_SIZE;
        this.is_visited = false;
        this.parent_x = x;
        this.parent_y = y;
        this.x = x;
        this.y = y;
        // whether or not there's a wall to x direction
        this.wall = [true, true, true, true];
        this.wall[NORTH] = y === 0? false : true;
        this.wall[SOUTH] = y === rows - 1? false : true;
        this.wall[WEST] = x === 0? false : true;
        this.wall[EAST] = x === cols - 1? false : true;
    }

    visit() {
        this.is_visited = true;
    }

    is_unvisited() {
        return !this.is_visited;
    }
}

class Maze {
    constructor(canvas) {
        canvas.width = canvas.height = CANVAS_SIZE;
        this.rows = Math.floor(canvas.height / CELL_SIZE);
        this.cols = Math.floor(canvas.width / CELL_SIZE);
        this.cells = [];
        for (let x = 0; x < this.cols; x++) {
            this.cells[x] = [];
            for (let y = 0; y < this.rows; y++) {
                this.cells[x][y] = new Cell(x, y, this.rows, this.cols);
            }
        }
        this.stack = [];
        this.stack.push(this.cells[0][1]);
    }

    random_neighbors(cell) {
        let neighbors = [];
        if (cell.x > 0) {
            neighbors.push(this.cells[cell.x - 1][cell.y]);
        }
        if (cell.x < this.cols - 1) {
            neighbors.push(this.cells[cell.x + 1][cell.y]);
        }
        if (cell.y > 0) {
            neighbors.push(this.cells[cell.x][cell.y - 1]);
        }
        if (cell.y < this.rows - 1) {
            neighbors.push(this.cells[cell.x][cell.y + 1]);
        }
        for (let i = 0; i < neighbors.length; i++) {
            for (let j = 0; j < neighbors.length; j++) {
                // swap neighbors[i] and neighbors[j] with ~50/50 chance
                if (Math.random() < 0.5) {
                    [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
                }
            }
        }
        return neighbors;
    }

    DFS() {
        console.log("Now entering DFS!!!!");
        while (this.stack.length != 0) {
            console.log(`Stack length = ${this.stack.length}`);
            // pop the top value of the stack
            var cell = this.stack[this.stack.length - 1];
            console.log(`current cell = (${cell.x}, ${cell.y})`);
            this.stack.pop();
            if (cell.is_unvisited()) {
                cell.visit();
                var parent = this.cells[cell.parent_x][cell.parent_y];
                // cell is east of parent
                if (cell.x > parent.x) {
                    parent.wall[EAST] = cell.wall[WEST] = false;
                }
                // cell is west of parent
                else if (cell.x < parent.x) {
                    parent.wall[WEST] = cell.wall[EAST] = false;
                }
                // cell is south of parent
                else if (cell.y > parent.y) {
                    parent.wall[SOUTH] = cell.wall[NORTH] = false;
                }
                // cell is north of parent
                else if (cell.y < parent.y) {
                    parent.wall[NORTH] = cell.wall[SOUTH] = false;
                }

                // add unvisited neighbors to the stack in "random" order
                let neighbors = this.random_neighbors(cell);
                for (var neighbor of neighbors) {
                    if (neighbor.is_unvisited()) {
                        console.log(`adding (${neighbor.x}, ${neighbor.y}) to stack`)
                        // add cell as neighbor's parent
                        neighbor.parent_x = cell.x;
                        neighbor.parent_y = cell.y;
                        this.stack.push(neighbor);
                    }
                }
            }
        }
    }
}

class Player {
    constructor(x, y) {
        console.log("Initializing player!");
        this.x = x;
        this.y = y;
        this.move = 4;
        this.width = this.height = CELL_SIZE - WALL_WIDTH;
        this.color = "red";
    }

    up(amount = this.move) {
        console.log("Up");
        this.y -= amount;
    }

    down(amount = this.move) {
        console.log("Down");
        this.y += amount;
    }

    left(amount = this.move) {
        console.log("Left");
        this.x -= amount;
    }

    right(amount = this.move) {
        console.log(`Right ${amount}`);
        this.x += amount;
    }

}

class Frame {
    constructor(board) {
        this.drawing = board.getContext("2d");
        this.drawing.scale(dpr, dpr);
        this.drawing.fillStyle = "white";
        this.drawing.fillRect(0, 0, board.width, board.height);
        this.maze = new Maze(board);
        this.player = new Player(WALL_WIDTH / 2, WALL_WIDTH / 2);
        // this.generate_maze();
        this.render_player();
    }

    generate_maze() {
        console.log("Generating maze");
        this.maze.DFS();
        for (var x = 0; x < this.maze.cells.length; x++) {
            for (var y = 0; y < this.maze.cells[x].length; y++) {
                // put walls around the maze to prevent player from going out of bounds
                if (x === 0) {
                    this.maze.cells[x][y].wall[WEST] = true;
                }
                if (y === 0) {
                    this.maze.cells[x][y].wall[NORTH] = true;
                }
                if (x === this.maze.cells.length - 1) {
                    this.maze.cells[x][y].wall[EAST] = true;
                }
                if (y === this.maze.cells[x].length - 1) {
                    this.maze.cells[x][y].wall[SOUTH] = true;
                }
                // TODO: make conciser
                var west = x * CELL_SIZE;
                var east = west + CELL_SIZE;
                var north = y * CELL_SIZE;
                var south = north + CELL_SIZE;
                this.drawing.lineWidth = WALL_WIDTH;
                const half_wall = WALL_WIDTH / 2;
                if (this.maze.cells[x][y].wall[NORTH]) {
                    this.drawing.strokeStyle = 'black';
                    this.drawing.moveTo(west - half_wall, north);
                    this.drawing.lineTo(east + half_wall, north);
                    this.drawing.stroke();
                }
                if (this.maze.cells[x][y].wall[SOUTH]) {
                    this.drawing.strokeStyle = 'black';
                    this.drawing.moveTo(west - half_wall, south);
                    this.drawing.lineTo(east + half_wall, south);
                    this.drawing.stroke();
                }
                if (this.maze.cells[x][y].wall[EAST]) {
                    this.drawing.strokeStyle = 'black';
                    this.drawing.moveTo(east, north - half_wall);
                    this.drawing.lineTo(east, south + half_wall);
                    this.drawing.stroke();
                }
                if (this.maze.cells[x][y].wall[WEST]) {
                    this.drawing.strokeStyle = 'black';
                    this.drawing.moveTo(west, north - half_wall);
                    this.drawing.lineTo(west, south + half_wall);
                    this.drawing.stroke();
                }
            }
        }
    }

    clear_player() {
        console.log("Clearing player");
        let player = this.player;
        this.drawing.clearRect(player.x, player.y, player.width, player.height);
    }

    render_player() {
        console.log("Rendering player");
        let player = this.player;
        this.drawing.fillStyle = player.color; // arbitrary
        this.drawing.fillRect(player.x, player.y, player.width, player.height);
    }

    get_cell(pos_x, pos_y) {
        const cell_x = Math.floor(pos_x / CELL_SIZE);
        const cell_y = Math.floor(pos_y / CELL_SIZE);
        return this.maze.cells[cell_x][cell_y];
    }
    

}

function get_west_x(cell_x) {
    return cell_x * CELL_SIZE;
}

function get_east_x(cell_x) {
    return (cell_x + 1) * CELL_SIZE - 1;
}

function get_north_y(cell_y) {
    return cell_y * CELL_SIZE;
}

function get_south_y(cell_y) {
    return (cell_y + 1) * CELL_SIZE - 1;
}



export {Player, Frame, Cell, Maze, get_west_x, get_east_x, get_north_y, get_south_y};