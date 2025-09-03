import React, { useState, useEffect } from "react";
import { getSalesData } from "../services/api";
import "./Dashboard.css"; // Assuming you'll have a CSS file for styling
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

// Helper function to process data for the dashboard
const processDashboardData = (sales) => {
  if (!sales || sales.length === 0) {
    return {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      bestSellingDay: { date: "-", value: 0 },
      paymentMethods: [],
      salesTrend: [],
    };
  }

  let totalSales = 0;
  const salesByDate = {};
  const paymentMethodCounts = {};

  sales.forEach((sale) => {
    const totalAmount = parseFloat(sale.total_amount);
    totalSales += totalAmount;

    // Use toLocaleDateString with options for consistent, sortable date
    const saleDate = format(new Date(sale.sale_date), "yyyy-MM-dd");
    if (!salesByDate[saleDate]) {
      salesByDate[saleDate] = 0;
    }
    salesByDate[saleDate] += totalAmount;

    const method = sale.payment_method;
    if (!paymentMethodCounts[method]) {
      paymentMethodCounts[method] = 0;
    }
    paymentMethodCounts[method] += 1;
  });

  const totalOrders = sales.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  let bestSellingDay = { date: "-", value: 0 };
  for (const date in salesByDate) {
    if (salesByDate[date] > bestSellingDay.value) {
      bestSellingDay = { date: date, value: salesByDate[date] };
    }
  }

  const paymentMethods = Object.keys(paymentMethodCounts).map((key) => ({
    name: key,
    value: paymentMethodCounts[key],
  }));

  const salesTrend = Object.keys(salesByDate)
    .map((date) => ({
      date: date,
      sales: salesByDate[date],
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    bestSellingDay,
    paymentMethods,
    salesTrend,
  };
};

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

const Dashboard = () => {
  const [allSalesData, setAllSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for today's data
  const [todaySales, setTodaySales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSalesData();
        setAllSalesData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Filter for today's sales whenever allSalesData changes
    const today = format(new Date(), "yyyy-MM-dd");
    const filteredTodaySales = allSalesData.filter((sale) => format(new Date(sale.sale_date), "yyyy-MM-dd") === today);
    setTodaySales(filteredTodaySales);
  }, [allSalesData]);

  // Process data for charts and "Best Selling Day" using all sales
  const { bestSellingDay, paymentMethods, salesTrend } = processDashboardData(allSalesData);

  // Calculate today's metrics
  const todayTotalSales = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const todayTotalOrders = todaySales.length;
  const todayAverageOrderValue = todayTotalOrders > 0 ? todayTotalSales / todayTotalOrders : 0;

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  return (
    <div className="dashboard-container">
      <div className="header">
        <h1 className="dashboard-title">
          <span role="img" aria-label="pizza-emoji">
            🍕
          </span>{" "}
          Sales Dashboard
        </h1>
      </div>

      <div className="card-container">
        <div className="card">
          <div className="card-icon">💲</div>
          <p className="card-label">Today's Sales</p>
          <p className="card-value">₹ {todayTotalSales.toFixed(2)}</p>
        </div>
        <div className="card">
          <div className="card-icon">🛒</div>
          <p className="card-label">Today's Orders</p>
          <p className="card-value">{todayTotalOrders}</p>
        </div>
        <div className="card">
          <div className="card-icon">📊</div>
          <p className="card-label">Average Order Value (Today)</p>
          <p className="card-value">₹ {todayAverageOrderValue.toFixed(2)}</p>
        </div>
        <div className="card">
          <div className="card-icon">📅</div>
          <p className="card-label">Best Selling Day</p>
          <p className="card-value">{bestSellingDay.date}</p>
          <p className="card-sub-value">₹ {bestSellingDay.value.toFixed(2)}</p>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <h2>Payment Methods</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentMethods}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {paymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {paymentMethods.map((method, index) => (
              <div key={index} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {method.name}: {method.value} ({((method.value / allSalesData.length) * 100).toFixed(1)}%)
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h2>Sales Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// import React, { useState, useEffect } from "react";
// import { getSalesData } from "../services/api";
// import "./Dashboard.css"; // Assuming you'll have a CSS file for styling
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// // Helper function to process data for the dashboard
// const processDashboardData = (sales) => {
//   if (!sales || sales.length === 0) {
//     return {
//       totalSales: 0,
//       totalOrders: 0,
//       averageOrderValue: 0,
//       bestSellingDay: { date: "-", value: 0 },
//       paymentMethods: [],
//       salesTrend: [],
//     };
//   }

//   let totalSales = 0;
//   const salesByDate = {};
//   const paymentMethodCounts = {};

//   sales.forEach((sale) => {
//     const totalAmount = parseFloat(sale.total_amount);
//     totalSales += totalAmount;

//     const saleDate = new Date(sale.sale_date).toLocaleDateString("en-GB"); // Use a consistent date format
//     if (!salesByDate[saleDate]) {
//       salesByDate[saleDate] = 0;
//     }
//     salesByDate[saleDate] += totalAmount;

//     const method = sale.payment_method;
//     if (!paymentMethodCounts[method]) {
//       paymentMethodCounts[method] = 0;
//     }
//     paymentMethodCounts[method] += 1;
//   });

//   const totalOrders = sales.length;
//   const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

//   let bestSellingDay = { date: "-", value: 0 };
//   for (const date in salesByDate) {
//     if (salesByDate[date] > bestSellingDay.value) {
//       bestSellingDay = { date: date, value: salesByDate[date] };
//     }
//   }

//   const paymentMethods = Object.keys(paymentMethodCounts).map((key) => ({
//     name: key,
//     value: paymentMethodCounts[key],
//   }));

//   const salesTrend = Object.keys(salesByDate)
//     .map((date) => ({
//       date: date,
//       sales: salesByDate[date],
//     }))
//     .sort((a, b) => new Date(a.date) - new Date(b.date));

//   return {
//     totalSales,
//     totalOrders,
//     averageOrderValue,
//     bestSellingDay,
//     paymentMethods,
//     salesTrend,
//   };
// };

// const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

// const Dashboard = () => {
//   const [salesData, setSalesData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getSalesData();
//       setSalesData(data);
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   const { totalSales, totalOrders, averageOrderValue, bestSellingDay, paymentMethods, salesTrend } =
//     processDashboardData(salesData);

//   if (loading) {
//     return <div className="loading-container">Loading...</div>;
//   }
//   return (
//     <div className="dashboard-container">
//       <div className="header">
//         <h1 className="dashboard-title">
//           <span role="img" aria-label="pizza-emoji">
//             🍕
//           </span>{" "}
//           Sales Dashboard
//         </h1>
//       </div>

//       <div className="card-container">
//         <div className="card">
//           <div className="card-icon">💲</div>
//           <p className="card-label">Total Sales</p>
//           <p className="card-value">₹ {totalSales.toFixed(2)}</p>
//         </div>
//         <div className="card">
//           <div className="card-icon">🛒</div>
//           <p className="card-label">Total Orders</p>
//           <p className="card-value">{totalOrders}</p>
//         </div>
//         <div className="card">
//           <div className="card-icon">📊</div>
//           <p className="card-label">Average Order Value</p>
//           <p className="card-value">₹ {averageOrderValue.toFixed(2)}</p>
//         </div>
//         <div className="card">
//           <div className="card-icon">📅</div>
//           <p className="card-label">Best Selling Day</p>
//           <p className="card-value">{bestSellingDay.date}</p>
//           <p className="card-sub-value">₹ {bestSellingDay.value.toFixed(2)}</p>
//         </div>
//       </div>

//       <div className="chart-section">
//         <div className="chart-card">
//           <h2>Payment Methods</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={paymentMethods}
//                 dataKey="value"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 fill="#8884d8"
//                 label
//               >
//                 {paymentMethods.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//           <div className="chart-legend">
//             {paymentMethods.map((method, index) => (
//               <div key={index} className="legend-item">
//                 <span className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
//                 {method.name}: {method.value} ({((method.value / totalOrders) * 100).toFixed(1)}%)
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="chart-card">
//           <h2>Sales Trend</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={salesTrend}>
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="sales" fill="#82ca9d" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
