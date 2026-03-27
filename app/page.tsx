export default function Home() {
  const time = new Date().toLocaleTimeString();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Gamecock Community Shop</h1>
        <h2 style={styles.subtitle}>Volunteer Clock-In</h2>

        <div style={styles.time}>{time}</div>

        <hr style={{ margin: "20px 0" }} />

        <label style={styles.label}>Select Your Name</label>

        <select style={styles.select}>
          <option>Select your name</option>
          <option>John Doe</option>
          <option>Jane Smith</option>
        </select>

        <div style={styles.buttonContainer}>
          <button style={styles.button}>Clock In</button>
          <button style={styles.button}>Clock Out</button>
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
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "400px",
    textAlign: "center" as const,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#7a1c1c",
    marginBottom: "10px",
  },
  subtitle: {
    marginBottom: "10px",
  },
  time: {
    fontSize: "28px",
    marginBottom: "10px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#7a1c1c",
    color: "white",
    border: "none",
    padding: "12px",
    width: "48%",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
