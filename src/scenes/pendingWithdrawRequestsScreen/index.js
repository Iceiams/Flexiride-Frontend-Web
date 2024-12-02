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
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchPendingWithdrawals = async () => {
      try {
        const response = await api.get(
          "http://localhost:3000/driver/wallet/withdraw-requests/pending"
        );

        // Thêm số thứ tự vào mỗi dòng dữ liệu
        const updatedWithdrawRequests = response.data.pendingWithdrawals.map(
          (request, index) => ({
            ...request,
            index: index + 1, // Thêm số thứ tự
          })
        );

        setWithdrawRequests(updatedWithdrawRequests);
      } catch (err) {
        console.error("Error fetching pending withdrawals:", err);
        setError("Failed to load pending withdrawals");
        showSnackbar("Failed to load pending withdrawals", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingWithdrawals();
  }, []);

  const processWithdrawRequest = async (transactionId, approve) => {
    try {
      const url = `http://localhost:3000/driver/wallet/withdraw-request/approve`;
      const response = await api.post(url, {
        transactionId,
        action: approve ? "APPROVE" : "REJECT",
      });

      // Check the response from the server
      if (response.data && response.data.success) {
        // Remove the transaction from the list
        setWithdrawRequests((prev) =>
          prev.filter((transaction) => transaction._id !== transactionId)
        );

        // Show success message
        showSnackbar(
          approve
            ? "Yêu cầu rút tiền đã được xử lý."
            : "Yêu cầu rút tiền đã bị từ chối",
          "success"
        );
      } else {
        // If the response indicates a failure
        showSnackbar(
          response.data?.message || "Có lỗi xảy ra khi xử lý yêu cầu",
          "error"
        );
      }
    } catch (error) {
      console.error("Error processing withdrawal request:", error);

      // More detailed error handling
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi xử lý yêu cầu rút tiền";

      showSnackbar(errorMessage, "error");
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
      renderCell: (params) => {
        if (params.value === "PENDING") {
          return "Đang chờ";
        } else {
          return "Không xác định"; // Giá trị mặc định nếu không phải "pending"
        }
      },
    },

    {
      field: "Hành động",
      flex: 1,
      renderCell: (params) => (
        <ButtonGroup variant="contained">
          <Button
            color="success"
            onClick={() => processWithdrawRequest(params.row._id, true)}
          >
            Duyệt
          </Button>
          {/* <Button color="error" onClick={() => handleOpenRejectDialog()}>
            Từ chối
          </Button> */}
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

      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
        <DialogTitle>Nhập lý do từ chối</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do từ chối"
            type="text"
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Hủy</Button>
          <Button onClick={() => handleReject(transactionId)}>Từ chối</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingWithdrawRequests;
