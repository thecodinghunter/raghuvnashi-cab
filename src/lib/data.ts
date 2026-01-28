import type { OptimizeDriverMatchingInput } from "@/ai/flows/optimize-driver-matching";
import type { Ride, Complaint } from '@/lib/types';
import {faker} from '@faker-js/faker';

export const availableDrivers: OptimizeDriverMatchingInput['availableDrivers'] = [
  {
    driverId: 'driver_1',
    location: { latitude: 34.0522, longitude: -118.2437 },
    vehicleType: 'Sedan',
    rating: 4.8,
    availability: true,
  },
  {
    driverId: 'driver_2',
    location: { latitude: 34.055, longitude: -118.25 },
    vehicleType: 'SUV',
    rating: 4.9,
    availability: true,
  },
  {
    driverId: 'driver_3',
    location: { latitude: 34.048, longitude: -118.24 },
    vehicleType: 'Sedan',
    rating: 4.7,
    availability: true,
  },
  {
    driverId: 'driver_4',
    location: { latitude: 34.06, longitude: -118.23 },
    vehicleType: 'Luxury',
    rating: 5.0,
    availability: false,
  },
  {
    driverId: 'driver_5',
    location: { latitude: 33.95, longitude: -118.34 },
    vehicleType: 'Sedan',
    rating: 4.6,
    availability: true,
  },
];

export const rideHistory = [
    {
        id: "RIDE001",
        date: "2023-10-26",
        pickup: "123 Main St, Anytown",
        dropoff: "456 Oak Ave, Anytown",
        fare: 25.50,
        driver: "John D.",
    },
    {
        id: "RIDE002",
        date: "2023-10-25",
        pickup: "789 Pine Ln, Anytown",
        dropoff: "101 Maple Dr, Anytown",
        fare: 15.75,
        driver: "Jane S.",
    },
    {
        id: "RIDE003",
        date: "2023-10-24",
        pickup: "210 Birch Rd, Anytown",
        dropoff: "314 Cedar Ct, Anytown",
        fare: 32.00,
        driver: "John D.",
    },
    {
        id: "RIDE004",
        date: "2023-10-23",
        pickup: "512 Elm St, Anytown",
        dropoff: "613 Spruce Ave, Anytown",
        fare: 18.20,
        driver: "Mike R.",
    },
];

export const earningsData = [
  { day: 'Mon', earnings: 150 },
  { day: 'Tue', earnings: 180 },
  { day: 'Wed', earnings: 220 },
  { day: 'Thu', earnings: 190 },
  { day: 'Fri', earnings: 250 },
  { day: 'Sat', earnings: 300 },
  { day: 'Sun', earnings: 280 },
];

export const driverDetails = {
    'driver_1': { name: 'John Doe', vehicle: 'Toyota Camry (ABC-123)', imageId: 'driver-1' },
    'driver_2': { name: 'Jane Smith', vehicle: 'Honda CR-V (DEF-456)', imageId: 'driver-2' },
    'driver_3': { name: 'Mike Ross', vehicle: 'Honda Accord (GHI-789)', imageId: 'driver-3' },
    'driver_4': { name: 'Sarah Connor', vehicle: 'Tesla Model S (JKL-012)', imageId: 'driver-4' },
    'driver_5': { name: 'Peter Jones', vehicle: 'Toyota Prius (MNO-345)', imageId: 'driver-1' },
}

const driverNames = Object.values(driverDetails).map(d => d.name);

export const allRides: Omit<Ride, 'id'>[] = Array.from({ length: 50 }, (_, i): Omit<Ride, 'id'> => {
    const statusOptions: Ride['status'][] = ["Completed", "In Progress", "Cancelled", "Disputed"];
    const driverName = faker.helpers.arrayElement(driverNames);
    
    return {
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      driverId: `driver_${driverNames.indexOf(driverName) + 1}`,
      driverName: driverName,
      pickup: faker.location.streetAddress(),
      dropoff: faker.location.streetAddress(),
      pickupCoords: { lat: faker.location.latitude(), lon: faker.location.longitude() },
      dropoffCoords: { lat: faker.location.latitude(), lon: faker.location.longitude() },
      fare: parseFloat(faker.finance.amount({ min: 5, max: 50, dec: 2 })),
      status: faker.helpers.arrayElement(statusOptions),
      createdAt: faker.date.recent({ days: 30 }),
      vehicleType: faker.helpers.arrayElement(['Sedan', 'SUV', 'Hatchback', 'Mini'])
    };
});

const rideIds = allRides.map((r, i) => `RIDE${i}`);
const userNames = allRides.map(r => r.userName);

export const allComplaints: Omit<Complaint, 'id'>[] = Array.from({ length: 15 }, (_, i): Omit<Complaint, 'id'> => {
  return {
    userId: faker.string.uuid(),
    userName: faker.helpers.arrayElement(userNames),
    rideId: faker.helpers.arrayElement(rideIds),
    message: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['Open', 'Resolved']),
    createdAt: faker.date.recent({ days: 30 }),
  };
});
