import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Invoices from './components/Invoices'
import CreateInvoice from './components/CreateInvoice'

import Sidebar from './components/Sidebar'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [token])

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  if (!token) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Routes>
            <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
            <Route path="/register" element={<Register setToken={setToken} setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col">
          <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Welcome, {user?.username}</h1>
            <button 
              onClick={logout} 
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </nav>
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard token={token} user={user} />} />
              <Route path="/invoices" element={<Invoices token={token} user={user} />} />

              <Route path="/create-invoice" element={user?.role === 'provider' ? <CreateInvoice token={token} /> : <Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App