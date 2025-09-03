import React, { useState, useEffect } from "react";
import { getCustomers } from "../services/api";
import { format } from "date-fns";
import "./Customer.css"; // CSS file for styling

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm)
  );

  return (
    <div className="customers-container">
      <h1 className="customers-title">Customer List</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-message">Loading...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="no-data-message">No customers found.</div>
      ) : (
        <div className="table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td data-label="ID">{customer.id}</td>
                  <td data-label="Name">{customer.first_name}</td>
                  <td data-label="Phone">{customer.phone}</td>
                  <td data-label="Created Date">{format(new Date(customer.created_at), "dd/MM/yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;
