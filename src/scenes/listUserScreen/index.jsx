import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
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
import Topbar from "../global/Topbar";
import moment from "moment";
const ListUsers = ({ searchQuery }) => {
  const [data, setData] = useState([]);
  const [view, setView] = useState("drivers");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchData = async (
    query = "",
    view = "drivers",
    page = 0,
    rowsPerPage = 5
  ) => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      let endpoint;

      if (query) {
        endpoint =
          view === "drivers"
            ? `/searchData?query=${query}&type=drivers&page=${page}&limit=${rowsPerPage}`
            : `/searchData?query=${query}&type=customers&page=${page}&limit=${rowsPerPage}`;
      } else {
        endpoint =
          view === "drivers"
            ? `/drivers?page=${page}&limit=${rowsPerPage}`
            : `/customers?page=${page}&limit=${rowsPerPage}`;
      }

      const response = await api.get(endpoint);
      const fetchedData =
        view === "drivers" ? response.data.drivers : response.data.customers;
      setData(fetchedData);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        console.warn("Session expired. Please log in again.");
      } else {
        console.error("Error fetching data:", err);
        setError("Không thể lấy dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(query || searchQuery || "", view, page, rowsPerPage);
  }, [view, page, rowsPerPage]);

  const handleSearch = (query) => {
    setQuery(query);
    fetchData(query, view);
  };

  const handleViewChange = (newView) => {
    setData([]);
    setError(null);
    setView(newView);
    setQuery("");
    fetchData("", newView);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchData(query, view);
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

  const handleOpenImageDialog = (imageSrc) => {
    setSelectedImage(imageSrc);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setSelectedImage(null);
    setOpenImageDialog(false);
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
      <Typography
        variant="h4"
        sx={{
          backgroundColor: "#0A1929", // Màu tối giống "Hồ Sơ Đợi Duyệt"
          borderRadius: "10px",
          padding: "14px",
          textAlign: "center",
          boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          color: "#ffffff",
          fontFamily: "'Playfair Display', sans-serif",
          fontWeight: "bold",
        }}
      >
        THÔNG TIN TÀI XẾ VÀ KHÁCH HÀNG
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between", // Các phần tử cách nhau
          alignItems: "center",
          marginBottom: "20px",
          marginTop: "40px",
        }}
      >
        {/* Phần nút chuyển đổi */}
        <Box sx={{ display: "flex", gap: "10px" }}>
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

        {/* Phần thanh tìm kiếm */}
        <Box sx={{ marginLeft: "auto" }}>
          <Topbar onSearch={handleSearch} view={view} />
        </Box>
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
      ) : data.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#ffffff",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Không tìm thấy người dùng
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#a1a1a1",
              fontSize: "18px",
            }}
          >
            Vui lòng kiểm tra từ khóa tìm kiếm hoặc chọn danh mục khác.
          </Typography>
          <Box
            sx={{
              marginTop: "20px",
            }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#007bff",
                color: "#ffffff",
                padding: "10px 20px",
                fontSize: "16px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#0056b3",
                },
              }}
              onClick={() => fetchData("", view, 0, rowsPerPage)}
            >
              Làm mới
            </Button>
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: "#1e2a38" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#ffffff" }}>STT</TableCell>{" "}
                {/* Thêm cột STT */}
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
                .map((item, index) => (
                  <TableRow key={item._id || index}>
                    {/* STT */}
                    <TableCell sx={{ color: "#ffffff" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
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
                        {/* Trạng thái hoạt động */}
                        <TableCell
                          sx={{
                            color:
                              item.status === "online"
                                ? "#4CAF50"
                                : item.status === "offline"
                                ? "#F44336"
                                : "#9E9E9E", // Màu xám nếu không xác định
                            fontWeight: "light",
                          }}
                        >
                          {item.status === "online"
                            ? "Online"
                            : item.status === "offline"
                            ? "Offline"
                            : "Không xác định"}
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang" // Giữ nguyên phần này
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trong tổng ${count}`
            }
            sx={{ color: "#ffffff", backgroundColor: "#1e2a38" }}
          />
          <Dialog
            open={openDetail}
            onClose={handleCloseDetail}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: "#1e2a38",
                color: "#ffffff",
                borderRadius: "12px",
              },
            }}
          >
            <DialogTitle
              sx={{
                backgroundColor: "#0a1929",
                color: "#ffffff",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Chi tiết giấy phép
            </DialogTitle>

            <DialogContent
              dividers
              sx={{
                backgroundColor: "#1e2a38",
                color: "#ffffff",
              }}
            >
              {selectedDocument && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Passport Section */}
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        marginBottom: 2,
                        color: "#FF9800",
                        borderBottom: "2px solid #FF9800",
                      }}
                    >
                      Căn cước công dân:
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography>
                          Ngày cấp:{" "}
                          {moment(selectedDocument.passport.issueDate).format(
                            "DD/MM/YYYY"
                          )}
                        </Typography>
                        <Typography>
                          Nơi cấp: {selectedDocument.passport.issuePlace}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, textAlign: "center" }}
                          >
                            Mặt trước
                          </Typography>
                          <img
                            src={selectedDocument.passport.frontImage}
                            alt="Passport Front"
                            style={{
                              width: "150px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            }}
                            onClick={() =>
                              handleOpenImageDialog(
                                selectedDocument.passport.frontImage
                              )
                            }
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, textAlign: "center" }}
                          >
                            Mặt sau
                          </Typography>
                          <img
                            src={selectedDocument.passport.backImage}
                            alt="Passport Back"
                            style={{
                              width: "150px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            }}
                            onClick={() =>
                              handleOpenImageDialog(
                                selectedDocument.passport.backImage
                              )
                            }
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Các phần khác với kiểu dáng thống nhất */}
                    {/* Bằng lái xe */}
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          marginBottom: 2,
                          color: "#FF9800",
                          borderBottom: "2px solid #FF9800",
                        }}
                      >
                        Bằng lái xe
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography>
                            Số bằng: {selectedDocument.driverLicense.number}
                          </Typography>
                          <Typography>
                            Ngày cấp:{" "}
                            {moment(
                              selectedDocument.driverLicense.issueDate
                            ).format("DD/MM/YYYY")}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, textAlign: "center" }}
                            >
                              Mặt trước
                            </Typography>
                            <img
                              src={selectedDocument.driverLicense.frontImage}
                              alt="Driver License Front"
                              style={{
                                width: "150px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                              onClick={() =>
                                handleOpenImageDialog(
                                  selectedDocument.driverLicense.frontImage
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, textAlign: "center" }}
                            >
                              Mặt sau
                            </Typography>
                            <img
                              src={selectedDocument.driverLicense.backImage}
                              alt="Driver License Back"
                              style={{
                                width: "150px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                              onClick={() =>
                                handleOpenImageDialog(
                                  selectedDocument.driverLicense.backImage
                                )
                              }
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Lý lịch tư pháp */}
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          marginBottom: 2,
                          color: "#FF9800",
                          borderBottom: "2px solid #FF9800",
                        }}
                      >
                        Lý lịch tư pháp
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography>
                            Ngày cấp:{" "}
                            {moment(
                              selectedDocument.criminalRecord.issueDate
                            ).format("DD/MM/YYYY")}
                          </Typography>
                          <Typography>
                            Nơi cấp:{" "}
                            {selectedDocument.criminalRecord.issuePlace}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, textAlign: "center" }}
                            >
                              Mặt trước
                            </Typography>
                            <img
                              src={selectedDocument.criminalRecord.frontImage}
                              alt="Criminal Record Front"
                              style={{
                                width: "150px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                              onClick={() =>
                                handleOpenImageDialog(
                                  selectedDocument.criminalRecord.frontImage
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, textAlign: "center" }}
                            >
                              Mặt sau
                            </Typography>
                            <img
                              src={selectedDocument.criminalRecord.backImage}
                              alt="Criminal Record Back"
                              style={{
                                width: "150px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                              onClick={() =>
                                handleOpenImageDialog(
                                  selectedDocument.criminalRecord.backImage
                                )
                              }
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Đăng ký phương tiện */}
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          marginBottom: 2,
                          color: "#FF9800",
                          borderBottom: "2px solid #FF9800",
                        }}
                      >
                        Đăng ký phương tiện
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography>
                            Biển số:{" "}
                            {selectedDocument.vehicleRegistration.licensePlate}
                          </Typography>
                          <Typography>
                            Loại nhiên liệu:{" "}
                            {selectedDocument.vehicleRegistration.fuelType}
                          </Typography>
                          <Typography>
                            Ngày đăng ký:{" "}
                            {moment(
                              selectedDocument.vehicleRegistration
                                .registrationDate
                            ).format("DD/MM/YYYY")}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, textAlign: "center" }}
                            >
                              Mặt trước
                            </Typography>
                            <img
                              src={
                                selectedDocument.vehicleRegistration.frontImage
                              }
                              alt="Vehicle Registration Front"
                              style={{
                                width: "150px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                              onClick={() =>
                                handleOpenImageDialog(
                                  selectedDocument.vehicleRegistration
                                    .frontImage
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, textAlign: "center" }}
                            >
                              Mặt sau
                            </Typography>
                            <img
                              src={
                                selectedDocument.vehicleRegistration.backImage
                              }
                              alt="Vehicle Registration Back"
                              style={{
                                width: "150px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                              onClick={() =>
                                handleOpenImageDialog(
                                  selectedDocument.vehicleRegistration.backImage
                                )
                              }
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Bảo hiểm xe */}
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          marginBottom: 2,
                          color: "#FF9800",
                          borderBottom: "2px solid #FF9800",
                        }}
                      >
                        Bảo hiểm xe
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography>
                            Số hợp đồng:{" "}
                            {selectedDocument.vehicleInsurance.contractNumber}
                          </Typography>
                          <Typography>
                            Ngày hiệu lực:{" "}
                            {moment(
                              selectedDocument.vehicleInsurance.startDate
                            ).format("DD/MM/YYYY")}
                          </Typography>
                          <Typography>
                            Ngày hết hạn:{" "}
                            {moment(
                              selectedDocument.vehicleInsurance.endDate
                            ).format("DD/MM/YYYY")}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, textAlign: "center" }}
                            >
                              Mặt trước
                            </Typography>
                            <img
                              src={selectedDocument.vehicleInsurance.frontImage}
                              alt="Vehicle Insurance Front"
                              style={{
                                width: "150px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                              onClick={() =>
                                handleOpenImageDialog(
                                  selectedDocument.vehicleInsurance.frontImage
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, textAlign: "center" }}
                            >
                              Mặt sau
                            </Typography>
                            <img
                              src={selectedDocument.vehicleInsurance.backImage}
                              alt="Vehicle Insurance Back"
                              style={{
                                width: "150px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                              onClick={() =>
                                handleOpenImageDialog(
                                  selectedDocument.vehicleInsurance.backImage
                                )
                              }
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </DialogContent>
          </Dialog>
          {/* Dialog hiển thị ảnh lớn */}
          <Dialog
            open={openImageDialog}
            onClose={handleCloseImageDialog}
            maxWidth="lg"
            PaperProps={{
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
            }}
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Enlarged"
                style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  borderRadius: "10px",
                }}
              />
            )}
          </Dialog>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListUsers;
