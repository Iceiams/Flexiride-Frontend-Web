import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";

const PriceForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = (values) => {
    console.log("Submitted values:", values);
    // Add logic here to send the data to the backend (e.g., via fetch or axios)
  };

  return (
    <Box m="20px">
      <Header
        title="MANAGE SERVICE PRICES"
        subtitle="Create, Update Prices for Services"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={priceSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Service Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.serviceName}
                name="serviceName"
                error={!!touched.serviceName && !!errors.serviceName}
                helperText={touched.serviceName && errors.serviceName}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Base Price"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.basePrice}
                name="basePrice"
                error={!!touched.basePrice && !!errors.basePrice}
                helperText={touched.basePrice && errors.basePrice}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Price Per KM"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.pricePerKm}
                name="pricePerKm"
                error={!!touched.pricePerKm && !!errors.pricePerKm}
                helperText={touched.pricePerKm && errors.pricePerKm}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Save Price
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const priceSchema = yup.object().shape({
  serviceName: yup.string().required("Service name is required"),
  basePrice: yup
    .number()
    .min(0, "Base price must be greater than or equal to 0")
    .required("Base price is required"),
  pricePerKm: yup
    .number()
    .min(0, "Price per KM must be greater than or equal to 0")
    .required("Price per KM is required"),
});

const initialValues = {
  serviceName: "", // E.g., "Traditional", "Carpool", "Driver Services"
  basePrice: 0,
  pricePerKm: 0,
};

export default PriceForm;
