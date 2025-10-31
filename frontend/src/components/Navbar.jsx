import { Link } from 'react-router-dom'

const Navbar = ({ user, logout }) => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">InvoiceBox Inc</Link>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/invoices" className="hover:underline">Invoices</Link>
          {user?.role === 'provider' && (
            <Link to="/create-invoice" className="hover:underline">Create Invoice</Link>
          )}
          <span className="bg-blue-700 px-2 py-1 rounded text-sm">{user?.username} ({user?.role})</span>
          <button onClick={logout} className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar