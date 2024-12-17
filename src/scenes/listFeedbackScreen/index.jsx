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
import Star from "@mui/icons-material/Star";

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

  // Dialog for review details
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
        if (error.response && error.response.status === 401) {
          // Session has expired, show the expired message
          showSnackbar(
            "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
            "error"
          );
        } else {
          setError("Lỗi hệ thống. Vui lòng thử lại sau.");
          showSnackbar("Lỗi hệ thống. Vui lòng thử lại sau.", "error");
        }
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

  if (drivers.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6" color="textSecondary">
          Không có dữ liệu để hiển thị
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
          DANH SÁCH CÁC ĐÁNH GIÁ TÀI XẾ
        </Typography>
      </Box>
      <Box m="40px 0 0 0" height="75vh">
        <DataGrid
          rows={drivers}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
          filterMode="client"
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 40, 60]}
          rowHeight={100}
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
                    <TableCell>Nội Dung</TableCell>
                    <TableCell>Đánh Giá</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedReviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>{review.content}</TableCell>
                      <TableCell>
                        {Array.from({ length: review.rate }, (_, index) => (
                          <Star key={index} color="warning" />
                        ))}
                      </TableCell>
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
