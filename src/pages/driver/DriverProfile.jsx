import { useEffect, useState } from "react";
import axios from "axios";
import "./DriverProfile.css";

export default function DriverProfile() {
  const driver = JSON.parse(localStorage.getItem("driver"));
  const driverId = driver?._id;

  const [form, setForm] = useState({
    name: driver?.name || "",
    phone: driver?.phone || "",
    carNumber: "",
    licenseNumber: "",
    rcNumber: "",
    profileImage: "",
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (driver) {
      setForm({
        name: driver.name,
        phone: driver.phone,
        carNumber: driver.carNumber || "",
        licenseNumber: driver.licenseNumber || "",
        rcNumber: driver.rcNumber || "",
        profileImage: driver.profileImage || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const res = await axios.put(
      `http://localhost:5000/api/drivers/${driverId}/profile`,
      form
    );

    localStorage.setItem("driver", JSON.stringify(res.data));
    setSaved(true);
  };

  return (
    <div className="profile-page">
      <div className="profile-card">

        <h2>👤 Driver Profile</h2>

        <div className="avatar-circle">
          {form.name?.charAt(0).toUpperCase()}
        </div>

        {!saved ? (
          <>
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Phone:</strong> {form.phone}</p>

            <input
              name="carNumber"
              placeholder="Car Number"
              value={form.carNumber}
              onChange={handleChange}
            />

            <input
              name="licenseNumber"
              placeholder="Driver License Number"
              value={form.licenseNumber}
              onChange={handleChange}
            />

            <input
              name="rcNumber"
              placeholder="Car RC Number"
              value={form.rcNumber}
              onChange={handleChange}
            />

            <button onClick={handleSave}>Save Details</button>
          </>
        ) : (
          <div className="saved-details">
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Phone:</strong> {form.phone}</p>
            <p><strong>Car Number:</strong> {form.carNumber}</p>
            <p><strong>License:</strong> {form.licenseNumber}</p>
            <p><strong>RC Number:</strong> {form.rcNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
}
