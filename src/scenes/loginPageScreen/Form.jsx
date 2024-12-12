import {
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useAuth } from "../../AuthContext.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  buttonStyles,
  typographyStyles,
  textFieldStyles,
  titleTypographyStyles,
  titleLogin,
} from "../../style/GlobalStyles.js";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState, useEffect } from "react";

const loginSchema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải ít nhất 6 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Mật khẩu phải chứa ít nhất một chữ thường, một chữ hoa, một số và một ký tự đặc biệt"
    ),
});

const initialValuesLogin = {
  email: "",
  password: "",
};

const LoginForm = () => {
  const { login, logout } = useAuth(); // Thêm hàm logout từ useAuth
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Nếu gặp lỗi 401 (Token hết hạn), tự động đăng xuất và điều hướng
          logout(); // Xóa token khỏi context
          navigate("/login"); // Điều hướng đến trang đăng nhập
        }
        return Promise.reject(error);
      }
    );

    // Xóa interceptor khi component unmount
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout, navigate]);

  const handleLogin = async (values, setFieldError) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/loginAdmin",
        values
      );
      const loggedIn = response.data;

      if (loggedIn && loggedIn.token) {
        login(loggedIn.admin, loggedIn.token);
        navigate("/dashboard");
      } else {
        console.error("Login failed: No token returned.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const backendError = error.response.data.message;

        if (backendError.includes("Email")) {
          setFieldError("email", backendError);
        } else if (backendError.includes("Mật khẩu")) {
          setFieldError("password", backendError);
        } else {
          console.error("Login error:", backendError);
        }
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  };

  const handleFormSubmit = async (values, { setFieldError }) => {
    await handleLogin(values, setFieldError);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={initialValuesLogin}
      validationSchema={loginSchema}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldError,
        resetForm,
      }) => (
        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: "100%", width: "100%" }}
        >
          {/* Secure Login Title */}
          <Typography sx={titleLogin}>FLEXIRIDE XIN CHÀO</Typography>

          <Typography sx={titleTypographyStyles}>Nhập email của bạn</Typography>

          {/* Email Field */}
          <TextField
            label="Email"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.email}
            name="email"
            error={Boolean(touched.email) && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            fullWidth
            sx={{ ...textFieldStyles, marginBottom: "1.5rem" }}
          />

          {/* Password Field */}
          <Typography sx={titleTypographyStyles}>
            Nhập mật khẩu của bạn
          </Typography>
          <TextField
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.password}
            name="password"
            error={Boolean(touched.password) && Boolean(errors.password)}
            helperText={touched.password && errors.password}
            fullWidth
            sx={{ ...textFieldStyles, marginBottom: "1.5rem" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Login Button */}
          <Button fullWidth type="submit" sx={buttonStyles}>
            ĐĂNG NHẬP
          </Button>

          {/* Reset Form Action */}
          <Typography
            onClick={() => resetForm()}
            sx={typographyStyles}
            mt="1rem"
          >
            {/* Don't have an account? Sign Up here. */}
          </Typography>
        </form>
      )}
    </Formik>
  );
};

export default LoginForm;
