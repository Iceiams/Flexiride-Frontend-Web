import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import axios from "axios";
import { format } from "date-fns";
import {
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  TextField,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import * as XLSX from "xlsx";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

const RevenueLineChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [filterType, setFilterType] = useState("month");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 6))
  ); // 6 tháng trước
  const [endDate, setEndDate] = useState(new Date()); // Hôm nay
  const [chartData, setChartData] = useState([]);
  const [totalSystemRevenue, setTotalSystemRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartUnit, setChartUnit] = useState("Ngàn VNĐ");

  const fetchRevenueData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("filterType", filterType);
      params.append("startDate", format(startDate, "yyyy-MM-dd"));
      params.append("endDate", format(endDate, "yyyy-MM-dd"));

      const response = await axios.get(
        `http://localhost:3000/admin/revenueLineStatistic?${params.toString()}`
      );

      if (
        !response.data ||
        !response.data.data ||
        response.data.data.length === 0
      ) {
        setChartData([]);
        setTotalSystemRevenue(0);
        setLoading(false);
        return;
      }

      const sortedData = response.data.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      const processedData = processChartData(sortedData);
      setChartData(processedData);
      setTotalSystemRevenue(response.data.totalSystemRevenue || 0);
      setLoading(false);
    } catch (err) {
      setError(err);
      setChartData([]);
      setTotalSystemRevenue(0);
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    if (!data || data.length === 0) {
      return [];
    }

    const serviceMap = {};

    try {
      data.forEach((item) => {
        if (item.services && Array.isArray(item.services)) {
          item.services.forEach((service) => {
            if (!service || !service.serviceName) return;

            const serviceName = service.serviceName;

            if (!serviceMap[serviceName]) {
              serviceMap[serviceName] = {
                id: serviceName,
                data: [],
              };
            }

            if (
              item.date &&
              service.systemRevenue !== undefined &&
              service.systemRevenue !== null
            ) {
              serviceMap[serviceName].data.push({
                x: new Date(item.date),
                y: Number(service.systemRevenue) || 0,
              });
            }
          });
        }
      });
    } catch (error) {
      console.error("Error processing chart data:", error);
      return [];
    }

    return Object.values(serviceMap);
  };
  const exportToExcel = () => {
    if (!chartData.length) {
      alert("Không có dữ liệu để xuất");
      return;
    }

    const excelData = chartData.flatMap((series) =>
      series.data.map((point) => ({
        "Tên Dịch Vụ": series.id,
        "Thời Gian": point.x,
        "Doanh Thu": point.y,
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh Thu");

    XLSX.writeFile(
      workbook,
      `Doanh_Thu_${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };

  useEffect(() => {
    fetchRevenueData();
  }, [filterType, startDate, endDate]);

  return (
    <Box sx={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}>
      {/* Bộ lọc */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <FormControl style={{ minWidth: 150 }}>
          <InputLabel>Loại thời gian</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Loại thời gian"
          >
            <MenuItem value="day">Ngày</MenuItem>
            <MenuItem value="month">Tháng</MenuItem>
            <MenuItem value="custom">Tùy chỉnh</MenuItem>
          </Select>
        </FormControl>
        {filterType === "custom" && (
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              type="date"
              label="Ngày bắt đầu"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="Ngày kết thúc"
              value={format(endDate, "yyyy-MM-dd")}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )}
        <Box>
          <Button
            variant="contained"
            onClick={fetchRevenueData}
            startIcon={<SearchIcon />}
            sx={{
              backgroundColor: "#4CAF50",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#388E3C",
              },
              minWidth: 130,
            }}
          >
            Tra cứu
          </Button>
          <Button
            variant="outlined"
            onClick={exportToExcel}
            startIcon={<FileDownloadIcon />}
            disabled={chartData.length === 0}
            sx={{
              color: "#4CAF50",
              borderColor: "#4CAF50",
              "&:hover": {
                borderColor: "#388E3C",
                backgroundColor: "#E8F5E9",
              },
              minWidth: 130,
            }}
          >
            Xuất Excel
          </Button>
        </Box>
      </Box>

      <Box sx={{ textAlign: "center", marginBottom: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.grey[100],
            fontSize: "14px",
            fontStyle: "italic",
          }}
        ></Typography>
      </Box>
      {/* Hiển thị loading hoặc lỗi */}
      {loading && (
        <Typography variant="body1" color="textSecondary" align="center">
          Đang tải dữ liệu...
        </Typography>
      )}
      {error && (
        <Typography variant="body1" color="error" align="center">
          Lỗi: {error.message}
        </Typography>
      )}

      {/* Phần render biểu đồ còn lại */}
      {!loading && !error && chartData.length > 0 ? (
        <Box sx={{ height: 550, position: "relative" }}>
          {/* Y-Axis Label */}
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              top: "1%",
              left: "0",
              transform: 0,
              textAlign: "center",
              color: colors.grey[100],
              fontSize: "14px",
            }}
          >
            Doanh Thu Hệ Thống ({chartUnit})
          </Typography>
          <Typography
            variant="h5"
            sx={{
              position: "absolute",
              top: "4%",
              left: "0",
              textAlign: "center",
              color: colors.greenAccent[400],
              fontSize: "16px",
            }}
          >
            Tổng: {totalSystemRevenue}
          </Typography>
          {/* X-Axis Label */}
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              bottom: "60px",
              left: "93%",
              transform: "translateX(-50%)",
              textAlign: "center",
              color: colors.grey[100],
              fontSize: "14px",
            }}
          >
            Thời gian
          </Typography>

          <ResponsiveLine
            data={chartData.length > 0 ? chartData : []} // Đảm bảo luôn có dữ liệu
            margin={{ top: 50, right: 110, bottom: 70, left: 60 }}
            xScale={{
              type: "time",
              format: filterType === "month" ? "%Y-%m" : "%Y-%m-%d",
              precision: filterType === "month" ? "month" : "day",
            }}
            axisBottom={{
              format: filterType === "month" ? "%m %Y" : "%d %b",
              tickRotation: -45,
              // legend: "Thời gian",
              // legendOffset: 50,
              // legendPosition: "middle",
            }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
            }}
            axisLeft={{
              format: (value) =>
                chartUnit === "Triệu VNĐ"
                  ? `${(value / 1000000).toFixed(1)}`
                  : `${(value / 1000).toFixed(0)}`,
            }}
            theme={{
              crosshair: {
                line: {
                  stroke: "#FF5722", // Đổi màu đường gióng thành màu cam (hoặc màu bạn muốn)
                  strokeWidth: 1, // Độ dày của đường gióng
                  strokeDasharray: "6 6", // Kiểu nét đứt
                },
              },
              grid: {
                line: {
                  stroke: "#FFFFFF",
                  strokeDasharray: "4 4",
                },
              },
              axis: {
                domain: {
                  line: {
                    stroke: "#FFFFFF",
                  },
                },
                ticks: {
                  line: {
                    stroke: "#FFFFFF",
                  },
                  text: {
                    fill: "#F4F4F4",
                  },
                },
              },
            }}
            pointSize={10}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointColor={{ theme: "background" }}
            enableGridX={false}
            enableGridY={true}
            useMesh={true}
            legends={[
              {
                anchor: "bottom", // Vị trí của chú thích
                direction: "row", // Sắp xếp theo hàng ngang
                justify: false,
                translateX: 0,
                translateY: 70, // Khoảng cách từ biểu đồ đến chú thích
                itemsSpacing: 10, // Khoảng cách giữa các mục
                itemDirection: "left-to-right",
                itemWidth: 120,
                itemHeight: 20,
                itemTextColor: "#EDEDED",
                symbolSize: 15, // Kích thước biểu tượng
                symbolShape: "circle", // Hình dạng biểu tượng
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#FFFFFF",
                    },
                  },
                ],
              },
            ]}
            tooltip={({ point }) => {
              // Dữ liệu từ `point`
              const { serieId, data } = point;

              const formattedRevenue = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                minimumFractionDigits: 0,
              }).format(data.y);

              return (
                <div
                  style={{
                    background: "#333",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "5px",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <strong>{serieId}</strong>
                  <br />
                  Thời gian: {format(new Date(data.x), "dd/MM/yyyy")}
                  <br />
                  Doanh thu: {formattedRevenue}
                </div>
              );
            }}
          />
        </Box>
      ) : (
        <Typography variant="body1" color="textSecondary" align="center">
          Không có dữ liệu cho khoảng thời gian được chọn
        </Typography>
      )}
    </Box>
  );
};

export default RevenueLineChart;
