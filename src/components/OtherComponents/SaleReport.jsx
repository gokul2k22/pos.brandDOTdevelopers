import React, { useEffect, useState } from "react";
import { getSalesData } from "../services/api";
// import { exportToExcel } from "../utils/export";
import { format } from "date-fns";
import "./SalesReport.css";

const SaleReport = () => {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("today");

  const [currentDateString, setCurrentDateString] = useState(format(new Date(), "yyyy-MM-dd"));

  const [cashTotal, setCashTotal] = useState(0);
  const [upiTotal, setUpiTotal] = useState(0);
  const [cardTotal, setCardTotal] = useState(0);

  const [salesCount, setSalesCount] = useState(0);

  useEffect(() => {
    setCurrentDateString(format(new Date(), "yyyy-MM-dd"));
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeToTomorrow = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setCurrentDateString(format(new Date(), "yyyy-MM-dd"));
      setInterval(() => setCurrentDateString(format(new Date(), "yyyy-MM-dd")), 1000 * 60 * 60 * 24);
    }, timeToTomorrow + 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    getSalesData()
      .then((data) => {
        let salesArray = [];
        if (Array.isArray(data)) {
          salesArray = data;
        } else if (data && Array.isArray(data.sales)) {
          salesArray = data.sales;
        } else if (data && Array.isArray(data.data)) {
          salesArray = data.data;
        } else {
          console.error("API response is not a valid array or object containing an array:", data);
          setLoading(false);
          alert("Failed to load sales history. Invalid data format received.");
          return;
        }

        const validSales = salesArray.filter(
          (sale) =>
            sale &&
            (sale.id || sale.customer_name || (Array.isArray(sale.sale_details) && sale.sale_details.length > 0))
        );

        const sortedSales = [...validSales].sort((a, b) => {
          const idA = a.id || 0;
          const idB = b.id || 0;
          return idB - idA;
        });

        setSales(sortedSales);
        setFiltered(sortedSales);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching sales:", error);
        setLoading(false);
        alert("Failed to load sales history. Please check the network connection.");
      });
  }, []);

  useEffect(() => {
    const filterAndCalculateTotals = () => {
      let result = sales;

      if (view === "today") {
        result = result.filter((sale) => sale.sale_date?.slice(0, 10) === currentDateString);
        setSearch("");
        setDateFilter("");
        setPaymentMethodFilter("");
      } else {
        if (search.trim() !== "") {
          result = result.filter((sale) => sale.customer_name?.toLowerCase().includes(search.toLowerCase()));
        }
        if (dateFilter) {
          result = result.filter((sale) => sale.sale_date?.slice(0, 10) === dateFilter);
        }
        if (paymentMethodFilter) {
          result = result.filter((sale) => sale.payment_method === paymentMethodFilter);
        }
      }

      setFiltered(result);
      setSalesCount(result.length);

      let currentCashTotal = 0;
      let currentUpiTotal = 0;
      let currentCardTotal = 0;

      result.forEach((sale) => {
        const amount = parseFloat(sale.total_amount || 0);
        switch (sale.payment_method) {
          case "Cash":
            currentCashTotal += amount;
            break;
          case "UPI":
            currentUpiTotal += amount;
            break;
          case "Card":
            currentCardTotal += amount;
            break;
          default:
            break;
        }
      });

      setCashTotal(currentCashTotal);
      setUpiTotal(currentUpiTotal);
      setCardTotal(currentCardTotal);
    };

    filterAndCalculateTotals();
  }, [sales, search, dateFilter, paymentMethodFilter, view, currentDateString]);

  const getTotalQty = (details) =>
    Array.isArray(details) ? details.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

  // --- REWRITTEN getProductList FUNCTION ---
  const getProductList = (details) =>
    Array.isArray(details) && details.length > 0
      ? details
          .map((item) => {
            const productName = item.product_name || item.manual_product_name || "Unknown";
            const productPrice = parseFloat(item.price || 0).toFixed(2);
            const productQuantity = item.quantity || 0;

            return `${productName} (₹${productPrice}) x ${productQuantity}`;
          })
          .join(", ")
      : "No products";

  //   const exportExcelData = filtered.map((sale) => {
  //     const formattedDate =
  //       sale.sale_date && !isNaN(new Date(sale.sale_date)) ? format(new Date(sale.sale_date), "dd/MM/yyyy") : "N/A";

  //     return {
  //       ID: sale.id || "-",
  //       Customer: sale.customer_name || "Guest",
  //       Products: getProductList(sale.sale_details), // Uses the updated function
  //       Quantity: getTotalQty(sale.sale_details),
  //       GrandTotal: parseFloat(sale.total_amount || 0).toFixed(2),
  //       "Payment Mode": sale.payment_method || "N/A",
  //       Date: formattedDate,
  //     };
  //   });

  const totalSales = filtered.reduce((total, sale) => total + (parseFloat(sale.total_amount) || 0), 0);
  const totalSalesFormatted = !isNaN(totalSales) ? totalSales.toFixed(2) : "0.00";

  return (
    <div className="sales-history">
      <h2 className="title">Sales History</h2>

      <div className="button-group">
        <button className={`btn ${view === "today" ? "active" : ""}`} onClick={() => setView("today")}>
          Today
        </button>
        <button className={`btn ${view === "all" ? "active" : ""}`} onClick={() => setView("all")}>
          All
        </button>
      </div>

      <div className="sales-summary">
        {view === "today" && (
          <p className="sales-count">
            <strong>Today's Sales Count:</strong> {salesCount}
          </p>
        )}
        <p>
          <strong>Total Sales:</strong> ₹{totalSalesFormatted}
        </p>
        <p>
          <strong>Cash Sales:</strong> ₹{cashTotal.toFixed(2)}
        </p>
        <p>
          <strong>UPI Sales:</strong> ₹{upiTotal.toFixed(2)}
        </p>
        <p>
          <strong>Card Sales:</strong> ₹{cardTotal.toFixed(2)}
        </p>
      </div>

      {view === "all" && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by customer name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
          <div className="date-filter-group">
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input" />
            {dateFilter && (
              <span className="date-sales-count">
                <strong>Sales Count:</strong> {salesCount}
              </span>
            )}
          </div>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="input select-filter"
          >
            <option value="">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
          <button
            className="btn clear-btn"
            onClick={() => {
              setSearch("");
              setDateFilter("");
              setPaymentMethodFilter("");
            }}
          >
            Clear
          </button>
          {/* <div className="export-wrapper">
            <button onClick={() => exportToExcel(exportExcelData, "Sales_History")} className="btn export-excel">
              Export Excel
            </button>
          </div> */}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No matching records found.</p>
      ) : (
        <div className="table-container-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Payment Mode</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale) => (
                <tr key={sale.id || Math.random().toString(36).substr(2, 9)}>
                  <td>{sale.id || "-"}</td>
                  <td>{sale.customer_name || "Guest"}</td>
                  <td>{getProductList(sale.sale_details)}</td>
                  <td className="text-right">{getTotalQty(sale.sale_details)}</td>
                  <td className="text-right">₹{parseFloat(sale.total_amount || 0).toFixed(2)}</td>
                  <td>{sale.payment_method || "N/A"}</td>
                  <td>
                    {sale.sale_date && !isNaN(new Date(sale.sale_date))
                      ? format(new Date(sale.sale_date), "dd/MM/yyyy")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SaleReport;
