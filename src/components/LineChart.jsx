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
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import * as XLSX from "xlsx";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import ExcelJS from "exceljs";

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

  const [validationError, setValidationError] = useState(null);

  const validateDateRange = () => {
    // Check if custom filter type is selected
    if (filterType === "custom") {
      // Check if start or end date is empty
      if (!startDate || !endDate) {
        setValidationError(
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc."
        );
        return false;
      }

      // Check if start date is after end date
      if (new Date(startDate) > new Date(endDate)) {
        setValidationError(
          "Phạm vi ngày tùy chỉnh không hợp lệ. Ngày bắt đầu phải trước ngày kết thúc."
        );
        return false;
      }
    }

    // Clear any previous validation errors
    setValidationError(null);
    return true;
  };

  const fetchRevenueData = async () => {
    if (!validateDateRange()) {
      return;
    }

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

      // Tính toán giá trị lớn nhất trong dữ liệu và cập nhật chartUnit
      const allRevenueValues = processedData.flatMap((service) =>
        service.data.map((point) => point.y)
      );
      const maxRevenueValue = Math.max(...allRevenueValues);

      if (maxRevenueValue >= 1000000) {
        setChartUnit("Triệu VNĐ");
      } else {
        setChartUnit("Ngàn VNĐ");
      }

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Doanh Thu");

    // Thêm tiêu đề chính
    worksheet.mergeCells("A1:B1"); // Gộp cột
    const mainTitle = worksheet.getCell("A1");
    mainTitle.value = "BÁO CÁO DOANH THU HỆ THỐNG";
    mainTitle.alignment = { horizontal: "center", vertical: "middle" };
    mainTitle.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    mainTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1F4E78" },
    };

    worksheet.addRow([]); // Dòng trống

    let grandTotal = 0;

    // Vòng lặp qua từng dịch vụ
    chartData.forEach((series) => {
      const serviceTotal = series.data.reduce((sum, point) => sum + point.y, 0);
      grandTotal += serviceTotal;

      // Thêm tiêu đề dịch vụ
      const serviceTitleRow = worksheet.addRow([`Tên Dịch Vụ: ${series.id}`]);
      serviceTitleRow.font = {
        bold: true,
        size: 14,
        color: { argb: "FFFFFFFF" },
      };
      serviceTitleRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4CAF50" }, // Màu xanh lá
      };

      // Thêm tiêu đề cột
      const headerRow = worksheet.addRow(["Thời Gian", "Doanh Thu (VNĐ)"]);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2196F3" }, // Màu xanh dương
      };
      headerRow.alignment = { horizontal: "center" };

      // Thêm chi tiết doanh thu
      series.data.forEach((point) => {
        worksheet.addRow([format(new Date(point.x), "dd/MM/yyyy"), point.y]);
      });

      // Thêm tổng doanh thu của dịch vụ
      const totalRow = worksheet.addRow(["Tổng doanh thu", serviceTotal]);
      totalRow.font = { bold: true, color: { argb: "FF0000" } }; // Màu đỏ
      totalRow.alignment = { horizontal: "right" };

      worksheet.addRow([]); // Dòng trống
    });

    // Thêm tổng doanh thu toàn bộ
    const grandTotalRow = worksheet.addRow([
      "Tổng doanh thu toàn bộ",
      grandTotal,
    ]);
    grandTotalRow.font = { bold: true, size: 12, color: { argb: "FF0000" } };
    grandTotalRow.alignment = { horizontal: "right" };

    // Định dạng cột
    worksheet.columns = [
      { width: 30 }, // Cột "Thời Gian" hoặc "Tên Dịch Vụ"
      { width: 20 }, // Cột "Doanh Thu"
    ];

    // Xuất file Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Doanh_Thu_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      link.click();
    });
  };

  const getTickValuesFromData = () => {
    const ticks = new Set(); // Sử dụng Set để tránh trùng lặp

    // Lặp qua tất cả các series trong chartData
    chartData.forEach((series) => {
      series.data.forEach((point) => {
        ticks.add(point.x); // Lấy `x` (ngày) từ từng điểm dữ liệu
      });
    });
    return Array.from(ticks).sort((a, b) => new Date(a) - new Date(b)); // Sắp xếp theo thời gian
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
      <Snackbar
        open={!!validationError}
        autoHideDuration={6000}
        onClose={() => setValidationError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setValidationError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {validationError}
        </Alert>
      </Snackbar>
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
              top: "2px",
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
              top: "5%",
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
              bottom: "90px",
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
            data={chartData.length > 0 ? chartData : []}
            margin={{ top: 70, right: 110, bottom: 100, left: 60 }}
            xScale={{
              type: "time",
              format: "%Y-%m-%d", // Định dạng thời gian chính
              precision: filterType === "month" ? "month" : "day",
              useUTC: false,
              nice: true,
            }}
            axisBottom={{
              format: (value) => {
                const date = new Date(value); // Chuyển giá trị x thành ngày
                if (filterType === "custom") {
                  const startYear = startDate.getFullYear();
                  const endYear = endDate.getFullYear();
                  const startMonth = startDate.getMonth();
                  const endMonth = endDate.getMonth();

                  if (startYear === endYear) {
                    if (startMonth === endMonth) {
                      // Cùng năm, cùng tháng -> Ngày/Tháng
                      return format(date, "dd/MM");
                    } else {
                      // Cùng năm, khác tháng -> Tháng/Năm
                      return format(date, "MM/yyyy");
                    }
                  } else {
                    // Khác năm -> Chỉ Năm
                    return format(date, "yyyy");
                  }
                } else if (filterType === "month") {
                  return format(date, "MM/yyyy"); // Tháng/Năm
                } else {
                  return format(date, "dd/MM"); // Ngày/Tháng/Năm
                }
              },
              tickValues: getTickValuesFromData(), // Chỉ hiển thị những ngày có data
              tickRotation: -45,
            }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
            }}
            axisLeft={{
              format: (value) =>
                chartUnit === "Triệu VNĐ"
                  ? `${(value / 1000).toFixed(0)} `
                  : `${(value / 1000).toFixed(0)}`,
            }}
            theme={{
              crosshair: {
                line: {
                  stroke: "#FF5722",
                  strokeWidth: 0.7,
                  strokeDasharray: "6 6",
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
                    fontSize: 13,
                  },
                },
              },

              legends: {
                text: {
                  fontSize: 13, // Tăng kích thước chữ trong legend
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
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 100,
                itemsSpacing: 10,
                itemDirection: "left-to-right",
                itemWidth: 120,
                itemHeight: 20,
                itemTextColor: "#EDEDED",
                symbolSize: 15,
                symbolShape: "circle",
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
              const { serieId, data } = point;

              let dateFormat = "dd/MM/yyyy"; // Mặc định

              if (filterType === "custom") {
                const startYear = startDate.getFullYear();
                const endYear = endDate.getFullYear();
                const startMonth = startDate.getMonth();
                const endMonth = endDate.getMonth();

                if (startYear === endYear) {
                  if (startMonth === endMonth) {
                    // Cùng năm, cùng tháng -> Ngày/Tháng
                    dateFormat = "dd/MM";
                  } else {
                    // Cùng năm, khác tháng -> Tháng/Năm
                    dateFormat = "MM/yyyy";
                  }
                } else {
                  // Khác năm -> Chỉ Năm
                  dateFormat = "yyyy";
                }
              } else if (filterType === "month") {
                dateFormat = "MM/yyyy"; // Tháng/Năm
              }

              const formattedDate = format(new Date(data.x), dateFormat);

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
                  Thời gian: {formattedDate}
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
