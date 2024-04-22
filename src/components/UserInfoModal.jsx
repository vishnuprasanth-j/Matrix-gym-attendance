import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const UserInfoModal = ({ open, handleClose, memberInfo }) => {
  const orderedKeys = [
    "regno",
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
    "planHistory",
  ];

  const labels = {
    regno: "Registraton No",
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
    address: "Address",
    planHistory: "Plan History",
  };

  const formatLabel = (key) => {
    return labels[key] || key;
  };

  const branchLabels = {
    branch1: "Jaycees Branch",
    branch2: "Kasipalayam Branch",
  };

  const planLabels = {
    plan1: "Plan 1 (1 month)",
    plan2: "Plan 2 (4 months)",
    plan3: "Plan 3 (6 months)",
    plan4: "Plan 4 (12 months)",
  };

  const getBranchLabel = (branch) => branchLabels[branch] || branch;
  const getPlanLabel = (plan) => planLabels[plan] || plan;

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
                {key === "planHistory" ? (
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", marginBottom: 1 }}
                    >
                      {formatLabel(key)}:
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>S.No.</TableCell>
                          <TableCell>Plan</TableCell>
                          <TableCell>Plan Start</TableCell>
                          <TableCell>Plan End</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {memberInfo[key].map((plan, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{plan.plan}</TableCell>
                            <TableCell>
                              {plan.planStart.toDate().toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {plan.planEnd.toDate().toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                ) : (
                  <React.Fragment>
                    <Grid item xs={6} sm={3} sx={{ paddingLeft: "30px" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        {formatLabel(key)}:
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={9}>
                      <Typography variant="body2" sx={{ marginLeft: "10px" }}>
                        {key === "branch"
                          ? getBranchLabel(memberInfo[key])
                          : key === "currentPlan"
                          ? getPlanLabel(memberInfo[key])
                          : key === "currPlanStart" || key === "dob"
                          ? memberInfo[key].toDate().toLocaleDateString()
                          : memberInfo[key]}
                      </Typography>
                    </Grid>
                  </React.Fragment>
                )}
              </React.Fragment>
            ))}
        </Grid>
        ``
      </DialogContent>
    </Dialog>
  );
};

export default UserInfoModal;
