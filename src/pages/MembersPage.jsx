import "../styles/MembersPage.css";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
  getDoc,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { differenceInDays, addMonths, formatDistanceToNow } from "date-fns";
import AddMemberModal from "../components/AddMemberModal";
import RenewMemberModal from "../components/RenewMemberModal";
import UserInfoModal from "../components/UserInfoModal";
import Sidebar from "../components/SideBar";
import ConfirmModal from "../components/ConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBell,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import EditMemberModal from "../components/EditMemberModal";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
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
  const [selectedPlan, setSelectedPlan] = useState("All");

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

  // useEffect(() => {
  //   const filteredMembers = members.filter((member) =>
  //     member.regno.includes(searchQuery.toLowerCase())
  //   );
  //   setSortedMembers(filteredMembers);
  // }, [searchQuery, members]);

  useEffect(() => {
    const filteredMembers = members.filter(
      (member) =>
        member.regno.includes(searchQuery.toLowerCase()) &&
        (selectedPlan === "All" || member.currentPlan === selectedPlan)
    );
    setSortedMembers(filteredMembers);
  }, [searchQuery, selectedPlan, members]);

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

  const handleRenewMember = async (
    newPlan,
    duration,
    amount,
    setReceiptData
  ) => {
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
      const updatedDocSnapshot = await getDoc(memberRef);
      const updatedDocData = updatedDocSnapshot.data();
      setReceiptData(updatedDocData);
      fetchMembers();
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

  const handlePlanChange = (event) => {
    setSelectedPlan(event.target.value);
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
      <Grid2 container spacing={2} sx={{ marginBottom: "10px" }}>
        <Grid2 xs={12} sm={6}>
          <TextField
            label="Search by Register Number"
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </Grid2>
        <Grid2 xs={12} sm={6}>
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="plan-select-label">Select Plan</InputLabel>
            <Select
              labelId="plan-select-label"
              value={selectedPlan}
              onChange={handlePlanChange}
              label="Select Plan"
            >
              <MenuItem value="All">All Plans</MenuItem>
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.dn}>
                  {plan.dn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>
      </Grid2>

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
            <TableRow
              sx={{
                backgroundColor: "#1976d2",
              }}
            >
              <TableCell sx={{ color: "white" }}>Reg No.</TableCell>
              <TableCell sx={{ color: "white" }}>Name</TableCell>
              <TableCell sx={{ color: "white" }}>Age</TableCell>
              <TableCell sx={{ color: "white" }}>Batch</TableCell>
              <TableCell sx={{ color: "white" }}>Phone</TableCell>
              <TableCell sx={{ color: "white" }}>Days Left</TableCell>
              <TableCell sx={{ color: "white" }}>Balance</TableCell>
              <TableCell align="center" sx={{ color: "white" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndPaginatedMembers.map((member) => (
              <TableRow
                key={member.id}
                sx={{
                  cursor: "pointer",
                  backgroundColor:
                    daysLeft(member.planHistory) <= 5 ||
                    daysLeft(member.planHistory) === "Expired"
                      ? "#FFCDD2"
                      : "inherit",
                  color:
                    daysLeft(member.planHistory) <= 5 ? "white" : "inherit",
                }}
                className="bd"
              >
                <TableCell>{member.regno}</TableCell>
                <TableCell onClick={() => handleRowClick(member)}>
                  {member.name}{" "}
                  {daysLeft(member.planHistory) <= 5 ? (
                    <Link
                      to={`https://wa.me/91${
                        member.phone
                      }?text=${encodeURIComponent(
                        `Hi there! This is a friendly reminder from Matrix Gym that your membership plan is about to expire in ${daysLeft(
                          member.planHistory
                        )} days. Please renew soon to continue enjoying our services. Thank you!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faBell}
                        style={{ color: "red" }}
                        shake
                      />
                    </Link>
                  ) : daysLeft(member.planHistory) === "Expired" ? (
                    <Link
                      to={`https://wa.me/91${
                        member.phone
                      }?text=${encodeURIComponent(
                        `Hi there! This is a friendly reminder from Matrix Gym that your membership plan is expired. Please renew soon to continue enjoying our services. Thank you!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faBell}
                        style={{ color: "red" }}
                        shake
                      />
                    </Link>
                  ) : (
                    ""
                  )}
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
                  <Grid2
                    container
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Grid2 item>
                      <Button onClick={() => handleEditOpen(member)}>
                        <FontAwesomeIcon icon={faPen} />
                      </Button>
                    </Grid2>
                    <Grid2 item>
                      <Button
                        onClick={() => handleDeleteButtonClick(member)}
                        color="error"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </Grid2>
                    {isPlanExpired(member.planHistory) ? (
                      <Grid2 item>
                        <Button
                          style={{ color: "red" }}
                          onClick={() => handleRenewButtonClick(member)}
                        >
                          Renew
                        </Button>
                      </Grid2>
                    ) : (
                      <Grid2 item>
                        <Button style={{ color: "green" }}>Active</Button>
                      </Grid2>
                    )}
                  </Grid2>
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
