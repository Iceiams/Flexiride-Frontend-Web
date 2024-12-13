import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import axios from "axios";
import ExcelJS from "exceljs";

const RideStatisticsChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [timeFilter, setTimeFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statsData, setStatsData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("completed");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCustomApplied, setIsCustomApplied] = useState(false);

  const fetchRideStats = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const params = { timeFilter, status: statusFilter };

      if (timeFilter === "custom") {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const response = await axios.get(
        `https://flexiride.onrender.com/admin/getRideStatsByTimeRange`,
        { params }
      );

      let data = response.data;

      // Điều chỉnh dữ liệu hiển thị cho từng timeFilter
      switch (timeFilter) {
        case "today":
          data = [
            {
              date: data.date || "N/A",
              ...data.services,
            },
          ];
          break;
        case "thisWeek":
          data = [
            {
              dateRange: data.dateRange || "N/A",
              ...data.services,
            },
          ];
          break;
        case "thisMonth":
          data = data.map((item) => ({
            date: item.date || item.monthYear || "N/A",
            ...item,
          }));
          break;
        case "thisYear":
          data = data
            .map((item) => ({
              date: item.date || item.monthYear || item.year || "N/A",
              ...item,
            }))
            .sort((a, b) => {
              // Trích xuất số tháng từ key monthYear hoặc sử dụng index nếu không có
              const getMonth = (item) => {
                if (item.monthYear) {
                  return parseInt(item.monthYear.split("-")[0]);
                }
                return 0;
              };

              return getMonth(a) - getMonth(b);
            });
          break;
        case "custom":
          data = data.map((item) => ({
            date: item.date || item.monthYear || item.year || "N/A",
            ...item,
          }));
          break;
        default:
          data = [];
      }

      // Nếu là tuần này, chuyển `dateRange` thành một key `date`
      if (timeFilter === "thisWeek") {
        data = data.map((item) => ({
          date: item.dateRange || "N/A", // Sử dụng `dateRange` thay vì `date`
          ...item,
        }));
      }

      setStatsData(data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Lỗi phiên hết hạn, thông báo cho người dùng
        setError("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        // Các lỗi khác
        setError(
          error.response?.data?.message || "Có lỗi xảy ra khi lấy dữ liệu."
        );
      }
      setStatsData([]);
    } finally {
      setLoading(false);
      setIsCustomApplied(false);
    }
  }, [timeFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    if (timeFilter === "custom" && !isCustomApplied) return; // Không fetch nếu chưa nhấn "Áp dụng"
    fetchRideStats();
    if (timeFilter === "custom") {
      setIsCustomApplied(false); // Reset sau khi fetch thành công
    }
  }, [timeFilter, statusFilter, isCustomApplied]);

  const handleApplyCustomFilter = () => {
    if (!startDate || !endDate) {
      setError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
      return;
    }

    setError(null);
    setIsCustomApplied(true); // Kích hoạt fetch khi nhấn áp dụng
  };

  const timeFilters = useMemo(
    () => [
      { value: "today", label: "Hôm nay" },
      { value: "thisWeek", label: "Tuần này" },
      { value: "thisMonth", label: "Tháng này" },
      { value: "thisYear", label: "Năm này" },
      { value: "custom", label: "Tùy chỉnh" },
    ],
    []
  );

  const statusFilters = useMemo(
    () => [
      { value: "completed", label: "Hoàn thành" },
      { value: "canceled", label: "Đã hủy" },
    ],
    []
  );
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Thống kê chuyến đi");

    const title = `Thống Kê Số Chuyến Đi - Trạng Thái: ${
      statusFilters.find((filter) => filter.value === statusFilter)?.label ||
      "Hoàn Thành"
    }`;

    worksheet.addRow([title]);
    const titleRow = worksheet.getRow(1);
    titleRow.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4CAF50" },
    };
    titleRow.alignment = { horizontal: "center" };
    worksheet.mergeCells(1, 1, 1, 5);

    const totalData = statsData.map((item) => {
      const total =
        (item["Thuê Tài Xế"] || 0) +
        (item["Đặt Xe"] || 0) +
        (item["Xe Ghép"] || 0);

      return {
        "Thời gian": item.date || item.dateRange || item.tháng,
        "Thuê Tài Xế": item["Thuê Tài Xế"] || 0,
        "Đặt Xe": item["Đặt Xe"] || 0,
        "Xe Ghép": item["Xe Ghép"] || 0,
        "Tổng Số Chuyến 3 Dịch Vụ": total,
      };
    });

    const headers = Object.keys(totalData[0]);
    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(2);
    headerRow.font = { bold: true, size: 12 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFCC" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    totalData.forEach((data) => {
      const row = worksheet.addRow(Object.values(data));

      const totalCell = row.getCell(
        headers.indexOf("Tổng Số Chuyến 3 Dịch Vụ") + 1
      );
      totalCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" },
      };
      totalCell.font = { bold: true };
      totalCell.alignment = { horizontal: "center" };
    });

    worksheet.eachRow((row) => {
      row.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

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
        <Typography variant="h5">
          {/* {timeFilter === "today" && "Thống Kê Hôm Nay"}
          {timeFilter === "thisWeek" && "Thống Kê Tuần Này"}
          {timeFilter === "thisMonth" && "Thống Kê Tháng Này"}
          {timeFilter === "thisYear" && "Thống Kê Năm Này"}
          {timeFilter === "custom" && `Thống Kê Từ ${startDate} Đến ${endDate}`} */}
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl style={{ minWidth: 120 }}>
            <InputLabel style={{ fontSize: "14px", fontWeight: "500" }}>
              Trạng thái
            </InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
              style={{ fontSize: "14px" }}
            >
              {statusFilters.map((filter) => (
                <MenuItem
                  key={filter.value}
                  value={filter.value}
                  style={{ fontSize: "14px" }}
                >
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
              <Button variant="contained" onClick={handleApplyCustomFilter}>
                Áp dụng
              </Button>
            </>
          )}
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
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="450px"
        >
          <CircularProgress />
        </Box>
      ) : statsData.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="450px"
        >
          <Typography variant="h6" color="textSecondary">
            Không có dữ liệu để hiển thị.
          </Typography>
        </Box>
      ) : (
        <Box position="relative" height="450px">
          {/* Custom Legend cho trục Y */}
          <Typography
            style={{
              position: "absolute",
              top: "10px",
              left: "0", // Căn chỉnh với trục Y
              transform: "translate(20%, 0)", // Dịch sang trái một nửa chiều rộng để căn giữa
              textAlign: "center",
              fontSize: "15px",
              color: colors.grey[100],
            }}
          >
            Số chuyến đi
          </Typography>
          <Typography
            style={{
              position: "absolute",
              bottom: "140px",
              right: "40px", // Đặt chữ ở bên phải
              textAlign: "center",
              fontSize: "15px",
              color: colors.grey[100],
            }}
          >
            Thời gian
          </Typography>
          <ResponsiveBar
            data={statsData}
            keys={["Thuê Tài Xế", "Đặt Xe", "Xe Ghép"]}
            indexBy="date"
            margin={{ top: 50, right: 130, bottom: 150, left: 60 }}
            padding={0.3}
            groupMode="grouped"
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={({ id }) =>
              id === "Thuê Tài Xế"
                ? "#79C850"
                : id === "Đặt Xe"
                ? "#ED7D31"
                : id === "Xe Ghép"
                ? "#5B9BD5"
                : "#CCC"
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
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              renderTick: (tick) => (
                <text
                  x={tick.x}
                  y={tick.y + 30} // Khoảng cách giữa chữ và trục
                  textAnchor="middle"
                  style={{
                    fontSize: "14px", // Kích thước chữ
                    fill: "white", // Màu chữ
                  }}
                >
                  {tick.value}
                </text>
              ),
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
            }}
            label={() => null} // Ẩn giá trị hiển thị trên cột
            labelSkipWidth={12}
            labelSkipHeight={12}
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0, // Căn giữa theo trục X
                translateY: 90, // Đặt khoảng cách dưới trục X
                itemsSpacing: 10,
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
      )}
    </Box>
  );
};

export default RideStatisticsChart;
