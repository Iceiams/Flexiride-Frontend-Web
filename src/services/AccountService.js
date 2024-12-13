import axios from "axios";

const API_URL = "https://flexiride.onrender.com/auth/";

const login = async (values) => {
  try {
    const response = await axios.post(`${API_URL}loginAdmin`, values);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export default {
  login,
};
