import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Typography,
  TextField,
} from "@mui/material";
import ReceiptDialog from "./ReceiptDialog";

const RenewMemberModal = ({
  open,
  handleClose,
  memberData,
  handleRenew,
  plans,
}) => {
  const { name, phone } = memberData || {};
  const [selectedPlan, setSelectedPlan] = useState("");
  const [amount, setAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState("");

  const handlePlanChange = (event) => {
    const selectedPlanId = event.target.value;
    const plan = plans.find((plan) => plan.dn === selectedPlanId);
    setSelectedPlan(plan);
    setAmount(plan.amount);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleRenew(selectedPlan.dn, selectedPlan.duration, amount,setReceiptData);
    setSuccessMessage("Member successfully renewed!");
    setSelectedPlan("");
    setAmount("");
  };

  const handleDownloadReceipt = () => {
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSuccessMessage("")
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Renew Member</DialogTitle>
        <DialogContent>
          {!successMessage ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <Typography variant="body1" gutterBottom>
                  <span style={{ fontWeight: "bold" }}>Name: </span>
                  {name}
                </Typography>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <Typography variant="body1" gutterBottom>
                  <span style={{ fontWeight: "bold" }}>Phone: </span>
                  {phone}
                </Typography>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <TextField
                  select
                  label="New Plan"
                  name="newPlan"
                  fullWidth
                  required
                  value={selectedPlan.id}
                  onChange={handlePlanChange}
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.dn}>
                      {plan.dn}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <TextField
                  label="Amount"
                  fullWidth
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </form>
          ) : (
            <Typography variant="h6" gutterBottom>
              {successMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {!successMessage ? (
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
            >
              Renew
            </Button>
          ) : (
            <Button
              onClick={handleDownloadReceipt}
              variant="contained"
              color="primary"
            >
              Download Receipt
            </Button>
          )}
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <ReceiptDialog
        open={showReceipt}
        onClose={handleCloseReceipt}
        receiptData={receiptData}
      />
    </>
  );
};

export default RenewMemberModal;
