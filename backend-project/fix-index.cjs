const mongoose = require('mongoose');

async function fixIndexes() {
  await mongoose.connect('mongodb://127.0.0.1:27017/HotelProDB');
  const db = mongoose.connection.db;

  try {
    const indexes = await db.collection('rooms').indexes();
    console.log('Current indexes on rooms:', indexes);
    
    // Find the problematic index
    for (let index of indexes) {
      if (index.name === 'RoomNumber_1') {
        console.log('Dropping legacy index:', index.name);
        await db.collection('rooms').dropIndex(index.name);
      }
    }
    console.log('Successfully removed old index.');
  } catch (err) {
    console.error('Error fixing indexes:', err);
  } finally {
    process.exit(0);
  }
}

fixIndexes();
