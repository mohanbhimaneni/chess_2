export type Color = 'white' | 'black';
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';

export type Coord = {
	row: number; // 0 is top (rank 8), 7 is bottom (rank 1)
	col: number; // 0 is file a, 7 is file h
};

export type Piece = {
	color: Color;
	type: PieceType;
	id: string; // unique identifier for React keying
};

export type BoardState = (Piece | null)[][];

export type Move = {
	from: Coord;
	to: Coord;
	captured?: Piece | null;
	promotion?: PieceType;
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function createInitialBoard(): BoardState {
	const emptyRank = Array(8).fill(null) as (Piece | null)[];
	const board: BoardState = Array.from({ length: 8 }, () => [...emptyRank]);

	const backRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

	// black pieces (top)
	for (let c = 0; c < 8; c += 1) {
		board[0][c] = { color: 'black', type: backRank[c], id: `b-${backRank[c]}-${c}` };
		board[1][c] = { color: 'black', type: 'p', id: `b-p-${c}` };
	}

	// white pieces (bottom)
	for (let c = 0; c < 8; c += 1) {
		board[6][c] = { color: 'white', type: 'p', id: `w-p-${c}` };
		board[7][c] = { color: 'white', type: backRank[c], id: `w-${backRank[c]}-${c}` };
	}

	return board;
}

export function coordToAlgebraic(coord: Coord): string {
	const file = files[coord.col];
	const rank = 8 - coord.row;
	return `${file}${rank}`;
}

export function algebraicToCoord(square: string): Coord {
	const file = square[0];
	const rank = Number(square[1]);
	return { row: 8 - rank, col: files.indexOf(file) };
}

function insideBoard(row: number, col: number): boolean {
	return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function cloneBoard(board: BoardState): BoardState {
	return board.map((row) => row.slice());
}

function rayMoves(
	board: BoardState,
	from: Coord,
	deltas: Array<[number, number]>,
	color: Color,
): Coord[] {
	const targets: Coord[] = [];
	for (const [dr, dc] of deltas) {
		let r = from.row + dr;
		let c = from.col + dc;
		while (insideBoard(r, c)) {
			const occupant = board[r][c];
			if (!occupant) {
				targets.push({ row: r, col: c });
			} else {
				if (occupant.color !== color) targets.push({ row: r, col: c });
				break;
			}
			r += dr;
			c += dc;
		}
	}
	return targets;
}

export function generatePseudoMoves(board: BoardState, from: Coord, color: Color): Coord[] {
	const piece = board[from.row][from.col];
	if (!piece || piece.color !== color) return [];

	const targets: Coord[] = [];
	switch (piece.type) {
		case 'p': {
			const dir = color === 'white' ? -1 : 1;
			const startRow = color === 'white' ? 6 : 1;
			const oneStep = { row: from.row + dir, col: from.col };
			if (insideBoard(oneStep.row, oneStep.col) && !board[oneStep.row][oneStep.col]) {
				targets.push(oneStep);
				const twoStep = { row: from.row + dir * 2, col: from.col };
				if (from.row === startRow && !board[twoStep.row][twoStep.col]) targets.push(twoStep);
			}
			// captures
			for (const dc of [-1, 1]) {
				const r = from.row + dir;
				const c = from.col + dc;
				if (insideBoard(r, c) && board[r][c] && board[r][c]?.color !== color) {
					targets.push({ row: r, col: c });
				}
			}
			break;
		}
		case 'n': {
			const jumps = [
				[2, 1],
				[2, -1],
				[-2, 1],
				[-2, -1],
				[1, 2],
				[1, -2],
				[-1, 2],
				[-1, -2],
			];
			for (const [dr, dc] of jumps) {
				const r = from.row + dr;
				const c = from.col + dc;
				if (!insideBoard(r, c)) continue;
				const occupant = board[r][c];
				if (!occupant || occupant.color !== color) targets.push({ row: r, col: c });
			}
			break;
		}
		case 'b': {
			targets.push(...rayMoves(board, from, [[1, 1], [1, -1], [-1, 1], [-1, -1]], color));
			break;
		}
		case 'r': {
			targets.push(...rayMoves(board, from, [[1, 0], [-1, 0], [0, 1], [0, -1]], color));
			break;
		}
		case 'q': {
			targets.push(...rayMoves(board, from, [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]], color));
			break;
		}
		case 'k': {
			const steps = [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
				[1, 1],
				[1, -1],
				[-1, 1],
				[-1, -1],
			];
			for (const [dr, dc] of steps) {
				const r = from.row + dr;
				const c = from.col + dc;
				if (!insideBoard(r, c)) continue;
				const occupant = board[r][c];
				if (!occupant || occupant.color !== color) targets.push({ row: r, col: c });
			}
			break;
		}
		default:
			break;
	}
	return targets;
}

function findKing(board: BoardState, color: Color): Coord | null {
	for (let r = 0; r < 8; r += 1) {
		for (let c = 0; c < 8; c += 1) {
			const p = board[r][c];
			if (p && p.type === 'k' && p.color === color) return { row: r, col: c };
		}
	}
	return null;
}

export function isSquareAttacked(board: BoardState, square: Coord, byColor: Color): boolean {
	// Pawns
	const pawnDir = byColor === 'white' ? -1 : 1;
	for (const dc of [-1, 1]) {
		const r = square.row + pawnDir;
		const c = square.col + dc;
		if (insideBoard(r, c)) {
			const p = board[r][c];
			if (p && p.color === byColor && p.type === 'p') return true;
		}
	}

	// Knights
	const knightJumps = [
		[2, 1],
		[2, -1],
		[-2, 1],
		[-2, -1],
		[1, 2],
		[1, -2],
		[-1, 2],
		[-1, -2],
	];
	for (const [dr, dc] of knightJumps) {
		const r = square.row + dr;
		const c = square.col + dc;
		if (!insideBoard(r, c)) continue;
		const p = board[r][c];
		if (p && p.color === byColor && p.type === 'n') return true;
	}

	// Diagonals (bishops/queens)
	const diagDirs: Array<[number, number]> = [
		[1, 1],
		[1, -1],
		[-1, 1],
		[-1, -1],
	];
	for (const [dr, dc] of diagDirs) {
		let r = square.row + dr;
		let c = square.col + dc;
		while (insideBoard(r, c)) {
			const p = board[r][c];
			if (!p) {
				r += dr;
				c += dc;
				continue;
			}
			if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
			break;
		}
	}

	// Straights (rooks/queens)
	const straightDirs: Array<[number, number]> = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1],
	];
	for (const [dr, dc] of straightDirs) {
		let r = square.row + dr;
		let c = square.col + dc;
		while (insideBoard(r, c)) {
			const p = board[r][c];
			if (!p) {
				r += dr;
				c += dc;
				continue;
			}
			if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
			break;
		}
	}

	// King proximity
	const kingSteps = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1],
		[1, 1],
		[1, -1],
		[-1, 1],
		[-1, -1],
	];
	for (const [dr, dc] of kingSteps) {
		const r = square.row + dr;
		const c = square.col + dc;
		if (!insideBoard(r, c)) continue;
		const p = board[r][c];
		if (p && p.color === byColor && p.type === 'k') return true;
	}

	return false;
}

