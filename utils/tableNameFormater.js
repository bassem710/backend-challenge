const formatedTableName = (tableName) => {
  // Convert table name to human readable format by removing underscores and capitalizing the first letter
  return tableName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

module.exports = formatedTableName;
