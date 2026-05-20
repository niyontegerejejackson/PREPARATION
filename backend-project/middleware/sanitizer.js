const escapeHtml = (str, keepSlashes = false) => {
  if (typeof str !== 'string') return str;
  let escaped = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  if (!keepSlashes) {
    escaped = escaped.replace(/\//g, '&#x2F;');
  }
  return escaped;
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        const keepSlashes = key.toLowerCase().includes('image') || 
                            key.toLowerCase().includes('url') || 
                            key.toLowerCase().includes('path') || 
                            key.toLowerCase().includes('file');
        obj[key] = escapeHtml(obj[key].trim(), keepSlashes);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = sanitizeInput;
