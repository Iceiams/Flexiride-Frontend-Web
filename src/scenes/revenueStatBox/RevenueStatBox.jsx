import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import axios from "axios";
import api from "../../api/axiosConfig";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};
// Component hiển thị doanh thu
const RevenueBox = ({ title, amount, colors }) => (
  <Box
    sx={{
      backgroundColor: colors.primary[400],
      color: colors.greenAccent[400],
      borderRadius: "8px",
      padding: "16px",
      boxShadow: 3,
      textAlign: "center",
      mb: 3,
      marginTop: "20px",
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontWeight: "500",
        fontSize: "17px",
        textTransform: "uppercase",
        color: colors.grey[100],
      }}
    >
      {title}
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
      {amount !== null ? formatCurrency(amount) : "0 ₫"}
    </Typography>
  </Box>
);

const RevenueOverview = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [todayRevenue, setTodayRevenue] = useState(null);
  const [weekRevenue, setWeekRevenue] = useState(null);
  const [monthRevenue, setMonthRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    try {
      const today = await api.get(
        // "http://localhost:3000/admin/getTotalRevenueByPeriod",
        // "/getTotalRevenueByPeriod",
        {
          params: { filterType: "today" },
        }
      );
      const week = await api.get(
        // "http://localhost:3000/admin/getTotalRevenueByPeriod",
        "/getTotalRevenueByPeriod",
        {
          params: { filterType: "week" },
        }
      );
      const month = await api.get(
        // "http://localhost:3000/admin/getTotalRevenueByPeriod",
        "/getTotalRevenueByPeriod",
        {
          params: { filterType: "month" },
        }
      );

      setTodayRevenue(today.data.data.systemRevenue);
      setWeekRevenue(week.data.data.systemRevenue);
      setMonthRevenue(month.data.data.systemRevenue);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  return (
    <Box p="20px" display="flex" flexDirection="column" gap="20px">
      <Box
        sx={{
          backgroundColor: colors.greenAccent[500],
          color: colors.primary[900],
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.15)",
          textAlign: "center",
          border: `2px solid ${colors.primary[400]}`,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            fontSize: "20px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          THEO DÕI DOANH THU
        </Typography>
      </Box>

      {/* Box Doanh Thu */}
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="150px"
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          <RevenueBox
            title="Doanh Thu Hôm Nay"
            amount={todayRevenue}
            colors={colors}
          />
          <RevenueBox
            title="Doanh Thu Tuần Này"
            amount={weekRevenue}
            colors={colors}
          />
          <RevenueBox
            title="Doanh Thu Tháng Này"
            amount={monthRevenue}
            colors={colors}
          />
        </>
      )}
    </Box>
  );
};

export default RevenueOverview;
