const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect('mongodb://127.0.0.1:27017/HotelProDB');
  const db = mongoose.connection.db;

  const bookings = await db.collection('bookings').find({}).toArray();
  for (let b of bookings) {
    if (b.guest && !b.user) {
      await db.collection('bookings').updateOne(
        { _id: b._id },
        { $set: { user: b.guest }, $unset: { guest: "" } }
      );
      console.log('Migrated booking:', b._id);
    }
  }
  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch(console.error);
