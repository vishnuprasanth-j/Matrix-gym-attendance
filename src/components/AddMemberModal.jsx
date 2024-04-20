import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "../lib/firebase"; // Assuming 'db' is your Firestore instance
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { useParams } from "react-router-dom";
import ReceiptDialog from "./ReceiptDialog";

const AddMemberModal = ({ open, handleClose }) => {
  const { branch } = useParams();
  const [memberData, setMemberData] = useState({
    name: "",
    age: "",
    bloodgroup: "",
    branch: "",
    currPlanStart: "",
    currentPlan: "",
    dob: "",
    gender: "",
    height: "",
    phone: "",
    photo: "",
    planHistory: [],
    weight: "",
    memberSince: "",
  });

  const [photoName, setPhotoName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMemberData({ ...memberData, [name]: value });
  };

  const handlePhotoChange = (event) => {
    const photoFile = event.target.files[0];
    if (photoFile) {
      setMemberData({ ...memberData, photo: photoFile });
      setPhotoName(photoFile.name);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      let photoUrl = memberData.photo
        ? await uploadPhoto(memberData.photo)
        : "";
      let dummydt = new Date(memberData.currPlanStart);
      let currPlanStartTS = Timestamp.fromDate(dummydt);
      let dobTS = Timestamp.fromDate(new Date(memberData.dob));
      let planEndTS;
      if (memberData.currentPlan === "plan1") {
        planEndTS = new Date(memberData.currPlanStart);
        planEndTS.setMonth(planEndTS.getMonth() + 1);
      } else if (memberData.currentPlan === "plan2") {
        planEndTS = new Date(memberData.currPlanStart);
        planEndTS.setMonth(planEndTS.getMonth() + 4);
      } else if (memberData.currentPlan === "plan3") {
        planEndTS = new Date(memberData.currPlanStart);
        planEndTS.setMonth(planEndTS.getMonth() + 6);
      } else if (memberData.currentPlan === "plan4") {
        planEndTS = new Date(memberData.currPlanStart);
        planEndTS.setMonth(planEndTS.getMonth() + 12);
      }

      let plArray = [];
      plArray.push({
        plan: memberData.currentPlan,
        planStart: currPlanStartTS,
        planEnd: Timestamp.fromDate(planEndTS),
      });
      const memberWithallFields = {
        ...memberData,
        photo: photoUrl,
        branch: branch,
        planHistory: plArray,
        memberSince: currPlanStartTS,
        currPlanStart: currPlanStartTS,
        dob: dobTS,
      };
      console.log(memberWithallFields);
      await addMemberToFirestore(memberWithallFields);
      console.log("Member added successfully!");
      setSuccessMessage("Member successfully added!");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const uploadPhoto = async (photoFile) => {
    const storageRef = ref(storage, `files/${photoFile.name}`);
    const uploadTask = await uploadBytes(storageRef, photoFile);
    const downloadurl = await getDownloadURL(storageRef);
    return downloadurl;
  };

  const addMemberToFirestore = async (memberData) => {
    await addDoc(collection(db, "members"), memberData);
  };

  const handleDownloadReceipt = () => {
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New Registration</DialogTitle>
      <DialogContent>
        {!successMessage && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ marginTop: "10px" }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={memberData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={memberData.dob}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Age"
                  name="age"
                  type="number"
                  value={memberData.age}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={memberData.phone}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={memberData.address}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Blood Group*</InputLabel>
                <Select
                  name="bloodgroup"
                  value={memberData.bloodgroup}
                  onChange={handleChange}
                  fullWidth
                  required
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
              <Grid item xs={12} sm={6}>
                <InputLabel>Plan*</InputLabel>
                <Select
                  name="currentPlan"
                  value={memberData.currentPlan}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  <MenuItem value="plan1">Plan 1 (1 month)</MenuItem>
                  <MenuItem value="plan2">Plan 2 (4 month)</MenuItem>
                  <MenuItem value="plan3">Plan 3 (6 month)</MenuItem>
                  <MenuItem value="plan4">Plan 4 (12 month)</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Height"
                  name="height"
                  value={memberData.height}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Weight"
                  name="weight"
                  value={memberData.weight}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RadioGroup
                  name="gender"
                  value={memberData.gender}
                  onChange={handleChange}
                  row
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label="Female"
                  />
                </RadioGroup>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Plan Start"
                  name="currPlanStart"
                  type="date"
                  value={memberData.currPlanStart}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <div className="upload-btn-wrapper">
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<FontAwesomeIcon icon={faCloudArrowUp} />}
                    onChange={handlePhotoChange}
                  >
                    {photoName || "Upload Image"}
                    <input type="file" accept="image/jpeg" hidden />
                  </Button>
                </div>
              </Grid>
            </Grid>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Register
              </Button>
            </DialogActions>
          </form>
        )}{" "}
        {successMessage && (
          <>
            <Typography variant="h6" gutterBottom>
              {successMessage}
            </Typography>
            <Button
              onClick={handleDownloadReceipt}
              variant="contained"
              color="primary"
            >
              Download Receipt
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </>
        )}
      </DialogContent>
      <ReceiptDialog
        open={showReceipt}
        onClose={handleCloseReceipt}
        memberData={memberData}
      />
    </Dialog>
  );
};

export default AddMemberModal;
