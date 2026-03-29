import Image from "next/image";

export default function Header() {
    return (
        <header style = {styles.header}>
            <div style={styles.left}>
                <Image
                    src="/CommunityShop.png"
                    alt = "Gamecock CommUnity Shop Logo"
                    width = {150}
                    height = {150}
                />
            </div>

            <div style={styles.center}>
                <h1 style={styles.title}>Gamecock CommUnity Shop</h1>
                <p style={styles.location}>
                    4000 Suite, Caroline Coliseum
                </p>
            </div>
        </header>
    );
}

const styles: {[key: string]: React.CSSProperties} = {
    header: {
        backgroundColor: "white",
        color: "#9a251d ",
        display: "flex",
        alignItems: "center",
        padding: "10 px 20px",
        justifyContent: "Space-between",
    },
    left: {
        display: "flex",
        alignItems: "center",
    },
    center: {
        textAlign: "center" as const,
        flex: 1,
    },
    title: {
        margin: 0,
        fontSize: "1.5rem",
        fontWeight: "bold",
    },
    location: {
        margin: 0,
        fontSize: "0.9rem",
    },
}