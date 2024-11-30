import api from "../../api/axiosConfig";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Snackbar,
  Alert, // Import Alert
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";

const ListLockedUsers = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const unlockDriver = async (driverId) => {
    try {
      const response = await api.post(`/drivers/${driverId}/unlock`);
      setSnackbarMessage(response.data.message); // Lấy thông điệp từ phản hồi API
      setSnackbarSeverity("success");
      setOpenSnackbar(true); // Mở Snackbar khi unlock thành công

      // Cập nhật lại danh sách tài xế
      const updatedDrivers = drivers.filter(
        (driver) => driver._id !== driverId
      );
      setDrivers(updatedDrivers);
    } catch (error) {
      console.error("Error unlocking driver:", error);
      // Cập nhật thông báo lỗi dựa trên phản hồi từ server
      if (error.response) {
        setSnackbarMessage(
          error.response.data.message || "Có lỗi xảy ra khi mở khóa tài khoản."
        );
      } else {
        setSnackbarMessage("Có lỗi xảy ra khi mở khóa tài khoản.");
      }
      setSnackbarSeverity("error");
      setOpenSnackbar(true); // Mở Snackbar khi có lỗi
    }
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await api.get("/getLockedDrivers");
        setDrivers(response.data.drivers);
      } catch (err) {
        // Kiểm tra mã trạng thái và đặt thông báo lỗi tương ứng
        if (err.response && err.response.status === 404) {
          setError("Không có tài khoản nào bị khóa.");
        } else {
          setError("Lỗi khi tải danh sách tài xế.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        flexDirection="column"
      >
        <Typography variant="h4" color="textSecondary">
          <span role="img" aria-label="info">
            🚫
          </span>{" "}
          {error}
        </Typography>
        <Typography variant="body1" color="textSecondary" mt={2}>
          Hiện tại không có tài khoản nào đang bị khóa.
        </Typography>
      </Box>
    );
  }

  const columns = [
    { field: "index", headerName: "STT", flex: 0.5 },
    {
      field: "fullName",
      headerName: "Họ và Tên",
      flex: 1,
      renderCell: (params) =>
        `${params.row.personalInfo?.firstName || ""} ${
          params.row.personalInfo?.lastName || ""
        }`.trim(),
    },
    {
      field: "phoneNumber",
      headerName: "Số điện thoại",
      flex: 1,
      renderCell: (params) => params.row.personalInfo?.phoneNumber || "",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => params.row.personalInfo?.email || "",
    },
    {
      field: "avatar",
      headerName: "Ảnh đại diện",
      flex: 1,
      renderCell: (params) =>
        params.row.personalInfo?.avatar ? (
          <img
            src={params.row.personalInfo.avatar}
            alt="Avatar"
            style={{
              width: 55,
              height: 55,
              borderRadius: "50%",
              marginTop: "10px",
            }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      field: "lockReason",
      headerName: "Lí do khóa",
      flex: 1,
      renderCell: (params) => params.row.lockReason || "",
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => unlockDriver(params.row._id)}
        >
          Unlock
        </Button>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="Danh sách" subtitle="Tài Khoản Bị Khóa" />
      <Box m="40px 0 0 0" height="75vh">
        <DataGrid
          rows={drivers}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
          rowHeight={80}
        />
      </Box>

      {/* Snackbar for displaying messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListLockedUsers;
