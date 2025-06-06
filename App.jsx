// GPS Photo Diary Web App Scaffold
import React, { useState } from "react";
import EXIF from "exif-js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [photoData, setPhotoData] = useState([]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
          EXIF.getData(img, function () {
            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "W";

            const convertDMSToDD = (dms, ref) => {
              const [deg, min, sec] = dms;
              let dd = deg + min / 60 + sec / 3600;
              if (ref === "S" || ref === "W") dd *= -1;
              return dd;
            };

            if (lat && lon) {
              const latDD = convertDMSToDD(lat, latRef);
              const lonDD = convertDMSToDD(lon, lonRef);

              setPhotoData((prev) => [
                ...prev,
                {
                  src: e.target.result,
                  lat: latDD,
                  lon: lonDD,
                  name: file.name,
                },
              ]);
            }
          });
        };
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📍 GPS Photo Diary</h1>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <MapContainer
            center={[39.5, -98.35]}
            zoom={4}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {photoData.map((photo, idx) => (
              <Marker key={idx} position={[photo.lat, photo.lon]}>
                <Popup>
                  <img src={photo.src} alt={photo.name} className="w-32 h-auto" />
                  <p>{photo.name}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Uploaded Photos</h2>
          {photoData.map((photo, idx) => (
            <div key={idx} className="mb-4">
              <img src={photo.src} alt={photo.name} className="w-full h-auto" />
              <p className="text-sm">{photo.name}</p>
              <p className="text-sm text-gray-500">
                📍 Lat: {photo.lat.toFixed(5)}, Lon: {photo.lon.toFixed(5)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
