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

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { admin } = useAuth();
  console.log();
  const [onlineDrivers, setOnlineDrivers] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [onlinePercentage, setOnlinePercentage] = useState("0");
  const [completedTrips, setCompletedTrips] = useState({
    traditional: 0,
    carpool: 0,
    hireDriver: 0,
  });
  // Hàm gọi API để lấy số tài xế online, tổng tài xế, và tỷ lệ phần trăm
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
  }, []); // Fetch data when the component mounts

  useEffect(() => {
    fetchOnlineDrivers();
  }, []); // Gọi API khi component được render lần đầu

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Xin Chào Admin FRide!" />

        {/* <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box> */}
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
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
          <Box height="500px">
            <PieChart />
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>
          {/* {mockTransactions.map((transaction, i) => (
            <Box
              key={`${transaction.txId}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction.txId}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.user}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{transaction.date}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                ${transaction.cost}
              </Box>
            </Box>
          ))} */}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              $48,352 revenue generated
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
          </Box>
        </Box>
        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
          display="flex"
          flexDirection="column"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Xu Hướng Đăng Ký Người Dùng Mới Trong 30 Ngày Qua
          </Typography>
          <Box height="100%" flexGrow={1}>
            <NewUserLineChart />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
