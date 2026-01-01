import './PlayerDetails.css'

import type { ReactNode } from 'react'

type Props = {
	name: string
	isActive: boolean
	color: 'white' | 'black'
	timer: ReactNode
}

export default function PlayerDetails({ name, isActive, color, timer }: Props) {
	return (
		<div className={`player-panel ${isActive ? 'active' : ''}`}>
			<div>
				<div className='player-name'>{name || (color === 'white' ? 'White' : 'Black')}</div>
				<div className='player-meta'>{color === 'white' ? 'White pieces' : 'Black pieces'}</div>
			</div>
			{timer}
		</div>
	)
}
