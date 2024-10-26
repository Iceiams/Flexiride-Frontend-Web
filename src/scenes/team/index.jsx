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
} from "@mui/material";

// Cấu hình axios
const api = axios.create({
  baseURL: "http://localhost:3000/admin",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [view, setView] = useState("drivers"); // Khởi tạo là "drivers"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(5); // Số hàng mỗi trang

  // Hàm để gọi API lấy danh sách tài xế hoặc khách hàng
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData([]); // Làm trống dữ liệu trước khi tải lại

    try {
      const endpoint = view === "drivers" ? "/drivers" : "/customers";
      console.log("Fetching data from:", endpoint); // Thêm log để kiểm tra endpoint
      const response = await api.get(endpoint);
      const fetchedData =
        view === "drivers" ? response.data.drivers : response.data.customers;
      console.log("Fetched data:", fetchedData); // Thêm log để kiểm tra dữ liệu từ API
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể lấy dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại API mỗi khi view thay đổi giữa drivers và customers
  useEffect(() => {
    fetchData();
  }, [view]);

  // Thay đổi view khi bấm nút và đảm bảo làm trống data và error
  const handleViewChange = (newView) => {
    setData([]); // Làm trống data để tránh lỗi khi chuyển đổi view
    setError(null); // Xóa lỗi trước khi tải dữ liệu mới
    setView(newView);
  };

  // Xử lý khi thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Xử lý khi thay đổi số hàng trên mỗi trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số hàng mỗi trang
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
                    <TableCell sx={{ color: "#ffffff" }}>Vai trò</TableCell>
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
                          {item.personalInfo.serviceType}
                        </TableCell>
                        <TableCell>
                          <Avatar
                            src={item.personalInfo.avatar}
                            alt="Avatar"
                            sx={{ width: 50, height: 50 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.document.driverLicense && "Bằng lái xe"}
                          <br />
                          {item.document.passport && "Hộ chiếu"}
                          <br />
                          {item.document.criminalRecord && "Lý lịch tư pháp"}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.bankAccount.accountHolderName} <br />
                          {item.bankAccount.accountNumber} <br />
                          {item.bankAccount.bankName}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {item.role === "1"
                            ? "Basic"
                            : item.role === "2"
                            ? "Premium"
                            : "VIP"}
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
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminDashboard;
