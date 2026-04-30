const generateId = (prefix = "") => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);

  return `${prefix}${timestamp}${random}`;
};

module.exports = generateId;
