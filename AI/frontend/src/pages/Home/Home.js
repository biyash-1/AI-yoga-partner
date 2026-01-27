import React from 'react'
import { Link } from 'react-router-dom'

import './Home.css'

export default function Home() {

    return (
        <div className='home-container'>
            <div className='home-header'>
                <h1 className='home-heading'>AI YOGA COACH</h1>
                <Link to='/about'>
                    <button 
                        className="btn btn-secondary" 
                        id="about-btn"
                    >
                        About
                    </button>
                </Link>
            </div>

            <h1 className="description">Yoga AI Trainer and Pose detector</h1>
            <div className="home-main">
                <div className="btn-section">
                    <Link to='/start'>
                        <button
                            className="btn start-btn"
                        >Lets Practice</button>
                    </Link>
                    <Link to='/Test'>
                        <button
                            className="btn start-btn"
                        >Take Test</button>
                    </Link>

                </div>
            </div>
        </div>
    )
}
