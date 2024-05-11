import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Avatar,
} from "@mui/material";
import html2pdf from "html2pdf.js";
import Logo2 from "/Logo2.png";

const ReceiptDialog = ({ open, onClose, receiptData }) => {
  if (!receiptData) {
    return null;
  }
  const { name, planHistory, currentPlan, phone } = receiptData;
  const handleDownload = () => {
    const element = document.getElementById("receipt-content");
    const opt = {
      margin: [0.5, 0.5],
      filename: "MATRIX_Gym_Receipt.pdf",
      // jsPDF: {
      //   unit: "px",
      //   format: [600, 600],
      //   image: { type: "jpeg", quality: 1.0 },
      // },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Receipt</DialogTitle>
      <DialogContent id="receipt-content">
        <DialogTitle style={{ display: "flex", alignItems: "center" }}>
          {/* <Avatar
            src={Logo}
            alt="Logo"
            sx={{ width: 56, height: 56, backgroundColor: "black" }}
          /> */}
          <img src={Logo2} style={{width:'70px',height:'75px'}}></img>
          <Typography variant="h6" style={{ marginLeft: "8px", flexGrow: 1, color:'#e69855' }}>
            Matrix Fitness Center
          </Typography>
          <Typography variant="subtitle2" style={{ float: "right" }}>
            {planHistory[planHistory.length - 1].planStart
              .toDate()
              .toLocaleDateString("en-GB")}
          </Typography>
        </DialogTitle>
        <TableContainer>
          <Table sx={{ border: "2px solid #ccc", borderRadius: "8px" }}>
            <TableBody>
              <TableRow sx={{ marginBottom: "5px" }}>
                <TableCell>Name:</TableCell>
                <TableCell>{name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Phone Number:</TableCell>
                <TableCell>{phone}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Plan:</TableCell>
                <TableCell>{currentPlan}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Plan End:</TableCell>
                <TableCell>
                  {planHistory[planHistory.length - 1].planEnd
                    .toDate()
                    .toLocaleDateString("en-GB")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Amount:</TableCell>
                <TableCell>
                  {planHistory[planHistory.length - 1].amount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Note: In any case, amount will not be refunded.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" color="primary" onClick={handleDownload}>
          Download Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptDialog;
