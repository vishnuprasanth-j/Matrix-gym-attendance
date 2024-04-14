import'../styles/MembersPage.css';
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db, SignOutUser } from "../lib/firebase"; // Assuming 'db' is your Firestore instance
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
import { AuthContext } from "../lib/AuthContext";
import RenewMemberModal from "../components/RenewMemberModal";
import UserInfoModal from "../components/UserInfoModal";
import Sidebar from "../components/Sidebar";

const MembersPage = () => {
  const { branch } = useParams();
  const [members, setMembers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortedMembers, setSortedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(AuthContext);
  const [isRenewMemberModalOpen, setIsRenewMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberInfo, setSelectedMemberInfo] = useState(null);
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
      plan2: 6, // Duration of plan2 in months
      plan3: 12, // Duration of plan3 in months
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

  const handleSignOut = async () => {
    try {
      await SignOutUser();
      navigate("/");
      setCurrentUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
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
      await updateDoc(memberRef, {
        currentPlan: newPlan,
        currPlanStart: Timestamp.now(),
        planHistory: [
          ...selectedMember.planHistory,
          selectedMember.currentPlan,
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
  return (
    <div className="memberspage-container">
     <Button onClick={handleSidebarOpen}>Open Sidebar</Button>
      <Sidebar isOpen={isSidebarOpen} handleClose={handleSidebarClose} />
      <Button onClick={handleSignOut}>Logout</Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddMemberButtonClick}
      >
        Add New Member
      </Button>
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
            backgroundColor: "#f0eeee"
          }
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
              <TableCell>Actions</TableCell>
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
                <TableCell onClick={() => handleRowClick(member)}>{member.name}</TableCell>
                <TableCell>{member.age}</TableCell>
                <TableCell>{member.gender}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.height + "cm"}</TableCell>
                <TableCell>{member.weight + "kg"}</TableCell>

                <TableCell>
                  {daysLeft(member.currPlanStart?.toDate(), member.currentPlan)}
                </TableCell>

                <TableCell>
                  <Button>Edit</Button>
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
    </div>
  );
};

export default MembersPage;
