import './Piece.css'

import type { Piece as PieceType } from '../game_logic/Moves'

type Props = {
	piece: PieceType
}

const glyphs: Record<PieceType['color'], Record<PieceType['type'], string>> = {
	white: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
	black: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
}

export default function Piece({ piece }: Props) {
	return <span className={`piece ${piece.color}`}>{glyphs[piece.color][piece.type]}</span>
}
