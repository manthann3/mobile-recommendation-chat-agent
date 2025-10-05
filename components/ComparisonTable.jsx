import React from "react";

export default function ComparisonTable({ rows = [] }) {
  if (!rows || rows.length < 2) return null;
  const headers = rows[0];
  const body = rows.slice(1);

  return (
    <div style={{ margin: "1rem 0" }}>
      <div
        className="desktop-table"
        style={{
          width: "100%",
          overflowX: "auto",
          borderRadius: "0.75rem",
          border: "1px solid #e2e8f0",
          background: "white",
          marginBottom: "1rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "500px",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#1e293b",
                    borderBottom: "2px solid #e2e8f0",
                    fontSize: "0.875rem",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{ background: rIdx % 2 === 0 ? "#ffffff" : "#f8fafc" }}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #f1f5f9",
                      color: cIdx === 0 ? "#1e293b" : "#475569",
                      fontWeight: cIdx === 0 ? 600 : 400,
                      lineHeight: "1.5",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-cards">
        {body.map((row, idx) => (
          <div
            key={idx}
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              background: "white",
              border: "1px solid #e2e8f0",
              marginBottom: "0.75rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: "0.75rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              {row[0] || "Feature"}
            </div>
            {headers.slice(1).map((header, hIdx) => (
              <div
                key={hIdx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "0.5rem 0",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    color: "#475569",
                    flexShrink: 0,
                    minWidth: "40%",
                  }}
                >
                  {header}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    color: "#1e293b",
                    wordBreak: "break-word",
                    flex: 1,
                  }}
                >
                  {row[hIdx + 1]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-table {
            display: none !important;
          }
          .mobile-cards {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .desktop-table {
            display: block !important;
          }
          .mobile-cards {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
