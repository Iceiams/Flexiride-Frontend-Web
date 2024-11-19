import React, { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import ClipLoader from "react-spinners/ClipLoader";
import * as XLSX from "xlsx";

const API_URL_TRADITIONAL = "http://localhost:3000/admin/getRidesByTime";
const API_URL_CARPOOL = "http://localhost:3000/admin/getCarpoolStatsByDate";

const formatTimeRange = (hour) => {
  return `${hour}:00 - ${hour}:59`;
};

// Analyze peak hours
const analyzePeakHours = (hourData) => {
  const sortedHours = [...hourData].sort((a, b) => a.count - b.count);

  // Tính trung vị
  const midIndex = Math.floor(sortedHours.length / 2);
  const median =
    sortedHours.length % 2 === 0
      ? (sortedHours[midIndex - 1].count + sortedHours[midIndex].count) / 2
      : sortedHours[midIndex].count;

  if (!median || median === 0) {
    console.error("Median is zero or undefined. Cannot calculate percentages.");
    return { peakHours: [], quietHours: [], median: 0 };
  }

  const peakHours = sortedHours
    .filter((item) => item.count > median)
    .map((item) => ({
      timeRange: formatTimeRange(item.time),
      count: item.count,
      percentageAboveAverage: (((item.count - median) / median) * 100).toFixed(
        1
      ),
    }));

  const quietHours = sortedHours
    .filter((item) => item.count < median)
    .map((item) => ({
      timeRange: formatTimeRange(item.time),
      count: item.count,
      percentageBelowAverage: (((median - item.count) / median) * 100).toFixed(
        1
      ),
    }));

  return {
    peakHours,
    quietHours,
    median: median.toFixed(1),
  };
};

const analyzeByDayOfWeek = (data) => {
  // Tính ngày trong tuần (0 = Sunday, 6 = Saturday)
  const dataWithDayOfWeek = data.map((item) => ({
    ...item,
    dayOfWeek: new Date(item.time).getDay(), // Tính dayOfWeek từ timestamp
  }));

  // Phân loại Weekday (Mon-Fri) và Weekend (Sat-Sun)
  const weekdayData = dataWithDayOfWeek.filter(
    (item) => item.dayOfWeek >= 1 && item.dayOfWeek <= 5
  );
  const weekendData = dataWithDayOfWeek.filter(
    (item) => item.dayOfWeek === 0 || item.dayOfWeek === 6
  );

  // Tính trung vị cho mỗi loại
  const medianWeekday = calculateMedian(weekdayData.map((item) => item.count));
  const medianWeekend = calculateMedian(weekendData.map((item) => item.count));

  return {
    weekday: {
      median: medianWeekday,
      peakHours: weekdayData.filter((item) => item.count > medianWeekday),
      quietHours: weekdayData.filter((item) => item.count < medianWeekday),
    },
    weekend: {
      median: medianWeekend,
      peakHours: weekendData.filter((item) => item.count > medianWeekend),
      quietHours: weekendData.filter((item) => item.count < medianWeekend),
    },
  };
};

// Hàm tính trung vị (Median)
const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const ChartCard = ({ title, children }) => (
  <div
    style={{
      backgroundColor: "#2C2F33",
      borderRadius: "10px",
      padding: "20px",
      margin: "20px auto",
      maxWidth: "800px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    }}
  >
    <h3
      style={{
        textAlign: "center",
        fontFamily: "'Roboto', sans-serif",
        color: "#FFFFFF",
        marginBottom: "20px",
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const TraditionalChart = ({ onDataChange }) => {
  const [allData, setAllData] = useState({
    hour: [],
    day: [],
    month: [],
    year: [],
  });
  const [timeUnit, setTimeUnit] = useState("hour");
  const [loading, setLoading] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const timeUnits = ["hour", "day", "month", "year"];
      const promises = timeUnits.map((unit) =>
        fetch(`${API_URL_TRADITIONAL}?timeUnit=${unit}`).then((res) =>
          res.json()
        )
      );

      const results = await Promise.all(promises);

      const newAllData = timeUnits.reduce((acc, unit, index) => {
        acc[unit] = results[index].result.map((item) => ({
          time: item._id.toString(),
          count: item.count,
        }));
        return acc;
      }, {});

      setAllData(newAllData);
      onDataChange(newAllData);
    } catch (error) {
      console.error("Error fetching traditional data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <ChartCard title="DỊCH VỤ ĐẶT XE TRUYỀN THỐNG">
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label
          htmlFor="timeUnitTraditional"
          style={{ marginRight: "10px", color: "#FFFFFF" }}
        >
          Chọn đơn vị thời gian:
        </label>
        <select
          id="timeUnitTraditional"
          value={timeUnit}
          onChange={(e) => setTimeUnit(e.target.value)}
          style={{ padding: "5px", borderRadius: "5px" }}
        >
          <option value="hour">Giờ</option>
          <option value="day">Ngày</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center" }}>
          <ClipLoader color="#F1A102" size={50} />
        </div>
      ) : (
        <div style={{ height: "400px" }}>
          <ResponsiveBar
            data={allData[timeUnit]}
            keys={["count"]}
            indexBy="time"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            colors={{ scheme: "category10" }}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Thời gian",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Số chuyến",
              legendPosition: "middle",
              legendOffset: -50,
            }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: "#FFFFFF",
                  },
                },
                legend: {
                  text: {
                    fill: "#FFFFFF",
                  },
                },
              },
            }}
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
                symbolSize: 20,
                symbolShape: "circle",
                itemTextColor: "white",
              },
            ]}
          />
        </div>
      )}
    </ChartCard>
  );
};

