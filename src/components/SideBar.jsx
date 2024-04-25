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

const Sidebar = ({ isOpen, handleClose }) => {
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
          <ListItemButton
            component={Link}
            to={`/Members/${branch}`}
            onClick={handleClose}
          >
            <ListItemText primary="Members" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to={`/Enquiry/${branch}`}
            onClick={handleClose}
          >
            <ListItemText primary="Enquiry" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to={`/Absentee/${branch}`}
            onClick={handleClose}
          >
            <ListItemText primary="Absentees" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to={`/Plan/${branch}`}
            onClick={handleClose}
          >
            <ListItemText primary="Plan" />
          </ListItemButton>
          <ListItemButton onClick={handleSignOut}>
            <ListItemText primary="Logout" />
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
