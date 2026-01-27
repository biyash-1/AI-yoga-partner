import React from 'react'

import './About.css'

export default function About() {
    return (
        <div className="about-container">
            <h1 className="about-heading">About</h1>
            <div className="about-main">
                <p className="about-content">
                Yoga poses training involves practicing and learning various yoga postures or asanas in order to
                 improve strength, flexibility, balance, and overall physical and mental well-being. 
                 There are many different styles of yoga, and each has its own set of asanas.
                </p>
                <div className="developer-info">
                    <h4>Team members</h4>
                    <p className="about-content">
                        
                            <ol>Ashum Bhuju Shrestha</ol>
                            <ol>Biyash Shrestha</ol>
                            <ol>Pranil Barahi</ol>
                            <ol>Prijal Khadka</ol>
                    </p>
                    
                </div>
            </div>
        </div>
    )
}