const CarpoolChart = ({ onDataChange }) => {
  const [allData, setAllData] = useState({
    day: [],
    month: [],
    year: [],
  });
  const [timeUnit, setTimeUnit] = useState("day");
  const [loading, setLoading] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const timeUnits = ["day", "month", "year"];
      const promises = timeUnits.map((unit) =>
        fetch(`${API_URL_CARPOOL}?timeUnit=${unit}`).then((res) => res.json())
      );

      const results = await Promise.all(promises);

      const newAllData = timeUnits.reduce((acc, unit, index) => {
        acc[unit] = results[index].result.map((item) => ({
          time: item._id.toString(),
          count: item.count,
        }));
        return acc;
      }, {});

      setAllData(newAllData);
      onDataChange(newAllData);
    } catch (error) {
      console.error("Error fetching carpool data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <ChartCard title="DỊCH VỤ XE GHÉP">
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label
          htmlFor="timeUnitCarpool"
          style={{ marginRight: "10px", color: "#FFFFFF" }}
        >
          Chọn đơn vị thời gian:
        </label>
        <select
          id="timeUnitCarpool"
          value={timeUnit}
          onChange={(e) => setTimeUnit(e.target.value)}
          style={{ padding: "5px", borderRadius: "5px" }}
        >
          <option value="day">Ngày</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center" }}>
          <ClipLoader color="#00AEEF" size={50} />
        </div>
      ) : (
        <div style={{ height: "400px" }}>
          <ResponsiveBar
            data={allData[timeUnit]}
            keys={["count"]}
            indexBy="time"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            colors={{ scheme: "pastel1" }}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Thời gian",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Số chuyến",
              legendPosition: "middle",
              legendOffset: -50,
            }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: "#FFFFFF",
                  },
                },
                legend: {
                  text: {
                    fill: "#FFFFFF",
                  },
                },
              },
            }}
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
                symbolSize: 20,
                symbolShape: "circle",
                itemTextColor: "white",
              },
            ]}
          />
        </div>
      )}
    </ChartCard>
  );
};

