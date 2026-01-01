import type { BoardState, Coord, Piece } from './Moves';

export function captureAt(board: BoardState, target: Coord): Piece | null {
	return board[target.row][target.col];
}

export function removePiece(board: BoardState, target: Coord): BoardState {
	const next = board.map((row) => row.slice());
	next[target.row][target.col] = null;
	return next;
}
