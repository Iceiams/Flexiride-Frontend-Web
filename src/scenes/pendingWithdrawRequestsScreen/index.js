import api from "../../api/axiosConfig";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  ButtonGroup,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";

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

  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await api.get(
        "http://localhost:3000/driver/wallet/withdraw-requests/pending"
      );
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
      const response = await api.post(
        "http://localhost:3000/driver/wallet/withdraw-request/approve",
        { transactionId }
      );
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
      const response = await api.post(
        "http://localhost:3000/driver/wallet/withdraw-request/complete",
        { transactionId }
      );
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

  const handleOpenRejectDialog = () => {
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectReason("");
  };

  const handleReject = (transactionId) => {
    processWithdrawRequest(transactionId, false, rejectReason);
    handleCloseRejectDialog();
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
    // {
    //   field: "amount",
    //   headerName: "Số tiền",
    //   flex: 1,
    //   renderCell: (params) =>
    //     new Intl.NumberFormat("vi-VN").format(params.value), // Chỉ định dạng số
    // },

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
                backgroundColor: "#2E8B57", // Màu xanh
                color: "#FFFFFF", // Màu chữ trắng
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
      <Header title="Yêu cầu rút tiền" />
      <Box m="40px 0 0 0" height="75vh">
        <DataGrid
          rows={withdrawRequests}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
          rowHeight={80}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Box>

      {/* Snackbar for success and error messages */}
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
