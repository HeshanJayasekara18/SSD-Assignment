import React, { useState, useEffect } from 'react';
import './PaymentManagement.css';
import { 
  FiSearch, 
  FiEye, 
  FiFileText, 
  FiX, 
  FiDollarSign, 
  FiCalendar, 
  FiCreditCard, 
  FiUser, 
  FiPackage,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTrash2,
  FiBarChart2,
  FiActivity
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const PaymentManagement = () => {
  // State for payments data
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCharts, setShowCharts] = useState(false);
  const [chartData, setChartData] = useState({ status: [], monthly: [] });

  // Fetch payments data from API
  useEffect(() => {
    fetchPayments();
  }, []);

  // Prepare chart data when payments change
  useEffect(() => {
    if (payments.length > 0) {
      prepareChartData();
    }
  }, [payments]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/payment/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment data');
      }
      
      const data = await response.json();
      if (data.success) {
        const formattedPayments = data.payments.map(payment => ({
          id: payment.paymentId,
          bookingId: payment.packageId,
          customerName: payment.fullName,
          tourPackage: payment.tourPackageName || 'Unknown Package',
          amount: payment.totalAmount,
          date: payment.createdAt,
          status: payment.status.toLowerCase(),
          paymentMethod: 'card',
          transactionId: payment.transactionId,
          email: payment.email,
          phone: payment.phone,
          numberOfTravelers: payment.numberOfTravelers
        }));
        
        setPayments(formattedPayments);
        setFilteredPayments(formattedPayments);
      } else {
        console.error('Error fetching payments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    // Status chart data
    const statusCounts = {
      completed: payments.filter(p => p.status === 'completed').length,
      pending: payments.filter(p => p.status === 'pending').length,
      failed: payments.filter(p => p.status === 'failed').length
    };
    
    const statusData = [
      { name: 'Completed', value: statusCounts.completed },
      { name: 'Pending', value: statusCounts.pending },
      { name: 'Failed', value: statusCounts.failed }
    ];

    // Monthly data for the last 6 months
    const monthlyData = getMonthlyData(payments);

    setChartData({
      status: statusData,
      monthly: monthlyData
    });
  };

  // Generate monthly data for chart
  const getMonthlyData = (paymentData) => {
    const months = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      months[`${monthName} ${d.getFullYear()}`] = {
        completed: 0,
        pending: 0,
        failed: 0,
        total: 0
      };
    }
    
    // Populate with payment data
    paymentData.forEach(payment => {
      const date = new Date(payment.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (months[monthYear]) {
        months[monthYear][payment.status]++;
        months[monthYear].total += payment.amount;
      }
    });
    
    // Convert to array for chart
    return Object.keys(months).map(month => ({
      name: month,
      completed: months[month].completed,
      pending: months[month].pending,
      failed: months[month].failed,
      total: months[month].total
    }));
  };

  // Delete payment
  const deletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:4000/api/payment/${paymentId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete payment');
        }
        
        const data = await response.json();
        if (data.success) {
          setPayments(payments.filter(payment => payment.id !== paymentId));
          setFilteredPayments(filteredPayments.filter(payment => payment.id !== paymentId));
          
          if (showDetailsModal && selectedPayment && selectedPayment.id === paymentId) {
            setShowDetailsModal(false);
            setSelectedPayment(null);
          }
          
          alert('Payment deleted successfully');
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Failed to delete payment. Please try again.');
      }
    }
  };

  // Filter payments based on search term and status
  useEffect(() => {
    let result = payments;
    
    if (filterStatus !== 'all') {
      result = result.filter(payment => payment.status === filterStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payment => 
        payment.id.toLowerCase().includes(term) ||
        payment.bookingId.toLowerCase().includes(term) ||
        payment.customerName.toLowerCase().includes(term) ||
        payment.tourPackage.toLowerCase().includes(term) ||
        payment.transactionId.toLowerCase().includes(term)
      );
    }
    
    result = [...result].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredPayments(result);
  }, [payments, searchTerm, sortConfig, filterStatus]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-badge-success';
      case 'pending':
        return 'status-badge-warning';
      case 'failed':
        return 'status-badge-danger';
      default:
        return 'status-badge-default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="status-icon" />;
      case 'pending':
        return <FiClock className="status-icon" />;
      case 'failed':
        return <FiAlertCircle className="status-icon" />;
      default:
        return null;
    }
  };

  // Generate PDF receipt
  const generateReceiptPDF = (payment) => {
    const doc = new jsPDF();

    // Add company details
    doc.setFontSize(12);
    doc.text('Ceylon go', 20, 20);
    doc.text('123 Travel Lane', 20, 25);
    doc.text('Colombo, SriLanka', 20, 30);
    doc.text('Phone: 123-456-7890', 20, 35);
    doc.text('Email: info@travelCeylon.go', 20, 40);

    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Receipt', 20, 55);
    doc.setFont('helvetica', 'normal');

    // Add payment details
    doc.setFontSize(12);
    let y = 65;
    const labelX = 20;
    const valueX = 80;

    const details = [
      { label: 'Payment ID:', value: payment.id },
      { label: 'Transaction ID:', value: payment.transactionId },
      { label: 'Customer Name:', value: payment.customerName },
      { label: 'Email:', value: payment.email },
      { label: 'Phone:', value: payment.phone },
      { label: 'Tour Package:', value: payment.tourPackage },
      { label: 'Package ID:', value: payment.bookingId },
      { label: 'Number of Travelers:', value: payment.numberOfTravelers.toString() },
      { label: 'Amount:', value: `$${payment.amount.toFixed(2)}` },
      { label: 'Date:', value: formatDate(payment.date) },
      { label: 'Status:', value: payment.status.charAt(0).toUpperCase() + payment.status.slice(1) },
      { label: 'Payment Method:', value: 'Credit/Debit Card' },
    ];

    details.forEach(detail => {
      doc.setFont('helvetica', 'bold');
      doc.text(detail.label, labelX, y);
      doc.setFont('helvetica', 'normal');
      doc.text(detail.value, valueX, y);
      y += 10;
    });

    // Add generated date
    const currentDate = formatDate(new Date());
    doc.text(`Generated on: ${currentDate}`, labelX, y + 10);

    // Add thank you message
    doc.text('Thank you for your payment.', labelX, y + 20);

    // Save the PDF
    doc.save(`receipt_${payment.id}.pdf`);
  };

  // Handle receipt generation
  const generateReceipt = (payment) => {
    generateReceiptPDF(payment);
  };

  // Chart colors
  const COLORS = {
    completed: '#2ecc71',
    pending: '#f39c12',
    failed: '#e74c3c'
  };

  const CHART_COLORS = ['#2ecc71', '#f39c12', '#e74c3c'];

  return (
    <div className="payment-management-container">
      <h1><FiDollarSign className="header-icon" /> Payment Management</h1>
      
      <div className="payment-management-header">
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button">
              <FiSearch className="search-icon" />
            </button>
          </div>
          
          <div className="filter-container">
            <label><FiAlertCircle className="filter-icon" /> Filter Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="filter-container">
            <label><FiBarChart2 className="filter-icon" /> Charts:</label>
            <button 
              className="modal-button" 
              style={{ marginLeft: '8px', padding: '6px 12px' }}
              onClick={() => setShowCharts(!showCharts)}
            >
              {showCharts ? 'Hide Charts' : 'Show Charts'}
            </button>
          </div>
        </div>
        
        <div className="payment-summary">
          <div className="summary-box">
            <h3><FiDollarSign className="summary-icon" /> Total Payments</h3>
            <p>{payments.length}</p>
          </div>
          <div className="summary-box success">
            <h3><FiCheckCircle className="summary-icon" /> Completed</h3>
            <p>{payments.filter(p => p.status === 'completed').length}</p>
          </div>
          <div className="summary-box warning">
            <h3><FiClock className="summary-icon" /> Pending</h3>
            <p>{payments.filter(p => p.status === 'pending').length}</p>
          </div>
          <div className="summary-box danger">
            <h3><FiAlertCircle className="summary-icon" /> Failed</h3>
            <p>{payments.filter(p => p.status === 'failed').length}</p>
          </div>
        </div>
      </div>
      
      {/* Chart section */}
      {showCharts && (
        <div style={{ marginBottom: '24px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBarChart2 /> Payment Analytics
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Payment Status Distribution */}
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#4a5568' }}>Payment Status Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData.status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} payments`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Monthly Payment Volume */}
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#4a5568' }}>Monthly Payment Volume</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData.monthly}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]} />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill={COLORS.completed} />
                  <Bar dataKey="pending" name="Pending" fill={COLORS.pending} />
                  <Bar dataKey="failed" name="Failed" fill={COLORS.failed} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Monthly Payment Amount */}
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#4a5568' }}>Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={chartData.monthly}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total Revenue" stroke="#3498db" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading payment data...</p>
        </div>
      ) : (
        <div className="payment-table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('customerName')}>
                  <FiUser className="header-icon" /> Customer {sortConfig.key === 'customerName' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('tourPackage')}>
                  <FiPackage className="header-icon" /> Tour Package {sortConfig.key === 'tourPackage' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('amount')}>
                  <FiDollarSign className="header-icon" /> Amount {sortConfig.key === 'amount' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('date')}>
                  <FiCalendar className="header-icon" /> Date {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('status')}>
                  Status {sortConfig.key === 'status' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className={`payment-row status-${payment.status}`}>
                    <td>{payment.customerName}</td>
                    <td>{payment.tourPackage}</td>
                    <td>${payment.amount.toFixed(2)}</td>
                    <td>{formatDate(payment.date)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-button view"
                        onClick={() => viewPaymentDetails(payment)}
                        title="View Details"
                      >
                        <FiEye className="action-icon" />
                      </button>
                      {payment.status === 'completed' && (
                        <button 
                          className="action-button receipt"
                          onClick={() => generateReceipt(payment)}
                          title="Generate Receipt"
                        >
                          <FiFileText className="action-icon" />
                        </button>
                      )}
                      <button 
                        className="action-button delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePayment(payment.id);
                        }}
                        title="Delete Payment"
                      >
                        <FiTrash2 className="action-icon" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="payment-details-modal">
            <div className="modal-header">
              <h2><FiDollarSign className="modal-header-icon" /> Payment Details</h2>
              <button className="close-button" onClick={() => setShowDetailsModal(false)}>
                <FiX className="close-icon" />
              </button>
            </div>
            <div className="modal-content">
              <div className="detail-row">
                <div className="detail-label">Payment ID:</div>
                <div className="detail-value">{selectedPayment.id}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Transaction ID:</div>
                <div className="detail-value">{selectedPayment.transactionId}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label"><FiUser className="detail-icon" /> Customer Name:</div>
                <div className="detail-value">{selectedPayment.customerName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{selectedPayment.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Phone:</div>
                <div className="detail-value">{selectedPayment.phone}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label"><FiPackage className="detail-icon" /> Tour Package:</div>
                <div className="detail-value">{selectedPayment.tourPackage}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Package ID:</div>
                <div className="detail-value">{selectedPayment.bookingId}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Number of Travelers:</div>
                <div className="detail-value">{selectedPayment.numberOfTravelers}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label"><FiDollarSign className="detail-icon" /> Amount:</div>
                <div className="detail-value">${selectedPayment.amount.toFixed(2)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label"><FiCalendar className="detail-icon" /> Date:</div>
                <div className="detail-value">{formatDate(selectedPayment.date)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`status-badge ${getStatusBadgeClass(selectedPayment.status)}`}>
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label"><FiCreditCard className="detail-icon" /> Payment Method:</div>
                <div className="detail-value">Credit/Debit Card</div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedPayment.status === 'completed' && (
                <button 
                  className="modal-button receipt"
                  onClick={() => generateReceipt(selectedPayment)}
                >
                  <FiFileText className="button-icon" /> Generate Receipt
                </button>
              )}
              <button 
                className="modal-button delete"
                onClick={() => deletePayment(selectedPayment.id)}
              >
                <FiTrash2 className="button-icon" /> Delete
              </button>
              <button 
                className="modal-button secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                <FiX className="button-icon" /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;