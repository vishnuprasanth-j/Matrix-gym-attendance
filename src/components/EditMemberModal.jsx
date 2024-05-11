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
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { Timestamp } from "firebase/firestore";

const convertTimestampToString = (timestamp) => {
  if (!timestamp || typeof timestamp.seconds !== "number") {
    return timestamp;
  }
  const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
  return date.toISOString().substring(0, 10); // Format YYYY-MM-DD
};

const EditMemberModal = ({
  open,
  handleClose,
  memberData,
  handleEdit,
  plans,
}) => {
  console.log(plans);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    regno: "",
    id: "",
    photo: "",
    name: "",
    age: "",
    bloodgroup: "",
    branch: "",
    dob: "",
    gender: "",
    height: "",
    phone: "",
    weight: "",
    address: "",
  });
  const [hidformData, setHidFormData] = useState({
    currentPlan: "",
    currPlanStart: "",
    planHistory: "",
  });
  const [isHovered, setIsHovered] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [changePlan, setChangePlan] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (memberData) {
      setFormData({
        regno: memberData.regno || "",
        id: memberData.id || "",
        name: memberData.name || "",
        age: memberData.age || "",
        bloodgroup: memberData.bloodgroup || "",
        branch: memberData.branch || "",
        // currentPlan: memberData.currentPlan || "",
        dob: convertTimestampToString(memberData.dob || ""),
        gender: memberData.gender || "",
        height: memberData.height || "",
        phone: memberData.phone || "",
        weight: memberData.weight || "",
        // currPlanStart: convertTimestampToString(
        //   memberData?.currPlanStart || ""
        // ),
        address: memberData.address || "",
        photo: memberData.photo || "",
        // planHistory:memberData.planHistory || "",
        // memberSince: memberData.memberSince || ""
      });
      setHidFormData({
        currentPlan: memberData.currentPlan || "",
        currPlanStart: memberData?.currPlanStart || "",
        planHistory: memberData.planHistory || "",
      });
      setAmount(
        memberData.planHistory[memberData.planHistory.length - 1].amount
      );
      setPhotoUrl(memberData.photo || "");
      console.log(hidformData);
    }
  }, [memberData]);
  const handleHidChange = (e) => {
    const { name, value } = e.target;
    if (name === "currentPlan") {
      const selectedPlan = plans.find((plan) => plan.dn === value);
      const durationInMonths = selectedPlan ? selectedPlan.duration : 0;
      const currPlanStartDate = new Date(
        convertTimestampToString(hidformData.currPlanStart)
      );

      const planEndDate = new Date(currPlanStartDate);
      planEndDate.setMonth(planEndDate.getMonth() + durationInMonths);

      const updatedPlanHistory = [...hidformData.planHistory];
      if (updatedPlanHistory.length > 0) {
        const lastPlan = updatedPlanHistory[updatedPlanHistory.length - 1];
        lastPlan.plan = value;
        lastPlan.amount = selectedPlan.amount;
        lastPlan.planEnd = Timestamp.fromDate(planEndDate);
      }
      setHidFormData({
        ...hidformData,
        currentPlan: value,
        planHistory: updatedPlanHistory,
      });
      setAmount(selectedPlan.amount);
    } else {
      const selectedPlan = plans.find(
        (plan) => plan.dn === hidformData.currentPlan
      );
      const durationInMonths = selectedPlan ? selectedPlan.duration : 0;
      const currPlanStartDate = new Date(value);

      const planEndDate = new Date(currPlanStartDate);
      planEndDate.setMonth(planEndDate.getMonth() + durationInMonths);

      const updatedPlanHistory = [...hidformData.planHistory];
      if (updatedPlanHistory.length > 0) {
        const lastPlan = updatedPlanHistory[updatedPlanHistory.length - 1];
        lastPlan.amount = amount;
        lastPlan.planStart = Timestamp.fromDate(currPlanStartDate);
        lastPlan.planEnd = Timestamp.fromDate(planEndDate);
      }
      setHidFormData({
        ...hidformData,
        currPlanStart: Timestamp.fromDate(currPlanStartDate),
        planHistory: updatedPlanHistory,
      });
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (changePlan) {
        const formDataWplan = {
          ...formData,
          ...hidformData,
        };
        await handleEdit(formDataWplan, memberData, photoName);
      } else {
        await handleEdit(formData, memberData, photoName);
      }
    } catch (error) {
      console.error("An error occurred during the update:", error);
    }
    setIsLoading(false);
    handleClose();
  };

  const handlePhotoHover = (isHovered) => {
    setIsHovered(isHovered);
  };

  const handlePhotoChange = (event) => {
    const photoFile = event.target.files[0];
    if (photoFile) {
      setFormData((prevData) => ({
        ...prevData,
        photo: photoFile,
      }));
      setPhotoName(photoFile.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoUrl(e.target.result);
      };
      reader.readAsDataURL(photoFile);
    }
  };

  const handleEditPhoto = () => {
    document.getElementById("photoInput").click();
  };
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    const updatedPlanHistory = [...hidformData.planHistory];
    if (updatedPlanHistory.length > 0) {
      const lastPlan = updatedPlanHistory[updatedPlanHistory.length - 1];
      lastPlan.amount = e.target.value;
    }
    setHidFormData({
      ...hidformData,
      planHistory: updatedPlanHistory
    });
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
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                display: "inline-block",
                textAlign: "center",
              }}
              onMouseEnter={() => handlePhotoHover(true)}
              onMouseLeave={() => handlePhotoHover(false)}
              onClick={handleEditPhoto}
            >
              <img
                src={photoUrl}
                alt="User"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "40px",
                }}
              />
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 1,
                  }}
                >
                  <FontAwesomeIcon icon={faPen} />
                </div>
              )}
            </div>
            <input
              id="photoInput"
              type="file"
              accept="image/jpeg"
              hidden
              onChange={handlePhotoChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Registration No."
              name="regno"
              value={formData.regno}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
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
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <Select
              label="Blood Group"
              name="bloodgroup"
              value={formData.bloodgroup}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="A+">A+</MenuItem>
              <MenuItem value="A-">A-</MenuItem>
              <MenuItem value="B+">B+</MenuItem>
              <MenuItem value="B-">B-</MenuItem>
              <MenuItem value="AB+">AB+</MenuItem>
              <MenuItem value="AB-">AB-</MenuItem>
              <MenuItem value="O+">O+</MenuItem>
              <MenuItem value="O-">O-</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6}>
            <Select
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="branch1">Branch 1</MenuItem>
              <MenuItem value="branch2">Branch 2</MenuItem>
            </Select>
          </Grid>
          {/* <Grid item xs={6}>
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
          </Grid> */}
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
            <RadioGroup
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Female"
                control={<Radio />}
                label="Female"
              />
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
            </RadioGroup>
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
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={changePlan}
                  onChange={(e) => setChangePlan(e.target.checked)}
                />
              }
              label="Change Plan"
            />
          </Grid>
          {changePlan && (
            <>
              <Grid item xs={6}>
                <Select
                  label="Current Plan"
                  name="currentPlan"
                  value={hidformData.currentPlan}
                  onChange={handleHidChange}
                  fullWidth
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.dn}>
                      {plan.dn}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Plan Start"
                  type="date"
                  name="currPlanStart"
                  value={convertTimestampToString(hidformData.currPlanStart)}
                  onChange={handleHidChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Amount"
                  name="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  fullWidth
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="secondary"
          disabled={isLoading}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMemberModal;