// export default CombinedCharts;
const CombinedCharts = () => {
  const [traditionalData, setTraditionalData] = useState(null);
  const [carpoolData, setCarpoolData] = useState(null);
  const [peakHoursAnalysis, setPeakHoursAnalysis] = useState(null);
  const [weekendWeekdayAnalysis, setWeekendWeekdayAnalysis] = useState(null);

  // const handleTraditionalDataChange = (data) => {
  //   setTraditionalData(data);
  //   if (data.hour) {
  //     setPeakHoursAnalysis(analyzePeakHours(data.hour));
  //   }
  // };

  const handleTraditionalDataChange = (data) => {
    setTraditionalData(data);
    if (data.hour) {
      setPeakHoursAnalysis(analyzePeakHours(data.hour));
      setWeekendWeekdayAnalysis(analyzeByDayOfWeek(data.hour));
    }
  };

  const handleCarpoolDataChange = (data) => {
    setCarpoolData(data);
  };

  const exportToExcel = () => {
    if (!traditionalData || !carpoolData) return;

    const wb = XLSX.utils.book_new();

    // Add traditional data sheets with detailed formatting
    // Hour sheet with time ranges and peak analysis
    if (traditionalData.hour) {
      const hourData = traditionalData.hour.map((item) => ({
        "Time Range": formatTimeRange(item.time),
        "Number of Rides": item.count,
        Status:
          item.count > peakHoursAnalysis.median ? "Peak Hour" : "Normal Hour",
        "Difference from Average (%)":
          item.count > peakHoursAnalysis.median
            ? `+${(
                ((item.count - peakHoursAnalysis.median) /
                  peakHoursAnalysis.median) *
                100
              ).toFixed(1)}%`
            : `-${(
                ((peakHoursAnalysis.median - item.count) /
                  peakHoursAnalysis.median) *
                100
              ).toFixed(1)}%`,
      }));

      const ws = XLSX.utils.json_to_sheet(hourData);

      // Add peak hours summary
      const peakHoursSummary = [
        ["", ""],
        ["Peak Hours Analysis", ""],
        ["Average Rides per Hour", peakHoursAnalysis.average],
        ["", ""],
        ["Top Peak Hours", "Rides Above Average"],
        ...peakHoursAnalysis.peakHours.map((peak) => [
          peak.timeRange,
          `+${peak.percentageAboveAverage}%`,
        ]),
        ["", ""],
        ["Quietest Hours", "Rides Below Average"],
        ...peakHoursAnalysis.quietHours.map((quiet) => [
          quiet.timeRange,
          `-${quiet.percentageBelowAverage}%`,
        ]),
      ];

      // Append summary to worksheet
      XLSX.utils.sheet_add_aoa(ws, peakHoursSummary, { origin: `E1` });

      // Add column widths
      ws["!cols"] = [
        { wch: 15 }, // Time Range
        { wch: 15 }, // Number of Rides
        { wch: 12 }, // Status
        { wch: 20 }, // Difference from Average
        { wch: 20 }, // Peak Hours Analysis
        { wch: 15 }, // Percentages
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Traditional_hourly");
    }

    // Day sheet
    const dayData = traditionalData.day.map((item) => ({
      Date: item.time,
      "Number of Rides": item.count,
      "Average Rides per Hour": (item.count / 24).toFixed(1),
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(dayData),
      "Traditional_daily"
    );

    // Month sheet
    const monthData = traditionalData.month.map((item) => ({
      Month: item.time,
      "Number of Rides": item.count,
      "Average Rides per Day": (item.count / 30).toFixed(1),
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(monthData),
      "Traditional_monthly"
    );

    // Year sheet
    const yearData = traditionalData.year.map((item) => ({
      Year: item.time,
      "Number of Rides": item.count,
      "Average Rides per Month": (item.count / 12).toFixed(1),
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(yearData),
      "Traditional_yearly"
    );

    // Add carpool data sheets with averages
    const carpoolDayData = carpoolData.day.map((item) => ({
      Date: item.time,
      "Number of Rides": item.count,
      "Average Rides per Hour": (item.count / 24).toFixed(1),
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(carpoolDayData),
      "Carpool_daily"
    );

    const carpoolMonthData = carpoolData.month.map((item) => ({
      Month: item.time,
      "Number of Rides": item.count,
      "Average Rides per Day": (item.count / 30).toFixed(1),
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(carpoolMonthData),
      "Carpool_monthly"
    );

    const carpoolYearData = carpoolData.year.map((item) => ({
      Year: item.time,
      "Number of Rides": item.count,
      "Average Rides per Month": (item.count / 12).toFixed(1),
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(carpoolYearData),
      "Carpool_yearly"
    );

    // Add summary sheet
    const summaryData = [
      ["Ride Statistics Summary", ""],
      ["", ""],
      ["Traditional Service", ""],
      ["Total Rides (This Year)", traditionalData.year[0]?.count || 0],
      [
        "Average Daily Rides",
        (traditionalData.year[0]?.count / 365).toFixed(1),
      ],
      [
        "Peak Hours",
        peakHoursAnalysis.peakHours.map((p) => p.timeRange).join(", "),
      ],
      ["Average Rides per Hour", peakHoursAnalysis.average],
      ["", ""],
      ["Carpool Service", ""],
      ["Total Rides (This Year)", carpoolData.year[0]?.count || 0],
      ["Average Daily Rides", (carpoolData.year[0]?.count / 365).toFixed(1)],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    XLSX.writeFile(
      wb,
      `Ride_Statistics_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#141B2D",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <button
        onClick={exportToExcel}
        style={{
          margin: "20px 0",
          padding: "10px 20px",
          backgroundColor: "#1976D2",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          float: "right",
        }}
      >
        Xuất File Excel
      </button>

      {peakHoursAnalysis && (
        <ChartCard title="PHÂN TÍCH GIỜ CAO ĐIỂM CHO DỊCH VỤ ĐẶT XE TRUYỀN THỐNG">
          <div style={{ color: "white", padding: "20px" }}>
            <h4 style={{ color: "#F1A102" }}>
              Giờ cao điểm (Trên trung vị{" "}
              {peakHoursAnalysis.median || "không xác định"} chuyến/giờ):
            </h4>
            <ul>
              {peakHoursAnalysis.peakHours.map((peak, index) => (
                <li key={index}>
                  {peak.timeRange}: {peak.count} chuyến (+
                  {peak.percentageAboveAverage || 0}%)
                </li>
              ))}
            </ul>

            <h4 style={{ color: "#00AEEF", marginTop: "20px" }}>
              Giờ thấp điểm:
            </h4>
            <ul>
              {peakHoursAnalysis.quietHours.slice(0, 5).map((quiet, index) => (
                <li key={index}>
                  {quiet.timeRange}: {quiet.count} chuyến (-
                  {quiet.percentageBelowAverage || 0}%)
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      )}

      {weekendWeekdayAnalysis && (
        <ChartCard title="PHÂN TÍCH THEO NGÀY TRONG TUẦN CHO DỊCH VỤ ĐẶT XE TRUYỀN THỐNG">
          <div style={{ color: "white", padding: "20px" }}>
            <h4 style={{ color: "#F1A102" }}>
              Ngày thường (Trung vị: {weekendWeekdayAnalysis.weekday.median}{" "}
              chuyến):
            </h4>
            <ul>
              {weekendWeekdayAnalysis.weekday.peakHours.map((hour, index) => (
                <li key={index}>
                  {formatTimeRange(hour.time)}: {hour.count} chuyến (+
                  {(
                    ((hour.count - weekendWeekdayAnalysis.weekday.median) /
                      weekendWeekdayAnalysis.weekday.median) *
                    100
                  ).toFixed(1)}
                  %)
                </li>
              ))}
            </ul>

            <h4 style={{ color: "#00AEEF", marginTop: "20px" }}>
              Cuối tuần (Trung vị: {weekendWeekdayAnalysis.weekend.median}{" "}
              chuyến):
            </h4>
            <ul>
              {weekendWeekdayAnalysis.weekend.peakHours.map((hour, index) => (
                <li key={index}>
                  {formatTimeRange(hour.time)}: {hour.count} chuyến (+
                  {(
                    ((hour.count - weekendWeekdayAnalysis.weekend.median) /
                      weekendWeekdayAnalysis.weekend.median) *
                    100
                  ).toFixed(1)}
                  %)
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      )}

      <TraditionalChart onDataChange={handleTraditionalDataChange} />
      <CarpoolChart onDataChange={handleCarpoolDataChange} />
    </div>
  );
};

export default CombinedCharts;
