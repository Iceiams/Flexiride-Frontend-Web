import { Box, useMediaQuery, Typography } from "@mui/material";
import Form from "./Form";

const LoginPage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  return (
    <Box
      sx={{
        display: "flex", // Chia layout thành hai phần
        flexDirection: isNonMobileScreens ? "row" : "column",
        minHeight: "100vh", // Chiều cao tối thiểu 100% viewport
      }}
    >
      {/* Phần bên trái - Hình ảnh với chữ chèn lên */}
      <Box
        flex={1} // Chiếm một nửa màn hình
        sx={{
          position: "relative", // Đặt position relative để chứa phần chữ bên trên
          backgroundImage: `url('https://weblogin.grab.com/static/images/carousel-enterprise-img-1.2v7Xcn-.png')`,
          backgroundSize: "118% auto", // Phóng to ảnh lên 110% để bù phần bị cắt
          backgroundPosition: "center right", // Canh chỉnh sang phải để bù phần bị cắt bên trái
          width: "100%",
          height: "100vh",
        }}
      >
        {/* Chữ chèn lên ảnh */}
        <Box
          sx={{
            position: "absolute",
            bottom: "8%", // Đặt chữ cách dưới 8% so với chiều cao
            left: "50%", // Căn chữ ở giữa theo chiều ngang
            transform: "translate(-50%, 8%)", // Dịch chuyển chữ sang giữa ảnh
            color: "white", // Màu chữ trắng
            borderRadius: "0.625rem", // Bo tròn góc chữ
            width: "60%", // Chiều rộng của box chứa chữ
            textAlign: "left", // Căn chữ sang trái
            marginBottom: "2rem", // Khoảng cách bên dưới
            transition: "all 0.5s ease-in-out", // Hiệu ứng chuyển tiếp
            fontFamily: "'Roboto', sans-serif",
            fontSize: "1rem",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            "Fride – Giải pháp quản lý dịch vụ xe toàn diện"
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginTop: "10px", maxWidth: "400px" }}
          >
            Fride giúp bạn dễ dàng quản lý tài xế, thiết lập giá linh hoạt và tự
            động hóa quy trình đặt xe. Với báo cáo theo thời gian thực, bạn có
            thể theo dõi hiệu suất và tối ưu hóa hoạt động kinh doanh. Mọi
            chuyến đi được đảm bảo an toàn, tiện lợi, và hiệu quả.
          </Typography>
        </Box>
      </Box>

      {/* Phần bên phải - Form login chiếm toàn màn hình còn lại */}
      <Box
        flex={1} // Chiếm một nửa màn hình
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          backgroundColor: "#fff", // Màu nền trắng cho phần form
        }}
      >
        {/* Form login */}
        <Box
          width={isNonMobileScreens ? "58%" : "80%"} // Chiều rộng form login
          p="2rem"
        >
          <Form />
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
