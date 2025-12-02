import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, Firestore, serverTimestamp, query, where, orderBy, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Nouvelle Interface House avec support multimédia
export interface House {
  id?: string;
  title: string;
  price: number;
  location: string;
  description: string;
  // On garde imageUrl pour la compatibilité, mais on ajoute les listes
  imageUrl: string; 
  images: string[];
  videos: string[];
  bedrooms: number;
  createdAt: any;
}

export interface Booking {
  id?: string;
  houseId: string;
  houseTitle: string;
  userId: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface FooterConfig {
  phone: string;
  email: string;
  address: string;
  copyright: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebaseConfig);
  public auth: Auth = getAuth(this.app);
  public db: Firestore = getFirestore(this.app);
  
  user$: Observable<User | null> = new Observable((observer) => {
    return onAuthStateChanged(this.auth, 
      (user) => observer.next(user),
      (error) => observer.error(error)
    );
  });

  constructor() {}

  // --- AUTH ---
  login(email: string, pass: string) { return signInWithEmailAndPassword(this.auth, email, pass); }
  register(email: string, pass: string) { return createUserWithEmailAndPassword(this.auth, email, pass); }
  loginWithGoogle() { return signInWithPopup(this.auth, new GoogleAuthProvider()); }
  logout() { return signOut(this.auth); }
  
  isAdmin(user: User | null): boolean {
    return user?.email === 'elyes@gmail.com';
  }

  // --- HOUSES CRUD ---
  getHouses(): Observable<House[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'houses');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const houses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House));
          observer.next(houses);
        }, (error) => observer.error(error));
      return () => unsubscribe();
    });
  }

  async getHouseById(id: string): Promise<House | null> {
    const docRef = doc(this.db, 'houses', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as House;
    }
    return null;
  }

  async addHouse(houseData: Omit<House, 'id' | 'createdAt'>): Promise<void> {
    const colRef = collection(this.db, 'houses');
    await addDoc(colRef, { ...houseData, createdAt: serverTimestamp() });
  }
  
  async updateHouse(id: string, houseData: Partial<House>): Promise<void> {
    const docRef = doc(this.db, 'houses', id);
    await updateDoc(docRef, houseData);
  }

  async deleteHouse(id: string): Promise<void> {
    const docRef = doc(this.db, 'houses', id);
    await deleteDoc(docRef);
  }

  // --- BOOKINGS ---
  async addBooking(booking: Partial<Booking>) {
    const colRef = collection(this.db, 'bookings');
    return await addDoc(colRef, { ...booking, status: 'pending', createdAt: serverTimestamp() });
  }

  getUserBookings(userId: string): Observable<Booking[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'bookings');
      const q = query(colRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        observer.next(bookings);
      });
      return () => unsubscribe();
    });
  }

  getAllBookings(): Observable<Booking[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'bookings');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        observer.next(bookings);
      });
      return () => unsubscribe();
    });
  }

  getApprovedBookingsForHouse(houseId: string): Observable<Booking[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'bookings');
      const q = query(colRef, where('houseId', '==', houseId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Booking))
          .filter(b => b.status === 'approved');
        observer.next(bookings);
      });
      return () => unsubscribe();
    });
  }

  async updateBookingStatus(bookingId: string, status: 'approved' | 'rejected') {
    const docRef = doc(this.db, 'bookings', bookingId);
    return await updateDoc(docRef, { status });
  }

  // --- FOOTER ---
  getFooterConfig(): Observable<FooterConfig> {
    return new Observable((observer) => {
      const docRef = doc(this.db, 'settings', 'footer');
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          observer.next(docSnap.data() as FooterConfig);
        } else {
          observer.next({ phone: '+216 215 415 425', email: 'elyes@gmail.com', address: 'Tunis', copyright: '2025 ElyesImmo' });
        }
      });
      return () => unsubscribe();
    });
  }

  async updateFooterConfig(config: FooterConfig) {
    const docRef = doc(this.db, 'settings', 'footer');
    return await setDoc(docRef, config, { merge: true });
  }
}
