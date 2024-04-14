import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import html2pdf from "html2pdf.js";

const ReceiptDialog = ({ open, onClose, memberData }) => {
  const handleDownload = () => {
    const element = document.getElementById("receipt-content");
    html2pdf().from(element).save();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Receipt</DialogTitle>
      <DialogContent id="receipt-content">
        <Typography variant="h6" gutterBottom>
          MATRIX Gym
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Gym Address
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          {new Date().toLocaleDateString()}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Name: {memberData.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Phone Number: {memberData.phone}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Plan:{" "}
          {memberData.currentPlan === "plan1" ? "1 month" : ""}
          {memberData.currentPlan === "plan2" ? "4 months" : ""}
          {memberData.currentPlan === "plan3" ? "6 months" : ""}
          {memberData.currentPlan === "plan4" ? "12 months" : ""}
        </Typography>
        {/* Add more receipt content here */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" color="primary" onClick={handleDownload}>
          Download Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptDialog;
