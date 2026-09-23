
const { jsPDF } = require("jspdf");
const PDFDocument = require('pdfkit');
const Booking = require('../model/Booking'); // Import the Booking model

const getAllBooking = async (req, res) => {
    try {
        const bookings = await Booking.find({}); 
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBooking = async (req, res) => {
    try {
        const bookingID = req.params.id; 
        const booking = await Booking.findOne({ bookingID: bookingID }); 
        res.status(200).json(booking); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addBooking = async (req, res) => {
    try {
        const newBooking = await Booking.create(req.body); 
        res.status(200).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBooking = async (req, res) => {
    const bookingID = req.params.id;
    const body = req.body;


    
    try {
        const updatedBooking = await Booking.findOneAndUpdate(
            { bookingID: bookingID },
            body,
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBooking = async (req, res) => {
    const { id } = req.params; 
    try {
        const deletedBooking = await Booking.findOneAndDelete({ bookingID: id }); 
        res.status(200).json(deletedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateReport = async (req, res) => {
    try {
        // Query the database for booking data (you can customize your query based on the required data)
        const bookings = await Booking.find({}, 'bookingID name booking_type start_date end_date'); // Fields you need

        // Create a PDF document
        const doc = new PDFDocument();

        // Set the response header to indicate it's a PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=booking_report.pdf');
        
        // Pipe the PDF into the response
        doc.pipe(res);

        // Add Title
        doc.fontSize(15).text('Booking Report', { align: 'center' });
        doc.moveDown();

        // Iterate over bookings and add each to the PDF
        bookings.forEach((booking, index) => {
            doc.text(`Booking ID: ${booking.bookingID}`);
            doc.text(`Name: ${booking.name}`);
            doc.text(`Booking Type: ${booking.booking_type}`);
            doc.text(`Start Date: ${new Date(booking.start_date).toLocaleDateString()}`);
            doc.text(`End Date: ${new Date(booking.end_date).toLocaleDateString()}`);
            doc.moveDown();
        });

        // Finalize and close the PDF document
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating report');
    }
}

module.exports = {
    getAllBooking,
    getBooking,
    addBooking,
    updateBooking,
    deleteBooking,
    generateReport
};