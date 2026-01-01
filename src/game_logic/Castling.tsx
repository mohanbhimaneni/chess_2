import type { BoardState, Color } from './Moves';

// Castling is not implemented in this lightweight engine.
// This helper keeps the API explicit for future extension.
export function canCastle(_board: BoardState, _color: Color): boolean {
	return false;
}
