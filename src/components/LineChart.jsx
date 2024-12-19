import React, { useState, useEffect, useCallback } from "react";
import { ResponsiveBar } from "@nivo/bar";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import ExcelJS from "exceljs";

const RevenueChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [filterType, setFilterType] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [totalSystemRevenue, setTotalSystemRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isApplyClicked, setIsApplyClicked] = useState(false);

  const fetchRevenueData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const params = { filterType };
      if (filterType === "custom") {
        if (!startDate || !endDate) {
          setError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
          setLoading(false);
          return;
        }

        if (new Date(startDate) > new Date(endDate)) {
          setError("Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
          setLoading(false);
          return;
        }

        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get(
        "https://flexiride.onrender.com/admin/revenueLineStatistic",
        // "http://localhost:3000/admin/revenueLineStatistic",
        { params }
      );

      const data = response.data.data;
      const processedData = processChartData(data);

      setChartData(processedData);
      setTotalSystemRevenue(response.data.totalSystemRevenue || "0 ₫");
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu doanh thu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setIsApplyClicked(false);
    }
  }, [filterType, startDate, endDate]);

  const processChartData = (data) => {
    const result = [];
    const serviceNames = new Set();

    data.forEach((item) => {
      let formattedDate = item.date;

      if (filterType === "day") {
        const date = new Date(item.date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        formattedDate = `${day}-${month}`;
      } else if (filterType === "month") {
        const [year, month] = item.date.split("-");
        formattedDate = `${year}-${month}`;
      }

      const row = { date: formattedDate };
      item.services.forEach((service) => {
        serviceNames.add(service.serviceName);
        row[service.serviceName] = service.systemRevenue || 0;
      });
      result.push(row);
    });

    return result.map((row) => {
      serviceNames.forEach((name) => {
        if (!row[name]) {
          row[name] = 0;
        }
      });
      return row;
    });
  };

  const exportToExcel = () => {
    if (!chartData.length) {
      alert("Không có dữ liệu để xuất");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Doanh Thu");

    worksheet.mergeCells("A1:C1");
    const mainTitle = worksheet.getCell("A1");
    mainTitle.value = "BÁO CÁO DOANH THU HỆ THỐNG";
    mainTitle.alignment = { horizontal: "center", vertical: "middle" };
    mainTitle.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    mainTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1F4E78" },
    };

    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      "Thời Gian",
      "Tên Dịch Vụ",
      "Doanh Thu (VNĐ)",
    ]);

    let grandTotal = 0;
    let startRow = 3;

    chartData.forEach((series) => {
      const date = series.date;

      const services = Object.entries(series).filter(([key]) => key !== "date");
      const serviceCount = services.length;

      worksheet.mergeCells(`A${startRow}:A${startRow + serviceCount - 1}`);
      worksheet.getCell(`A${startRow}`).value = date;
      worksheet.getCell(`A${startRow}`).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      let totalForDate = 0;

      services.forEach(([serviceName, value], index) => {
        worksheet.getCell(`B${startRow + index}`).value = serviceName;
        worksheet.getCell(`C${startRow + index}`).value = value;
        worksheet.getCell(`C${startRow + index}`).alignment = {
          horizontal: "right",
        };
        totalForDate += value;
      });

      worksheet.getCell(`B${startRow + serviceCount}`).value = "Tổng";
      worksheet.getCell(`B${startRow + serviceCount}`).font = {
        bold: true,
        color: { argb: "FF0000" },
      };
      worksheet.getCell(`C${startRow + serviceCount}`).value = totalForDate;
      worksheet.getCell(`C${startRow + serviceCount}`).font = {
        bold: true,
        color: { argb: "FF0000" },
      };
      worksheet.getCell(`C${startRow + serviceCount}`).alignment = {
        horizontal: "right",
      };

      grandTotal += totalForDate;
      startRow += serviceCount + 1;
    });

    worksheet.addRow([]);
    const grandTotalRow = worksheet.addRow([
      "Tổng doanh thu toàn bộ",
      "",
      grandTotal,
    ]);
    grandTotalRow.font = { bold: true, size: 12, color: { argb: "FF0000" } };
    grandTotalRow.alignment = { horizontal: "right" };

    worksheet.columns = [
      { width: 20 }, // Thời Gian
      { width: 30 }, // Tên Dịch Vụ
      { width: 20 }, // Doanh Thu
    ];

    // Xuất file Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Doanh_Thu_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
    });
  };

  useEffect(() => {
    if (filterType !== "custom" || isApplyClicked) {
      fetchRevenueData();
      setIsApplyClicked(false);
    }
  }, [filterType, isApplyClicked]);

  const serviceKeys =
    chartData.length > 0
      ? Object.keys(chartData[0]).filter((key) => key !== "date")
      : [];

  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN");
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box
          sx={{
            backgroundColor: colors.primary[400],
            color: colors.greenAccent[400],
            borderRadius: "8px",
            padding: "16px",
            boxShadow: 3,
            textAlign: "center",
            mb: 3,
            marginTop: "40px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "500",
              fontSize: "17px",
              textTransform: "uppercase",
            }}
          >
            Tổng Doanh Thu Hệ Thống
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontSize: "28px",
              color: colors.greenAccent[500],
              marginTop: "8px",
            }}
          >
            {totalSystemRevenue}
          </Typography>
        </Box>

        {/* Bộ lọc và nút */}
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          sx={{
            marginTop: "40px",
          }}
        >
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <MenuItem value="day">Tháng</MenuItem>
            <MenuItem value="month">Năm</MenuItem>
            <MenuItem value="custom">Tùy chỉnh</MenuItem>
          </Select>
          {filterType === "custom" && (
            <>
              <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                label="Ngày bắt đầu"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                label="Ngày kết thúc"
                InputLabelProps={{ shrink: true }}
              />
              <Button onClick={fetchRevenueData} variant="contained">
                Áp dụng
              </Button>
            </>
          )}
          <Button
            variant="contained"
            onClick={exportToExcel}
            style={{ backgroundColor: "#4CAF50", color: "white" }}
          >
            Xuất Excel
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <Box position="relative" height="500px">
          <Typography
            style={{
              position: "absolute",
              top: "10px",
              left: "40px",
              transform: "translate(20%, 0)",
              textAlign: "center",
              fontSize: "15px",
              color: colors.grey[100],
            }}
          >
            Tổng doanh thu (VNĐ)
          </Typography>

          <Typography
            style={{
              position: "absolute",
              bottom: "90px",
              right: "90px",
              textAlign: "center",
              fontSize: "15px",
              color: colors.grey[100],
            }}
          >
            Thời gian
          </Typography>

          <ResponsiveBar
            data={chartData}
            keys={serviceKeys}
            indexBy="date"
            margin={{ top: 50, right: 180, bottom: 100, left: 180 }}
            padding={0.3}
            groupMode="grouped"
            axisBottom={{
              tickSize: 5,
              tickPadding: 10,
              tickRotation: 0,
              legend: "",
              format: (value) => value,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              legend: "",
              format: (value) => formatCurrency(value),
            }}
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 90,
                itemsSpacing: 40,
                itemWidth: 120,
                itemHeight: 10,
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSpacing: 30,
                symbolShape: ({ x, y, fill, width, height }) => (
                  <rect
                    x={x}
                    y={y + 6}
                    width={40}
                    height={10}
                    fill={fill}
                    rx={2}
                    ry={2}
                  />
                ),
                textColor: "#FFFFFF",
              },
            ]}
            tooltip={({ id, value, indexValue }) => (
              <div
                style={{
                  padding: "10px",
                  background: "#333",
                  color: "#fff",
                }}
              >
                <strong>{id}</strong>: {value.toLocaleString("vi-VN")} VNĐ
                <br />
                Thời gian: {indexValue}
              </div>
            )}
            label={null}
            animate={true}
            theme={{
              axis: {
                ticks: {
                  line: {
                    stroke: "#777",
                    strokeWidth: 1,
                  },
                  text: {
                    fontSize: 13,
                    fill: "#FFFFFF",
                  },
                },
              },
              legends: {
                text: {
                  fill: "#FFFFFF",
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default RevenueChart;
