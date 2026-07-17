require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Car = require('./models/Car');
const User = require('./models/User');

const cars = [
  {
    brand: 'Maruti Suzuki',
    carName: 'Swift VXI',
    modelYear: 2020,
    price: 585000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kmDriven: 32000,
    owners: 1,
    description: 'Single owner, full service history, recently serviced with new tyres.',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    brand: 'Hyundai',
    carName: 'Creta SX',
    modelYear: 2021,
    price: 1450000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 21000,
    owners: 1,
    description: 'Top-spec SX trim with sunroof, still under manufacturer warranty.',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    brand: 'Honda',
    carName: 'City ZX',
    modelYear: 2019,
    price: 950000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kmDriven: 45000,
    owners: 2,
    description: 'Well-maintained sedan, new battery, all documents clear.',
    images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    brand: 'Tata',
    carName: 'Nexon XZ+',
    modelYear: 2022,
    price: 1050000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kmDriven: 12000,
    owners: 1,
    description: '5-star safety rated, showroom condition, low mileage.',
    images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    brand: 'Mahindra',
    carName: 'XUV700 AX7',
    modelYear: 2023,
    price: 2350000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    kmDriven: 8000,
    owners: 1,
    description: 'Nearly new, ADAS package, extended warranty transferable.',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    brand: 'Toyota',
    carName: 'Innova Crysta GX',
    modelYear: 2018,
    price: 1650000,
    fuelType: 'Diesel',
    transmission: 'Manual',
    kmDriven: 68000,
    owners: 2,
    description: 'Fleet-maintained, all major services done at authorized center.',
    images: ['https://images.unsplash.com/photo-1619976215249-990e6b8f2f7c?auto=format&fit=crop&w=1200&q=80'],
  },
];

async function seed() {
  await connectDB();
  await Promise.all([Car.deleteMany({}), User.deleteMany({})]);

  await Car.insertMany(cars);

  await User.create({
    name: 'RKCartune Admin',
    email: 'admin@rkcartune.com',
    password: 'Admin@123',
    phone: '9998887776',
    role: 'admin',
  });

  await User.create({
    name: 'Test Buyer',
    email: 'buyer@example.com',
    password: 'Buyer@123',
    phone: '9998887775',
    role: 'user',
  });

  console.log(`[seed] inserted ${cars.length} cars, 1 admin, 1 test user`);
  console.log('[seed] admin login  -> admin@rkcartune.com / Admin@123');
  console.log('[seed] buyer login  -> buyer@example.com / Buyer@123');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
