import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import html2pdf from "html2pdf.js";

const ReceiptDialog = ({ open, onClose, memberData }) => {
  if (!memberData) {
    return null; // Return null for React components when there is nothing to render
  }

  const handleDownload = () => {
    const element = document.getElementById("receipt-content");
    const opt = {
      margin: [0.5, 0.5],
      filename: 'MATRIX_Gym_Receipt.pdf',
      jsPDF: {
        unit: 'px', 
        format: [400,400] 
      }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Receipt
      </DialogTitle>
      <DialogContent id="receipt-content">
        <Typography variant="h6" gutterBottom  sx={{ textAlign: 'center' }}>
          Matrix Gym
        </Typography>
        <Typography variant="subtitle2" gutterBottom style={{ float: 'right' }}>
          {new Date().toLocaleDateString()}
        </Typography>
        <TableContainer>
          <Table   sx={{ border: '2px solid #ccc', borderRadius: '8px' }}>
            <TableBody>
              <TableRow  sx={{marginBottom:"5px" }}>
                <TableCell>Name:</TableCell>
                <TableCell>{memberData.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Phone Number:</TableCell>
                <TableCell>{memberData.phone}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Plan:</TableCell>
                <TableCell>{memberData.currentPlan === "plan1" ? "1 month" : ""}
                  {memberData.currentPlan === "plan2" ? "4 months" : ""}
                  {memberData.currentPlan === "plan3" ? "6 months" : ""}
                  {memberData.currentPlan === "plan4" ? "12 months" : ""}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {/* Additional centered content here */}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" color="primary" onClick={handleDownload}>
          Download Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptDialog;
