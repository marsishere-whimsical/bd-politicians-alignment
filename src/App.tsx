import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Header from './components/Header'
import SandwichAlignmentGame from './components/SandwichAlignmentGame'
import About from './components/About'
import Admin from './components/Admin'
import './App.css'
import { useDispatch } from 'react-redux'
import { setSelectedSandwich } from './store/selectedSandwichSlice'

function App() {
  const [activeTab, setActiveTab] = useState('game')
  const dispatch = useDispatch()

  const handlePageClick = () => {
    dispatch(setSelectedSandwich(null))
  }

  return (
    <Router>
      <div className="min-h-screen bg-black px-4 py-2 text-neutral-200" onClick={handlePageClick}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="max-w-7xl mx-auto mt-8 mb-12 px-2">
          <Routes>
            <Route path="/" element={<Navigate to="/game" />} />
            <Route path="/game" element={<SandwichAlignmentGame />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/game" />} />
          </Routes>
        </main>
      </div>
      <Analytics />
    </Router>
  )
}

export default App