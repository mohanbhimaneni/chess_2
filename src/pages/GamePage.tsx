import './GamePage.css'

import { useEffect, useMemo, useState } from 'react'
import { Toast } from 'bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'

import Board from '../components/Board'
import PlayerDetails from '../components/PlayerDetails'
import Timer from '../components/Timer'
import {
    coordToAlgebraic,
    createInitialBoard,
    formatMove,
    generateLegalMoves,
    makeMove,
    statusAfterMove,
} from '../game_logic/Moves'
import type { BoardState, Color, Coord, Move } from '../game_logic/Moves'
import { hasAnyLegalMoves, isInCheck } from '../game_logic/Moves'

type MovePair = {
    num: number
    white?: string
    black?: string
}

export default function GamePage() {
    const location = useLocation()
    const navigate = useNavigate()
    const warnings = (location.state?.warnings as string[]) || []

    const player1Name = (localStorage.getItem('player-1') || 'Player-1').trim() || 'Player-1'
    const player2Name = (localStorage.getItem('player-2') || 'Player-2').trim() || 'Player-2'
    const timerSetting = (localStorage.getItem('timer') || '10:00').trim()

    const baseSeconds = useMemo(() => parseTimer(timerSetting), [timerSetting])

    const [board, setBoard] = useState<BoardState>(() => createInitialBoard())
    const [turn, setTurn] = useState<Color>('white')
    const [selected, setSelected] = useState<Coord | null>(null)
    const [legalTargets, setLegalTargets] = useState<Coord[]>([])
    const [history, setHistory] = useState<MovePair[]>([])
    const [status, setStatus] = useState<string>('White to move')
    const [whiteSeconds, setWhiteSeconds] = useState<number>(baseSeconds)
    const [blackSeconds, setBlackSeconds] = useState<number>(baseSeconds)

    useEffect(() => {
        const id = setInterval(() => {
            setWhiteSeconds((s) => (turn === 'white' ? Math.max(s - 1, 0) : s))
            setBlackSeconds((s) => (turn === 'black' ? Math.max(s - 1, 0) : s))
        }, 1000)
        return () => clearInterval(id)
    }, [turn])

    useEffect(() => {
        if (whiteSeconds === 0 || blackSeconds === 0) {
            setStatus('Time over')
        }
    }, [whiteSeconds, blackSeconds])

    useEffect(() => {
        const id = setTimeout(() => {
            warnings.forEach((warning, index) => {
                const toastEl = document.getElementById(`toast-${index}`)
                if (toastEl) {
                    const toast = new Toast(toastEl)
                    toast.show()
                }
            })
        }, 120)
        return () => clearTimeout(id)
    }, [warnings])

    const handleSelect = (coord: Coord) => {
        if (whiteSeconds === 0 || blackSeconds === 0) return
        const piece = board[coord.row][coord.col]

        const tryMove = selected && legalTargets.some((c) => c.row === coord.row && c.col === coord.col)
        if (selected && tryMove) {
            const move: Move = { from: selected, to: coord }
            const nextBoard = makeMove(board, move)
            const opponent: Color = turn === 'white' ? 'black' : 'white'

            const opponentInCheck = isInCheck(nextBoard, opponent)
            const opponentHasMoves = hasAnyLegalMoves(nextBoard, opponent)
            const mate = opponentInCheck && !opponentHasMoves
            const stalemate = !opponentInCheck && !opponentHasMoves
            const san = formatMove(board, move, { check: opponentInCheck, mate, stalemate })

            setBoard(nextBoard)
            setHistory((prev) => {
                if (turn === 'white') {
                    return [...prev, { num: prev.length + 1, white: san }]
                }
                const copy = [...prev]
                const last = copy[copy.length - 1]
                if (last) copy[copy.length - 1] = { ...last, black: san }
                else copy.push({ num: 1, black: san })
                return copy
            })
            const nextTurn: Color = opponent
            setTurn(nextTurn)
            setStatus(statusAfterMove(nextBoard, nextTurn))
            setSelected(null)
            setLegalTargets([])
            return
        }

        if (piece && piece.color === turn) {
            setSelected(coord)
            setLegalTargets(generateLegalMoves(board, coord, turn))
        } else {
            setSelected(null)
            setLegalTargets([])
        }
    }

    const resetGame = () => {
        setBoard(createInitialBoard())
        setTurn('white')
        setSelected(null)
        setLegalTargets([])
        setHistory([])
        setStatus('White to move')
        setWhiteSeconds(baseSeconds)
        setBlackSeconds(baseSeconds)
    }

    return (
        <div className='app-shell'>
            <div className='d-flex justify-content-between align-items-center app-card'>
                <div>
                    <h2 className='page-title mb-1 '>Game board</h2>
                    <div className='subtle-text'>{status}</div>
                </div>
                <div className='d-flex gap-2'>
                    <button className='btn btn-outline-light btn-sm' onClick={() => navigate('/')}>Back</button>
                    <button className='btn btn-warning btn-sm' onClick={resetGame}>Reset</button>
                </div>
            </div>

            <div className='game-layout'>
                <div className='app-card'>
                    <Board
                        board={board}
                        selected={selected}
                        legalTargets={legalTargets}
                        onSelect={handleSelect}
                        flipped={turn === 'black'}
                    />
                </div>

                <div className='side-panel'>
                    <div className='app-card'>
                        <PlayerDetails
                            name={player1Name}
                            isActive={turn === 'white'}
                            color='white'
                            timer={<Timer seconds={whiteSeconds} isActive={turn === 'white'} />}
                        />
                    </div>
                    <div className='app-card'>
                        <PlayerDetails
                            name={player2Name}
                            isActive={turn === 'black'}
                            color='black'
                            timer={<Timer seconds={blackSeconds} isActive={turn === 'black'} />}
                        />
                    </div>

                    <div className='app-card move-list'>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                            <div className='fw-semibold'>Moves</div>
                            <div className='subtle-text small'>Tap any square to play</div>
                        </div>
                        {history.length === 0 && <div className='subtle-text'>No moves yet.</div>}
                        <ol className='history-list'>
                            {history.map((entry) => (
                                <li key={entry.num}>
                                    {entry.white || ''} {entry.black || ''}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>

            <div className='toast-container position-fixed top-0 end-0 p-3'>
                {warnings.map((warning, index) => (
                    <div key={index} id={`toast-${index}`} className='toast' role='alert'>
                        <div className='toast-header bg-warning text-dark'>
                            <strong className='me-auto'>Warning</strong>
                            <button type='button' className='btn-close' data-bs-dismiss='toast'></button>
                        </div>
                        <div className='toast-body'>{warning}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function parseTimer(value: string): number {
    const match = value.match(/^(\d{1,4}):(\d{2})$/)
    if (!match) return 600
    const mins = Number(match[1])
    const secs = Number(match[2])
    const total = mins * 60 + secs
    return Number.isNaN(total) ? 600 : total
}