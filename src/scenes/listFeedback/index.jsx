import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import {
  Box,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";

const DriverReviews = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Dialog cho chi tiết review
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);

  useEffect(() => {
    const fetchDriversData = async () => {
      try {
        const [driversResponse, reviewCountsResponse] = await Promise.all([
          api.get("/getAllDriversWithReviews"),
          api.get("/getDriverReviewCount"),
        ]);

        const drivers = driversResponse.data.drivers;
        const reviewCounts = reviewCountsResponse.data.reviewCounts;

        // Kết hợp dữ liệu từ cả hai API và thêm index
        const combinedData = drivers.map((driver, index) => {
          const reviewData = reviewCounts.find(
            (count) => count.driverId === driver._id
          );
          return {
            ...driver,
            index: index + 1,
            reviewCount: reviewData ? reviewData.reviewCount : 0,
            fullName: `${driver.personalInfo?.firstName || ""} ${
              driver.personalInfo?.lastName || ""
            }`.trim(),
          };
        });

        setDrivers(combinedData);
      } catch (error) {
        setError("Failed to load drivers");
        showSnackbar("Failed to load drivers", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDriversData();
  }, []);

  // Snackbar handler
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle review dialog open and close
  const handleOpenReviewDialog = (reviews) => {
    setSelectedReviews(reviews);
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
    setSelectedReviews([]);
  };

  const columns = [
    {
      field: "index",
      headerName: "STT",
      flex: 0.5,
    },

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
      field: "role",
      headerName: "Dịch Vụ",
      flex: 1,
      renderCell: (params) => params.row.role || "Chưa xác định",
    },
    {
      field: "avatar",
      headerName: "Ảnh đại diện",
      flex: 1,
      renderCell: (params) => (
        <Avatar
          src={params.row.personalInfo?.avatar || ""}
          alt="Avatar"
          sx={{ width: 55, height: 55, marginTop: "23px" }}
        />
      ),
    },
    {
      field: "reviewCount",
      headerName: "Số Lượng Đánh Giá",
      flex: 1,
      renderCell: (params) => params.row.reviewCount || 0,
    },

    {
      field: "reviews",
      headerName: "Chi Tiết Đánh Giá",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="success"
          onClick={() => handleOpenReviewDialog(params.row.reviews)}
        >
          Chi Tiết
        </Button>
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

  return (
    <Box m="20px">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Bảng Đánh Giá Tài Xế
      </Typography>
      <Box m="40px 0 0 0" height="75vh">
        <DataGrid
          rows={drivers}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
          filterMode="client" // Bật tính năng lọc phía client
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20 }, // Đặt trang mặc định là 20
            },
          }}
          pageSizeOptions={[20, 40, 60]} // Tùy chọn phân trang mới
          rowHeight={100}
          //   autoHeight // Tự động điều chỉnh chiều cao
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#FFCF48", // Màu nền tiêu đề
              color: "#FDC83C", // Màu chữ
              fontWeight: "bold",
              fontSize: "15px",
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },
          }}
        />
      </Box>

      {/* Dialog for showing review details in a table format */}
      <Dialog
        open={openReviewDialog}
        onClose={handleCloseReviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent dividers>
          {selectedReviews.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      fontFamily: "monospace",
                      color: "#1241A9",
                      textAlign: "center",
                      backgroundColor: "#3D4C6E",
                      padding: "16px",
                      borderBottom: "2px solid #3D4C6E",
                    }}
                  >
                    <TableCell>Người Đánh Giá</TableCell>
                    <TableCell>Nội Dung</TableCell>
                    <TableCell>Đánh Giá</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedReviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>{review.account_id?.name}</TableCell>
                      <TableCell>{review.content}</TableCell>
                      <TableCell>{review.rate} ⭐</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Chưa có đánh giá nào.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

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

export default DriverReviews;
