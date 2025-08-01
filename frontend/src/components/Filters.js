import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Select from "react-select";

export default function Filters({ dateRange, location, setLocation }) {
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
          label: loc.token,
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
    console.log(`Option selected:`, option);
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
