import { Box, Typography } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";

const Bar = () => {
  return (
    <Box m="20px">
      <Box
        sx={{
          backgroundColor: "#141B2D",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          marginBottom: "60px", // Tăng khoảng cách dưới tiêu đề
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
          THỐNG KÊ CHUYẾN ĐI
        </Typography>
      </Box>

      {/* Tạo khoảng cách trước phần nội dung */}
      <Box sx={{ marginTop: "20px" }}>
        <Box height="80vh">
          <BarChart />
        </Box>
      </Box>
    </Box>
  );
};

export default Bar;
