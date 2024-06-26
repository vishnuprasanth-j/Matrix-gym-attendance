import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  Backdrop,
  IconButton,
} from "@mui/material";
import { SignOutUser } from "../lib/firebase";
import { useContext } from "react";
import { AuthContext } from "../lib/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const SidebarDashboard = ({ isOpen, handleClose }) => {
  const navigate = useNavigate();
  const { branch } = useParams();
  const { setCurrentUser } = useContext(AuthContext);
  const handleSignOut = async () => {
    try {
      await SignOutUser();
      navigate("/");
      setCurrentUser();
      handleClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }}
        open={isOpen}
        onClick={handleClose}
      />
      <Drawer
        open={isOpen}
        onClose={handleClose}
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
          },
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: 0, left: 0 }}
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>

        <List
          sx={{
            marginTop: "50px",
          }}
        >
          {/* <ListItemButton
                component={Link}
                to={`/Dashboard/Earnings`}
                onClick={handleClose}
              >
                <ListItemText primary="Earnings" />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to={`/Dashboard/Statistics`}
                onClick={handleClose}
              >
                <ListItemText primary="Stats" />
              </ListItemButton> */}
          <ListItemButton onClick={handleSignOut}>
            <ListItemText primary="Logout" />
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};

export default SidebarDashboard;
