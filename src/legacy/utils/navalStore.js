const BOARD_SIZE = 8;
const COLUMNS = 'abcdefgh';

const FLEET = [
    { name: 'Porta-Aviões', size: 5 },
    { name: 'Couraçado', size: 4 },
    { name: 'Couraçado', size: 4 },
    { name: 'Cruzador', size: 3 },
    { name: 'Cruzador', size: 3 },
    { name: 'Submarino', size: 2 },
    { name: 'Submarino', size: 2 },
    { name: 'Submarino', size: 2 },
    { name: 'Bote', size: 1 },
    { name: 'Bote', size: 1 }
];

// groupId -> game state
const games = new Map();

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function createEmptyGrid() {
    return Array.from(
        { length: BOARD_SIZE },
        () => Array(BOARD_SIZE).fill(null)
    );
}

function canPlace(grid, row, col, size, horizontal) {
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;

        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
            return false;
        }

        // bloqueia inclusive as casas vizinhas (navios não encostam)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;

                if (
                    nr >= 0 && nr < BOARD_SIZE &&
                    nc >= 0 && nc < BOARD_SIZE &&
                    grid[nr][nc]
                ) {
                    return false;
                }
            }
        }
    }

    return true;
}

function placeShip(grid, shipDef, id) {
    let attempts = 0;

    while (attempts < 500) {
        attempts++;

        const horizontal = Math.random() < 0.5;
        const row = randomInt(BOARD_SIZE);
        const col = randomInt(BOARD_SIZE);

        if (canPlace(grid, row, col, shipDef.size, horizontal)) {
            const cells = [];

            for (let i = 0; i < shipDef.size; i++) {
                const r = horizontal ? row : row + i;
                const c = horizontal ? col + i : col;
                grid[r][c] = id;
                cells.push(`${r},${c}`);
            }

            return cells;
        }
    }

    return [];
}

function generateBoard() {
    const grid = createEmptyGrid();
    const ships = [];

    FLEET.forEach((shipDef, index) => {
        const id = `s${index}`;
        const cells = placeShip(grid, shipDef, id);

        ships.push({
            id,
            name: shipDef.name,
            cells,
            hits: new Set()
        });
    });

    return {
        grid,
        ships,
        shots: new Map() // "row,col" -> 'hit' | 'miss'
    };
}

function parseCoordinate(text) {
    const match = String(text || '')
        .trim()
        .toLowerCase()
        .match(/^([a-h])([1-8])$/);

    if (!match) {
        return null;
    }

    const col = COLUMNS.indexOf(match[1]);
    const row = parseInt(match[2], 10) - 1;

    return {
        row,
        col,
        label: `${match[1]}${match[2]}`
    };
}

function renderBoard(board) {
    const lines = [];

    let tiros = 0;
    let acertos = 0;

    lines.push('╔════════════════════╗');
    lines.push('║ 🚢 BATALHA NAVAL ║');
    lines.push('╚════════════════════╝');
    lines.push('');
    lines.push('   A B C D E F G H');
    lines.push('');

    for (let r = 0; r < BOARD_SIZE; r++) {
        const linha = [];

        for (let c = 0; c < BOARD_SIZE; c++) {
            const key = `${r},${c}`;
            const shot = board.shots.get(key);

            if (shot === 'hit') {
                linha.push('💥');
                tiros++;
                acertos++;
            } else if (shot === 'miss') {
                linha.push('🌊');
                tiros++;
            } else {
                linha.push('⬜');
            }
        }

        lines.push(
            `${String(r + 1).padStart(2, '0')} ${linha.join(' ')}`
        );
    }

    lines.push('');
    lines.push(`🎯 Tiros: ${tiros}`);
    lines.push(`💥 Acertos: ${acertos}`);
    lines.push(`❌ Erros: ${tiros - acertos}`);
    lines.push('');
    lines.push('⬜ Desconhecido');
    lines.push('🌊 Água');
    lines.push('💥 Acerto');
    lines.push('');

    return lines.join('\n');
}
function fireShot(board, row, col) {
    const key = `${row},${col}`;

    if (board.shots.has(key)) {
        return {
            alreadyShot: true,
            hit: board.shots.get(key) === 'hit',
            sunk: false,
            ship: null
        };
    }

    const shipId = board.grid[row][col];

    if (!shipId) {
        board.shots.set(key, 'miss');

        return {
            alreadyShot: false,
            hit: false,
            sunk: false,
            ship: null
        };
    }

    board.shots.set(key, 'hit');

    const ship = board.ships.find(item => item.id === shipId);

    if (ship) {
        ship.hits.add(key);
    }

    const sunk =
        ship &&
        ship.cells.every(cell => ship.hits.has(cell));

    return {
        alreadyShot: false,
        hit: true,
        sunk,
        ship
    };
}

function allSunk(board) {
    return board.ships.every(ship =>
        ship.cells.length > 0 &&
        ship.cells.every(cell => ship.hits.has(cell))
    );
}
module.exports = {
    BOARD_SIZE,
    COLUMNS,
    FLEET,
    games,
    generateBoard,
    parseCoordinate,
    fireShot,
    allSunk,
    renderBoard
};