import { Modal, Button, Select, MenuItem, Typography } from '@mui/material';

const RenewMemberModal = ({ open, handleClose, memberData, handleRenew }) => {
    const { name, phone, currentPlan } = memberData || {};

  const handleSubmit = (event) => {
    event.preventDefault();
    const newPlan = event.target.newPlan.value;
    handleRenew(newPlan);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h6" gutterBottom align="center">Renew Member</Typography>
        <form onSubmit={handleSubmit}>
          <p><span>Name:</span><span>{name}</span></p>
          <p><span>phone:</span><span>{phone}</span></p>
          <Select label="New Plan" name="newPlan" defaultValue={currentPlan} fullWidth>
            <MenuItem value="plan1">Plan 1</MenuItem>
            <MenuItem value="plan2">Plan 2</MenuItem>
            <MenuItem value="plan3">Plan 3</MenuItem>
          </Select>
          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '10px' }}>Renew</Button>
        </form>
      </div>
    </Modal>
  );
};

export default RenewMemberModal;
