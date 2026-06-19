export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  type: 'room' | 'roommate';
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  author: User;
  createdAt: string;
  availableFrom: string;
  isFurnished?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  genderPreference?: 'any' | 'male' | 'female';
}

export interface SearchFilters {
  type?: 'room' | 'roommate' | '';
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  isFurnished?: boolean;
  genderPreference?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
