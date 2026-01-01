import type { BoardState, Color } from './Moves';
import { hasAnyLegalMoves, isInCheck } from './Moves';

export function isCheckmate(board: BoardState, color: Color): boolean {
	return isInCheck(board, color) && !hasAnyLegalMoves(board, color);
}
