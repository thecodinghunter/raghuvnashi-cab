import { collection, doc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { allRides, allComplaints } from './data';
import { faker } from '@faker-js/faker';
import type { Driver } from '@/lib/types';

const defaultVendorFee = 250;

async function seedCollection(db: any, collectionName: string, data: any[]) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
        console.log(`Seeding ${collectionName}...`);
        const batch = writeBatch(db);
        data.forEach(item => {
            const docRef = doc(collectionRef);
            batch.set(docRef, item);
        });
        await batch.commit();
        console.log(`${collectionName} seeded.`);
        return true;
    }
    return false;
}

// This function now intelligently seeds fees based on existing drivers
async function seedVendorFees(db: any) {
    const feesCollectionRef = collection(db, 'vendorFees');
    const feesSnapshot = await getDocs(feesCollectionRef);
    if (!feesSnapshot.empty) {
        console.log('vendorFees collection is not empty, skipping seed.');
        return;
    }

    console.log('Seeding vendorFees based on existing drivers...');
    
    // 1. Get actual drivers from the 'users' collection
    const driversQuery = query(collection(db, 'users'), where('role', '==', 'driver'));
    const driversSnapshot = await getDocs(driversQuery);
    const drivers = driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));

    if (drivers.length === 0) {
        console.log('No drivers found in the database. Cannot seed vendor fees.');
        return;
    }

    const batch = writeBatch(db);

    // 2. Ensure at least one active driver has an unpaid fee for today for demo purposes
    const firstActiveDriver = drivers.find(d => d.status === 'approved');
    if (firstActiveDriver) {
        const today = new Date();
        const firstFeeDocRef = doc(collection(db, 'vendorFees'));
        batch.set(firstFeeDocRef, {
            driverId: firstActiveDriver.id,
            driverName: firstActiveDriver.name,
            date: today,
            feeAmount: defaultVendorFee,
            status: 'unpaid',
        });
        console.log(`Created unpaid fee for today for driver: ${firstActiveDriver.name}`);
    }

    // 3. Seed other drivers with a few random historical fees
    drivers.forEach((driver) => {
        // Only add a few historical fees, not for every driver necessarily
        if (Math.random() > 0.5) { 
             const feeCount = faker.number.int({ min: 2, max: 5 });
             for (let i = 0; i < feeCount; i++) {
                const feeDocRef = doc(collection(db, 'vendorFees'));
                batch.set(feeDocRef, {
                    driverId: driver.id,
                    driverName: driver.name,
                    date: faker.date.recent({ days: 30 }),
                    feeAmount: defaultVendorFee,
                    status: faker.helpers.arrayElement(['paid', 'unpaid']),
                });
            }
        }
    });

    await batch.commit();
    console.log('vendorFees seeded successfully.');
}


export async function seedDatabase(db: any) {
  try {
    // These collections are simple and don't have dependencies
    await seedCollection(db, 'rides', allRides);
    await seedCollection(db, 'complaints', allComplaints);

    // This function now intelligently seeds fees based on existing drivers
    await seedVendorFees(db);
    
    console.log('Database verification complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
