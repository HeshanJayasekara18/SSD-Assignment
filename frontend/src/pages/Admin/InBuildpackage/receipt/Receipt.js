import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Receipt = () => {
    const { transactionId } = useParams();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const res = await axios.get(`/api/payments/receipt/${transactionId}`);
                setReceipt(res.data.receiptData);
            } catch (err) {
                setError("Receipt not found or server error.");
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [transactionId]);

    if (loading) return <div style={styles.container}>Loading...</div>;
    if (error) return <div style={{ ...styles.container, color: 'red' }}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Payment Receipt</h2>
            <div style={styles.box}>
                <p><strong>Transaction ID:</strong> {receipt.transactionId}</p>
                <p><strong>Payment ID:</strong> {receipt.paymentId}</p>
                <p><strong>Customer:</strong> {receipt.customerName}</p>
                <p><strong>Email:</strong> {receipt.customerEmail}</p>
                <p><strong>Phone:</strong> {receipt.customerPhone}</p>
                <p><strong>Payment Method:</strong> {receipt.paymentMethod}</p>
                <p><strong>Status:</strong> {receipt.paymentStatus}</p>
                <p><strong>Travelers:</strong> {receipt.numberOfTravelers}</p>
                <p><strong>Price per person:</strong> ${receipt.pricePerPerson}</p>
                <p><strong>Total:</strong> ${receipt.totalAmount}</p>
                <hr />
                <h3 style={styles.subheading}>Tour Package</h3>
                <p><strong>Name:</strong> {receipt.packageDetails.name}</p>
                <p><strong>Destination:</strong> {receipt.packageDetails.destination}</p>
                <p><strong>Start:</strong> {new Date(receipt.packageDetails.startDate).toDateString()}</p>
                <p><strong>End:</strong> {new Date(receipt.packageDetails.endDate).toDateString()}</p>
                <p><strong>Type:</strong> {receipt.packageDetails.tourType}</p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    heading: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '1rem'
    },
    subheading: {
        color: '#444',
        marginTop: '1.5rem'
    },
    box: {
        lineHeight: '1.6',
        fontSize: '16px'
    }
};

export default Receipt;
