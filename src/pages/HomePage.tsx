import './HomePage.css'

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage(){
    const navigate=useNavigate();
    const [player1, setPlayer1]=useState('');
    const [player2, setPlayer2]=useState('');
    const [timer, setTimer]=useState('');
    
    const handleSubmit = (e:any)=>{
        e.preventDefault();

        const warnings: string[] = [];
        if(player1===''){
            warnings.push('Player 1 name was empty. Defaulted to "Player-1".');
            setPlayer1('Player-1');
        }
        if(player2===''){
            warnings.push('Player 2 name was empty. Defaulted to "Player-2".');
            setPlayer2('Player-2');
        }
        if(!isValidTimerValue(timer)){
            warnings.push('Timer was invalid. Defaulted to 10:00');
        }
        localStorage.setItem('player-1',player1);
        localStorage.setItem('player-2',player2);
        localStorage.setItem('timer',timer);
        navigate('/game',{state:{warnings: warnings}});
    }
    return(
        <>
            <div className='container-fluid d-flex flex-column align-items-center justify-content-center'>
                <h1 className='display-1'>Chess</h1>
                <div className='container-fluid settings'>
                    <p className='lead'>Choose your game settings</p>
                    <form onSubmit={handleSubmit} className='container-fluid'>
                        <input 
                            className='form-control'
                            name='player1'
                            type="text"
                            value={player1}
                            onChange={(e)=> setPlayer1(e.target.value)}
                            placeholder='Enter name of player-1'
                        />
                        <input 
                            className='form-control mt-2'
                            name='player2'
                            type="text"
                            value={player2}
                            onChange={(e)=> setPlayer2(e.target.value)}
                            placeholder='Enter name of player-2'
                        />
                        <input 
                            className='form-control mt-2'
                            name='timer'
                            type="text"
                            value={timer}
                            onChange={(e)=> setTimer(e.target.value)}
                            placeholder='Enter timer value (mm:ss)'
                        />
                        <button className='button mt-2'>Start game</button>
                    </form>
                </div>
            </div>
        </>
    )
}

function isValidTimerValue(value: string):boolean{
    const trimmed=value.trim();
    return /^(\d{1,4}):([0-5]\d)$/.test(trimmed);
}