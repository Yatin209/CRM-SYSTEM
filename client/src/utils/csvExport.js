/**
 * Prepares data for CSV export by:
 * - Removing id, _id columns
 * - Converting createdBy and updatedBy from IDs to names
 * - Filtering out unwanted fields
 */
export function prepareCsvData(rows, users = []) {
  if (!rows || rows.length === 0) return [];

  // Fields to exclude from CSV
  const excludeFields = ['id', '_id', 'convertedCustomer', 'sourceLeadId', '__v'];

  return rows.map((row) => {
    const cleanRow = {};

    Object.keys(row).forEach((key) => {
      // Skip excluded fields
      if (excludeFields.includes(key)) return;

      let value = row[key];

      // Convert createdBy and updatedBy IDs to names
      if (key === 'createdBy' || key === 'updatedBy') {
        if (value) {
          const user = users.find((u) => u.id === value || u._id === value);
          value = user ? user.name : value;
        }
      }

      // Convert ownerId to owner name if owner field doesn't exist
      if (key === 'ownerId' && !row.owner) {
        const user = users.find((u) => u.id === value || u._id === value);
        if (user) {
          cleanRow.owner = user.name;
          return; // Skip adding ownerId
        }
      }

      // Skip ownerId if owner field exists (to avoid duplication)
      if (key === 'ownerId' && row.owner) return;

      cleanRow[key] = value;
    });

    return cleanRow;
  });
}

/**
 * Converts array of objects to CSV string
 */
export function toCSV(rows) {
  if (!rows || rows.length === 0) return "";
  
  const keys = Object.keys(rows[0]);
  const headers = keys.join(",");
  const body = rows.map((row) =>
    keys.map((key) => {
      const value = row[key] ?? "";
      // Properly escape values for CSV
      return JSON.stringify(String(value));
    }).join(",")
  );
  
  return [headers, ...body].join("\n");
}

/**
 * Downloads CSV file with proper formatting
 */
export function downloadCsv(filename, rows, users = []) {
  const preparedData = prepareCsvData(rows, users);
  const csv = toCSV(preparedData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
