import axios from "axios";
import.meta.env.VITE_API_BASE;
const API_BASE = "http://103.14.120.41/api";
// const API_BASE = import.meta.env.VITE_API_BASE;
export const getSalesData = async () => {
  try {
    const response = await axios.get(`${API_BASE}/sales/create`);
    return response.data.sales;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }
};

export const getCustomers = async () => {
  try {
    const response = await fetch(`${API_BASE}/customers`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return [];
  }
};

export const getCustomerSalesHistory = async (customerPhone) => {
  try {
    const response = await axios.get(`${API_BASE}/sales/history/?phone=${customerPhone}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer sales history:", error);
    // It's good to return a structured error or default value
    // to prevent UI crashes.
    return {
      customer: { name: "Unknown", phone: customerPhone },
      history: [],
    };
  }
};
