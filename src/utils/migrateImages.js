export const uploadBase64Image = async (base64) => {
  try {
    const res = await fetch('/api/upload-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });
    const data = await res.json();
    if (data.success && data.url) {
      return data.url;
    }
    return null;
  } catch (err) {
    console.error('Error uploading image', err);
    return null;
  }
};

const processObject = async (obj) => {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/')) {
      const url = await uploadBase64Image(obj);
      return url || obj;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    const newArr = [];
    for (let i = 0; i < obj.length; i++) {
      newArr.push(await processObject(obj[i]));
    }
    return newArr;
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = await processObject(obj[key]);
    }
    return newObj;
  }
  return obj;
};

export const migrateLocalStorageImages = async () => {
  if (typeof window === 'undefined') return 0;

  let migratedCount = 0;
  
  // Create a copy of keys because localStorage might be modified during iteration
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }

  for (const key of keys) {
    const value = localStorage.getItem(key);
    
    if (!value || typeof value !== 'string') continue;
    
    // Quick check to avoid processing if no base64 image pattern is present
    if (!value.includes('data:image/')) continue;

    try {
      // Try to parse as JSON
      let parsed;
      let isJson = false;
      try {
        parsed = JSON.parse(value);
        isJson = true;
      } catch(e) {
        // Not JSON
        parsed = value;
      }

      const processed = await processObject(parsed);
      
      const newValue = isJson ? JSON.stringify(processed) : processed;
      
      // If content changed, save it back
      if (newValue !== value) {
        localStorage.setItem(key, newValue);
        migratedCount++;
        console.log(`Migrated images in localStorage key: ${key}`);
      }
    } catch (err) {
      console.error(`Error migrating key ${key}:`, err);
    }
  }
  
  return migratedCount;
};
