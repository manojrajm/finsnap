import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../services/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const BillingForm = () => {
  const [formData, setFormData] = useState({
    billId: "",
    guestName: "",
    mobileNumber: "",
    roomNo: "",
    checkInDate: "",
    checkOutDate: "",
    roomType: "Double",
    roomCharges: "",
    tax: "",
    total: 0,
    paymentStatus: "Paid",
    paymentMode: "Cash",
  });

  const [currentBillCount, setCurrentBillCount] = useState(0);

  useEffect(() => {
    const fetchBillCount = async () => {
      const billsSnapshot = await getDocs(collection(db, "billing"));
      setCurrentBillCount(billsSnapshot.size);
    };
    fetchBillCount();
  }, []);

  const generateBillId = () => {
    const date = new Date();
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}${date.toLocaleString("default", {
      month: "short",
    })}`;
    const billNumber = String(currentBillCount + 1).padStart(2, "0");
    return `RCH${formattedDate}${billNumber}`;
  };

  const calculateGST = (roomCharges) => {
    const charges = parseFloat(roomCharges) || 0;
    const gst = charges * 0.06; // 6% CGST and 6% SGST
    return {
      cgst: gst,
      sgst: gst,
      total: charges + gst * 2,
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value,
    };
    const { cgst, sgst, total } = calculateGST(updated.roomCharges);
    updated.tax = (cgst + sgst).toFixed(2);
    updated.total = total.toFixed(2);
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newBillId = generateBillId();
    try {
      await addDoc(collection(db, "billing"), {
        ...formData,
        billId: newBillId,
        total: parseFloat(formData.total),
      });
      toast.success("Bill added successfully!");
      setCurrentBillCount((prev) => prev + 1);
      setFormData({
        billId: "",
        guestName: "",
        mobileNumber: "",
        roomNo: "",
        checkInDate: "",
        checkOutDate: "",
        roomType: "Double",
        roomCharges: "",
        tax: "",
        total: 0,
        paymentStatus: "Paid",
        paymentMode: "Cash",
      });
    } catch (err) {
      console.error("Error adding bill: ", err);
      toast.error("Failed to add the bill.");
    }
  };

  return (
    <><style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
      
        body {
          font-family: 'Poppins', 'Segoe UI', sans-serif;
          background: linear-gradient(120deg, #f0f4ff, #fdfbfb);
          color: #1f2937;
        }
      
        .container {
          max-width: 750px;
          margin: 60px auto;
          padding: 20px;
        }
      
        h2 {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #4f46e5;
          margin-bottom: 30px;
          background: linear-gradient(to right, #6366f1, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      
        form {
          background: white;
          padding: 35px;
          border-radius: 18px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 24px;
          animation: fadeIn 0.8s ease-out;
        }
      
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      
        label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #374151;
          font-size: 0.95rem;
        }
      
        input[type="text"],
        input[type="number"],
        input[type="date"],
        select {
          width: 100%;
          padding: 13px 16px;
          border-radius: 10px;
          font-size: 1rem;
          background: #f9fafb;
          border: 1.8px solid #d1d5db;
          transition: 0.3s ease-in-out;
          box-shadow: inset 0 0 0 transparent;
        }
      
        input:focus,
        select:focus {
          border-color: #6366f1;
          outline: none;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
      
        input[readonly] {
          background-color: #f3f4f6;
          color: #111827;
          font-weight: 600;
          cursor: not-allowed;
        }
      
        button {
          background: linear-gradient(to right, #6366f1, #3b82f6);
          color: #fff;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.3s ease, background 0.3s ease;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
        }
      
        button:hover {
          transform: scale(1.04);
          background: linear-gradient(to right, #4f46e5, #2563eb);
        }
      
        @media (min-width: 640px) {
          form {
            grid-template-columns: 1fr 1fr;
          }
      
          .total,
          button {
            grid-column: 1 / -1;
          }
      
          button {
            max-width: 300px;
            margin: 20px auto 0;
          }
        }
      
        @media (max-width: 639px) {
          form {
            grid-template-columns: 1fr;
          }
      
          button {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="container">
        <h2>Billing Form</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="guestName">Guest Name</label>
            <input
              type="text"
              id="guestName"
              name="guestName"
              placeholder="Enter guest's name"
              value={formData.guestName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              placeholder="Enter mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              maxLength={10}
            />
          </div>

          <div>
            <label htmlFor="roomNo">Room Number</label>
            <input
              type="text"
              id="roomNo"
              name="roomNo"
              placeholder="Enter room number"
              value={formData.roomNo}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="checkInDate">Check-In Date</label>
            <input
              type="date"
              id="checkInDate"
              name="checkInDate"
              value={formData.checkInDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="checkOutDate">Check-Out Date</label>
            <input
              type="date"
              id="checkOutDate"
              name="checkOutDate"
              value={formData.checkOutDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="roomType">Room Type</label>
            <select
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
            >
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
              <option value="Four">Four</option>
            </select>
          </div>

          <div>
            <label htmlFor="paymentMode">Payment Mode</label>
            <select
              id="paymentMode"
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          <div>
            <label htmlFor="roomCharges">Room Charges</label>
            <input
              type="number"
              id="roomCharges"
              name="roomCharges"
              placeholder="Enter room charges"
              value={formData.roomCharges}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div>
            <label>Tax (6% CGST + 6% SGST)</label>
            <input
              type="text"
              value={`₹${formData.tax || 0}`}
              readOnly
            />
          </div>

          <div className="total">
            <label>Total</label>
            <input
              type="text"
              value={`₹${formData.total}`}
              readOnly
            />
          </div>

          <button type="submit">Submit</button>
        </form>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
};

export default BillingForm;
