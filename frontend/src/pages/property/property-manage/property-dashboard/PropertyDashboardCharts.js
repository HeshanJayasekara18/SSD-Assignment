// PropertyDashboardCharts.js
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';
import './PropertyDashboardCharts.css';

const pieData = [
  { name: 'Active Properties', value: 19 },
  { name: 'Pending Properties', value: 5 },
];

const COLORS = ['#10b981', '#f59e0b'];

const barData = [
  { name: 'Total', total: 24 },
  { name: 'Active', active: 19 },
  { name: 'Pending', pending: 5 },
];

function PropertyDashboardCharts({ onClose }) {
  return (
    <motion.div 
      className="t-chart-modal-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="t-chart-title">Properties Overview</h2>

      <div className="t-chart-grid">
        <PieChart width={300} height={300}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>

        <BarChart width={350} height={300} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#4f46e5" />
          <Bar dataKey="active" fill="#10b981" />
          <Bar dataKey="pending" fill="#f59e0b" />
        </BarChart>
      </div>

      <div className="t-chart-stats">
        <div className="t-stat-box">
          <h3>24</h3>
          <p>Total Properties</p>
        </div>
        <div className="t-stat-box">
          <h3>19</h3>
          <p>Active</p>
        </div>
        <div className="t-stat-box">
          <h3>5</h3>
          <p>Pending</p>
        </div>
      </div>

      <div className="t-manage-button">
        <button onClick={onClose}>Close</button>
      </div>
    </motion.div>
  );
}

export default PropertyDashboardCharts;
