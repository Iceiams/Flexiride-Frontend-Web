const titleLogin = {
  fontSize: "1.5rem",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "1.3rem",
};

const titleTypographyStyles = {
  color: "#3d3d3d", // Màu văn bản
  fontSize: "14px", // Kích thước chữ
  fontWeight: "400", // Độ đậm
  fontFamily: "sans-serif", // Font chữ
  marginTop: "0.5rem", // Khoảng cách phía trên
  marginBottom: "0.5rem", // Khoảng cách phía dưới
};
const buttonStyles = {
  m: "1rem 0",
  p: "1rem",
  backgroundColor: "#00B14F", // Màu nền cho nút
  color: "#fff", // Màu chữ cho nút
  borderRadius: "3.5rem", // Bo tròn góc cho nút
  height: "3rem",
  transition: "all 0.3s ease", // Hiệu ứng chuyển tiếp
  "&:hover": {
    backgroundColor: "#1EBD60", // Màu nền khi hover
    transform: "scale(1.05)", // Nâng lên nhẹ khi hover
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)", // Bóng khi hover
  },
};

const typographyStyles = {
  textDecoration: "underline",
  color: "#1976d2", // Màu chữ cho liên kết
  fontWeight: "bold", // Chữ đậm
  "&:hover": {
    cursor: "pointer", // Con trỏ dạng pointer khi hover
    color: "#2196f3", // Màu sáng hơn khi hover
  },
};

const textFieldStyles = {
  "& .MuiInputBase-input": {
    color: "#000", // Màu chữ là đen (để dễ đọc trên nền trắng)
  },
  "& .MuiFormLabel-root": {
    color: "#3d3d3d", // Màu nhãn mặc định
  },
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff", // Nền màu trắng
    borderRadius: "4px", // Bo góc khung input
    "& fieldset": {
      borderColor: "#d9d9d9", // Màu viền mặc định (xám nhạt)
    },
    "&:hover fieldset": {
      borderColor: "#2BC169", // Màu viền khi hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2BC169", // Màu viền khi focus
    },
  },
  "& .MuiFormHelperText-root": {
    color: "#d32f2f", // Màu thông báo lỗi
    fontSize: "14px",
  },
};

const passwordIconStyles = {
  color: "#fff", // Màu trắng cho icon
};

export {
  buttonStyles,
  typographyStyles,
  textFieldStyles,
  titleTypographyStyles,
  titleLogin,
};
