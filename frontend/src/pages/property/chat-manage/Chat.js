import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chat.css"; 

function ChatManage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // User information - in a real app, get this from your auth context
  const userType = localStorage.getItem("userType") || "Business"; // or "Tourist"
  const userID = localStorage.getItem("userID") ;
  const touristID = localStorage.getItem("touristID") ; 
  const businessID = localStorage.getItem("businessID") ;

  useEffect(() => {
    // Fetch all bookings with chats
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`http://localhost:4000/api/chat/bookingByBussinessId`, {
          params: { B_Id: businessID }
        });
        setBookings(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings");
        setLoading(false);
      }
    };
    

    fetchBookings();
  }, []);

  useEffect(() => {
    // Scroll to bottom of messages when they change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Fetch messages when a booking is selected
    if (selectedBooking) {
      fetchMessages(selectedBooking._id);
      
      // Set up polling for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedBooking._id);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedBooking]);

  const fetchMessages = async (bookingId) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/chat`, {
        params: {
          bookingId: bookingId,
          userId: userID,
          senderModel: 'Business',
        }
      });
      setMessages(res.data.chats || []); // it should be res.data.chats not res.data.message
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    }
  };
  

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setError(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedBooking) return;
    
    try {
      const res = await axios.post(`http://localhost:4000/api/chat/`, {
        sender: userID,             
        senderModel: 'Business',    
        bookingId: selectedBooking, 
        message: newMessage        
      });

      // After saving, maybe you want to refresh chats instead of setMessages(res.data.messages)
      setMessages(prevMessages => [...prevMessages, res.data.chat]);
      setNewMessage(""); // clear input
    } catch (err) {
      console.error("Error sending message:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to send message");
    }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading && !selectedBooking) {
    return (
      <div className="chat-container">
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      
      <div className="chat-layout">
        {/* Bookings List */}
        <div className="bookings-sidebar">
          <h2>All Bookings</h2>
          {bookings.length === 0 ? (
            <p className="no-bookings">No bookings found</p>
          ) : (
            <ul className="booking-list">
              {bookings.map((booking) => (
                <li 
                  key={booking._id} 
                  className={`booking-item ${selectedBooking?._id === booking._id ? 'selected' : ''}`}
                  onClick={() => handleBookingSelect(booking)}
                >
                  <div className="booking-name">
                    {userType === "Business" ? booking.touristName : booking.businessName}
                  </div>
                  <div className="booking-date">                 
                    {new Date(booking.booking_date).toLocaleDateString() +"  "+ booking.name}
                    <p><b>{booking._id}</b></p>
                  </div>
                  <div className="booking-status">
                    {booking.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Chat Area */}
        <div className="chat-area">
          {selectedBooking ? (
            <>
              <div className="chat-header">
                <h3>
                  Chatting with {userType === "Business" ? selectedBooking.touristName : selectedBooking.businessName}
                </h3>
                <p>Booking ID: {selectedBooking._id}</p>
              </div>
              
              <div className="messages-container">
                {messages.length === 0 ? (
                  <p className="no-messages">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`message ${msg.senderModel === userType ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">{msg.message}</div>
                      <div className="message-info">
                        <span className="message-time">{formatDate(msg.timestamp)}</span>
                        {msg.senderModel === userType && (
                          <span className="read-status">{msg.read ? "Read" : "Sent"}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                />
                <button type="submit" className="send-button">Send</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a booking to start chatting</p>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default ChatManage;