import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Select from "react-select";

function LocationFilter({ dateRange, location, setLocation }) {
  const [locations, setLocations] = useState(null);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_NODE_URL}/matches/filters`,
        {
          params: {
            dateFrom: dateRange[0],
            dateTo: dateRange[1],
          },
        }
      );
      setLocations(
        res.data?.locations.map((loc) => ({
          value: loc.id,
          label: loc.name,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleChange = (option) => {
    setLocation(option);
  };

  return (
    <div>
      <Select
        options={locations}
        value={location}
        onChange={handleChange}
        placeholder="Select location"
        isClearable // Allows clearing the selection
      />
    </div>
  );
}

function PlayerFilter({ dateRange, player, setPlayer, location }) {
  const [players, setPlayers] = useState(null);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_NODE_URL}/matches/filters/players`,
        {
          params: {
            dateFrom: dateRange[0],
            dateTo: dateRange[1],
            location: location?.value,
          },
        }
      );
      setPlayers(
        res.data?.players.map((p) => ({
          value: p,
          label: p,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }, [dateRange, location]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleChange = (option) => {
    setPlayer(option);
  };

  return (
    <div>
      <Select
        options={players}
        value={player}
        onChange={handleChange}
        placeholder="Select player"
        isClearable // Allows clearing the selection
      />
    </div>
  );
}

export { LocationFilter, PlayerFilter };
