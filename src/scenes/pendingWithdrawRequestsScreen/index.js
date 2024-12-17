import api from "../../api/axiosConfig";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  ButtonGroup,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const PendingWithdrawRequests = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await axios.get(
        "https://flexiride.onrender.com/driver/wallet/withdraw-requests/pending"
      );

      // const response = await axios.get(
      //   "http://localhost:3000/driver/wallet/withdraw-requests/pending"
      // );

      setWithdrawRequests(
        response.data.pendingWithdrawals.map((req, index) => ({
          ...req,
          index: index + 1,
        }))
      );
    } catch (err) {
      console.error("Error fetching pending withdrawals:", err);
      showSnackbar("Không thể tải danh sách. Vui lòng thử lại sau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWithdrawals();
  }, []);

  // Approve a withdrawal request
  const processApproveRequest = async (transactionId) => {
    try {
      const response = await axios.post(
        "https://flexiride.onrender.com/driver/wallet/withdraw-request/approve",
        { transactionId }
      );

      // const response = await axios.post(
      //   "http://localhost:3000/driver/wallet/withdraw-request/approve",
      //   { transactionId }
      // );

      if (response.data.success) {
        showSnackbar("Yêu cầu rút tiền đã được phê duyệt.", "success");

        // Cập nhật trạng thái trực tiếp
        setWithdrawRequests((prevRequests) =>
          prevRequests.map((request) =>
            request._id === transactionId
              ? { ...request, status: "APPROVED" }
              : request
          )
        );
      }
    } catch (err) {
      console.error("Error approving request:", err);
      showSnackbar(
        err.response?.data?.message || "Có lỗi xảy ra khi duyệt yêu cầu.",
        "error"
      );
    }
  };

  const processCompleteRequest = async (transactionId) => {
    try {
      const response = await axios.post(
        "https://flexiride.onrender.com/driver/wallet/withdraw-request/complete",
        { transactionId }
      );

      // const response = await axios.post(
      //   "http://localhost:3000/driver/wallet/withdraw-request/complete",
      //   { transactionId }
      // );
      if (response.data.success) {
        showSnackbar("Giao dịch đã được hoàn tất.", "success");

        // Xóa dòng khỏi danh sách
        setWithdrawRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== transactionId)
        );
      }
    } catch (err) {
      console.error("Error completing request:", err);
      showSnackbar(
        err.response?.data?.message || "Có lỗi xảy ra khi hoàn tất giao dịch.",
        "error"
      );
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const columns = [
    {
      field: "index",
      headerName: "STT",
      flex: 0.5,
      renderCell: (params) => params.row.index,
    },
    {
      field: "fullName",
      headerName: "Họ và Tên",
      flex: 1,
      renderCell: (params) => params.row.driverDetails?.fullName || "",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => params.row.driverDetails?.email || "",
    },
    {
      field: "phoneNumber",
      headerName: "Số điện thoại",
      flex: 1,
      renderCell: (params) => params.row.driverDetails?.phoneNumber || "",
    },
    {
      field: "bankName",
      headerName: "Tên Ngân Hàng",
      flex: 1,
      renderCell: (params) =>
        params.row.driverDetails?.bankAccount?.bankName || "",
    },
    {
      field: "accountNumber",
      headerName: "Số Tài Khoản",
      flex: 1,
      renderCell: (params) =>
        params.row.driverDetails?.bankAccount?.accountNumber || "",
    },
    {
      field: "amount",
      headerName: "Số tiền",
      flex: 1,
      renderCell: (params) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          currencyDisplay: "code", // Thêm dòng này để hiển thị VND thay vì đ
        }).format(params.value),
    },

    {
      field: "createdAt",
      headerName: "Ngày gửi yêu cầu",
      flex: 1,
      renderCell: (params) =>
        new Date(params.row.createdAt).toLocaleDateString("vi-VN"),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      renderCell: (params) =>
        params.value === "PENDING"
          ? "Đang chờ"
          : params.value === "APPROVED"
          ? "Đã duyệt"
          : "",
    },

    {
      field: "Hành động",
      flex: 1,
      renderCell: (params) => (
        <ButtonGroup>
          {params.row.status === "PENDING" && (
            <Button
              style={{
                backgroundColor: "#2E8B57",
                color: "#FFFFFF",
              }}
              onClick={() => processApproveRequest(params.row._id)}
            >
              Duyệt
            </Button>
          )}
          {params.row.status === "APPROVED" && (
            <Button
              style={{
                backgroundColor: "#FFA726", // Màu cam
                color: "#FFFFFF", // Màu chữ trắng
              }}
              onClick={() => processCompleteRequest(params.row._id)}
            >
              Hoàn tất
            </Button>
          )}
        </ButtonGroup>
      ),
    },
  ];

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
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (withdrawRequests.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h5">
          Không có yêu cầu rút tiền nào đang chờ xử lý.
        </Typography>
      </Box>
    );
  }

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
          YÊU CẦU RÚT TIỀN
        </Typography>
      </Box>

      <Box m="40px 0 0 0" height="75vh">
        <DataGrid
          rows={withdrawRequests}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
          rowHeight={80}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingWithdrawRequests;
