import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CheckCircleIcon from "@mui/icons-material/ElectricBikeOutlined";
import Person3Sharp from "@mui/icons-material/Person3Sharp";
import CarRentalOutlined from "@mui/icons-material/CarRentalOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import { useAuth } from "../../AuthContext";
import api from "../../api/axiosConfig";
import React, { useEffect, useState } from "react";
import PieChart from "../../components/PieChart";
import NewUserLineChart from "../../components/NewUserLineChart";
import { useNavigate } from "react-router-dom";
import ArrowForwardTwoToneIcon from "@mui/icons-material/ArrowForwardTwoTone";
import RecentTransactions from "../../scenes/revenueStatBox/RevenueStatBox";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { admin } = useAuth();
  const navigate = useNavigate();
  console.log();
  const [onlineDrivers, setOnlineDrivers] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [onlinePercentage, setOnlinePercentage] = useState("0");
  const [completedTrips, setCompletedTrips] = useState({
    traditional: 0,
    carpool: 0,
    hireDriver: 0,
  });

  const fetchOnlineDrivers = async () => {
    try {
      const response = await api.get("/countDriversOnline");
      const {
        onlineDrivers: count,
        totalDrivers: total,
        onlinePercentage: percentage,
      } = response.data;

      setOnlineDrivers(count);
      setTotalDrivers(total);
      setOnlinePercentage(percentage);
    } catch (error) {
      console.error("Error fetching online drivers data:", error);
    }
  };

  const fetchCompletedTrips = async () => {
    try {
      const response = await api.get("/getCompletedTripCounts");
      setCompletedTrips(response.data);
    } catch (error) {
      console.error("Error fetching completed trips:", error);
    }
  };

  useEffect(() => {
    fetchCompletedTrips();
  }, []);

  useEffect(() => {
    fetchOnlineDrivers();
  }, []);

  return (
    <Box
      m="20px"
      sx={{
        overflowY: "hidden", // Ẩn thanh cuộn dọc
        scrollbarWidth: "none", // Cho Firefox
        msOverflowStyle: "none", // Cho IE và Edge
        "&::-webkit-scrollbar": {
          display: "none", // Cho Chrome, Safari và Opera
        },
      }}
    >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Xin Chào Admin FRide!" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        sx={{
          overflowY: "hidden", // Ẩn thanh cuộn dọc
          scrollbarWidth: "none", // Cho Firefox
          msOverflowStyle: "none", // Cho IE và Edge
          "&::-webkit-scrollbar": {
            display: "none", // Cho Chrome, Safari và Opera
          },
        }}
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={onlineDrivers}
            subtitle="Tài Xế Đang Hoạt Động"
            progress={onlinePercentage}
            increase={totalDrivers}
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={completedTrips.traditional}
            subtitle="Dịch Vụ Đặt Xe"
            progress={
              completedTrips.traditional /
              (completedTrips.traditional +
                completedTrips.carpool +
                completedTrips.hireDriver)
            }
            increase={`${(
              (completedTrips.traditional /
                (completedTrips.traditional +
                  completedTrips.carpool +
                  completedTrips.hireDriver)) *
              100
            ).toFixed(2)}%`}
            icon={
              <CheckCircleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={completedTrips.carpool}
            subtitle="Dịch Vụ Xe Ghép"
            progress={
              completedTrips.carpool /
              (completedTrips.traditional +
                completedTrips.carpool +
                completedTrips.hireDriver)
            }
            increase={`${(
              (completedTrips.carpool /
                (completedTrips.traditional +
                  completedTrips.carpool +
                  completedTrips.hireDriver)) *
              100
            ).toFixed(2)}%`}
            icon={
              <CarRentalOutlined
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={completedTrips.hireDriver}
            subtitle="Dịch Vụ Thuê Tài Xế"
            progress={
              completedTrips.hireDriver /
              (completedTrips.traditional +
                completedTrips.carpool +
                completedTrips.hireDriver)
            }
            increase={`${(
              (completedTrips.hireDriver /
                (completedTrips.traditional +
                  completedTrips.carpool +
                  completedTrips.hireDriver)) *
              100
            ).toFixed(2)}%`}
            icon={
              <Person3Sharp
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 4"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          ></Typography>
          <Box
            height="500px"
            sx={{
              overflowY: "hidden", // Ẩn thanh cuộn dọc
              scrollbarWidth: "none", // Cho Firefox
              msOverflowStyle: "none", // Cho IE và Edge
              "&::-webkit-scrollbar": {
                display: "none", // Cho Chrome, Safari và Opera
              },
            }}
          >
            <PieChart />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 4"
          backgroundColor={colors.primary[400]}
          p="15px"
          sx={{
            overflowY: "hidden", // Ẩn thanh cuộn dọc
            scrollbarWidth: "none", // Cho Firefox
            msOverflowStyle: "none", // Cho IE và Edge
            "&::-webkit-scrollbar": {
              display: "none", // Cho Chrome, Safari và Opera
            },
          }}
        >
          {/* Tiêu đề Recent Transactions nằm trên */}
          <Typography
            color={colors.grey[100]}
            variant="h5"
            fontWeight="600"
            mb="10px"
            textAlign="center"
          ></Typography>

          {/* Component Recent Transactions */}
          <RecentTransactions />
        </Box>

        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
          display="flex"
          flexDirection="column"
        >
          {/* Tiêu đề và mũi tên */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="15px"
          >
            <Typography variant="h5" fontWeight="600" color="#ABDBE3">
              Xu hướng người dùng sử dụng dịch vụ 30 ngày qua
            </Typography>
            <IconButton
              onClick={() => navigate("/bar")}
              sx={{
                color: "#ABDBE3",
                "&:hover": {
                  backgroundColor: "transparent",
                  transform: "scale(1.1)",
                },
              }}
            >
              <ArrowForwardTwoToneIcon fontSize="large" />
            </IconButton>
          </Box>

          <Box
            height="100%"
            flexGrow={1}
            sx={{
              overflowY: "hidden", // Ẩn thanh cuộn dọc
              scrollbarWidth: "none", // Cho Firefox
              msOverflowStyle: "none", // Cho IE và Edge
              "&::-webkit-scrollbar": {
                display: "none", // Cho Chrome, Safari và Opera
              },
            }}
          >
            <NewUserLineChart />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
