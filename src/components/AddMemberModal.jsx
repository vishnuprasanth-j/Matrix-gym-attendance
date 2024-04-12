import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db , storage} from "../lib/firebase"; // Assuming 'db' is your Firestore instance
import "../styles/AddMemberModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";

const AddMemberModal = ({ open, handleClose }) => {
  const [memberData, setMemberData] = useState({
    fullName: "",
    dateOfBirth: "",
    age: "",
    phoneNumber: "",
    address: "",
    bloodGroup: "",
    height: "",
    weight: "",
    gender: "",
    // Add more fields as needed
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMemberData({ ...memberData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate all fields
    if (Object.values(memberData).some((value) => value.trim() === "")) {
      alert("All fields are mandatory!");
      return;
    }

    try {
      await addDoc(collection(db, "members"), memberData);
      handleClose();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New Registration</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <div className="user_details">
            <div className="input_box">
              <span className="details">Full Name</span>
              <TextField
                type="text"
                name="fullName"
                placeholder="Enter your name"
                value={memberData.fullName}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            <div className="input_box">
              <span className="details">Date of Birth</span>
              <TextField
                type="text"
                name="dateOfBirth"
                placeholder="DD/MM/YYYY"
                value={memberData.dateOfBirth}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            <div className="input_box">
              <span className="details">Age</span>
              <TextField
                type="number"
                name="age"
                placeholder="Enter your age"
                value={memberData.age}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            <div className="input_box">
              <span className="details">Phone Number</span>
              <TextField
                type="text"
                name="phoneNumber"
                placeholder="Enter your Phone Number"
                value={memberData.phoneNumber}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            <div className="input_box">
              <span className="details">Address</span>
              <TextField
                type="text"
                name="address"
                placeholder="Enter your Address"
                value={memberData.address}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            <div className="input_box">
              <span className="details">Blood Group</span>
              <TextField
                type="text"
                name="bloodGroup"
                placeholder="Enter your Blood Group"
                value={memberData.bloodGroup}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            <div className="input_box">
              <span className="details">Height</span>
              <TextField
                type="text"
                name="height"
                placeholder="Enter your Height in cm"
                value={memberData.height}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            <div className="input_box">
              <span className="details">Weight</span>
              <TextField
                type="text"
                name="weight"
                placeholder="Enter your Weight in kg"
                value={memberData.weight}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            <div className="gender_details">
              <span className="gender_title">Gender</span>
              <div className="category">
                <input
                  type="radio"
                  name="gender"
                  id="dot-1"
                  value="Male"
                  onChange={handleChange}
                />
                <label htmlFor="dot-1">
                  <span className="dot one"></span>
                  <span className="gender">Male</span>
                </label>
                <input
                  type="radio"
                  name="gender"
                  id="dot-2"
                  value="Female"
                  onChange={handleChange}
                />
                <label htmlFor="dot-2">
                  <span className="dot two"></span>
                  <span className="gender">Female</span>
                </label>
              </div>
            </div>
            <div className="input_box">
              <div className="upload-btn-wrapper">
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<FontAwesomeIcon icon={faCloudArrowUp} />}
                >
                  Upload file
                  <input type="file" accept="image/jpeg" />
                </Button>
              </div>
            </div>
          </div>
          <div className="button">
            <Button type="submit" variant="contained" color="primary">
              Register
            </Button>
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberModal;
