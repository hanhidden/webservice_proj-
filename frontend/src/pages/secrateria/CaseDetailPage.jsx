import React from "react";
import { useParams } from "react-router-dom";

function CaseDetailPage() {
  const { caseId } = useParams();

  return (
    <div className="p-10">
      <h1>Details for Case {caseId}</h1>
      {/* Fetch & display case details */}
      {/* Update and Delete buttons here */}
    </div>
  );
}

export default CaseDetailPage;
