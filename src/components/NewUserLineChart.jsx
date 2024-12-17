import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axiosConfig";
import axios from "axios";

const NewUserLineChart = () => {
  const [chartData, setChartData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          // "http://localhost:3000/admin/getServiceUsageTrends"
          "https://flexiride.onrender.com/admin/getServiceUsageTrends"
        );
        const { data } = response.data;

        const formattedData = data.map((item) => ({
          date: item.date,
          count: item.count,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching service usage data:", error);
        if (error.response) {
          setErrorMessage(
            `Lỗi từ server: ${error.response.status} - ${
              error.response.data.error || "Không xác định"
            }`
          );
        } else if (error.request) {
          setErrorMessage("Không thể kết nối đến server. Vui lòng thử lại.");
        } else {
          setErrorMessage(`Đã xảy ra lỗi: ${error.message}`);
        }
      }
    };

    fetchData();
  }, []);

  if (errorMessage) {
    return (
      <div style={{ color: "red", textAlign: "center" }}>{errorMessage}</div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#9CA3AF" }}>
        Không có dữ liệu để hiển thị.
      </div>
    );
  }
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "10px 15px",
            border: "1px solid #d1d5db",
            borderRadius: "5px",
            color: "#374151",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>Ngày: {label}</p>
          <p style={{ margin: 0, color: "#3b82f6" }}>
            Số lượt sử dụng thành công: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid stroke="#f3f4f6" strokeDasharray="2 2" />

        <XAxis
          dataKey="date"
          stroke="#d1d5db"
          tick={{
            fontSize: 12,
            fill: "#f9fafb",
          }}
          tickFormatter={(tick) => {
            // Chỉ hiển thị MM-DD
            return tick;
          }}
        />

        <Tooltip content={<CustomTooltip />} />

        <Line
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          strokeWidth={2}
          activeDot={{ r: 10 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NewUserLineChart;
