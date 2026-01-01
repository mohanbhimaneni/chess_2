import './Board.css'

import Piece from './Piece'
import { coordToAlgebraic } from '../game_logic/Moves'
import type { BoardState, Coord } from '../game_logic/Moves'

type BoardProps = {
	board: BoardState
	selected: Coord | null
	legalTargets: Coord[]
	onSelect: (coord: Coord) => void
	flipped?: boolean
}

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

export default function Board({ board, selected, legalTargets, onSelect, flipped = false }: BoardProps) {
	const displayFiles = flipped ? [...files].reverse() : files
	const displayRanks = flipped ? [...ranks].reverse() : ranks

	const isTarget = (row: number, col: number) =>
		legalTargets.some((c) => c.row === row && c.col === col)

	const isCapture = (row: number, col: number) => board[row][col] !== null && isTarget(row, col)

	const mapDisplayToModel = (r: number, c: number): Coord => ({
		row: flipped ? 7 - r : r,
		col: flipped ? 7 - c : c,
	})

	return (
		<div className='board-shell'>
			<div className='board-row'>
				<div className='rank-labels left'>
					{displayRanks.map((r) => (
						<span key={`l-${r}`}>{r}</span>
					))}
				</div>

				<div className='board-grid'>
					{Array.from({ length: 8 }).map((_, rIdx) =>
						Array.from({ length: 8 }).map((__, cIdx) => {
							const modelCoord = mapDisplayToModel(rIdx, cIdx)
							const piece = board[modelCoord.row][modelCoord.col]
							const isSelected = selected?.row === modelCoord.row && selected?.col === modelCoord.col
							const target = isTarget(modelCoord.row, modelCoord.col)
							const capture = isCapture(modelCoord.row, modelCoord.col)
							const colorClass = (modelCoord.row + modelCoord.col) % 2 === 0 ? 'square-light' : 'square-dark'
							const classes = ['square', colorClass]
							if (isSelected) classes.push('selected')
							if (target) classes.push(capture ? 'capture' : 'hint')

							return (
								<div
									key={`${rIdx}-${cIdx}`}
									className={classes.join(' ')}
									onClick={() => onSelect(modelCoord)}
									aria-label={`Square ${coordToAlgebraic(modelCoord)}`}
								>
									{piece && <Piece piece={piece} />}
								</div>
							)
						}),
					)}
				</div>
			</div>

			<div className='file-labels bottom'>
				{displayFiles.map((f) => (
					<span key={`b-${f}`}>{f}</span>
				))}
			</div>
		</div>
	)
}
