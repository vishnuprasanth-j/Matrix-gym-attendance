import "../styles/MembersPage.css";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../lib/firebase"; // Assuming 'db' is your Firestore instance
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
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const localPlans = localStorage.getItem("plans");
        if (localPlans) {
          setPlans(JSON.parse(localPlans));
        } else {
          const plansRef = collection(db, "plans");
          const querySnapshot = await getDocs(plansRef);
          const plansData = [];
          querySnapshot.forEach((doc) => {
            plansData.push({ id: doc.id, ...doc.data() });
          });
          setPlans(plansData);
          localStorage.setItem("plans", JSON.stringify(plansData));
        }
      } catch (error) {
        console.error("Error fetching plans: ", error);
      }
    };
    fetchPlans();
  }, []);

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
        membersData.sort((a, b) => {
          const numA = Number(a.regno);
          const numB = Number(b.regno);
          return numA - numB;
        });
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members: ", error);
      }
    };
    fetchMembers();
  }, [branch]);

  useEffect(() => {
    if (members.length > 0) {
      localStorage.removeItem("absentees");
      localStorage.setItem("absentees", JSON.stringify(members));
    }
  }, [members]);

  useEffect(() => {
    const filteredMembers = members.filter((member) =>
      member.regno.includes(searchQuery.toLowerCase())
    );
    setSortedMembers(filteredMembers);
  }, [searchQuery, members]);

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
      membersData.sort((a, b) => {
        const numA = Number(a.regno);
        const numB = Number(b.regno);
        return numA - numB;
      });
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members: ", error);
    }
  };

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

  const isPlanExpired = (planHistory) => {
    const currPlanEnd = planHistory[planHistory.length - 1].planEnd.toDate();
    const now = new Date();
    return now > currPlanEnd;
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

  const handleRenewMember = async (newPlan, duration, amount) => {
    try {
      if (!selectedMember) return;

      const memberRef = doc(db, "members", selectedMember.id);

      let planEndTS;
      const currPlanStartDt = new Date();
      planEndTS = new Date(currPlanStartDt);
      planEndTS.setMonth(planEndTS.getMonth() + duration);
      planEndTS = Timestamp.fromDate(planEndTS);

      let updatedplanHistory = {
        plan: newPlan,
        planStart: Timestamp.now(),
        planEnd: planEndTS,
        amount: amount,
      };

      await updateDoc(memberRef, {
        currentPlan: newPlan,
        currPlanStart: Timestamp.now(),
        planHistory: [...selectedMember.planHistory, updatedplanHistory],
      });
      fetchMembers();
      setIsRenewMemberModalOpen(false);
    } catch (error) {
      console.error("Error renewing member:", error);
    }
  };

  const daysLeft = (planHistory) => {
    const currPlanEnd = planHistory[planHistory.length - 1].planEnd.toDate();
    const now = new Date();
    const diffInDays = differenceInDays(currPlanEnd, now);

    if (diffInDays <= 0) {
      return "Expired";
    } else {
      return diffInDays;
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
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== selectedMember.id)
      );

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

  const handleEditMember = async (editedMember, existingData, photoName) => {
    try {
      let dobTimestamp = editedMember.dob;
      if (!isTimestamp(dobTimestamp)) {
        dobTimestamp = Timestamp.fromDate(new Date(editedMember.dob));
      }

      if (photoName) {
        const storageRef = ref(storage, `files/${photoName}`);
        await uploadBytes(storageRef, editedMember.photo);
        const newPhotoURL = await getDownloadURL(storageRef);

        editedMember.photo = newPhotoURL;
      }

      const memberRef = doc(db, "members", editedMember.id);

      await updateDoc(memberRef, {
        ...editedMember,
        dob: dobTimestamp,
      });
      fetchMembers();
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  const CalculateBalance = (paid, currplan) => {
    const selectedPlan = plans.find((plan) => plan.dn === currplan);
    if (!selectedPlan) {
      return "";
    }
    const selectedPlanAmount = selectedPlan.amount;
    const diff = Number(selectedPlanAmount) - Number(paid);
    return diff === 0 ? "Nil" : diff;
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
        label="Search by Register Number"
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
              <TableCell>Reg No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Days Left</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndPaginatedMembers.map((member) => (
              <TableRow
                key={member.id}
                sx={{
                  cursor: "pointer",
                  backgroundColor:
                    daysLeft(member.planHistory) <= 5 ? "#FFCDD2" : "inherit",
                  color:
                    daysLeft(member.planHistory) <= 5 ? "white" : "inherit",
                }}
                className="bd"
              >
                <TableCell>{member.regno}</TableCell>
                <TableCell onClick={() => handleRowClick(member)}>
                  {member.name}
                </TableCell>
                <TableCell>{member.age}</TableCell>
                <TableCell>{member.batch}</TableCell>
                <TableCell>{member.phone}</TableCell>

                <TableCell>{daysLeft(member.planHistory)}</TableCell>
                <TableCell>
                  {CalculateBalance(
                    member.planHistory[member.planHistory.length - 1].amount,
                    member.planHistory[member.planHistory.length - 1].plan
                  )}
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
                  {isPlanExpired(member.planHistory) ? (
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
        plans={plans}
        handleClose={handleCloseAddMemberModal}
        updateMembers={setMembers}
      />
      <RenewMemberModal
        open={isRenewMemberModalOpen}
        handleClose={handleCloseRenewMemberModal}
        memberData={selectedMember}
        handleRenew={handleRenewMember}
        plans={plans}
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
        plans={plans}
      />
    </div>
  );
};

export default MembersPage;
