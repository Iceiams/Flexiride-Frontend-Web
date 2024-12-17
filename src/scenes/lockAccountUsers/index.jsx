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
import { Tooltip } from "@mui/material";

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
      if (error.response) {
        // Kiểm tra lỗi session hết hạn
        if (
          error.response.status === 401 ||
          error.response.data.message?.includes("Session expired")
        ) {
          console.log("Session expired. Please log in again.");
          setSnackbarMessage(
            "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else {
          setSnackbarMessage(
            error.response.data.message ||
              "Có lỗi xảy ra khi mở khóa tài khoản."
          );
        }
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
        const fetchedDrivers = response.data.drivers || [];

        if (fetchedDrivers.length === 0) {
          // Danh sách rỗng, không phải lỗi
          setDrivers([]);
          setError(null);
        } else {
          // Có tài khoản bị khóa
          setDrivers(fetchedDrivers);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching drivers:", err);
        setDrivers([]); // Đảm bảo không có dữ liệu hiển thị khi gặp lỗi
        setError(
          "Không thể tải danh sách tài khoản. Có thể xảy ra lỗi hệ thống hoặc kết nối."
        );
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
          <span role="img" aria-label="error">
            🚫
          </span>{" "}
          Lỗi xảy ra
        </Typography>
        <Typography variant="body1" color="textSecondary" mt={2}>
          {error}
        </Typography>
      </Box>
    );
  }

  if (!error && drivers.length === 0) {
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
            📋
          </span>{" "}
          Không có tài khoản nào bị khóa.
        </Typography>
        <Typography variant="body1" color="textSecondary" mt={2}>
          Hiện tại không có tài khoản nào đang bị khóa. Bạn có thể quay lại sau.
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
      renderCell: (params) => (
        <Tooltip title={params.row.lockReason || "Không có lý do"}>
          <span>{params.row.lockReason || ""}</span>
        </Tooltip>
      ),
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
          Mở Khóa
        </Button>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box
        sx={{
          backgroundColor: "#141B2D",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          marginBottom: "20px",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#ffffff",
            fontFamily: "'Playfair Display', sans-serif",
            fontWeight: "bold",
          }}
        >
          DANH SÁCH TÀI KHOẢN BỊ KHÓA
        </Typography>
      </Box>
      <Box m="40px 0 0 0" height="75vh">
        <DataGrid
          rows={drivers}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
          rowHeight={80}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1F2A40", // Màu nền header
              color: "#4CCEAC", // Màu chữ header
              fontSize: "14px",
            },
            "& .MuiDataGrid-columnHeader": {
              color: "#F7AB3F", // Màu chữ cho từng ô header
              fontWeight: "bold",
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "13px",
            },
          }}
          localeText={{
            toolbarDensity: "Mật độ",
            toolbarDensityLabel: "Mật độ",
            toolbarDensityCompact: "Nhỏ",
            toolbarDensityStandard: "Tiêu chuẩn",
            toolbarDensityComfortable: "Thoải mái",
            noRowsLabel: "Không có dữ liệu",
            columnMenuSortAsc: "Sắp xếp tăng dần",
            columnMenuSortDesc: "Sắp xếp giảm dần",
            columnMenuFilter: "Lọc",
            columnMenuHideColumn: "Ẩn cột",
            columnMenuShowColumns: "Hiển thị cột",
            footerRowSelected: (count) => `${count} hàng đã chọn`,
            footerTotalRows: "Tổng số hàng:",
            columnMenuManageColumns: "Quản lý cột",
            footerPaginationRowsPerPage: "Số hàng mỗi trang",
            footerPaginationRowsPerPageTooltip: "Số hàng trên mỗi trang",
            footerPaginationOf: "của",
            MuiTablePagination: {
              labelRowsPerPage: "Số hàng mỗi trang",
            },
          }}
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
