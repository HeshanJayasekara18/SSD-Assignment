import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from "@mui/material";

const BookingGuideBooking = ({ open, handleClose, selectedDate }) => {
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleRequestBooking = () => {
    console.log("Booking requested:", { fullName, contactNumber, notes, selectedDate });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Booking Details</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Tour Guide: Saman Kumara</Typography>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Selected Date: {selectedDate || "Not Selected"}
        </Typography>
        <TextField
          label="Full Name"
          fullWidth
          margin="dense"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextField
          label="Contact Number"
          fullWidth
          margin="dense"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
        />
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={3}
          margin="dense"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Close</Button>
        <Button onClick={handleRequestBooking} variant="contained" color="secondary">
          Request Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingGuideBooking;
