import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import { Card } from "@mui/material";

import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatVietnamNumber = (value) => {
  if (value === null || value === undefined) return "";

  if (value.toString().includes(".")) {
    return parseFloat(value).toFixed(2).replace(".", ",");
  }

  return new Intl.NumberFormat("vi-VN").format(value);
};

const parseVietnamNumber = (value) => {
  if (!value) return "";

  if (typeof value !== "string") {
    value = String(value);
  }

  // Xử lý trường hợp có dấu phẩy và dấu chấm
  // Thay dấu phẩy thành dấu chấm nếu có
  value = value.replace(",", ".");

  // Loại bỏ tất cả dấu chấm không phải dấu phân cách thập phân (dấu phân cách nghìn)
  value = value.replace(/\.(?=\d{3}\b)/g, "");

  // Chuyển đổi giá trị thành số thực
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? "" : parsedValue;
};

const getServiceSchema = (attributes) => {
  const schemaObject = {};

  attributes.forEach((attr) => {
    // Lấy tên dễ hiểu từ priceLabels nếu có, nếu không thì dùng tên thuộc tính
    const fieldLabel =
      priceLabels[attr] || attr.replace(/_/g, " ").toUpperCase();

    // Custom validator that handles Vietnamese number formatting
    const vietnamNumberValidator = yup
      .string()
      .test(
        "is-valid-number",
        `${fieldLabel} phải là số hợp lệ`,
        function (value) {
          // Nếu trường là rỗng hoặc null thì bỏ qua
          if (!value) return true;

          // Thử parse giá trị
          const parsedValue = parseVietnamNumber(value);

          // Nếu không parse được thành số
          if (parsedValue === "") {
            return this.createError({
              message: `${fieldLabel} phải là số hợp lệ`,
            });
          }

          // Kiểm tra cho multipliers
          if (attr.includes("multiplier")) {
            if (parsedValue < 0) {
              return this.createError({
                message: `${fieldLabel} phải lớn hơn hoặc bằng 0`,
              });
            }
            if (parsedValue > 10) {
              return this.createError({
                message: `${fieldLabel} không được vượt quá 10`,
              });
            }

            // Kiểm tra số chữ số thập phân
            const decimalPart = parsedValue.toString().split(".")[1];
            if (decimalPart && decimalPart.length > 2) {
              return this.createError({
                message: `${fieldLabel} phải có tối đa 2 chữ số thập phân`,
              });
            }
          } else {
            // Kiểm tra cho giá
            if (parsedValue < 0) {
              return this.createError({
                message: `${fieldLabel} phải là số dương`,
              });
            }
            if (parsedValue.toString().replace(".", "").length > 15) {
              return this.createError({
                message: `${fieldLabel} không được vượt quá 15 chữ số`,
              });
            }
          }

          return true;
        }
      )
      .required(`${fieldLabel} là bắt buộc`);

    schemaObject[attr] = vietnamNumberValidator;
  });

  return yup.object(schemaObject);
};

// Định nghĩa labels cho các trường
const priceLabels = {
  basic_fee: "Phí cơ bản",
  hourly_fee: "Phí theo giờ",
  base_fare_first_2km: "Giá cơ bản (2km đầu)",
  fare_per_km_after_2km: "Giá mỗi km (sau 2km)",
  time_fare_after_2km: "Phí theo thời gian (sau 2km)",
  normal_time_multiplier: "Hệ số giờ bình thường",
  peak_time_multiplier: "Hệ số giờ cao điểm",
  night_time_multiplier: "Hệ số ban đêm",
  advance_booking_fee: "Phí đặt trước",
  bad_weather_multiplier: "Hệ số thời tiết xấu",
  day_fee: "Phí ngày",
  base_fare_first_10km: "Phí 10 km đầu",
  fare_per_km_after_10km: "Phí cộng thêm sau 10km",
};

const PriceForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [validationSchema, setValidationSchema] = useState(null);
  const [originalPricingAttributes, setOriginalPricingAttributes] = useState(
    {}
  );

  useEffect(() => {
    axios
      .get("https://flexiride.onrender.com/admin/viewPriceServices")
      .then((response) => {
        setServiceOptions(response.data);
        if (response.data.length > 0) {
          const firstService = response.data[0];
          setSelectedService(firstService);
          setOriginalPricingAttributes(firstService.pricingAttributes); // Lưu giá trị ban đầu
          setValidationSchema(
            getServiceSchema(Object.keys(firstService.pricingAttributes))
          );
        }
      })
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  const getInitialValues = (service) => {
    if (!service) return {};

    // Convert numeric values to formatted Vietnamese style
    const formattedValues = {};
    Object.entries(service.pricingAttributes).forEach(([key, value]) => {
      formattedValues[key] = formatVietnamNumber(value);
    });

    return formattedValues;
  };

  const handleServiceChange = (serviceName, setFieldValue) => {
    const service = serviceOptions.find(
      (option) => option.service_option_id.name === serviceName
    );

    if (service) {
      setSelectedService(service);
      setValidationSchema(
        getServiceSchema(Object.keys(service.pricingAttributes))
      );

      // Reset form với các giá trị của service mới, formatted
      Object.entries(service.pricingAttributes).forEach(([key, value]) => {
        setFieldValue(key, formatVietnamNumber(value));
      });
    }
  };

  const handleFormSubmit = async (values, { setFieldValue }) => {
    if (!selectedService) return;

    // Kiểm tra xem các giá trị có thay đổi so với giá trị ban đầu không
    const hasChanges = Object.keys(values).some(
      (key) =>
        parseVietnamNumber(values[key]) !==
        parseVietnamNumber(originalPricingAttributes[key]) // Kiểm tra sự thay đổi so với giá trị ban đầu
    );

    if (!hasChanges) {
      toast.info("Không có thay đổi nào để cập nhật");
      return; // Nếu không có thay đổi, không gửi request
    }

    try {
      const serviceId = selectedService.service_option_id._id;

      // Parse formatted values back to numeric
      const updatedPricingAttributes = {};
      Object.keys(values).forEach((key) => {
        updatedPricingAttributes[key] = parseVietnamNumber(values[key]);
      });

      const response = await axios.put(
        `https://flexiride.onrender.com/admin/update-price/${serviceId}`,
        { pricingAttributes: updatedPricingAttributes }
      );

      if (response.data.data) {
        setServiceOptions((prevOptions) =>
          prevOptions.map((option) =>
            option.service_option_id._id === serviceId
              ? response.data.data
              : option
          )
        );

        toast.success("Cập nhật thành công!");

        // Cập nhật form với dữ liệu mới, formatted
        const newPricingAttributes = response.data.data.pricingAttributes;
        Object.entries(newPricingAttributes).forEach(([key, value]) => {
          setFieldValue(key, formatVietnamNumber(value)); // Định dạng lại giá trị trước khi hiển thị
        });
        setOriginalPricingAttributes(newPricingAttributes); // Lưu lại giá trị mới để kiểm tra sự thay đổi sau
      }
    } catch (err) {
      console.error("Failed to update service price:", err);
      toast.error("Cập nhật thất bại!");
    }
  };

  if (!selectedService) {
    return <div>Loading...</div>;
  }

  return (
    <Box m="20px">
      <Box
        sx={{
          backgroundColor: "#141B2D",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          marginBottom: "20px",
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
          QUẢN LÝ GIÁ DỊCH VỤ
        </Typography>
      </Box>
      <Card
        className="p-6"
        sx={{
          marginTop: "20px",
          backgroundColor: "#1e293b", // Màu nền xám đậm phù hợp với giao diện tối
          color: "#ffffff", // Màu chữ trắng
          borderRadius: "10px", // Bo góc mềm mại
          boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.3)", // Đổ bóng nhẹ
        }}
      >
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={getInitialValues(selectedService)}
          validationSchema={validationSchema}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <FormControl
                  fullWidth
                  variant="filled"
                  sx={{
                    gridColumn: "span 4",
                    backgroundColor: "#2d3748",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                    border: "1px solid #63b3ed",
                    marginBottom: "30px",
                    "& .MuiFilledInput-root": {
                      backgroundColor: "#2d3748",
                      color: "#f8f9fa",
                      "&:hover": {
                        backgroundColor: "#4a5568",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#1e293b",
                        border: "1px solid #63b3ed",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#a0aec0",
                      fontSize: "1rem",
                      "&.Mui-focused": {
                        color: "#63b3ed",
                        fontSize: "1.1rem",
                      },
                    },
                  }}
                >
                  <InputLabel>Tên Dịch Vụ</InputLabel>
                  <Select
                    value={selectedService.service_option_id.name}
                    onChange={(e) =>
                      handleServiceChange(e.target.value, setFieldValue)
                    }
                    sx={{
                      color: "#f8f9fa",
                      "& .MuiSelect-icon": {
                        color: "#a0aec0", // Màu của icon xổ xuống
                      },
                    }}
                  >
                    {serviceOptions.map((option) => (
                      <MenuItem
                        key={option._id}
                        value={option.service_option_id.name}
                        sx={{
                          color: "#f8f9fa", // Màu chữ
                          backgroundColor: "#2d3748", // Nền giống ô nhập liệu
                          "&:hover": {
                            backgroundColor: "#4a5568", // Hover sáng hơn
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#4a5568", // Màu khi item được chọn
                            color: "#ffffff",
                            "&:hover": {
                              backgroundColor: "#63b3ed", // Hover khi item đã chọn
                            },
                          },
                        }}
                      >
                        {option.service_option_id.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Chỉ hiển thị các trường có trong pricingAttributes của service hiện tại */}
                {Object.keys(selectedService.pricingAttributes).map((field) => (
                  <TextField
                    key={field}
                    fullWidth
                    variant="filled" // Dùng filled để có viền mềm mại
                    type="text"
                    label={
                      priceLabels[field] ||
                      field.replace(/_/g, " ").toUpperCase()
                    }
                    value={values[field]}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9,]/g, "");
                      value = value.replace(",", ".");
                      setFieldValue(field, value);
                    }}
                    onBlur={(e) => {
                      const currentValue = e.target.value;
                      const rawValue = parseVietnamNumber(currentValue);
                      setFieldValue(field, formatVietnamNumber(rawValue));
                    }}
                    sx={{
                      gridColumn: "span 2",
                      backgroundColor: "#2d3748",
                      borderRadius: "8px",
                      border: "1px solid #4a5568",
                      input: {
                        color: "#f8f9fa",
                        fontSize: "0.8rem",
                      },
                      label: {
                        color: "#a0aec0",
                        fontSize: "1rem",
                        "&.Mui-focused": {
                          color: "#63b3ed",
                          fontSize: "1.1rem",
                        },
                      },
                      "& .MuiFilledInput-root": {
                        backgroundColor: "#2d3748",
                        "&:hover": {
                          backgroundColor: "#4a5568",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#1e293b",
                          border: "1px solid #63b3ed",
                        },
                      },
                    }}
                    error={touched[field] && Boolean(errors[field])}
                    helperText={touched[field] && errors[field]}
                  />
                ))}
              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Cập Nhật
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Card>
      <ToastContainer />
    </Box>
  );
};

export default PriceForm;
