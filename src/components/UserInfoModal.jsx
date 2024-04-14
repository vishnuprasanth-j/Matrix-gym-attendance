import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const UserInfoModal = ({ open, handleClose, memberInfo }) => {
  const {
    name,
    age,
    bloodgroup,
    branch,
    currPlanStart,
    currentPlan,
    dob,
    gender,
    height,
    phone,
    photo,
    planHistory,
    weight,
  } = memberInfo || {};

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth={true}>
      <DialogTitle>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FontAwesomeIcon icon={faTimes} onClick={handleClose} style={{ cursor: "pointer" }} />
          <span style={{ marginLeft: "auto" }}>User Information</span>
        </div>
      </DialogTitle>
      <DialogContent>
        {memberInfo && (
          <div>
            <p>Name: {name}</p>
            <p>Age: {age}</p>
            {/* Display other user information */}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserInfoModal;
