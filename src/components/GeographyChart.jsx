import React from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import { useTheme } from "@mui/material";
import vietNamGeoJSON from "../data/export"; // GeoJSON của Việt Nam
import { tokens } from "../theme";

const GeographyChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Hàm tùy chỉnh hiển thị từng vùng trên bản đồ
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<b>${feature.properties.name}</b>`);
    }
  };

  // Hàm tùy chỉnh style cho từng vùng
  const style = (feature) => ({
    fillColor:
      feature.properties.traffic_density === "high"
        ? "red"
        : colors.greenAccent[400],
    weight: 2,
    opacity: 1,
    color: colors.grey[100],
    dashArray: "3",
    fillOpacity: 0.7,
  });

  return (
    <MapContainer
      center={[15.87, 100.9925]} // Tâm bản đồ Việt Nam
      zoom={5}
      style={{ height: isDashboard ? "215px" : "600px", width: "100%" }}
    >
      {/* Lớp nền bản đồ */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Bản đồ OSM">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay checked name="Dữ liệu giao thông (giả lập)">
          <GeoJSON
            data={vietNamGeoJSON}
            style={style}
            onEachFeature={onEachFeature}
          />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default GeographyChart;
