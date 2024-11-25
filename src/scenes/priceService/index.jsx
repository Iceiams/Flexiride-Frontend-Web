import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Card } from "@mui/material";

import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getServiceSchema = (attributes) => {
  const schemaObject = {};

  attributes.forEach((attr) => {
    schemaObject[attr] = yup
      .number()
      .required(`${attr} là bắt buộc`)
      .min(0, `${attr} phải là số dương`);
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
  car_basic_fee: "Phí cơ bản cho xe ô tô",
  car_base_fare_first_10km: "Giá cơ bản (10km đầu) cho xe ô tô",
  car_fare_per_km_after_10km: "Giá mỗi km (sau 10km) cho xe ô tô",
  base_fare_first_2km: "Giá cơ bản (2km đầu)",
};

const PriceForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [validationSchema, setValidationSchema] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/viewPriceServices")
      .then((response) => {
        setServiceOptions(response.data);
        if (response.data.length > 0) {
          const firstService = response.data[0];
          setSelectedService(firstService);
          setValidationSchema(
            getServiceSchema(Object.keys(firstService.pricingAttributes))
          );
        }
      })
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  const getInitialValues = (service) => {
    if (!service) return {};
    return {
      ...service.pricingAttributes,
    };
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

      // Reset form với các giá trị của service mới
      Object.keys(service.pricingAttributes).forEach((key) => {
        setFieldValue(key, service.pricingAttributes[key]);
      });
    }
  };

  const handleFormSubmit = async (values, { setFieldValue }) => {
    if (!selectedService) return;

    try {
      const serviceId = selectedService.service_option_id._id;

      // Chỉ gửi các trường có trong pricingAttributes của service hiện tại
      const updatedPricingAttributes = {};
      Object.keys(selectedService.pricingAttributes).forEach((key) => {
        updatedPricingAttributes[key] = values[key];
      });

      const response = await axios.put(
        `http://localhost:3000/admin/update-price/${serviceId}`,
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

        // Cập nhật form với dữ liệu mới
        const newPricingAttributes = response.data.data.pricingAttributes;
        Object.keys(newPricingAttributes).forEach((key) => {
          setFieldValue(key, newPricingAttributes[key]);
        });
      }
    } catch (err) {
      console.error("Failed to update service price:", err);
      toast.error("Cập nhật thất bại!");
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      await axios.delete(`http://localhost:3000/admin/price/${serviceId}`);
      setServiceOptions((prevOptions) =>
        prevOptions.filter((option) => option._id !== serviceId)
      );
      toast.success("Dịch vụ đã được xóa thành công!");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Xóa dịch vụ thất bại!");
    }
  };

  if (!selectedService) {
    return <div>Loading...</div>;
  }

  return (
    <Box m="20px">
      <Header title="QUẢN LÝ GIÁ DỊCH VỤ" />
      <Card className="p-6">
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
                  sx={{ gridColumn: "span 4" }}
                >
                  <InputLabel>Tên Dịch Vụ</InputLabel>
                  <Select
                    value={selectedService.service_option_id.name}
                    onChange={(e) =>
                      handleServiceChange(e.target.value, setFieldValue)
                    }
                  >
                    {serviceOptions.map((option) => (
                      <MenuItem
                        key={option._id}
                        value={option.service_option_id.name}
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
                    variant="filled"
                    type="number"
                    label={
                      priceLabels[field] ||
                      field.replace(/_/g, " ").toUpperCase()
                    }
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values[field]}
                    name={field}
                    sx={{ gridColumn: "span 2" }}
                    error={touched[field] && Boolean(errors[field])}
                    helperText={touched[field] && errors[field]}
                  />
                ))}
              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Cập Nhật
                </Button>
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => handleDelete(selectedService._id)}
                  sx={{ marginLeft: "10px" }}
                >
                  Xóa Dịch Vụ
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
