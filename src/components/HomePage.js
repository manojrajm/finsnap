import React, { useEffect, useState } from "react";
import "./Homepages.css";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import logo from "../img/Fs.png";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { toast } from "react-toastify";

const Homepage = () => {
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch invoices
  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      setError(null);

      try {
        const invoicesRef = collection(db, "billing");
        const q = query(invoicesRef, orderBy("checkInDate", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setRecentInvoices([]);
          setTotalPayments(0);
          setInvoiceCount(0);
          setPendingAmount(0);
        } else {
          const invoices = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setRecentInvoices(invoices);
          const total = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total || "0"), 0);
          const pending = invoices.reduce(
            (sum, invoice) => (invoice.paymentStatus !== "Paid" ? sum + parseFloat(invoice.total || "0") : sum),
            0
          );
          setTotalPayments(total);
          setPendingAmount(pending);
          setInvoiceCount(invoices.length);
        }
      } catch (error) {
        setError("Failed to load invoices. Please try again.");
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Toggle navigation menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <header className="bg-primary text-white py-3 shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          {/* Live Time */}
          <div>
            <h6 className="m-0">
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </h6>
          </div>
          <div>
            <img src={logo} alt="Logo" style={{ height: "70px", width: "80px" }} />
          </div>
          <button className="menu-btn" onClick={toggleMenu}>
            ☰
          </button>
        </div>
      </header>

      {/* Navigation Menu */}
      {isMenuOpen && (
        <nav className="nav open">
          <button className="close-btn" onClick={toggleMenu}>
            ✖
          </button>
          <button className="btn btn-link text-white fw-semibold" onClick={() => navigate("/")}>
            <i className="fas fa-home me-1"></i> Home
          </button>
          <button className="btn btn-link text-white fw-semibold" onClick={() => navigate("/billing-form")}>
            <i className="fas fa-file-invoice-dollar me-1"></i> Billing Form
          </button>
          <button className="btn btn-link text-white fw-semibold" onClick={() => navigate("/invoice")}>
            <i className="fas fa-receipt me-1"></i> Invoice
          </button>
          <button className="btn btn-link text-white fw-semibold" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-1"></i> Logout
          </button>
        </nav>
      )}

      <main className="container flex-grow-1 py-4">
        {error && <div className="alert alert-danger">{error}</div>}
        <section className="mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Total Payments</h5>
                  <p className="card-text fs-4 text-primary">₹{totalPayments.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Invoices Generated</h5>
                  <p className="card-text fs-4 text-success">{invoiceCount}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Pending Amount</h5>
                  <p className="card-text fs-4 text-warning">₹{pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="h5 mb-3">Recent Invoices</h2>
          <div className="table-responsive shadow-sm bg-white rounded">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>Invoice ID</th>
                  <th>Guest Name</th>
                  <th>Room No.</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">Loading invoices...</td>
                  </tr>
                ) : recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">No invoices found.</td>
                  </tr>
                ) : (
                  recentInvoices.map(({ id, billId, guestName, roomNo, total, paymentStatus }) => (
                    <tr key={id}>
                      <td>{billId}</td>
                      <td>{guestName}</td>
                      <td>{roomNo}</td>
                      <td>₹{total}</td>
                      <td className={paymentStatus === "Paid" ? "text-success fw-bold" : "text-danger fw-bold"}>
                        {paymentStatus}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>© 2025 Billing Software. All rights reserved. | Terms | Privacy</small>
      </footer>
    </div>
  );
};

export default Homepage;
