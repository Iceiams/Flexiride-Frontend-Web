import React, { useEffect, useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import ExcelJS from "exceljs";
import { Box, Button, useTheme } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

const API_URL = "http://localhost:3000/admin/getRideCountsByServiceAndStatus";

const Charts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [traditionalData, setTraditionalData] = useState([]);
  const [carpoolData, setCarpoolData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  const formatData = (data, services, statuses) =>
    services.map((service) => {
      const serviceData = data[service] || {};
      return statuses.reduce(
        (formatted, status) => ({
          ...formatted,
          [status]: serviceData[status] || 0,
        }),
        { service }
      );
    });

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      const traditionalStatuses = [
        "pending",
        "confirmed",
        "on the way",
        "arrived",
        "picked up",
        "on trip",
        "completed",
        "canceled",
      ];
      const carpoolStatuses = [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "ongoing",
        "done",
      ];
      const traditionalServices = ["FlexiBike", "FlexiCar", "FlexiCar7"];
      const carpoolServices = [
        "BookingCarpool4",
        "BookingCarpool7",
        "BookingCarpoolLimousine",
      ];

      const traditionalFormatted = formatData(
        result.traditional || {},
        traditionalServices,
        traditionalStatuses
      );
      const carpoolFormatted = formatData(
        result.carpool || {},
        carpoolServices,
        carpoolStatuses
      );

      setTraditionalData(traditionalFormatted);
      setCarpoolData(carpoolFormatted);

      const totalTraditional = traditionalServices.reduce(
        (sum, service) =>
          sum +
          traditionalStatuses.reduce(
            (acc, status) =>
              acc + (result.traditional?.[service]?.[status] || 0),
            0
          ),
        0
      );
      const totalCarpool = carpoolServices.reduce(
        (sum, service) =>
          sum +
          carpoolStatuses.reduce(
            (acc, status) => acc + (result.carpool?.[service]?.[status] || 0),
            0
          ),
        0
      );

      setComparisonData([
        {
          id: "Traditional",
          label: "Đặt xe truyền thống",
          value: totalTraditional,
        },
        { id: "Carpool", label: "Đặt xe ghép", value: totalCarpool },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hàm xuất Excel

  const exportToExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Ride Status");

    // Thêm cột
    sheet.columns = [
      { header: "Dịch vụ", key: "service", width: 20 },
      { header: "Trạng thái", key: "status", width: 20 },
      { header: "Số lượng", key: "count", width: 15 },
    ];

    let totalStartRow = 2; // Dòng bắt đầu cho dữ liệu
    const serviceTotalRows = []; // Lưu các dòng tổng của từng dịch vụ

    // Thêm dữ liệu traditional
    traditionalData.forEach((item) => {
      Object.entries(item).forEach(([status, count]) => {
        if (status !== "service") {
          sheet.addRow({ service: item.service, status, count });
        }
      });

      // Tính tổng cho dịch vụ hiện tại
      const lastRow = sheet.rowCount + 1;
      sheet.addRow({
        service: `${item.service} - Tổng cộng`,
        status: "",
        count: { formula: `SUM(C${totalStartRow}:C${lastRow - 1})` },
      });

      // Tô màu cho dòng tổng
      const totalRow = sheet.getRow(lastRow);
      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFE135" },
        };
      });

      serviceTotalRows.push(lastRow);
      totalStartRow = lastRow + 1;
    });

    // Thêm dữ liệu carpool
    carpoolData.forEach((item) => {
      Object.entries(item).forEach(([status, count]) => {
        if (status !== "service") {
          sheet.addRow({ service: item.service, status, count });
        }
      });

      // Tính tổng cho dịch vụ hiện tại
      const lastRow = sheet.rowCount + 1;
      sheet.addRow({
        service: `${item.service} - Tổng cộng`,
        status: "",
        count: { formula: `SUM(C${totalStartRow}:C${lastRow - 1})` },
      });

      const totalRow = sheet.getRow(lastRow);
      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFE135" },
        };
      });

      serviceTotalRows.push(lastRow);
      totalStartRow = lastRow + 1;
    });

    const finalRow = sheet.rowCount + 1;
    const totalFormula = serviceTotalRows.map((row) => `C${row}`).join(" + ");
    sheet.addRow({
      service: "Tổng tất cả dịch vụ",
      status: "",
      count: { formula: totalFormula },
    });

    const allServicesRow = sheet.getRow(finalRow);
    allServicesRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF00FF00" },
      };
    });
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell("status");
        const countCell = row.getCell("count");

        if (
          statusCell.value === "canceled" ||
          statusCell.value === "rejected"
        ) {
          countCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" },
          };

          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" },
          };

          row.eachCell((cell) => {
            cell.font = { bold: true };
          });
        }
      }
    });

    // Tải xuống file Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RideStats.xlsx";
      a.click();
    });
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <Button
          onClick={exportToExcel}
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
            "&:hover": {
              backgroundColor: "#115293",
            },
          }}
        >
          <DownloadOutlinedIcon sx={{ mr: "10px" }} />
          Xuất File Excel
        </Button>
      </Box>

      {/* Biểu đồ 1: Traditional Rides */}
      <div style={{ height: 400 }}>
        <h3 style={{ textAlign: "center", fontFamily: "monospace" }}>
          BIỂU ĐỒ THEO DÕI TRẠNG THÁI DỊCH VỤ ĐẶT XE
        </h3>
        <ResponsiveBar
          data={traditionalData}
          keys={[
            "pending",
            "confirmed",
            "on the way",
            "arrived",
            "picked up",
            "on trip",
            "completed",
            "canceled",
          ]}
          indexBy="service"
          margin={{ top: 40, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          colors={{ scheme: "nivo" }}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: colors.grey[100],
                  fontSize: 14,
                },
              },
            },
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              itemWidth: 100,
              itemHeight: 20,
              itemsSpacing: 2,
              symbolSize: 20,
              itemTextColor: "#FFFFFF",
            },
          ]}
          tooltip={({ id, value, indexValue, color }) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "white",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                color: "#404040",
                fontFamily: "sans-serif",
              }}
            >
              {/* Hình vuông hiển thị màu */}
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: color,
                  marginRight: "8px",
                }}
              ></div>
              {/* Nội dung tooltip */}
              <div>
                <strong>Dịch vụ:</strong> {indexValue} <br />
                <strong>Trạng thái:</strong> {id} <br />
                <strong>Số lượng:</strong> {value}
              </div>
            </div>
          )}
        />
      </div>

      {/* Biểu đồ 2: Carpool Rides */}
      <div style={{ height: 400, paddingTop: "50px" }}>
        <h3 style={{ textAlign: "center", fontFamily: "monospace" }}>
          BIỂU ĐỒ THEO DÕI TRẠNG THÁI DỊCH VỤ XE GHÉP
        </h3>
        <ResponsiveBar
          data={carpoolData}
          keys={[
            "pending",
            "accepted",
            "rejected",
            "completed",
            "ongoing",
            "done",
          ]}
          indexBy="service"
          margin={{ top: 40, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          colors={{ scheme: "nivo" }}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: colors.grey[100],
                  fontSize: 14,
                },
              },
            },
          }}
          axisLeft={{
            tickValues: "auto", // Tự động tính toán các giá trị
            format: (value) => Math.round(value), // Làm tròn giá trị thành số nguyên
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              itemWidth: 100,
              itemHeight: 20,
              itemsSpacing: 2,
              symbolSize: 20,
              itemTextColor: "#F0F0F0",
            },
          ]}
          tooltip={({ id, value, indexValue, color }) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "white",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                color: "#404040",
                fontFamily: "sans-serif",
              }}
            >
              {/* Hình vuông hiển thị màu */}
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: color,
                  marginRight: "8px",
                }}
              ></div>
              {/* Nội dung tooltip */}
              <div>
                <strong>Dịch vụ:</strong> {indexValue} <br />
                <strong>Trạng thái:</strong> {id} <br />
                <strong>Số lượng:</strong> {value}
              </div>
            </div>
          )}
        />
      </div>

      {/* Biểu đồ 3: Total Rides Comparison */}
      <div style={{ height: 400, paddingTop: "50px" }}>
        <h3 style={{ textAlign: "center", fontFamily: "monospace" }}>
          BIỂU ĐỒ TỔNG SỐ CHUYẾN ĐI 3 DỊCH VỤ
        </h3>
        <ResponsivePie
          data={comparisonData}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={colors.grey[100]}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: colors.grey[100],
                },
              },
            },
          }}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 40,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
          tooltip={({ datum: { id, value, label, color } }) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                backgroundColor: "white",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                color: "#333",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: color,
                    marginRight: "8px",
                  }}
                ></div>
                <strong>{label}</strong>
              </div>
              <div>
                <strong>Dịch vụ:</strong> {id}
              </div>
              <div>
                <strong>Tổng chuyến:</strong> {value}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Charts;
