import { useState } from "react";
import { Link } from "react-router-dom";

import RecordCard from "../components/RecordCard";
import { useAppData } from "../AppDataContext.tsx";

const Dashboard = () => {
  const { records, recordsLoading, recordsError } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const searchQuery = searchTerm.trim().toLowerCase();
  const visibleRecords = records.filter(
    (record) =>
      !record.isHidden && record.title.toLowerCase().includes(searchQuery),
  );

  return (
    <main className="flex flex-col overflow-auto relative">
      {/* <h1 className="text-3xl font-bold underline">Walt</h1> */}

      <div className="m-2">
        <input
          type="search"
          aria-label="Search records by title"
          placeholder="Search records"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="border-2 border-gray-500 px-2 w-full"
        />
      </div>

      <div className="bg-gray-200 m-3 rounded-lg shrink overflow-auto shadow-sm border-collapse">
        {recordsLoading ? (
          <p className="p-3">Loading records...</p>
        ) : recordsError ? (
          <p role="alert" className="p-3 text-red-700">{recordsError}</p>
        ) : visibleRecords.length === 0 ? (
          <p className="p-3">
            {searchQuery ? "No matching records." : "No records yet."}
          </p>
        ) : (
          visibleRecords.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))
        )}
      </div>

      {/* <div>
        <Link className='p-5 cursor-pointer block bg-red-500' to='/records/add'>+ Add Record</Link>
      </div> */}

      <Link
        className="absolute p-4 cursor-pointer block bg-blue-500 text-white font-bold text-xl shadow-2xl bottom-2 right-2 rounded-4xl"
        to="/records/add"
      >
        +
      </Link>
    </main>
  );
};

export default Dashboard;
