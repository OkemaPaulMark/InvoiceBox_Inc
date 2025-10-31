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

const Analytics = ({ token }) => {
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:8000/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAnalytics(response.data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      }
    }
    fetchAnalytics()
  }, [token])

  if (!analytics) return <div className="text-center">Loading analytics...</div>

  // Status Pie Chart Data
  const statusPieData = {
    labels: Object.keys(analytics.status_breakdown),
    datasets: [
      {
        data: Object.values(analytics.status_breakdown),
        backgroundColor: ['#FCD34D', '#3B82F6', '#10B981', '#EF4444'],
        borderColor: ['#F59E0B', '#2563EB', '#059669', '#DC2626'],
        borderWidth: 2,
      },
    ],
  }

  // Currency Bar Chart Data
  const currencyBarData = {
    labels: Object.keys(analytics.currency_breakdown),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(analytics.currency_breakdown),
        backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B'],
        borderColor: ['#2563EB', '#7C3AED', '#D97706'],
        borderWidth: 2,
      },
    ],
  }

  // Monthly Trends Line Chart Data
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
    plugins: {
      legend: {
        position: 'top',
      },
    },
  }

  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Invoice Count'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Invoice Status Distribution</h2>
          <div className="h-64">
            <Pie data={statusPieData} options={chartOptions} />
          </div>
        </div>

        {/* Currency Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Revenue by Currency</h2>
          <div className="h-64">
            <Bar data={currencyBarData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Monthly Trends Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Monthly Trends</h2>
        <div className="h-80">
          <Line data={monthlyLineData} options={lineChartOptions} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(analytics.status_breakdown).map(([status, count]) => (
          <div key={status} className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className={`text-2xl font-bold ${
              status === 'Paid' ? 'text-green-600' : 
              status === 'Payment Submitted' ? 'text-blue-600' :
              status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {count}
            </div>
            <div className="text-gray-600">{status} Invoices</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Analytics