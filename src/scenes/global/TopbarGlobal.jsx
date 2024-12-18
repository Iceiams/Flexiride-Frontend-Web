import axios from "axios";
import {
  Box,
  IconButton,
  useTheme,
  Badge,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Popover,
  Menu,
  MenuItem,
} from "@mui/material";

import { useContext, useState, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import io from "socket.io-client";
import api from "../../api/axiosConfig";

const socket = io("https://flexiride.onrender.com");

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Separate state for different menus/popovers
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);

  // Separate open states
  const isNotificationsOpen = Boolean(notificationsAnchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  const sortedNotifications = [...notifications].sort((a, b) => {
    // Đưa thông báo chưa đọc (isRead: false) lên trước
    return a.isRead - b.isRead;
  });

  const handleLogout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. Please log in again.");
      return; // Dừng hàm nếu không có token
    }

    axios
      .get("https://flexiride.onrender.com/auth/logout", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Logged out successfully:", response.data);
        localStorage.removeItem("token"); // Xóa token
        logout();
        navigate("/loginAdmin");
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
      });
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notification", {
          params: { role: "Admin", userId: "67151219bc3fc797c0ca5329" },
        });

        if (response.data.success) {
          setNotifications(response.data.notifications); // Đồng bộ danh sách thông báo
          setUnreadCount(response.data.unreadCount); // Đồng bộ số thông báo chưa đọc
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    socket.on("withdrawRequest", (data) => {
      setNotifications((prev) => [...prev, { ...data, isRead: false }]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("withdrawRequest");
    };
  }, []);

  const handleNotificationOpen = async (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    setUnreadCount(0); // Reset số thông báo chưa đọc

    // Đánh dấu tất cả thông báo là đã đọc
    try {
      await api.post("/markAsRead", {
        role: "Admin",
        userId: "6715e854837efb8f9c755924",
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleNotificationClose = () => {
    setNotificationsAnchorEl(null); // Đóng danh sách thông báo
  };

  const handleNotificationClick = async (notification) => {
    const { transactionId, _id } = notification;

    if (transactionId) {
      navigate(`/pendingWithdrawRequests`); // Điều hướng đến trang xử lý

      // Đánh dấu thông báo là đã đọc
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === _id ? { ...notif, isRead: true } : notif
        )
      );

      try {
        await api.post("/markAsRead", { notificationId: _id }); // Gửi yêu cầu cập nhật trạng thái đã đọc
      } catch (error) {
        console.error("Error updating notification status:", error);
      }

      setNotificationsAnchorEl(null); // Đóng danh sách thông báo
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Box display="flex" justifyContent="flex-end" flex="1">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton onClick={handleNotificationOpen}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={handleUserMenuOpen}>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>

      {/* Separate Menu for User Actions */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={isUserMenuOpen}
        onClose={handleUserMenuClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
      </Menu>

      {/* Notifications Popover */}
      <Popover
        open={isNotificationsOpen}
        anchorEl={notificationsAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          style: {
            padding: "10px",
            maxWidth: "350px", // Tăng giới hạn chiều rộng
            borderRadius: "12px", // Bo góc mềm mại hơn
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)", // Bóng mềm và nổi bật
            backgroundColor: "#1f1f1f", // Nền tối hơn
            color: "#ffffff", // Màu chữ sáng
          },
        }}
      >
        <Box p={2}>
          <Typography
            variant="h6"
            gutterBottom
            style={{
              fontWeight: "bold",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Thông báo
          </Typography>
          <Divider
            style={{
              backgroundColor: "#444", // Đường kẻ mờ hơn
              marginBottom: "15px",
            }}
          />
          <List>
            {sortedNotifications.length === 0 ? (
              <ListItem
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "30px",
                  textAlign: "center",
                  backgroundColor: "#1f1f1f",
                  borderRadius: "10px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Typography
                  variant="h6"
                  style={{
                    color: "#ccc",
                    marginBottom: "8px",
                  }}
                >
                  Không có thông báo mới
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    color: "#aaa",
                  }}
                >
                  Bạn sẽ nhận được thông báo ở đây khi có hoạt động mới.
                </Typography>
              </ListItem>
            ) : (
              sortedNotifications.map((notification, index) => (
                <ListItem
                  key={index}
                  divider
                  button
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    backgroundColor: notification.isRead
                      ? "#f5f5f5"
                      : "#e0f7fa",
                    color: notification.isRead ? "#888" : "#007b83",
                    fontWeight: notification.isRead ? "normal" : "bold",
                    padding: "15px",
                    borderRadius: "8px",
                    margin: "5px 0",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = notification.isRead
                      ? "#ebebeb"
                      : "#d5f3f6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = notification.isRead
                      ? "#f5f5f5"
                      : "#e0f7fa")
                  }
                >
                  <ListItemText
                    primary={`Bạn có yêu cầu rút tiền chờ xử lý từ tài xế ${
                      notification.driverName || notification.driverId
                    }`}
                    secondary={`Số tiền: ${notification.amount} VND`}
                    primaryTypographyProps={{
                      style: { fontSize: "14px" },
                    }}
                    secondaryTypographyProps={{
                      style: {
                        fontSize: "12px",
                        color: notification.isRead ? "#aaa" : "#555",
                      },
                    }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Popover>
    </Box>
  );
};

export default Topbar;
