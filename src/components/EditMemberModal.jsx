import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

const convertTimestampToString = (timestamp) => {
  if (!timestamp || typeof timestamp.seconds !== 'number') {
    return "";
  }
  const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
  return date.toISOString().substring(0, 10); // Format YYYY-MM-DD
};

const EditMemberModal = ({ open, handleClose, memberData, handleEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodgroup: "",
    branch: "",
    currentPlan: "",
    dob: "",
    gender: "",
    height: "",
    phone: "",
    weight: "",
    currPlanStart:""
  });

  // Update formData whenever memberData changes
  useEffect(() => {
    if (memberData) {
      setFormData({
        name: memberData.name || "",
        age: memberData.age || "",
        bloodgroup: memberData.bloodgroup || "",
        branch: memberData.branch || "",
        currentPlan: memberData.currentPlan || "",
        dob: convertTimestampToString(memberData.dob || ""),
        gender: memberData.gender || "",
        height: memberData.height || "",
        phone: memberData.phone || "",
        weight: memberData.weight || "",
        currPlanStart:convertTimestampToString(memberData?.currPlanStart || "")
      });
    }
  }, [memberData]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    handleEdit(formData);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h6" align="center">
          Edit Member
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: "10px" }}>
          <Grid item xs={6}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Blood Group"
              name="bloodgroup"
              value={formData.bloodgroup}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <Select
              label="Current Plan"
              name="currentPlan"
              value={formData.currentPlan}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="plan1">Plan 1</MenuItem>
              <MenuItem value="plan2">Plan 2</MenuItem>
              <MenuItem value="plan3">Plan 3</MenuItem>
              <MenuItem value="plan4">Plan 4</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Plan Start"
              type="date"
              name="currPlanStart"
              value={formData.currPlanStart}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Date of Birth"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMemberModal;
