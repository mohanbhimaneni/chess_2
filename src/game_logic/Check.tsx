import type { BoardState, Color } from './Moves';
import { isInCheck } from './Moves';

export function underCheck(board: BoardState, color: Color): boolean {
	return isInCheck(board, color);
}
