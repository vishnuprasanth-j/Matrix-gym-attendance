import "../styles/MembersPage.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc
} from "firebase/firestore";
import { db, storage} from "../lib/firebase"; // Assuming 'db' is your Firestore instance
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Paper,
  TablePagination,
} from "@mui/material";
import { differenceInDays, addMonths, formatDistanceToNow } from "date-fns";
import AddMemberModal from "../components/AddMemberModal";
import RenewMemberModal from "../components/RenewMemberModal";
import UserInfoModal from "../components/UserInfoModal";
import Sidebar from "../components/SideBar";
import ConfirmModal from "../components/ConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditMemberModal from "../components/EditMemberModal";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
const MembersPage = () => {
  const { branch } = useParams();
  console.log(branch);
  const [members, setMembers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortedMembers, setSortedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isRenewMemberModalOpen, setIsRenewMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberInfo, setSelectedMemberInfo] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editMemberData, setEditMemberData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = branch
          ? query(membersRef, where("branch", "==", branch))
          : membersRef;
        const querySnapshot = await getDocs(q);
        const membersData = [];
        querySnapshot.forEach((doc) => {
          membersData.push({ id: doc.id, ...doc.data() });
        });
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members: ", error);
      }
    };

    fetchMembers();
  }, [branch]);

  useEffect(() => {
    const filteredMembers = members.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSortedMembers(filteredMembers);
  }, [members, searchQuery]);

   const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateCurrPlanEnd = (currPlanStart, currentPlan) => {
    const planLengths = {
      plan1: 1, // Duration of plan1 in months
      plan2: 4, // Duration of plan2 in months
      plan3: 6, // Duration of plan3 in months
      plan4: 12 // Duration of plan4 in months
    };
    const planDurationMonths = planLengths[currentPlan] || 0;
    if (!planDurationMonths) return null;
    console.log(currPlanStart);
    const planEnd = new Date(currPlanStart);
    planEnd.setMonth(planEnd.getMonth() + planDurationMonths);
    return planEnd;
  };

  const isPlanExpired = (currPlanStart, currentPlan) => {
    const currPlanEnd = calculateCurrPlanEnd(currPlanStart, currentPlan);
    if (!currPlanStart || !currPlanEnd) return false; // Return false if plan start or end date is not available
    const now = new Date();
    return now > currPlanEnd; // Check if the current date is after the plan end date
  };

  const sortedAndPaginatedMembers = sortedMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const handleAddMemberButtonClick = () => {
    setIsAddMemberModalOpen(true);
  };

  const handleCloseAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const handleRenewButtonClick = (member) => {
    setSelectedMember(member);
    setIsRenewMemberModalOpen(true);
  };

  const handleCloseRenewMemberModal = () => {
    setSelectedMember(null);
    setIsRenewMemberModalOpen(false);
  };

  const handleRenewMember = async (newPlan) => {
    try {
      if (!selectedMember) return;

      const memberRef = doc(db, "members", selectedMember.id);
     
      let planEndTS;
      const currPlanStartDt = new Date(); 
      switch (newPlan) {
          case "plan1":
              planEndTS = new Date(currPlanStartDt);
              planEndTS.setMonth(planEndTS.getMonth() + 1);
              break;
          case "plan2":
              planEndTS = new Date(currPlanStartDt);
              planEndTS.setMonth(planEndTS.getMonth() + 4);
              break;
          case "plan3":
              planEndTS = new Date(currPlanStartDt);
              planEndTS.setMonth(planEndTS.getMonth() + 6);
              break;
          case "plan4":
              planEndTS = new Date(currPlanStartDt);
              planEndTS.setMonth(planEndTS.getMonth() + 12);
              break;
          default:
              throw new Error("Unknown plan code: " + newPlan);
      }

      planEndTS = Timestamp.fromDate(planEndTS);
  
      let updatedplanHistory={
        plan:newPlan,
        planStart:Timestamp.now(),
        planEnd:planEndTS
      }
     
      await updateDoc(memberRef, {
        currentPlan: newPlan,
        currPlanStart: Timestamp.now(),
        planHistory: [
          ...selectedMember.planHistory,
          updatedplanHistory
        ],
      });

      setIsRenewMemberModalOpen(false);
    } catch (error) {
      console.error("Error renewing member:", error);
    }
  };

  const daysLeft = (currPlanStart, currentPlan) => {
    const currPlanEnd = calculateCurrPlanEnd(currPlanStart, currentPlan);
    if (!currPlanStart || !currPlanEnd) return "";
    const now = new Date();
    const diffInDays = differenceInDays(currPlanEnd, now);
    if (diffInDays <= 0) {
      return "Expired";
    } else if (diffInDays <= 30) {
      return `${diffInDays}d`;
    } else {
      const futureDate = addMonths(currPlanEnd, 1);
      return formatDistanceToNow(futureDate, { addSuffix: true });
    }
  };

  const handleRowClick = (member) => {
    setSelectedMemberInfo(member);
  };

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleDeleteButtonClick = (member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedMember(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteMember = async () => {
    try {
      if (!selectedMember) return;

      const memberRef = doc(db, "members", selectedMember.id);
      await deleteDoc(memberRef);

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleEditOpen = (member) => {
    setEditMemberData(member);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
  };
  const isTimestamp = (value) => {
    return value instanceof Timestamp;
  };
  
  const handleEditMember = async (editedMember, photoName) => {
    try {
      let currPlanStartTimestamp = editedMember.currPlanStart;
      let dobTimestamp = editedMember.dob;
  
      if (!isTimestamp(currPlanStartTimestamp)) {
        currPlanStartTimestamp = Timestamp.fromDate(new Date(editedMember.currPlanStart));
      }
      if (!isTimestamp(dobTimestamp)) {
        dobTimestamp = Timestamp.fromDate(new Date(editedMember.dob));
      }
  
      let planEndTS;
      switch (editedMember.currentPlan) {
          case "plan1":
              planEndTS = new Date(editedMember.currPlanStart);
              planEndTS.setMonth(planEndTS.getMonth() + 1);
              break;
          case "plan2":
              planEndTS = new Date(editedMember.currPlanStart);
              planEndTS.setMonth(planEndTS.getMonth() + 4);
              break;
          case "plan3":
              planEndTS = new Date(editedMember.currPlanStart);
              planEndTS.setMonth(planEndTS.getMonth() + 6);
              break;
          case "plan4":
              planEndTS = new Date(editedMember.currPlanStart);
              planEndTS.setMonth(planEndTS.getMonth() + 12);
              break;
          default:
              throw new Error("Unknown plan code: " + editedMember.currentPlan);
      }

      planEndTS = Timestamp.fromDate(planEndTS);
  
      if (photoName) {
        const storageRef = ref(storage, `files/${photoName}`);
        await uploadBytes(storageRef, editedMember.photo);
        const newPhotoURL = await getDownloadURL(storageRef);
  
     
        editedMember.photo = newPhotoURL;
      }
      
      let editedPlanHistory = Array.isArray(editedMember.planHistory) ? [...editedMember.planHistory] : [];
      const lastPlan = editedPlanHistory.length > 0 ? editedPlanHistory[editedPlanHistory.length - 1] : null;
      lastPlan.planStart = currPlanStartTimestamp;
      lastPlan.plan = editedMember.currentPlan;
      lastPlan.planEnd = planEndTS;
      
      const memberRef = doc(db, "members", editedMember.id);

      await updateDoc(memberRef, {
        ...editedMember, 
        currPlanStart: currPlanStartTimestamp,
        dob: dobTimestamp,
        planHistory:editedPlanHistory
      });
  
      console.log("Document successfully updated!");
  
      handleEditClose();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  

  return (
    <div className="memberspage-container">
      <div className="memberspage-btn-container">
        <Button onClick={handleSidebarOpen}>
          <FontAwesomeIcon icon={faBars} />
        </Button>
        <Sidebar isOpen={isSidebarOpen} handleClose={handleSidebarClose} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddMemberButtonClick}
        >
          Add New Member
        </Button>
      </div>

      <TextField
        label="Search by Name"
        value={searchQuery}
        onChange={handleSearchChange}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <TableContainer component={Paper}>
        <Table
          sx={{
            minWidth: 650,
            "& > .MuiTableBody-root > .MuiTableRow-root:hover": {
              backgroundColor: "#f0eeee",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Height</TableCell>
              <TableCell>Days Left</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndPaginatedMembers.map((member) => (
              <TableRow
                key={member.id}
                sx={{
                  cursor: "pointer",
                }}
                className="bd"
              >
                <TableCell onClick={() => handleRowClick(member)}>
                  {member.name}
                </TableCell>
                <TableCell>{member.age}</TableCell>
                <TableCell>{member.gender}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.height + "cm"}</TableCell>
                <TableCell>{member.weight + "kg"}</TableCell>

                <TableCell>
                  {daysLeft(member.currPlanStart?.toDate(), member.currentPlan)}
                </TableCell>

                <TableCell align="center">
                  <Button onClick={() => handleEditOpen(member)}>
                    <FontAwesomeIcon icon={faPen} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteButtonClick(member)}
                    color="error"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                  {isPlanExpired(
                    member.currPlanStart?.toDate() || "",
                    member.currentPlan
                  ) ? (
                    <Button
                      style={{ color: "red" }}
                      onClick={() => handleRenewButtonClick(member)}
                    >
                      Renew
                    </Button>
                  ) : (
                    <Button style={{ color: "green" }}>Active</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={sortedMembers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
      <AddMemberModal
        open={isAddMemberModalOpen}
        handleClose={handleCloseAddMemberModal}
      />
      <RenewMemberModal
        open={isRenewMemberModalOpen}
        handleClose={handleCloseRenewMemberModal}
        memberData={selectedMember}
        handleRenew={handleRenewMember}
      />
      <UserInfoModal
        open={selectedMemberInfo !== null}
        handleClose={() => setSelectedMemberInfo(null)}
        memberInfo={selectedMemberInfo}
      />

      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteMember}
        message="Are you sure you want to delete this member?"
      />
        <EditMemberModal
          open={isEditModalOpen}
          handleClose={handleEditClose}
          memberData={editMemberData}
          handleEdit={handleEditMember}
        />
     </div>
  );
};

export default MembersPage;
