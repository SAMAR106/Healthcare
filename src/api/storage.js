const getCollection = (name) => {
  const data = localStorage.getItem(name);
  return data ? JSON.parse(data) : [];
};

const saveCollection = (name, data) => {
  localStorage.setItem(name, JSON.stringify(data));
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const db = {
  create: (collection, item) => {
    const items = getCollection(collection);
    const newItem = { ...item, id: generateId(), created_date: new Date().toISOString() };
    items.unshift(newItem);
    saveCollection(collection, items);
    return newItem;
  },
  list: (collection, limit = 100) => {
    const items = getCollection(collection);
    return items.slice(0, limit);
  },
  clear: (collection) => {
    localStorage.removeItem(collection);
  },
};