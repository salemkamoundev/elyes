import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  Firestore,
  serverTimestamp,
  query,
  where,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

  // --- HOUSES ---
  getHouses(): Observable<any[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'houses');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const houses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(houses);
        },
        (error) => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  async addHouse(houseData: any): Promise<any> {
    const colRef = collection(this.db, 'houses');
    return await addDoc(colRef, { ...houseData, createdAt: serverTimestamp() });
  }

  // --- BOOKINGS ---
  async addBooking(booking: Partial<Booking>) {
    const colRef = collection(this.db, 'bookings');
    return await addDoc(colRef, {
      ...booking,
      status: 'pending',
      createdAt: serverTimestamp()
    });
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

  // Action Admin : Valider ou Refuser
  async updateBookingStatus(bookingId: string, status: 'approved' | 'rejected') {
    const docRef = doc(this.db, 'bookings', bookingId);
    return await updateDoc(docRef, { status });
  }
}
