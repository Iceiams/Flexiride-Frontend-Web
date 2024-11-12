import React, { useState } from "react";
import { Box, IconButton, useTheme, InputBase } from "@mui/material";
import { DebounceInput } from "react-debounce-input";
import SearchIcon from "@mui/icons-material/Search";

const Topbar = ({ onSearch }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (query) => {
    setSearchTerm(query);
    onSearch(query);
  };

  return (
    <Box display="flex" justifyContent="space-between" pt={2} pr={2} pb={2}>
      <Box display="flex" backgroundColor="#3b3b3b" borderRadius="3px">
        <DebounceInput
          minLength={2}
          debounceTimeout={300}
          element={InputBase}
          sx={{ ml: 2, flex: 1 }}
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <IconButton onClick={() => onSearch(searchTerm)} sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
