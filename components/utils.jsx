export function parseTableFromText(text) {
  if (!text) return null;
  const lines = text.split("\n").filter((l) => l.trim());
  const tableLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("|")) {
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c);
      if (cells.length >= 2 && !line.match(/^[\s|]*[-=]+[\s|]*$/)) {
        tableLines.push(line);
      }
    }
  }
  if (tableLines.length < 2) return null;
  const rows = tableLines
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell && !cell.match(/^[\-\=]+$/))
    )
    .filter((r) => r.length > 1);
  return rows.length >= 2 ? rows : null;
}

export function formatCurrency(num) {
  try {
    return "₹" + Number(num).toLocaleString("en-IN");
  } catch {
    return `₹${num}`;
  }
}


export function sanitizeText(text = "") {
  if (typeof text !== "string") return text;
  return text.replace(/\*/g, "").trim();
}