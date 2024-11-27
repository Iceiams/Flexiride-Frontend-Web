import React, { useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const RevenueLineChart = () => {
  const [filterType, setFilterType] = useState("month");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch revenue data
  const fetchRevenueData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("filterType", filterType);
      if (startDate)
        params.append("startDate", format(startDate, "yyyy-MM-dd"));
      if (endDate) params.append("endDate", format(endDate, "yyyy-MM-dd"));

      const response = await axios.get(
        `http://localhost:3000/admin/revenueLineStatistic?${params.toString()}`
      );

      const processedData = processChartData(response.data.data);
      setChartData(processedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError(err);
      setLoading(false);
    }
  };

  // Process chart data
  const processChartData = (data) => {
    const serviceMap = {};

    data.forEach((item) => {
      item.services.forEach((service) => {
        const serviceName = service.serviceName;

        if (!serviceMap[serviceName]) {
          serviceMap[serviceName] = {
            id: serviceName,
            color: getRandomColor(),
            data: [],
          };
        }

        const systemRevenue = parseFloat(
          service.systemRevenue.replace(/[^0-9.-]+/g, "")
        );

        serviceMap[serviceName].data.push({
          x: item.date,
          y: systemRevenue,
        });
      });
    });

    // Sort data by date for each service
    Object.values(serviceMap).forEach((service) => {
      service.data.sort((a, b) => new Date(a.x) - new Date(b.x));
    });

    return Object.values(serviceMap);
  };

  // Generate random colors
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Thống Kê Doanh Thu
      </h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {/* Filter type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="day">Ngày</option>
          <option value="month">Tháng</option>
        </select>

        {/* Start date */}
        <ReactDatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Ngày bắt đầu"
          dateFormat="yyyy-MM-dd"
          style={{
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        {/* End date */}
        <ReactDatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="Ngày kết thúc"
          dateFormat="yyyy-MM-dd"
          style={{
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        {/* Search button */}
        <button
          onClick={fetchRevenueData}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Tra cứu
        </button>
      </div>

      {/* Loading/Error */}
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error.message}</p>}

      {/* Chart */}
      {!loading && !error && chartData.length > 0 && (
        <div style={{ height: "500px" }}>
          <ResponsiveLine
            data={chartData}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "time", format: "%Y-%m-%d", precision: "day" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            axisBottom={{
              format: "%d",
              tickValues: "every 1 days",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Thời Gian",
              legendOffset: 36,
              legendPosition: "middle",
              legendTextStyle: { fill: "#2196F3" },
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Doanh Thu Hệ Thống (VND)",
              legendOffset: -40,
              legendPosition: "middle",
              legendTextStyle: { fill: "#2196F3" },
            }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: "#F4F4F4", // Tick labels color
                  },
                },
                legend: {
                  text: {
                    fill: "#F4F4F4", // Legend text color
                  },
                },
              },
            }}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            useMesh={true}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      )}

      {/* No data */}
      {!loading && !error && chartData.length === 0 && (
        <p style={{ textAlign: "center", color: "gray" }}>
          Không có dữ liệu để hiển thị
        </p>
      )}
    </div>
  );
};

export default RevenueLineChart;
