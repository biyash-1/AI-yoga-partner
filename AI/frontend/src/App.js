import React from 'react'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'

import Home from './pages/Home/Home'
import Yoga from './pages/Yoga/Yoga'
import About from './pages/About/About'
// import Tutorials from './pages/Tutorials/Tutorials'
import Test from './pages/Test/Test'

import './App.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/start' element={<Yoga />} />
        <Route path='/about' element={<About />} />
        <Route path='/Test' element={<Test />} />
      </Routes>
    </Router>
  )
}


