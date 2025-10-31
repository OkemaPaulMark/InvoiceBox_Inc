import { useState, useEffect } from 'react'
import axios from 'axios'
import PaymentModal from './PaymentModal'
import { API_BASE_URL } from '../config'

const Invoices = ({ token, user }) => {
  const [invoices, setInvoices] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setInvoices(response.data)
      } catch (error) {
        console.error('Failed to fetch invoices:', error)
      }
    }
    fetchInvoices()
  }, [token])

  const updateInvoiceStatus = async (invoiceId, status, paymentReference = null) => {
    try {
      const payload = { status }
      if (paymentReference) {
        payload.payment_reference = paymentReference
      }
      
      const response = await axios.put(`${API_BASE_URL}/invoices/${invoiceId}`, 
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId ? response.data : inv
      ))
    } catch (error) {
      console.error('Failed to update invoice:', error)
      alert(error.response?.data?.detail || 'Failed to update invoice')
    }
  }

  const handlePaymentSubmit = (invoice) => {
    setSelectedInvoice(invoice)
    setShowPaymentModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-100'
      case 'Payment Submitted': return 'text-blue-600 bg-blue-100'
      case 'Defaulted': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {user?.role === 'provider' ? 'Purchaser' : 'Provider'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono font-medium text-blue-600">{invoice.invoice_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{invoice.title}</div>
                    <div className="text-sm text-gray-500">{invoice.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user?.role === 'provider' ? invoice.purchaser_name : invoice.provider_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(invoice.date_created).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* Purchaser Actions */}
                  {user?.role === 'purchaser' && (
                    <div>
                      {invoice.status === 'Pending' && (
                        <div className="space-x-2">
                          <button
                            onClick={() => handlePaymentSubmit(invoice)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Submit Payment
                          </button>
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, 'Defaulted')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Mark Defaulted
                          </button>
                        </div>
                      )}
                      {invoice.payment_reference && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ref: {invoice.payment_reference}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Provider Actions */}
                  {user?.role === 'provider' && (
                    <div>
                      {invoice.status === 'Payment Submitted' && (
                        <div className="space-x-2">
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, 'Paid')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Confirm Payment
                          </button>
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, 'Defaulted')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Mark Defaulted
                          </button>
                        </div>
                      )}
                      {invoice.payment_reference && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ref: {invoice.payment_reference}
                        </div>
                      )}
                      {invoice.status === 'Pending' && (
                        <span className="text-gray-500 text-sm">Awaiting payment</span>
                      )}
                      {(invoice.status === 'Paid' || invoice.status === 'Defaulted') && (
                        <span className="text-gray-500 text-sm">Complete</span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">No invoices found</div>
        )}
      </div>
      
      {showPaymentModal && selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={updateInvoiceStatus}
        />
      )}
    </div>
  )
}

export default Invoices