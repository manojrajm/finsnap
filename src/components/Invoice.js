import { useEffect, useState } from "react";
import { db } from "../services/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { jsPDF } from "jspdf";
import logo from "../img/logo11.png"; 

const Invoice = () => {
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchRecentInvoices = async () => {
      try {
        const q = query(
          collection(db, "billing"),
          orderBy("billId", "desc"),
          limit(100)
        );

        const querySnapshot = await getDocs(q);
        const invoices = [];
        querySnapshot.forEach((doc) => {
          invoices.push({ id: doc.id, ...doc.data() });
        });

        setRecentInvoices(invoices);
      } catch (error) {
        console.error("Error fetching recent invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentInvoices();
  }, []);

  // Same downloadPDF and printInvoice functions from your code (unchanged)...
  // [For brevity, you can reuse your existing downloadPDF and printInvoice functions here]

 

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    // Preload the logo image
    const image = new Image();
  image.src = logo; 
  
    image.onload = () => {
      // Header Background
      doc.setFillColor(0, 51, 102); // Dark blue background
      doc.rect(0, 0, 210, 50, "F");
  
      // Insert the Logo
      doc.addImage(image, "JPEG", 10, 10, 30, 30);
  
      // Hotel Details
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Right Choice Hotels", 50, 15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("21/90-C-5, Eswariamman Kovil Street", 50, 22);
      doc.text("Rameswaram-623 526", 50, 27);
      doc.text("Phone: +91-7871140888 | GSTIN: 33CTHPS5371J1Z9", 50, 32);
      doc.text("Email: rightchoicehotels@gmail.com", 50, 37);
  
      // Invoice Title
      doc.setFontSize(20);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text("Tax Invoice", 105, 60, null, null, "center");
  
      // Divider Line
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(0.5);
      doc.line(20, 65, 190, 65);
  
      // Invoice Details
      doc.setFontSize(11);
      const addLine = (label, value, x = 20, y) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, x, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(value || "N/A"), x + 50, y);
      };
  
      let y = 75;
      addLine("Bill ID", invoice.billId, 20, y);
      addLine("Guest Name", invoice.guestName, 20, (y += 7));
      addLine("Mobile Number", invoice.mobileNumber, 20, (y += 7));
      addLine("Room Number", invoice.roomNo, 20, (y += 7));
      addLine("Room Type", invoice.roomType || "N/A", 20, (y += 7));
      addLine("Check-In Date", invoice.checkInDate || "N/A", 20, (y += 7));
      addLine("Check-Out Date", invoice.checkOutDate || "N/A", 20, (y += 7));
      addLine("Payment Mode", invoice.paymentMode || "N/A", 20, (y += 14));
      addLine("Payment Status", invoice.paymentStatus || "N/A", 20, (y += 7));
  
      // Charges
      const roomCharges = Number(invoice.roomCharges || 0);
      const extraCharges = Number(invoice.extraCharges || 0);
      const cgst = Number((roomCharges + extraCharges) * 0.06);
      const sgst = Number((roomCharges + extraCharges) * 0.06);
      const total = Number(roomCharges + extraCharges + cgst + sgst);
  
      const charges = [
        ["Room Charges", roomCharges],
        ["Extra Charges", extraCharges],
        ["CGST (6%)", cgst],
        ["SGST (6%)", sgst],
      ];
  
      // Table Header
      y += 15;
      doc.setFillColor(0, 51, 102);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.rect(20, y, 170, 10, "F");
      doc.text("Description", 25, y + 7);
      doc.text("Amount (₹)", 175, y + 7, null, null, "right");
  
      // Table Rows
      y += 15;
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
  
      charges.forEach(([desc, amount]) => {
        doc.text(desc, 25, y);
        doc.text(`₹${amount.toFixed(2)}`, 175, y, null, null, "right");
        y += 10;
      });
  
      // Total Row
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(20, y, 170, 10, "F");
      doc.setTextColor(0);
      doc.text("Total Amount", 25, y + 7);
      doc.text(`₹${total.toFixed(2)}`, 175, y + 7, null, null, "right");
  
      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text("Thank you for staying with us!", 105, 280, null, null, "center");
  
      doc.save(`${invoice.billId}_invoice.pdf`);
    };
  
    image.onerror = () => {
      console.error("Error loading logo image. Please ensure the path is correct.");
    };
  };
  
  
  const printInvoice = (invoice) => {
    const printContent = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        h1 { text-align: center; color: #003566; }
        p { margin: 0; padding: 0.5rem 0; }
        .highlight { color: #28a745; font-weight: bold; }
      </style>
      <div>
        <h1>Invoice Details</h1>
        <p><strong>Bill ID:</strong> ${invoice.billId}</p>
        <p><strong>Guest Name:</strong> ${invoice.guestName}</p>
        <p><strong>Room Number:</strong> ${invoice.roomNo}</p>
        <p><strong>Room Charges:</strong> ₹${invoice.roomCharges}</p>
        <p><strong>Extra Charges:</strong> ₹${invoice.extraCharges}</p>
        <p><strong>Total:</strong> <span class="highlight">₹${invoice.total}</span></p>
      </div>
    `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };
  
  

  return (
    <>
      <style>{`
        :root {
          --primary-color: #004a99;
          --secondary-color: #007bff;
          --success-color: #28a745;
          --danger-color: #dc3545;
          --background-light: #f8f9fa;
          --shadow-color: rgba(0, 0, 0, 0.1);
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: var(--background-light);
        }
        section {
          max-width: 900px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px var(--shadow-color);
        }
        h2 {
          color: var(--primary-color);
          font-weight: 700;
          text-align: center;
          margin-bottom: 1.5rem;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          user-select: none;
          background: linear-gradient(90deg, #004a99, #00aaff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
          font-size: 0.95rem;
          box-shadow: 0 0 15px var(--shadow-color);
          border-radius: 10px;
          overflow: hidden;
        }
        thead tr {
          background: linear-gradient(90deg, #004a99, #00aaff);
          color: white;
          user-select: none;
        }
        thead th {
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        tbody tr {
          background: #fff;
          box-shadow: 0 4px 6px var(--shadow-color);
          border-radius: 10px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        tbody tr:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px var(--shadow-color);
        }
        tbody td {
          padding: 12px 15px;
          vertical-align: middle;
          border-bottom: none !important;
        }
        .text-success {
          color: var(--success-color) !important;
        }
        .text-danger {
          color: var(--danger-color) !important;
        }
        button {
          border: none;
          padding: 8px 15px;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease;
          user-select: none;
        }
        button.btn-outline-primary {
          background-color: transparent;
          color: var(--primary-color);
          border: 2px solid var(--primary-color);
        }
        button.btn-outline-primary:hover {
          background-color: var(--primary-color);
          color: white;
          box-shadow: 0 0 8px var(--primary-color);
        }
        /* Modal overlay */
        .modal {
          animation: fadeIn 0.4s ease forwards;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1050;
        }
        /* Modal dialog */
        .modal-dialog {
          animation: slideDown 0.5s ease forwards;
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 90%;
          box-shadow: 0 12px 24px var(--shadow-color);
          overflow: hidden;
          user-select: text;
        }
        .modal-header {
          background: linear-gradient(90deg, #004a99, #00aaff);
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          letter-spacing: 0.05em;
          font-size: 1.25rem;
        }
        .modal-body {
          padding: 1.5rem;
          color: #333;
          line-height: 1.5;
          font-size: 1rem;
        }
        .modal-body p {
          margin-bottom: 0.75rem;
        }
        .modal-footer {
          padding: 1rem 1.5rem;
          background: #f7f7f7;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .modal-footer button {
          padding: 0.5rem 1.2rem;
          font-weight: 700;
          border-radius: 8px;
          box-shadow: 0 2px 6px var(--shadow-color);
        }
        .btn-primary {
          background: var(--primary-color);
          color: white;
          border: none;
        }
        .btn-primary:hover {
          background: #003366;
          box-shadow: 0 0 12px #003366aa;
        }
        .btn-secondary {
          background: var(--secondary-color);
          color: white;
          border: none;
        }
        .btn-secondary:hover {
          background: #0056d2;
          box-shadow: 0 0 12px #0056d2aa;
        }
        .btn-outline-dark {
          background: transparent;
          border: 2px solid #333;
          color: #333;
        }
        .btn-outline-dark:hover {
          background: #333;
          color: white;
          box-shadow: 0 0 8px #333;
        }
        .btn-close {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .btn-close:hover {
          color: #ffdddd;
        }
        /* Text highlights */
        .text-success {
          color: var(--success-color);
          font-weight: 700;
        }
        .text-danger {
          color: var(--danger-color);
          font-weight: 700;
        }
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <section>
        <h2>Recent Invoices</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Guest Name</th>
                <th>Room No.</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem 0" }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem 0" }}>
                    No invoices found.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id} onClick={() => setSelectedInvoice(invoice)} style={{ cursor: "pointer" }}>
                    <td>{invoice.billId}</td>
                    <td>{invoice.guestName}</td>
                    <td>{invoice.roomNo}</td>
                    <td>₹{invoice.total?.toFixed(2) || invoice.total}</td>
                    <td
                      className={
                        invoice.paymentStatus === "Paid"
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {invoice.paymentStatus}
                    </td>
                    <td>
                      <button
                        className="btn-outline-primary"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          setSelectedInvoice(invoice);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {selectedInvoice && (
          <div
            className="modal"
            onClick={() => setSelectedInvoice(null)}
            tabIndex="-1"
          >
            <div
              className="modal-dialog"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Invoice Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p><strong>Bill ID:</strong> {selectedInvoice.billId}</p>
                  <p><strong>Guest Name:</strong> {selectedInvoice.guestName}</p>
                  <p><strong>Room Number:</strong> {selectedInvoice.roomNo}</p>
                  <p><strong>Room Type:</strong> {selectedInvoice.roomType || "N/A"}</p>
                  <p><strong>Check-In:</strong> {selectedInvoice.checkInDate || "N/A"}</p>
                  <p><strong>Check-Out:</strong> {selectedInvoice.checkOutDate || "N/A"}</p>
                  <p><strong>Room Charges:</strong> ₹{selectedInvoice.roomCharges || 0}</p>
                  <p><strong>Extra Charges:</strong> ₹{selectedInvoice.extraCharges || 0}</p>
                  <p>
                    <strong>Total:</strong>{" "}
                    <span className="text-success">₹{selectedInvoice.total}</span>
                  </p>
                  <p><strong>Payment Mode:</strong> {selectedInvoice.paymentMode || "N/A"}</p>
                  <p><strong>Payment Status:</strong> {selectedInvoice.paymentStatus}</p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn-primary"
                    onClick={() => downloadPDF(selectedInvoice)}
                  >
                    Download PDF
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => printInvoice(selectedInvoice)}
                  >
                    Print
                  </button>
                  <button
                    className="btn-outline-dark"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Invoice;
