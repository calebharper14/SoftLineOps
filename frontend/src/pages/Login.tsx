import React, { useState, FormEvent } from "react";
import { login } from "../api/auth";
import logo from "../assets/logo/softlineops-logo.png";

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorReportModalOpen, setErrorReportModalOpen] = useState(false);
  const [errorReportData, setErrorReportData] = useState({
    subject: "",
    description: "",
    severity: "low",
    category: "general",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(username, password);
      onLogin(data.token);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  const handleErrorReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would normally send the report to your API
      console.log("Error report submitted:", errorReportData);

      // Show success message or notification
      alert(
        "Thank you for your report. Our support team will review it shortly."
      );

      // Reset form and close modal
      setErrorReportData({
        subject: "",
        description: "",
        severity: "low",
        category: "general",
      });
      setErrorReportModalOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again later.");
    }
  };

  return (
    <div className="login-card">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <img
          src={logo}
          alt="SoftLineOps Logo"
          style={{
            width: "280px",
            marginBottom: "2.5rem",
            borderRadius: "20px",
            boxShadow:
              "0 8px 16px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.1)",
          }}
        />
        <p
          style={{
            color: "#4b5563",
            fontWeight: 500,
            fontSize: "1.1rem",
            marginBottom: "0.5rem",
          }}
        >
          Smarter Systems, Smoother Operations
        </p>
        <br />
        <h2
          style={{
            color: "#357ded",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Sign In
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="button-primary">
          Sign In
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img
              src={logo}
              alt="SoftLineOps Logo"
              className="logo-square footer-logo-icon"
              style={{ height: "26px", width: "26px", borderRadius: "6px" }}
              onError={(e) => {
                console.warn("Footer logo failed to load");
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="footer-brand">SoftLineOps</span>
          </div>
          <div className="footer-info">
            <p>
              &copy; {new Date().getFullYear()} SoftLineOps. All rights
              reserved.
            </p>
            <p className="footer-tagline">
              Smoother Systems, Smarter Operations
            </p>
          </div>
          <div className="footer-links">
            <a
              href="#"
              className="footer-link"
              onClick={(e) => {
                e.preventDefault();
                setErrorReportModalOpen(true);
              }}
            >
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* Error Reporting Modal */}
      {errorReportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container error-report-modal">
            <div className="modal-header">
              <div className="error-report-header">
                <div className="error-report-logo">
                  <img
                    src={logo}
                    alt="SoftLineOps Logo"
                    className="error-report-logo-icon"
                    style={{
                      height: "30px",
                      width: "30px",
                      borderRadius: "6px",
                    }}
                  />
                  <h3 className="error-report-brand">SoftLineOps</h3>
                </div>
                <p className="error-report-motto">
                  Smoother Systems, Smarter Operations
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setErrorReportModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <h2
                style={{
                  margin: "0 0 1.5rem 0",
                  color: "#357ded",
                }}
              >
                Report an Issue
              </h2>
              <form
                onSubmit={handleErrorReport}
                className="error-report-form"
              >
                <div className="form-group">
                  <label htmlFor="report-subject">Subject*</label>
                  <input
                    id="report-subject"
                    type="text"
                    value={errorReportData.subject}
                    onChange={(e) =>
                      setErrorReportData({
                        ...errorReportData,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Brief summary of the issue"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="report-category">Category*</label>
                  <select
                    id="report-category"
                    value={errorReportData.category}
                    onChange={(e) =>
                      setErrorReportData({
                        ...errorReportData,
                        category: e.target.value,
                      })
                    }
                    className="form-select"
                    required
                  >
                    <option value="general">General</option>
                    <option value="ui">User Interface</option>
                    <option value="performance">Performance</option>
                    <option value="functionality">Functionality</option>
                    <option value="data">Data Issues</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="report-severity">Severity*</label>
                  <select
                    id="report-severity"
                    value={errorReportData.severity}
                    onChange={(e) =>
                      setErrorReportData({
                        ...errorReportData,
                        severity: e.target.value,
                      })
                    }
                    className="form-select"
                    required
                  >
                    <option value="low">Low - Minor inconvenience</option>
                    <option value="medium">
                      Medium - Partial functionality affected
                    </option>
                    <option value="high">High - Major feature unusable</option>
                    <option value="critical">Critical - System unusable</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="report-description">Description*</label>
                  <textarea
                    id="report-description"
                    value={errorReportData.description}
                    onChange={(e) =>
                      setErrorReportData({
                        ...errorReportData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Please provide details about the issue, steps to reproduce, and any error messages"
                    required
                    className="form-textarea"
                    rows={5}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setErrorReportModalOpen(false)}
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;