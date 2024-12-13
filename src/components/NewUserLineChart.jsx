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

const NewUserLineChart = () => {
  const [chartData, setChartData] = useState([]);

  // Gọi API để lấy dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/getCustomerRegistrationsLastMonth");
        const { data } = response.data;

        // Định dạng dữ liệu cho Recharts
        const formattedData = data.map((item) => ({
          date: item.date,
          count: item.count,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching customer registration data:", error);
      }
    };

    fetchData();
  }, []);

  if (chartData.length === 0) {
    return <div>Loading...</div>;
  }

  // Custom Tooltip Component
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
            Số Lượng: {payload[0].value}
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
        {/* Đường lưới mờ hơn */}
        <CartesianGrid stroke="#f3f4f6" strokeDasharray="2 2" />

        {/* Số hiển thị màu sáng hơn */}
        <XAxis
          dataKey="date"
          stroke="#d1d5db"
          tick={{
            fontSize: 12,
            fill: "#f9fafb", // Màu sáng hơn cho thời gian
          }}
        />
        <YAxis
          stroke="#d1d5db"
          tick={{
            fontSize: 12,
            fill: "#f9fafb", // Màu sáng hơn cho trục Y
          }}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* Đường biểu đồ màu sáng */}
        <Line
          type="monotone"
          dataKey="count"
          stroke="#3b82f6" // Màu sáng hơn
          strokeWidth={2}
          activeDot={{ r: 10 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NewUserLineChart;
