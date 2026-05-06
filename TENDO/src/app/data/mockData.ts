export interface BusStop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  lines: string[];
}

export interface BusLine {
  id: string;
  number: string;
  name: string;
  color: string;
  type?: string;
  hasWiFi?: boolean;
  hasAC?: boolean;
  isAccessible?: boolean;
  stops: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  favorites: string[];
  enabled: boolean;
}

export const mockBusStops: BusStop[] = [
  {
    id: '1',
    name: 'Gare Sud Plateau',
    address: 'Plateau',
    latitude: 5.3183,
    longitude: -4.0195,
    lines: ['01', '12', '42']
  },
  {
    id: '2',
    name: 'Place de la République',
    address: 'Plateau',
    latitude: 5.3265,
    longitude: -4.0180,
    lines: ['12', '24']
  },
  {
    id: '3',
    name: 'Université FHB',
    address: 'Cocody',
    latitude: 5.3421,
    longitude: -3.9856,
    lines: ['01', '24', '35']
  },
  {
    id: '4',
    name: 'Centre Commercial Cap Sud',
    address: 'Marcory',
    latitude: 5.3023,
    longitude: -3.9806,
    lines: ['12', '35']
  },
  {
    id: '5',
    name: 'Carrefour Siporex',
    address: 'Yopougon',
    latitude: 5.3417,
    longitude: -4.0531,
    lines: ['01', '42']
  }
];

export const mockBusLines: BusLine[] = [
  {
    id: '1',
    number: '01',
    name: 'Plateau - Cocody',
    color: '#F57C00',
    stops: ['1', '3', '5']
  },
  {
    id: '2',
    number: '12',
    name: 'Treichville - Marcory',
    color: '#2E7D32',
    stops: ['1', '2', '4']
  },
  {
    id: '3',
    number: '24',
    name: 'Plateau - Yopougon',
    color: '#F57C00',
    stops: ['2', '3']
  },
  {
    id: '4',
    number: '35',
    name: 'Express Riviera',
    color: '#2E7D32',
    stops: ['3', '4']
  },
  {
    id: '5',
    number: '42',
    name: 'Direct FHB',
    color: '#F57C00',
    stops: ['1', '5']
  }
];

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 1000);
};

export const mockUserPosition = {
  latitude: 5.3265,
  longitude: -4.0180
};
