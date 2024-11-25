import React, { useState, useEffect } from "react";
import { ResponsiveBar } from "@nivo/bar";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import axios from "axios";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

const RideStatisticsChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [timeFilter, setTimeFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statsData, setStatsData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null); // State để lưu thông báo lỗi

  const fetchRideStats = async () => {
    try {
      setError(null);
      const params = {
        timeFilter,
        status: statusFilter,
      };
      if (timeFilter === "custom") {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const response = await axios.get(
        `http://localhost:3000/admin/getRideStatsByTimeRange`,
        { params }
      );

      let data = response.data;

      // Nếu là "thisYear", bổ sung các tháng còn thiếu
      if (timeFilter === "thisYear") {
        const currentYear = new Date().getFullYear();

        // Tạo danh sách tháng từ 01 đến 12 theo định dạng MM-YYYY
        const monthsInYear = Array.from({ length: 12 }, (_, i) => ({
          tháng: `${(i + 1).toString().padStart(2, "0")}-${currentYear}`, // Định dạng MM-YYYY
          "Thuê Tài Xế": 0,
          "Đặt Xe": 0,
          "Xe Ghép": 0,
        }));

        // Chuyển đổi định dạng từ "tháng X năm YYYY" sang "MM-YYYY"
        const transformedData = data.map((item) => {
          const [_, month, year] = item.tháng.match(/tháng (\d+) năm (\d+)/);
          return {
            ...item,
            tháng: `${month.padStart(2, "0")}-${year}`, // Định dạng MM-YYYY
          };
        });

        // Kết hợp dữ liệu đã có với các tháng còn thiếu
        data = monthsInYear.map((month) => {
          const existingData = transformedData.find(
            (d) => d.tháng === month.tháng
          );

          return {
            ...month,
            "Thuê Tài Xế": existingData?.["Thuê Tài Xế"] || 0,
            "Đặt Xe": existingData?.["Đặt Xe"] || 0,
            "Xe Ghép": existingData?.["Xe Ghép"] || 0,
          };
        });
      }

      setStatsData(data);
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    }
  };

  useEffect(() => {
    if (timeFilter !== "custom") {
      fetchRideStats();
    }
  }, [timeFilter, statusFilter]);

  const timeFilters = [
    { value: "today", label: "Hôm nay" },
    { value: "thisWeek", label: "Tuần này" },
    { value: "thisMonth", label: "Tháng này" },
    { value: "thisYear", label: "Năm này" },
    { value: "custom", label: "Tùy chỉnh" },
  ];

  const statusFilters = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "completed", label: "Hoàn thành" },
    { value: "canceled", label: "Đã hủy" },
  ];

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Thống kê chuyến đi");

    // Thêm tiêu đề lớn
    const title = `Thống Kê Số Chuyến Đi - Trạng Thái: ${
      statusFilters.find((filter) => filter.value === statusFilter)?.label ||
      "Tất cả"
    }`;

    worksheet.addRow([title]);
    const titleRow = worksheet.getRow(1);
    titleRow.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4CAF50" }, // Màu xanh lá cây
    };
    titleRow.alignment = { horizontal: "center" };
    worksheet.mergeCells(1, 1, 1, 5); // Gộp các ô từ A1 đến E1

    // Chuẩn bị dữ liệu
    const totalData = statsData.map((item) => {
      const total =
        (item["Thuê Tài Xế"] || 0) +
        (item["Đặt Xe"] || 0) +
        (item["Xe Ghép"] || 0);

      return {
        "Thời gian": item.tháng,
        "Thuê Tài Xế": item["Thuê Tài Xế"] || 0,
        "Đặt Xe": item["Đặt Xe"] || 0,
        "Xe Ghép": item["Xe Ghép"] || 0,
        "Tổng Số Chuyến 3 Dịch Vụ": total,
      };
    });

    // Thêm tiêu đề cột
    const headers = Object.keys(totalData[0]);
    worksheet.addRow(headers);

    // Định dạng dòng tiêu đề
    const headerRow = worksheet.getRow(2); // Dòng thứ 2 là tiêu đề
    headerRow.font = { bold: true, size: 12 }; // Làm đậm chữ và tăng kích thước
    headerRow.alignment = { horizontal: "center", vertical: "middle" }; // Căn giữa
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFCC" }, // Màu nền vàng nhạt
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Thêm dữ liệu và tô màu
    totalData.forEach((data) => {
      const row = worksheet.addRow(Object.values(data));

      // Tô màu cho cột "Tổng Số Chuyến 3 Dịch Vụ"
      const totalCell = row.getCell(
        headers.indexOf("Tổng Số Chuyến 3 Dịch Vụ") + 1
      );
      totalCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" }, // Màu vàng
      };
      totalCell.font = { bold: true };
      totalCell.alignment = { horizontal: "center" };
    });

    // Căn giữa toàn bộ nội dung
    worksheet.eachRow((row) => {
      row.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Tự động điều chỉnh độ rộng cột
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "thong_ke_chuyen_di.xlsx";
    link.click();
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5"></Typography>
        <Box display="flex" gap={2} alignItems="center">
          {/* Bộ lọc trạng thái */}
          <FormControl style={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
            >
              {statusFilters.map((filter) => (
                <MenuItem key={filter.value} value={filter.value}>
                  {filter.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl style={{ minWidth: 150 }}>
            <InputLabel>Thời gian</InputLabel>
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              label="Thời gian"
            >
              {timeFilters.map((filter) => (
                <MenuItem key={filter.value} value={filter.value}>
                  {filter.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {timeFilter === "custom" && (
            <>
              <TextField
                type="date"
                label="Ngày bắt đầu"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="Ngày kết thúc"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" onClick={fetchRideStats}>
                Áp dụng
              </Button>
            </>
          )}

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <Alert severity="error" style={{ marginBottom: 16 }}>
              {error}
            </Alert>
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

      <Box height="450px">
        <ResponsiveBar
          data={statsData}
          keys={["Thuê Tài Xế", "Đặt Xe", "Xe Ghép"]}
          indexBy="tháng"
          margin={{ top: 50, right: 130, bottom: 80, left: 60 }}
          padding={0.3}
          groupMode="grouped"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={
            ({ id }) =>
              id === "Thuê Tài Xế"
                ? "#79C850"
                : id === "Đặt Xe"
                ? "#ED7D31"
                : id === "Xe Ghép"
                ? "#5B9BD5"
                : "#CCC" // Mặc định màu xám nếu không khớp
          }
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
            legends: {
              text: {
                fill: colors.grey[100],
              },
            },
            tooltip: {
              container: {
                background: colors.primary[400],
                color: colors.grey[100],
                fontSize: "12px",
                borderRadius: "4px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            },
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 15,
            tickRotation: 0,
            legend: "Thời gian",
            legendPosition: "middle",
            legendOffset: 60,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Số chuyến đi",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          tooltip={({ id, value, color }) => (
            <div
              style={{
                padding: 12,
                background: colors.primary[400],
                color: colors.grey[100],
              }}
            >
              <strong>{id}</strong>
              <br />
              Số chuyến: {value}
            </div>
          )}
        />
      </Box>
    </Box>
  );
};

export default RideStatisticsChart;
