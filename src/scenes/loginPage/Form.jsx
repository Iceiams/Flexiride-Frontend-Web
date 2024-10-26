import {
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useAuth } from "../../AuthContext";
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
import { useState } from "react";

const loginSchema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải ít nhất 6 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    ),
});

const initialValuesLogin = {
  email: "",
  password: "",
};

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
    console.log("Icon clicked"); // Kiểm tra hàm có được gọi không
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
          <Typography sx={titleLogin}>Secure Login</Typography>

          <Typography sx={titleTypographyStyles}>
            Enter your work email
          </Typography>

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
          <Typography sx={titleTypographyStyles}>Password</Typography>
          <TextField
            label="Password"
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
            LOGIN
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
