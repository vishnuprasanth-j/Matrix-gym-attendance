import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputBase,
} from "@mui/material";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

const PlanEditModal = ({ open, handleClose, plan }) => {
  if (!plan) {
    return;
  }
  const [editedPlan, setEditedPlan] = useState({
    dn: plan.dn,
    duration: plan.duration,
    amount: plan.amount,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isNumberField = name === "duration";
    setEditedPlan((prevPlan) => ({
      ...prevPlan,
      [name]: isNumberField ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log(editedPlan);
      // const planRef = doc(db, "plans", plan.id);
      // await updateDoc(planRef, editedPlan);
      handleClose();
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };
  const handleKeyPress = (e) => {
    if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Plan</DialogTitle>
      <DialogContent>
        <TextField
          name="dn"
          label="Display Name"
          value={editedPlan.dn}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            marginBottom: "10px",
            marginTop: "10px",
          }}
        />
        <TextField
          name="duration"
          label="Duration"
          value={editedPlan.duration}
          onChange={handleChange}
          onKeyDown={handleKeyPress} 
          fullWidth
          required
          sx={{
            marginBottom: "10px",
          }}
        />
        <TextField
          name="amount"
          label="Amount"
          value={editedPlan.amount}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            marginBottom: "10px",
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanEditModal;
