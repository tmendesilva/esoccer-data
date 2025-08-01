import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import Charts from "./components/Charts";
import FilterLocation from "./components/Filters.js";
import Table from "./components/Table";

export default function App() {
  const [data, setData] = useState(null); // State to store fetched data
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  const [dateRange, onChangeDateRange] = useState([
    new Date(new Date().setHours(0, 0, 0, 0)),
    new Date(),
  ]);
  const [location, setLocation] = useState(""); // State for error handling

  async function handlePutRequest(entity) {
    setIsLoading(true);
    await axios
      .put(`${process.env.REACT_APP_NODE_URL}/update-${entity}`, {})
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
        },
      });
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, setData, setError, setIsLoading, location]);

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
        <FilterLocation
          dateRange={dateRange}
          location={location}
          setLocation={setLocation}
        />
      </div>
      <Table data={data || []} />
      <Charts data={data || []} />
    </div>
  );
}
