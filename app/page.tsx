"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    setMounted(true);
    setTime(new Date().toLocaleTimeString());

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function handleClock(action: "Clock In" | "Clock Out") {
    if (!selectedName) return;
    alert(`${action} clicked for ${selectedName}`);
  }

  const canClick = Boolean(selectedName);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Gamecock Community Shop</h1>
        <h2 style={styles.subtitle}>Volunteer Clock-In</h2>

        <div style={styles.time}>{mounted ? time : " "}</div>

        <hr style={{ margin: "20px 0" }} />

        <label style={styles.label}>Select Your Name</label>

        <select
          style={styles.select}
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
        >
          <option value="">Select your name</option>
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
        </select>

        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={() => handleClock("Clock In")}
            disabled={!canClick}
            style={{
              ...styles.button,
              opacity: canClick ? 1 : 0.5,
              cursor: canClick ? "pointer" : "not-allowed",
            }}
          >
            Clock In
          </button>

          <button
            type="button"
            onClick={() => handleClock("Clock Out")}
            disabled={!canClick}
            style={{
              ...styles.button,
              opacity: canClick ? 1 : 0.5,
              cursor: canClick ? "pointer" : "not-allowed",
            }}
          >
            Clock Out
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    backgroundColor: "#f4f4f4",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "80px",
  },
  card: {
    backgroundColor: "white",
    padding: "50px",
    borderRadius: "16px",
    width: "550px",
    textAlign: "center" as const,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },
  title: {
    color: "#7a1c1c",
    marginBottom: "10px",
    fontSize: "28px",
  },
  subtitle: {
    marginBottom: "10px",
    fontSize: "20px",
  },
  time: {
    fontSize: "40px",
    marginBottom: "10px",
    minHeight: "48px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontSize: "18px",
  },
  select: {
    width: "100%",
    padding: "14px",
    marginBottom: "25px",
    fontSize: "16px",
    cursor: "pointer",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#7a1c1c",
    color: "white",
    border: "none",
    padding: "14px",
    width: "48%",
    borderRadius: "10px",
    fontSize: "16px",
  },
};
