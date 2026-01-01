import './Timer.css'

type Props = {
	seconds: number
	isActive: boolean
}

export default function Timer({ seconds, isActive }: Props) {
	const safeSeconds = Math.max(0, seconds)
	const mins = Math.floor(safeSeconds / 60)
	const secs = safeSeconds % 60
	const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

	return <div className={`timer ${isActive ? 'running' : 'paused'}`}>{display}</div>
}
