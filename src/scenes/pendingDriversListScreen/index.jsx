import api from "../../api/axiosConfig";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";

const PendingDrivers = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const fetchPendingDrivers = async () => {
      try {
        const response = await api.get("/drivers/pending");
        const driversWithIndex = response.data.drivers.map((driver, index) => ({
          ...driver,
          index: index + 1,
          fullName: `${driver.personalInfo?.firstName || ""} ${
            driver.personalInfo?.lastName || ""
          }`.trim(),
        }));
        setPendingDrivers(driversWithIndex);
      } catch (err) {
        console.error("Error fetching pending drivers:", err);
        if (err.response?.status === 401) {
          console.error("Session expired. Please log in again."); // Log message
          showSnackbar(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            "warning"
          );
        } else {
          setError("Lỗi hệ thống. Vui lòng thử lại sau.");
          showSnackbar("Lỗi hệ thống. Vui lòng thử lại sau.", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPendingDrivers();
  }, []);

  const updateApprovalStatus = async (driverId, approve) => {
    try {
      const url = `/drivers/${driverId}/approve`;
      await api.put(url, { approve });
      setPendingDrivers((prevDrivers) =>
        prevDrivers.filter((driver) => driver._id !== driverId)
      );
      showSnackbar(
        approve
          ? "Hồ sơ tài xế đã được phê duyệt thành công"
          : "Hồ sơ tài xế đã bị từ chối thành công ",
        "success"
      );
    } catch (error) {
      console.error("Error updating approval status:", error);
      if (error.response?.status === 401) {
        console.error("Session expired. Please log in again.");
        showSnackbar(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          "warning"
        );
      } else if (error.response?.status === 404) {
        showSnackbar(
          "Dữ liệu không còn đồng bộ. Vui lòng làm mới danh sách.",
          "error"
        );
      } else {
        showSnackbar("Lỗi khi cập nhật trạng thái tài xế.", "error");
      }
    }
  };

  const handleOpenDetail = (document) => {
    setSelectedDocument(document);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedDocument(null);
  };

  // Function to show snackbar with a specific message and severity
  const showSnackbar = (message, severity) => {
    console.log("Snackbar Called:", { message, severity });
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    console.log("Snackbar Open State:", snackbarOpen);
  };

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    console.log("Snackbar Closed");
    setSnackbarOpen(false);
  };

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
      field: "gender",
      headerName: "Giới tính",
      flex: 1,
      renderCell: (params) => params.row.personalInfo?.gender || "N/A",
    },
    {
      field: "city",
      headerName: "Thành phố",
      flex: 1,
      renderCell: (params) => params.row.personalInfo?.city || "N/A",
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
      field: "licenseType",
      headerName: "Loại giấy phép",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          onClick={() => handleOpenDetail(params.row)}
        >
          Chi tiết
        </Button>
      ),
    },
    {
      field: "status",
      headerName: "Trạng Thái",
      flex: 1,
      renderCell: (params) => (
        <ButtonGroup variant="contained">
          <Button
            color="success"
            onClick={() => updateApprovalStatus(params.row._id, true)}
          >
            Duyệt
          </Button>
          <Button
            color="error"
            onClick={() => updateApprovalStatus(params.row._id, false)}
          >
            Từ chối
          </Button>
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

  // Kiểm tra nếu danh sách `pendingDrivers` rỗng
  if (pendingDrivers.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        flexDirection="column"
      >
        <Typography variant="h4" color="textSecondary">
          📋 Không có hồ sơ nào đợi duyệt
        </Typography>
        <Typography variant="body1" color="textSecondary" mt={2}>
          Hiện tại không có hồ sơ nào đang chờ phê duyệt. Vui lòng quay lại sau.
        </Typography>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header
        title={
          <Box
            sx={{
              backgroundColor: colors.primary[500],
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: colors.grey[100],
                fontFamily: "'Playfair Display', sans-serif",
                fontWeight: "bold",
              }}
            >
              DANH SÁCH HỒ SƠ ĐỢI DUYỆT
            </Typography>
          </Box>
        }
      />

      <Box m="40px 0 0 0" height="75vh">
        <DataGrid
          rows={pendingDrivers}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
          rowHeight={80}
        />
      </Box>

      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết giấy phép</DialogTitle>
        <DialogContent dividers>
          {selectedDocument && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Passport Section */}
              <Box>
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                  Hộ chiếu
                </Typography>
                <Typography>
                  Ngày cấp:{" "}
                  {selectedDocument?.document?.passport?.issueDate || "N/A"}
                </Typography>
                <Typography>
                  Nơi cấp:{" "}
                  {selectedDocument?.document?.passport?.issuePlace || "N/A"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                  <img
                    src={selectedDocument?.document?.passport?.frontImage || ""}
                    alt="Passport Front"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                  <img
                    src={selectedDocument?.document?.passport?.backImage || ""}
                    alt="Passport Back"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                </Box>
              </Box>

              {/* Driver License Section */}
              <Box>
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                  Bằng lái xe
                </Typography>
                <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                  <img
                    src={
                      selectedDocument?.document?.driverLicense?.frontImage ||
                      ""
                    }
                    alt="Driver License Front"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                  <img
                    src={
                      selectedDocument?.document?.driverLicense?.backImage || ""
                    }
                    alt="Driver License Back"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                </Box>
              </Box>

              {/* Criminal Record Section */}
              <Box>
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                  Lý lịch tư pháp
                </Typography>
                <Typography>
                  Ngày cấp:{" "}
                  {selectedDocument?.document?.criminalRecord?.issueDate ||
                    "N/A"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                  <img
                    src={
                      selectedDocument?.document?.criminalRecord?.frontImage ||
                      ""
                    }
                    alt="Criminal Record Front"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                  <img
                    src={
                      selectedDocument?.document?.criminalRecord?.backImage ||
                      ""
                    }
                    alt="Criminal Record Back"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                </Box>
              </Box>

              {/* Vehicle Registration Section */}
              <Box>
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                  Đăng ký phương tiện
                </Typography>
                <Typography>
                  Biển số:{" "}
                  {selectedDocument?.document?.vehicleRegistration
                    ?.licensePlate || "N/A"}
                </Typography>
                <Typography>
                  Loại nhiên liệu:{" "}
                  {selectedDocument?.document?.vehicleRegistration?.fuelType ||
                    "N/A"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                  <img
                    src={
                      selectedDocument?.document?.vehicleRegistration
                        ?.frontImage || ""
                    }
                    alt="Vehicle Registration Front"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                  <img
                    src={
                      selectedDocument?.document?.vehicleRegistration
                        ?.backImage || ""
                    }
                    alt="Vehicle Registration Back"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                </Box>
              </Box>

              {/* Vehicle Insurance Section */}
              <Box>
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                  Bảo hiểm xe
                </Typography>
                <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                  <img
                    src={
                      selectedDocument?.document?.vehicleInsurance
                        ?.frontImage || ""
                    }
                    alt="Vehicle Insurance Front"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                  <img
                    src={
                      selectedDocument?.document?.vehicleInsurance?.backImage ||
                      ""
                    }
                    alt="Vehicle Insurance Back"
                    width="100"
                    style={{ borderRadius: 8 }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} color="primary">
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

export default PendingDrivers;
