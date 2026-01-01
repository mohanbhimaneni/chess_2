import './GamePage.css'

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toast } from 'bootstrap';

export default function GamePage(){
    const location = useLocation();
    const warnings = (location.state?.warnings as string[]) || [];
    useEffect(()=>{
        setTimeout(() => {
            warnings.forEach((warning, index) =>{
                console.log(warning);
                const toastEl=document.getElementById(`toast-${index}`);
                if(toastEl){
                    const toast = new Toast(toastEl);
                    toast.show();
                }
            });
        }, 100);
    },[warnings]);
    return (
        <>
            <div className='toast-container position-fixed top-0 end-0 p-3'>
                {warnings.map((warning,index)=>(
                    <div key={index} id={`toast-${index}`} className='toast' role='alert'>
                        <div className='toast-header bg-warning text-dark'>
                            <strong className='me-auto'>Warning</strong>
                            <button type='button' className='btn-close' data-bs-dismiss='toast'></button>
                        </div>
                        <div className='toast-body'>{warning}</div>
                    </div>
                ))}
            </div>
        </>
    )
}