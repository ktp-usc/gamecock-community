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
    <main className="min-h-screen bg-[#f4f4f4] flex justify-center items-start pt-20">
      <div className="bg-white w-[550px] p-12 rounded-2xl shadow-lg text-center">
        <h1 className="text-[#7a1c1c] text-2xl font-semibold mb-2">
          Gamecock Community Shop
        </h1>

        <h2 className="text-lg mb-2">Volunteer Clock-In</h2>

        <div className="text-4xl mb-2 min-h-[48px]">
          {mounted ? time : " "}
        </div>

        <hr className="my-5" />

        <label className="block mb-2 text-lg">Select Your Name</label>

        <select
          className="w-full p-3 mb-6 border rounded-lg cursor-pointer"
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
        >
          <option value="">Select your name</option>
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
        </select>

        <div className="flex justify-between gap-4">
          <button
            onClick={() => handleClock("Clock In")}
            disabled={!canClick}
            className={`w-1/2 py-3 rounded-lg text-white transition ${
              canClick
                ? "bg-[#7a1c1c] hover:bg-[#651616] cursor-pointer"
                : "bg-[#7a1c1c]/50 cursor-not-allowed"
            }`}
          >
            Clock In
          </button>

          <button
            onClick={() => handleClock("Clock Out")}
            disabled={!canClick}
            className={`w-1/2 py-3 rounded-lg text-white transition ${
              canClick
                ? "bg-[#7a1c1c] hover:bg-[#651616] cursor-pointer"
                : "bg-[#7a1c1c]/50 cursor-not-allowed"
            }`}
          >
            Clock Out
          </button>
        </div>
      </div>
    </main>
  );
}
