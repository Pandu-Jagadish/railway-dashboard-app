import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const Dashboard = () => {
  const quadrantRef = useRef([]);
  const [trains, setTrains] = useState([]);
  const currentStation = "sc";

  const dashboardStyle = {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
    padding: "20px",
    height: "100vh",
    width: "100vw",
    boxSizing: "border-box",
  };

  const quadrantStyle = {
    flex: "1 0 45%",
    border: "1px solid #ccc",
    padding: "20px",
    textAlign: "center",
    overflowY: "auto",
    maxHeight: "calc(50vh - 80px)",
  };

  const tableWrapperStyle = {
    position: "relative",
    overflowY: "auto",
    maxHeight: "calc(50vh - 160px)",
  };
  const headerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #ccc",
  };

  const dateStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "10px",
  };
  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thStyle = {
    backgroundColor: "#f2f2f2",
    padding: "8px",
    position: "sticky",
    top: "0",
    zIndex: "1",
  };

  const tdStyle = {
    border: "1px solid #ddd",
    padding: "8px",
  };

  useEffect(() => {
    const scrollIntervalId = setInterval(() => {
      quadrantRef.current.forEach((ref, index) => {
        if (ref.scrollHeight > ref.clientHeight) {
          console.log("Scrolling...");
          ref.scrollTop += 10;
        }
      });
    }, 2000);

    const fetchTrainData = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/trains");
        setTrains(response.data);
      } catch (error) {
        console.error("Failed to fetch train data:", error);
      }
    };

    const intervalId = setInterval(() => {
      fetchTrainData();
    }, 5001); // Fetch data every 5 seconds

    fetchTrainData(); // Initial fetch

    return () => {
      clearInterval(intervalId);
      clearInterval(scrollIntervalId);
    };
  }, []);

  const getTrainDataByType = (type) => {
    const currentTime = new Date();
    const next24Hours = new Date(currentTime);
    next24Hours.setHours(next24Hours.getHours() + 24);

    return trains.filter((train) => {
      const expectedArrivalTime = new Date(train.expectedArrivalTime);
      return (
        train.type === type &&
        expectedArrivalTime >= currentTime &&
        expectedArrivalTime <= next24Hours
      );
    });
  };

  const renderTrainRows = (trains) => {
    return trains.map((train) => (
      <tr key={train.name}>
        <td style={tdStyle}>{train.name}</td>
        <td style={tdStyle}>{train.type}</td>
        <td style={tdStyle}>{train.averageSpeed}</td>
        <td style={tdStyle}>{train.departureStation}</td>
        <td style={tdStyle}>{currentStation}</td>
        <td style={tdStyle}>
          {new Date(train.expectedArrivalTime).toLocaleTimeString()}
        </td>
      </tr>
    ));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Trains List", 10, 10);
    const types = ["Goods", "Super Fast", "Passenger", "Express"];
    let yPos = 20; // Initial y position for the text
    types.forEach((type, index) => {
      const trainsByType = getTrainDataByType(type);
      const trainRows = renderTrainRows(trainsByType);
      if (index !== 0) {
        doc.addPage();
        yPos = 20; // Reset yPos for each new page
      }
      doc.text(`${type} Trains`, 10, yPos);
      yPos += 10; // Move down 10 units for the table
      doc.autoTable({
        startY: yPos,
        head: [
          [
            "Name",
            "Type",
            "Avg Speed",
            "Dept Station",
            "Current Station",
            "ETA",
          ],
        ],
        body: trainRows.map((row) =>
          row.props.children.map((td) => td.props.children)
        ),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    });
    doc.save("trains_list.pdf");
  };

  return (
    <div>
      <div style={headerStyle}>
        <p style={dateStyle}>{`Current Station : ${currentStation}`}</p>
        <div style={dateStyle}>{new Date().toLocaleString()}</div>
        <button style={buttonStyle} onClick={handleDownloadPDF}>
          Download as PDF
        </button>
      </div>
      <div style={dashboardStyle}>
        <div ref={(el) => (quadrantRef.current[0] = el)} style={quadrantStyle}>
          <h2 style={{ marginBottom: "20px" }}>Goods</h2>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Avg Speed</th>
                  <th style={thStyle}>Dept Station</th>
                  <th style={thStyle}>Current Station</th>
                  <th style={thStyle}>ETA</th>
                </tr>
              </thead>
              <tbody>{renderTrainRows(getTrainDataByType("Goods"))}</tbody>
            </table>
          </div>
        </div>
        <div ref={(el) => (quadrantRef.current[1] = el)} style={quadrantStyle}>
          <h2 style={{ marginBottom: "20px" }}>Superfast</h2>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Avg Speed</th>
                  <th style={thStyle}>Dept Station</th>
                  <th style={thStyle}>Current Station</th>
                  <th style={thStyle}>ETA</th>
                </tr>
              </thead>
              <tbody>{renderTrainRows(getTrainDataByType("Super Fast"))}</tbody>
            </table>
          </div>
        </div>
        <div ref={(el) => (quadrantRef.current[2] = el)} style={quadrantStyle}>
          <h2 style={{ marginBottom: "20px" }}>Passenger</h2>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Avg Speed</th>
                  <th style={thStyle}>Dept Station</th>
                  <th style={thStyle}>Current Station</th>
                  <th style={thStyle}>ETA</th>
                </tr>
              </thead>
              <tbody>{renderTrainRows(getTrainDataByType("Passenger"))}</tbody>
            </table>
          </div>
        </div>
        <div ref={(el) => (quadrantRef.current[3] = el)} style={quadrantStyle}>
          <h2 style={{ marginBottom: "20px" }}>Express</h2>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Avg Speed</th>
                  <th style={thStyle}>Dept Station</th>
                  <th style={thStyle}>Current Station</th>
                  <th style={thStyle}>ETA</th>
                </tr>
              </thead>
              <tbody>{renderTrainRows(getTrainDataByType("Express"))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
