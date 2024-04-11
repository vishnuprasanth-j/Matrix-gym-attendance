import {  useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Assuming 'db' is your Firestore instance
import {  TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const AddMemberModal = ({ open, handleClose }) => {
  const [memberData, setMemberData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    // Add more fields as needed
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMemberData({ ...memberData, [name]: value });
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (Object.values(memberData).some(value => value.trim() === '')) {
      alert('All fields are mandatory!');
      return;
    }

    try {
      await addDoc(collection(db, 'members'), memberData);
      handleClose();
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Member</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          name="name"
          value={memberData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Age"
          name="age"
          value={memberData.age}
          onChange={handleChange}
          type="number"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Gender"
          name="gender"
          value={memberData.gender}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Phone"
          name="phone"
          value={memberData.phone}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        {/* Add more fields as needed */}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};


export default AddMemberModal;