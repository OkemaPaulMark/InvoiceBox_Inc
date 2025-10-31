import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const Dashboard = ({ token, user }) => {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, analyticsResponse] = await Promise.all([
          axios.get('http://localhost:8000/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/analytics', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        setStats(statsResponse.data)
        setAnalytics(analyticsResponse.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [token])

  if (!stats || !analytics) return <div className="text-center">Loading...</div>

  // Chart data
  const statusPieData = {
    labels: Object.keys(analytics.status_breakdown),
    datasets: [{
      data: Object.values(analytics.status_breakdown),
      backgroundColor: ['#FCD34D', '#3B82F6', '#10B981', '#EF4444'],
      borderColor: ['#F59E0B', '#2563EB', '#059669', '#DC2626'],
      borderWidth: 2,
    }],
  }

  const currencyBarData = {
    labels: Object.keys(analytics.currency_breakdown),
    datasets: [{
      label: 'Revenue',
      data: Object.values(analytics.currency_breakdown),
      backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B'],
      borderColor: ['#2563EB', '#7C3AED', '#D97706'],
      borderWidth: 2,
    }],
  }

  const monthlyLineData = {
    labels: analytics.monthly_trends.map(m => m.month),
    datasets: [
      {
        label: 'Invoice Count',
        data: analytics.monthly_trends.map(m => m.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Revenue ($)',
        data: analytics.monthly_trends.map(m => m.amount),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
  }

  const lineChartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { display: true, title: { display: true, text: 'Month' } },
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Invoice Count' } },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Revenue ($)' }, grid: { drawOnChartArea: false } },
    },
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard - {user?.role}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Invoices</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total_invoices}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Amount</h3>
          <p className="text-3xl font-bold text-green-600">{stats.total_amount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Paid Amount</h3>
          <p className="text-3xl font-bold text-green-500">{stats.paid_amount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending_count}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Payment Submitted</h3>
          <p className="text-3xl font-bold text-blue-500">{stats.payment_submitted_count || 0}</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Invoice Status Distribution</h3>
            <div className="h-64">
              <Pie data={statusPieData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Revenue by Currency</h3>
            <div className="h-64">
              <Bar data={currencyBarData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Monthly Trends</h3>
          <div className="h-80">
            <Line data={monthlyLineData} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard