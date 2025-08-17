import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import ChartGoals from "./components/ChartGoals";
import ChartPercentage from "./components/ChartPercentage";
import {
  LocationFilter,
  PlayerFilter,
  StatusFilter,
  statusOptions,
} from "./components/Filters";
import Table from "./components/Table";

function startStateFromLocalStorage(stateName, defaultValue = "") {
  const localData = localStorage.getItem(stateName);
  return localData ? JSON.parse(localData) : defaultValue;
}

export default function App() {
  const [data, setData] = useState(null); // State to store fetched data
  const [chartData, setChartData] = useState(null); // State to store fetched data
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  // Filters
  const [dateRange, onChangeDateRange] = useState(
    startStateFromLocalStorage("dateRange", [
      new Date(new Date().setHours(0, 0)),
      new Date(new Date().setHours(23, 59)),
    ])
  );
  const [location, setLocation] = useState(
    startStateFromLocalStorage("location")
  );
  const [player1, setPlayer1] = useState(startStateFromLocalStorage("player1"));
  const [player2, setPlayer2] = useState(startStateFromLocalStorage("player2"));
  const [status, setStatus] = useState(
    startStateFromLocalStorage(
      "status",
      statusOptions().filter((o) => o.value !== 1)
    )
  );

  async function handlePutRequest(entity) {
    setIsLoading(true);
    await axios
      .put(`${process.env.REACT_APP_NODE_URL}/update-${entity}`, {
        dateFrom: dateRange[0],
        dateTo: dateRange[1],
        location: location?.value,
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
      setChartData(res.data.filter((m) => m.status_id >= 2));
      localStorage.setItem("dateRange", JSON.stringify(dateRange));
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    dateRange,
    setData,
    setChartData,
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
          attribute="player1"
        />
        <PlayerFilter
          dateRange={dateRange}
          player={player2}
          setPlayer={setPlayer2}
          location={location}
          attribute="player2"
        />
        <StatusFilter status={status} setStatus={setStatus} />
      </div>
      <Table data={data || []} />
      <ChartPercentage
        data={chartData || []}
        player1={player1}
        player2={player2}
      />
      <ChartGoals data={chartData || []} />
    </div>
  );
}
