const LOCAL_STORAGE_KEY_TEST = 'localStorageTestKey';

function isLocalStorageSupported() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_TEST, '');
    localStorage.removeItem(LOCAL_STORAGE_KEY_TEST);

    return true;
  } catch (error) {
    return false;
  }
}

function getLocalStorage(key) {
  if (!isLocalStorageSupported()) {
    return {
      setItem() {},
      getItem() {
        return [];
      },
    };
  }

  return {
    setItem(items) {
      return window.localStorage.setItem(key, JSON.stringify(items));
    },
    getItem() {
      const items = window.localStorage.getItem(key);

      return items ? JSON.parse(items) : [];
    },
  };
}


export function createLocalStorageAlkosto(props) {
  const { key, limit } = props;
  const storage = getLocalStorage(key);

  return {
    onAdd: function(item) {
      const items = storage.getItem();
      storage.setItem([item, ...items]);
    },
    onRemove: function(id) {
      const items = storage.getItem().filter(function(x) {
        return x.id !== id;
      });
      storage.setItem(items);
    },
    getAll: function(query) {
      query = query || '';
      const items = storage.getItem();
      return items.slice(0, limit);
    }
  };
}

export function methodsForPlugin(props){
  const {onRemove, getAll} = createLocalStorageAlkosto(props)
  return {
    onRemove,
    getAll,
    onAdd: (item) => {}
  }
}