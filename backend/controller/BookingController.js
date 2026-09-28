const PDFDocument = require('pdfkit');
const Booking = require('../model/Booking');
const Tourist = require("../model/Tourist"); 


const getAuthenticatedTourist = async (userID) => {
    return await Tourist.findOne({ userID });
};

const getAllBooking = async (req, res) => {
    try {
        const tourist = await getAuthenticatedTourist(
            req.user.userID
        );

        if (!tourist) {
            return res.status(403).json({
                message: "Tourist profile not found"
            });
        }

        const bookings = await Booking.find({
            touristID: tourist.touristID
        });

        return res.status(200).json(bookings);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getBooking = async (req, res) => {
    try {
        const bookingID = req.params.id;

        // Resolve authenticated user to Tourist profile
        const tourist = await getAuthenticatedTourist(
            req.user.userID
        );

        if (!tourist) {
            return res.status(403).json({
                message: "Tourist profile not found"
            });
        }

        const booking = await Booking.findOne({
            bookingID: bookingID
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Object-level authorization
        if (booking.touristID !== tourist.touristID) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        return res.status(200).json(booking);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// Security: only these fields may ever be written from a request body. Passing
// req.body straight to Mongoose would let a client set any field on the document.
const BOOKING_WRITABLE_FIELDS = [
    'name',
    'booking_type',
    'booking_date',
    'booking_time',
    'start_date',
    'end_date',
    'mobile_number',
    'payID',
    'tourID',
    'payment_amount',
    'B_Id',
    'hotel_booking',
    'vehicle_booking',
    'guide_booking'
];

// Security: fields that may be set when a booking is CREATED but must never be
// changed afterwards. payment_amount is the amount PaymentController charges via
// Stripe, and touristID/B_Id are ownership, so allowing updates would let a
// client zero out a price or reassign someone else's booking.
const BOOKING_IMMUTABLE_AFTER_CREATE = ['payment_amount', 'touristID', 'B_Id', 'payID', 'tourID'];

const pickBookingFields = (source, { isUpdate = false } = {}) => {
    const allowed = isUpdate
        ? BOOKING_WRITABLE_FIELDS.filter((field) => !BOOKING_IMMUTABLE_AFTER_CREATE.includes(field))
        : BOOKING_WRITABLE_FIELDS;

    const result = {};
    allowed.forEach((field) => {
        if (source[field] !== undefined) {
            result[field] = source[field];
        }
    });
    return result;
};

const addBooking = async (req, res) => {
    try {
        const tourist = await getAuthenticatedTourist(
            req.user.userID
        );

        if (!tourist) {
            return res.status(403).json({
                message: "Tourist profile not found"
            });
        }

        const bookingData = pickBookingFields(req.body);

        // Security: Tourist identity comes from authenticated session,
        // not from client-controlled request data.
        bookingData.touristID = tourist.touristID;

        const newBooking = await Booking.create(
            bookingData
        );

        return res.status(201).json(newBooking);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const updateBooking = async (req, res) => {
    const bookingID = req.params.id;

    try {
        const tourist = await getAuthenticatedTourist(
            req.user.userID
        );

        if (!tourist) {
            return res.status(403).json({
                message: "Tourist profile not found"
            });
        }

        const booking = await Booking.findOne({
            bookingID: bookingID
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (booking.touristID !== tourist.touristID) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const updateData = pickBookingFields(
            req.body,
            { isUpdate: true }
        );

        const updatedBooking = await Booking.findOneAndUpdate(
            {
                bookingID: bookingID,
                touristID: tourist.touristID
            },
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json(updatedBooking);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const tourist = await getAuthenticatedTourist(
            req.user.userID
        );

        if (!tourist) {
            return res.status(403).json({
                message: "Tourist profile not found"
            });
        }

        const booking = await Booking.findOne({
            bookingID: id
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (booking.touristID !== tourist.touristID) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await Booking.findOneAndDelete({
            bookingID: id,
            touristID: tourist.touristID
        });

        return res.status(200).json({
            message: "Booking deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const generateReport = async (req, res) => {
    try {
        const tourist = await getAuthenticatedTourist(
            req.user.userID
        );

        if (!tourist) {
            return res.status(403).json({
                message: "Tourist profile not found"
            });
        }

        const bookings = await Booking.find(
            {
                touristID: tourist.touristID
            },
            'bookingID name booking_type start_date end_date'
        );

        const doc = new PDFDocument();

        res.setHeader(
            'Content-Type',
            'application/pdf'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=booking_report.pdf'
        );

        doc.pipe(res);

        doc.fontSize(15).text(
            'Booking Report',
            { align: 'center' }
        );

        doc.moveDown();

        bookings.forEach((booking) => {
            doc.text(
                `Booking ID: ${booking.bookingID}`
            );

            doc.text(
                `Name: ${booking.name}`
            );

            doc.text(
                `Booking Type: ${booking.booking_type}`
            );

            doc.text(
                `Start Date: ${new Date(
                    booking.start_date
                ).toLocaleDateString()}`
            );

            doc.text(
                `End Date: ${new Date(
                    booking.end_date
                ).toLocaleDateString()}`
            );

            doc.moveDown();
        });

        doc.end();

    } catch (error) {
        console.error(error);

        if (!res.headersSent) {
            return res.status(500).json({
                message: "Error generating report"
            });
        }
    }
};

module.exports = {
    getAllBooking,
    getBooking,
    addBooking,
    updateBooking,
    deleteBooking,
    generateReport
};