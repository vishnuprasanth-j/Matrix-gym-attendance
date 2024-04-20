import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { Timestamp } from "firebase/firestore";

const AddEnquiryModal = ({ open, onClose, onSubmit }) => {
  const [newEnquiryData, setNewEnquiryData] = useState({
    name: "",
    address: "",
    phone: "",
    date:""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEnquiryData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitEnquiry = () => {
    const newEnquiryDataWithDate={...newEnquiryData,date:Timestamp.fromDate(new Date())}
    onSubmit(newEnquiryDataWithDate);
    setNewEnquiryData({
      name: "",
      address: "",
      phone: "",
      date:""
    });
  };
  

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          minWidth: 300,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Add New Enquiry
        </Typography>
        <TextField
          name="name"
          label="Name"
          value={newEnquiryData.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="address"
          label="Address"
          value={newEnquiryData.address}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="phone"
          label="Phone"
          value={newEnquiryData.phone}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Button
          onClick={handleSubmitEnquiry}
          variant="contained"
          color="primary"
          fullWidth
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default AddEnquiryModal;
