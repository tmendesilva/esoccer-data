import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import Charts from "./components/Charts";
import Table from "./components/Table";

export default function App() {
  const [data, setData] = useState(null); // State to store fetched data
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const [dateRange, onChangeDateRange] = useState([
    new Date(new Date().setHours(0, 0, 0, 0)),
    new Date(),
  ]);

  async function handlePutRequest(entity) {
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
        },
      });
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, setData, setError, setIsLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log(dateRange);

  return (
    <div className="App">
      <h1>Esoccer Data:</h1>
      <button onClick={() => handlePutRequest("tournaments")}>
        Update Tournaments
      </button>{" "}
      <button onClick={() => handlePutRequest("matches")}>
        Update Matches
      </button>
      <div className="filters">
        <DateRangePicker onChange={onChangeDateRange} value={dateRange} />
      </div>
      <Table data={data} />
      <Charts data={data} />
    </div>
  );
}
