import React, { useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import api from "../api/axiosConfig";

const PieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          "http://localhost:3000/admin/totalRevenue"
        );
        const { systemRevenue, driverIncome } = response.data;

        // Transform data into Nivo Pie Chart format
        const data = [
          {
            id: "Doanh Thu Hệ Thống",
            label: "Doanh Thu Hệ Thống",
            value: systemRevenue,
          },
          {
            id: "Doanh Thu Tài Xế",
            label: "Doanh Thu Tài Xế",
            value: driverIncome,
          },
        ];
        setChartData(data);
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    };

    fetchData();
  }, []);

  if (chartData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <ResponsivePie
      data={chartData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
              fontSize: "18px", // Tăng kích thước chữ trong legend
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        arcLinkLabels: {
          text: {
            fontSize: 22, // Tăng kích thước chữ liên kết (arc link labels)
            fill: colors.grey[100], // Màu chữ liên kết
          },
        },
        legends: {
          text: {
            fill: colors.primary[100],
            fontSize: "13px", // Tăng kích thước chữ trong legend
          },
        },
      }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLabelsSkipAngle={10}
      arcLabelsRadiusOffset={0.4}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      arcLabel={(datum) =>
        `${(
          (datum.value / chartData.reduce((acc, d) => acc + d.value, 0)) *
          100
        ).toFixed(2)}%`
      }
      arcLabelsTextSize={30} // Tăng kích thước chữ trên các miếng
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      tooltip={({ datum }) => (
        <div
          style={{
            background: colors.primary[400],
            padding: "10px 15px",
            borderRadius: "5px",
            color: colors.grey[100],
            fontSize: "18px", // Tăng kích thước chữ trong tooltip
          }}
        >
          <strong>{datum.label}</strong>: {datum.value.toLocaleString()} VND
        </div>
      )}
      colors={["#3b82f6", "#10b981", "#f97316"]}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 20,
          itemWidth: 150,
          itemHeight: 18,
          itemTextColor: "#FFFFFF", // Màu chữ chú thích thành màu trắng
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#CE723C", // Màu chữ khi hover
              },
            },
          ],
        },
      ]}
    />
  );
};

export default PieChart;
