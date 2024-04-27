import { useState } from "react";
import { Modal, Button, MenuItem, Typography, TextField } from "@mui/material";

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

  const handlePlanChange = (event) => {
    const selectedPlanId = event.target.value;
    const plan = plans.find((plan) => plan.dn === selectedPlanId);
    setSelectedPlan(plan);
    setAmount(plan.amount);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleRenew(selectedPlan.dn, selectedPlan.duration, amount);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          minWidth: "400px",
        }}
      >
        <Typography variant="h6" gutterBottom align="center">
          Renew Member
        </Typography>
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: "10px" }}
          >
            Renew
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default RenewMemberModal;
