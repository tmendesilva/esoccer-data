import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import { useRef } from "react";
import { statusOptions } from "./Filters";

export default function Table({ data }) {
  const table = useRef(null);
  const columnArr = [
    "id",
    "date",
    "location",
    "status",
    "player1",
    "player1_score",
    "player2",
    "player2_score",
    "halfScore",
    "totalScore",
  ];

  const columns = columnArr.map((column) => ({
    name: column,
    data: column,
    className: column,
    footer: "sum",
  }));

  DataTable.use(DT); // Initialize DataTables core

  const customRowCallback = (row, data, index) => {
    const statusEl = row.querySelector(".status");
    statusEl.style.color = statusOptions().find(
      (o) => o.value === data.status_id
    ).color;
    const p1Elements = row.querySelectorAll(
      ".player1,.player1_half_score,.player1_score"
    );
    const p2Elements = row.querySelectorAll(
      ".player2,.player2_half_score,.player2_score"
    );
    if (data.player1_score > data.player2_score) {
      p1Elements.forEach((e) => {
        e.classList.add("win");
      });
      p2Elements.forEach((e) => {
        e.classList.add("lose");
      });
    } else if (data.player1_score < data.player2_score) {
      p1Elements.forEach((e) => {
        e.classList.add("lose");
      });
      p2Elements.forEach((e) => {
        e.classList.add("win");
      });
    } else {
      p1Elements.forEach((e) => {
        e.classList.add("draw");
      });
      p2Elements.forEach((e) => {
        e.classList.add("draw");
      });
    }
  };

  const footerCallback = () => {
    const api = table.current?.dt();

    if (api) {
      // Iterate through each column to calculate and display averages
      api.columns().every(function () {
        const columnIndex = this.index();
        const columnName = this.name();
        const columnData = this.data().toArray();

        // Check if the column contains numerical data for averaging
        // (You might need more robust checks for non-numeric data)
        if (
          columnData.length > 0 &&
          [
            "player1_score",
            "player2_score",
            "halfScore",
            "totalScore",
          ].includes(columnName)
        ) {
          const columnDataFiltered = columnData.filter(
            (data) => !isNaN(parseInt(data))
          );
          const sum = columnDataFiltered.reduce(function (a, b) {
            return parseFloat(a) + parseFloat(b);
          }, 0);

          const average = sum / columnDataFiltered.length;

          // Update the footer cell for the current column
          api.column(columnIndex).footer().innerHTML = average.toFixed(2);
        } else {
          // For non-numerical columns, you might display an empty string or a different message
          api.column(columnIndex).footer().innerHTML = "";
        }
        return true;
      });
    }
  };

  return (
    <div className="Table">
      {data ? (
        <DataTable
          ref={table}
          columns={columns}
          data={data}
          className="display"
          options={{
            responsive: true,
            select: true,
            order: [{ name: "date", dir: "desc" }],
            rowCallback: customRowCallback,
            footerCallback: footerCallback,
          }}
        >
          <thead>
            <tr key="header">
              {columns.map((column) => (
                <th key={column.data}>{column.data}</th>
              ))}
            </tr>
          </thead>
        </DataTable>
      ) : (
        <div>No data available.</div>
      )}
    </div>
  );
}
