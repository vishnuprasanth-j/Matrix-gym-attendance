import { TextField } from "@mui/material";
import "../styles/AttendancePage.css";

const AttendancePage = () => {
  return (
    <main className="at-outercontainer">
      <div className="at-innercontainer">
        <div className="at-header">
          <p>Matrix Gym</p>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
        <div className="at-body">
          <p className="at-bd-title">Attendance</p>
          <div>
            <TextField
              label="Phone Number"
              variant="outlined"
              sx={{
                width:"500px",
                // Root class for the input field
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  // Class for the border around the input field
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                    borderWidth: "2px",
                  },
                },
                // Class for the label of the input field
                "& .MuiInputLabel-outlined": {
                  color: "#fff",
                },
              }}
            />
          </div>
          <div className="at-bd-footer">

          </div>
        </div>
      </div>
    </main>
  );
};

export default AttendancePage;
