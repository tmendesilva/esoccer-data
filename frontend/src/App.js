import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import Charts from "./components/Charts";
import {
  LocationFilter,
  PlayerFilter,
  StatusFilter,
  statusOptions,
} from "./components/Filters";
import Table from "./components/Table";

export default function App() {
  const [data, setData] = useState(null); // State to store fetched data
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  // Filters
  const [dateRange, onChangeDateRange] = useState([
    new Date(new Date().setHours(0, 0)),
    new Date(new Date().setHours(23, 59)),
  ]);
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState(
    statusOptions().filter((o) => o.value !== "1")
  );
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  async function handlePutRequest(entity) {
    setIsLoading(true);
    await axios
      .put(`${process.env.REACT_APP_NODE_URL}/update-${entity}`, {
        dateFrom: dateRange[0],
        dateTo: dateRange[1],
      })
      .then(() => {
        fetchData();
      })
      .catch((error) => {
        console.error("Error during PUT request:", error);
      });
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_NODE_URL}/matches`, {
        params: {
          dateFrom: dateRange[0],
          dateTo: dateRange[1],
          location: location?.value,
          player1: player1?.value,
          player2: player2?.value,
          status: status.map((s) => s.value),
        },
      });
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    dateRange,
    setData,
    setError,
    setIsLoading,
    location,
    player1,
    player2,
    status,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="App">
      <h2>Esoccer Data:</h2>
      <button onClick={() => handlePutRequest("tournaments")}>
        Update Tournaments
      </button>{" "}
      <button onClick={() => handlePutRequest("matches")}>
        Update Matches
      </button>
      <div className="filters">
        <DateRangePicker
          onChange={onChangeDateRange}
          value={dateRange}
          clearIcon={null}
          required
          className="DateRangePicker"
        />
        <LocationFilter
          dateRange={dateRange}
          location={location}
          setLocation={setLocation}
        />
        <PlayerFilter
          dateRange={dateRange}
          player={player1}
          setPlayer={setPlayer1}
          location={location}
        />
        <PlayerFilter
          dateRange={dateRange}
          player={player2}
          setPlayer={setPlayer2}
          location={location}
        />
        <StatusFilter status={status} setStatus={setStatus} />
      </div>
      <Table data={data || []} />
      <Charts data={data || []} />
    </div>
  );
}
