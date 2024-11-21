import {Frame, get_west_x, get_east_x, get_north_y, get_south_y} from './frame.js';

const board = document.getElementById("main");
const dpr = devicePixelRatio || 1;
const WALL_WIDTH = 2;

const frame = new Frame(board);
var player = frame.player;

const NORTH = 0;
const SOUTH = 1;
const WEST = 2;
const EAST = 3;

function get_wall_pos(direction) {
    const x = player.x + (direction === EAST? player.width : 0);
    const y = player.y + (direction === SOUTH? player.width : 0);

    switch (direction) {
        case NORTH:
            return get_north_y(frame.get_cell(x, y).y);
        case SOUTH:
            return get_south_y(frame.get_cell(x, y).y) - WALL_WIDTH;
        case WEST:
            return get_west_x(frame.get_cell(x, y).x);
        case EAST:
            return get_east_x(frame.get_cell(x, y).x) - WALL_WIDTH;
        default:
            console.log(`ERROR: Invalid direction: ${direction}`);
            return -1;
    }
}

function get_wall_distance(direction, wall_pos) {
    switch(direction) {
        case NORTH:
            return player.y - wall_pos - WALL_WIDTH + 1;
        case SOUTH:
            return wall_pos - player.y - player.width + WALL_WIDTH;
        case WEST:
            return player.x - wall_pos - WALL_WIDTH + 1;
        case EAST:
            return wall_pos - player.x - player.width + WALL_WIDTH;
        default:
            console.log(`ERROR: Invalid direction ${direction}`);
            return -1;
    }
}

function move_player(direction, distance = player.move) {
    switch(direction) {
        case NORTH:
            return player.up(distance);
        case SOUTH:
            return player.down(distance);
        case WEST:
            return player.left(distance);
        case EAST:
            return player.right(distance);
        default: 
            console.log("ERROR: Invalid direction");
            return -1;
    }
}

function move(direction) {
    frame.clear_player();
    const cell1 = frame.get_cell(player.x, player.y);
    let x2 = player.x;
    let side1_direction = -1;
    if (direction === NORTH || direction === SOUTH) {
        x2 += player.width;
        side1_direction = WEST;
    }
    let y2 = player.y;
    if (direction === WEST || direction === EAST) {
        y2 += player.width;
        side1_direction = NORTH;
    }
    const cell2 = frame.get_cell(x2, y2);
    if (cell1.wall[direction] || cell2.wall[direction] || (cell1 !== cell2 && (cell1.wall[side1_direction] || cell2.wall[side1_direction + 1]))) {
        console.log("Detected wall!");

        const wall = get_wall_pos(direction);
        console.log(`wall = ${wall}, direction ${direction}`);

        const player_pos = (direction === NORTH || direction === SOUTH)? player.y : player.x;
        console.log(`player_pos = ${player_pos}`);

        // figure out if player's move would "break" the wall
        let collision = false;
        switch (direction) {
            case NORTH:
                collision = (player.y - player.move <= wall);
                break;
            case SOUTH:
                collision = (player.y + player.width + player.move >= wall);
                break;
            case WEST:
                collision = (player.x - player.move <= wall);
                break;
            case EAST:
                collision = (player.x + player.width + player.move >= wall);
                break;
        }
        if (collision) {
            console.log("Collision detected");
            move_player(direction, get_wall_distance(direction, wall));
            return;
        }
    }
    move_player(direction);
}

frame.generate_maze();

window.addEventListener('keydown', function(event) {
    switch(event.key) {
        case "ArrowUp":
            move(NORTH);
            break;
        case "ArrowDown": {
            move(SOUTH);
            break;
        }
        case "ArrowLeft": {
            move(WEST);
            break;
        }
        case "ArrowRight": {
            move(EAST);
            break;
            break;
        }
        default:
            return;
    }
    frame.render_player();
});