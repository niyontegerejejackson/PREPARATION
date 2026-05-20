const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src/pages'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace remaining axios calls with backticks
  content = content.replace(/axios\.delete\(`http:\/\/localhost:5000\/api/g, "api.delete(`");
  content = content.replace(/axios\.put\(`http:\/\/localhost:5000\/api/g, "api.put(`");
  content = content.replace(/axios\.get\(`http:\/\/localhost:5000\/api/g, "api.get(`");
  content = content.replace(/axios\.post\(`http:\/\/localhost:5000\/api/g, "api.post(`");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed backticks in:', file);
  }
});
