import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ user }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', },
    { path: '/invoices', label: 'Invoices',  },
    ...(user?.role === 'provider' ? [{ path: '/create-invoice', label: 'Create Invoice',}] : [])
  ]

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">InvoiceBox Inc</h2>
        <p className="text-gray-400 text-sm">{user?.username} ({user?.role})</p>
      </div>
      
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
           
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar