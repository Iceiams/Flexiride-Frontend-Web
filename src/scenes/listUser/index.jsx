import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

const api = axios.create({
  baseURL: "http://localhost:3000/admin",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const ListUsers = () => {
  const [data, setData] = useState([]);
  const [view, setView] = useState("drivers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const endpoint = view === "drivers" ? "/drivers" : "/customers";
      console.log("Fetching data from:", endpoint);
      const response = await api.get(endpoint);
      const fetchedData =
        view === "drivers" ? response.data.drivers : response.data.customers;
      console.log("Fetched data:", fetchedData);
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể lấy dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  const handleViewChange = (newView) => {
    setData([]);
    setError(null);
    setView(newView);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetail = (document) => {
    setSelectedDocument(document);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setSelectedDocument(null);
    setOpenDetail(false);
  };

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: "#0a1929",
        color: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Thông tin tài xế và khách hàng
      </Typography>

      <Box sx={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button
          variant={view === "drivers" ? "contained" : "outlined"}
          onClick={() => handleViewChange("drivers")}
          sx={{
            backgroundColor: view === "drivers" ? "#007bff" : "transparent",
            color: "#ffffff",
          }}
        >
          Hiển thị Tài xế
        </Button>
        <Button
          variant={view === "customers" ? "contained" : "outlined"}
          onClick={() => handleViewChange("customers")}
          sx={{
            backgroundColor: view === "customers" ? "#007bff" : "transparent",
            color: "#ffffff",
          }}
        >
          Hiển thị Khách hàng
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: "#1e2a38" }}>
          <Table>
            <TableHead>
              <TableRow>
                {view === "drivers" ? (
                  <>
                    <TableCell sx={{ color: "#ffffff" }}>Họ và tên</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      Số điện thoại
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>Email</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>Giới tính</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>Thành phố</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      Loại dịch vụ
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      Ảnh đại diện
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      Loại giấy phép
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      Tài khoản ngân hàng
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      Trạng thái hoạt động
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ color: "#ffffff" }}>Họ và tên</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      Số điện thoại
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>Email</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>Giới tính</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item._id}>
                    {view === "drivers" ? (
                      <>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.personalInfo.firstName}{" "}
                          {item.personalInfo.lastName}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.personalInfo.phoneNumber}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.personalInfo.email}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.personalInfo.gender}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.personalInfo.city}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.role}
                        </TableCell>
                        <TableCell>
                          <Avatar
                            src={item.personalInfo.avatar}
                            alt="Avatar"
                            sx={{ width: 50, height: 50 }}
                          />
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenDetail(item.document)}
                          >
                            Chi tiết
                          </Button>
                        </TableCell>

                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.bankAccount.accountHolderName} <br />
                          {item.bankAccount.accountNumber} <br />
                          {item.bankAccount.bankName}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.activityStatus}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.name}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.phone}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.email}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.gender}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {/* Phân trang */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ color: "#ffffff", backgroundColor: "#1e2a38" }}
          />
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
                      Ngày cấp: {selectedDocument.passport.issueDate}
                    </Typography>
                    <Typography>
                      Nơi cấp: {selectedDocument.passport.issuePlace}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                      <img
                        src={selectedDocument.passport.frontImage}
                        alt="Passport Front"
                        width="100"
                        style={{ borderRadius: 8 }}
                      />
                      <img
                        src={selectedDocument.passport.backImage}
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
                        src={selectedDocument.driverLicense.frontImage}
                        alt="Driver License Front"
                        width="100"
                        style={{ borderRadius: 8 }}
                      />
                      <img
                        src={selectedDocument.driverLicense.backImage}
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
                      Ngày cấp: {selectedDocument.criminalRecord.issueDate}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                      <img
                        src={selectedDocument.criminalRecord.frontImage}
                        alt="Criminal Record Front"
                        width="100"
                        style={{ borderRadius: 8 }}
                      />
                      <img
                        src={selectedDocument.criminalRecord.backImage}
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
                      {selectedDocument.vehicleRegistration.licensePlate}
                    </Typography>
                    <Typography>
                      Loại nhiên liệu:{" "}
                      {selectedDocument.vehicleRegistration.fuelType}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                      <img
                        src={selectedDocument.vehicleRegistration.frontImage}
                        alt="Vehicle Registration Front"
                        width="100"
                        style={{ borderRadius: 8 }}
                      />
                      <img
                        src={selectedDocument.vehicleRegistration.backImage}
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
                        src={selectedDocument.vehicleInsurance.frontImage}
                        alt="Vehicle Insurance Front"
                        width="100"
                        style={{ borderRadius: 8 }}
                      />
                      <img
                        src={selectedDocument.vehicleInsurance.backImage}
                        alt="Vehicle Insurance Back"
                        width="100"
                        style={{ borderRadius: 8 }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListUsers;