export function isInCheck(board: BoardState, color: Color): boolean {
	const kingPos = findKing(board, color);
	if (!kingPos) return false;
	return isSquareAttacked(board, kingPos, color === 'white' ? 'black' : 'white');
}

export function makeMove(board: BoardState, move: Move): BoardState {
	const next = cloneBoard(board);
	const piece = board[move.from.row][move.from.col];
	if (!piece) return board;
	const targetPiece = board[move.to.row][move.to.col];
	move.captured = targetPiece || undefined;

	const moved: Piece = { ...piece };
	// promotion to queen only for now
	if (moved.type === 'p' && (move.to.row === 0 || move.to.row === 7)) {
		moved.type = move.promotion || 'q';
	}

	next[move.from.row][move.from.col] = null;
	next[move.to.row][move.to.col] = moved;
	return next;
}

export function generateLegalMoves(board: BoardState, from: Coord, color: Color): Coord[] {
	const pseudo = generatePseudoMoves(board, from, color);
	const legal: Coord[] = [];
	for (const to of pseudo) {
		const draft = makeMove(board, { from, to });
		if (!isInCheck(draft, color)) legal.push(to);
	}
	return legal;
}

export function hasAnyLegalMoves(board: BoardState, color: Color): boolean {
	for (let r = 0; r < 8; r += 1) {
		for (let c = 0; c < 8; c += 1) {
			const piece = board[r][c];
			if (piece && piece.color === color) {
				if (generateLegalMoves(board, { row: r, col: c }, color).length > 0) return true;
			}
		}
	}
	return false;
}

export function describePiece(piece: Piece | null): string {
	if (!piece) return '';
	const symbolMap: Record<PieceType, string> = {
		k: 'K',
		q: 'Q',
		r: 'R',
		b: 'B',
		n: 'N',
		p: 'P',
	};
	return `${piece.color === 'white' ? 'W' : 'B'}${symbolMap[piece.type]}`;
}

type MoveAnnotation = {
	check: boolean;
	mate: boolean;
	stalemate: boolean;
};

export function formatMove(board: BoardState, move: Move, info: MoveAnnotation): string {
	const piece = board[move.from.row][move.from.col];
	if (!piece) return '';

	const dest = coordToAlgebraic(move.to);
	const origin = coordToAlgebraic(move.from);
	const isCapture = !!board[move.to.row][move.to.col];

	const pieceLetterMap: Record<PieceType, string> = {
		k: 'K',
		q: 'Q',
		r: 'R',
		b: 'B',
		n: 'N',
		p: '',
	};

	const pieceLetter = pieceLetterMap[piece.type];
	const captureMark = isCapture ? 'x' : '';

	// For pawns, include originating file on capture (e.g., exd5)
	const pawnOrigin = piece.type === 'p' && isCapture ? origin[0] : '';

	let san = `${pieceLetter}${pawnOrigin}${captureMark}${dest}`;
	if (move.promotion) san += `=${pieceLetterMap[move.promotion]}`;

	if (info.mate) san += '#';
	else if (info.stalemate) san += ' (stalemate)';
	else if (info.check) san += '+';

	return san;
}

export function statusAfterMove(board: BoardState, colorToMove: Color): string {
	const inCheck = isInCheck(board, colorToMove);
	const hasMoves = hasAnyLegalMoves(board, colorToMove);
	if (inCheck && !hasMoves) return `${capitalize(colorToMove)} is checkmated`;
	if (!inCheck && !hasMoves) return 'Stalemate';
	if (inCheck) return `${capitalize(colorToMove)} is in check`;
	return `${capitalize(colorToMove)} to move`;
}

function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}
