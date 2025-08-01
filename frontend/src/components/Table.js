import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";

export default function Table({ data }) {
  const columnArr = [
    "id",
    "date",
    "location",
    "status_id",
    "player1",
    "player1_score",
    "player2",
    "player2_score",
    "scoreTotal",
  ];

  const columns = columnArr.map((column) => ({
    name: column,
    data: column,
    className: column,
  }));

  DataTable.use(DT); // Initialize DataTables core

  const customRowCallback = (row, data, index) => {
    const p1Elements = row.querySelectorAll(".player1,.player1_score");
    const p2Elements = row.querySelectorAll(".player2,.player2_score");
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

  return (
    <div className="Table">
      {data ? (
        <DataTable
          columns={columns}
          data={data}
          className="display"
          options={{
            responsive: true,
            select: true,
            order: [{ name: "date", dir: "desc" }],
            rowCallback: customRowCallback,
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
