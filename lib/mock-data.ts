export type LocalTransporter = {
  id: number;
  name: string;
  zone: string;
  district: string;
  coverage: string;
  price: string;
  rating: string;
  reviews: number;
  available: boolean;
};

export type GpTrip = {
  id: number;
  name: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  returnDate: string;
  capacity: string;
  price: string;
  rating: string;
  reviews: number;
  available: boolean;
};

export const localTransporters: LocalTransporter[] = [
  { id: 1, name: "Mamadou Ndiaye", zone: "Dakar", district: "Plateau", coverage: "Dakar Plateau, Médina, Fann", price: "1 500 FCFA", rating: "4,9", reviews: 42, available: true },
  { id: 2, name: "Awa Livraison", zone: "Dakar", district: "Parcelles Assainies", coverage: "Parcelles, Yoff, Ouakam", price: "2 000 FCFA", rating: "4,8", reviews: 26, available: true },
  { id: 3, name: "Ibrahima Express", zone: "Thiès", district: "Centre-ville", coverage: "Thiès, Grand Standing", price: "1 200 FCFA", rating: "4,7", reviews: 18, available: true },
  { id: 4, name: "Fatou Courses", zone: "Dakar", district: "Pikine", coverage: "Pikine, Guédiawaye", price: "1 800 FCFA", rating: "4,9", reviews: 31, available: false },
];

export const gpTrips: GpTrip[] = [
  { id: 11, name: "GP Aminata", from: "Paris", to: "Dakar", depart: "2026-12-05", arrive: "2026-12-06", returnDate: "2026-12-19", capacity: "15 kg", price: "8 €/kg", rating: "4,9", reviews: 37, available: true },
  { id: 12, name: "GP Moussa", from: "Dakar", to: "Paris", depart: "2026-12-11", arrive: "2026-12-12", returnDate: "2026-12-28", capacity: "10 kg", price: "6 000 FCFA/kg", rating: "4,8", reviews: 21, available: true },
  { id: 13, name: "GP Marième", from: "Lyon", to: "Dakar", depart: "2026-12-18", arrive: "2026-12-19", returnDate: "2027-01-04", capacity: "8 kg", price: "9 €/kg", rating: "4,6", reviews: 14, available: true },
];
