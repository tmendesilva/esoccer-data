import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";

export default function Table({ data }) {
  const columnArr = [
    "id",
    "date",
    "location_name",
    "status_id",
    "participant1_nickname",
    "participant1_score",
    "participant2_nickname",
    "participant2_score",
    "scoreTotal",
  ];

  const columns = columnArr.map((column) => ({
    name: column,
    data: column,
  }));

  DataTable.use(DT); // Initialize DataTables core

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
