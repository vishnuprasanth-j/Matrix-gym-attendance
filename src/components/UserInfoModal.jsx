import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const UserInfoModal = ({ open, handleClose, memberInfo }) => {
  const orderedKeys = [
    "name",
    "age",
    "gender",
    "phone",
    "weight",
    "height",
    "address",
    "currentPlan",
    "branch",
    "currPlanStart",
    "dob",
  ];

  const labels = {
    name: "Name",
    age: "Age",
    gender: "Gender",
    phone: "Phone",
    weight: "Weight",
    height: "Height",
    currentPlan: "Current Plan",
    branch: "Branch",
    currPlanStart: "Plan Start",
    dob: "DOB",
    address:"Address"
  };
  
  const formatLabel = (key) => {
    return labels[key] || key;
  };


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth={true}>
      <DialogTitle>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FontAwesomeIcon
            icon={faTimes}
            onClick={handleClose}
            style={{ cursor: "pointer" }}
          />
          <span style={{ marginLeft: "auto" }}>User Information</span>
        </div>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            {memberInfo && (
              <img
                src={memberInfo.photo}
                alt="User"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "40px",
                }}
              />
            )}
          </Grid>
          {memberInfo &&
            orderedKeys.map((key, index) => (
              <React.Fragment key={index}>
                <Grid item xs={6} sm={3} sx={{ paddingLeft: "30px" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold"}}
                  >
                    {formatLabel(key)}:
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={9}>
                  {/* Check if key is currPlanStart or dob, if yes, convert to date format */}
                  <Typography variant="body2" sx={{ marginLeft: "10px" }}>
                    {key === "currPlanStart"
                      ? memberInfo[key].toDate().toDateString()
                      : memberInfo[key]}
                  </Typography>
                </Grid>
              </React.Fragment>
            ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default UserInfoModal;
