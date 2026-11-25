import { City } from '@/types';

export const CITIES: City[] = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    localities: [
      'All Localities',
      'Mazgaon (Hasanabad / Saifee Park)',
      'Bhendi Bazaar (SBUT / Raudat Tahera)',
      'Byculla',
      'Marol (Saifee Colony)',
      'Mira Road (Shanti Nagar)',
      'Thane',
      'Andheri East',
      'Kurla / Nehru Nagar',
    ],
    jamaats: [
      'Mazgaon Jamaat (Hasanabad / Saifee Park)',
      'Badri Mohalla Jamaat (Bhendi Bazaar)',
      'Byculla Jamaat',
      'Marol Jamaat (Saifee Colony)',
      'Bandra Jamaat',
      'Andheri Jamaat',
      'Goregaon Jamaat',
      'Malad Jamaat',
      'Borivali Jamaat',
      'Mira Road Jamaat',
      'Bhayandar (East & West) Jamaat',
      'Thane Jamaat',
      'Kurla Jamaat',
      'Ghatkopar / Vikhroli Jamaat',
      'Dombivli / Kalyan Jamaat',
      'Navi Mumbai (Vashi / Nerul / Kharghar) Jamaat',
      'Panvel Jamaat',
      'Bhiwandi Jamaat',
    ],
  },
  {
    id: 'surat',
    name: 'Surat',
    country: 'India',
    localities: [
      'All Localities',
      'Zampa Bazaar (Devdi Mubarak)',
      'Begumpura',
      'Nanpura',
      'Rustampura',
      'Adajan',
    ],
    jamaats: [
      'Anjuman-e-Mohammedi (Zampa Bazaar / Devdi Mubarak)',
      'Begumpura Jamaat',
      'Nanpura Jamaat',
      'Rustampura Jamaat',
      'Salabatpura Jamaat',
      'Adajan / Rander Jamaat',
      'Aljamea-tus-Saifiyah Campus Zone',
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    country: 'India',
    localities: ['All Localities', 'Camp / Saifee Street', 'Kondhwa', 'Salunke Vihar'],
    jamaats: [
      'Pune City Jamaat (Camp / Saifee Street)',
      'Kondhwa / NIBM Jamaat',
      'Salunke Vihar / Wanowrie Jamaat',
      'Hadapsar / Magarpatta Jamaat',
      'Pimpri-Chinchwad Jamaat',
    ],
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    country: 'India',
    localities: ['All Localities', 'Kalupur', 'Paldi', 'Dani Limda'],
    jamaats: [
      'Ahmedabad City Jamaat (Manek Chowk / Doshiwada ni Pol)',
      'Kalupur Jamaat',
      'Paldi / Vasna Jamaat',
      'Dani Limda Jamaat',
      'Vatwa Jamaat',
      'Saraspur Jamaat',
    ],
  },
  {
    id: 'indore',
    name: 'Indore',
    country: 'India',
    localities: ['All Localities', 'Siyaganj', 'Saifee Nagar', 'Khatiwala Tank'],
    jamaats: [
      'Saifee Nagar Jamaat',
      'Husaini Mohalla Jamaat',
      'Noorani Nagar Jamaat',
      'Siyaganj / Central Indore Jamaat',
      'Vajihi Mohalla Jamaat',
      'Badri Mohalla Jamaat',
      'Khatiwala Tank Jamaat',
    ],
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'UAE',
    localities: ['All Localities', 'Al Nahda (Masjid Area)', 'Al Qusais', 'Deira', 'Bur Dubai'],
    jamaats: [
      'Dubai Jamaat (Al Qusais / Al Nahda Markaz)',
      'Deira / Bur Dubai Community Unit',
      'Jumeirah / Al Barsha Community Unit',
    ],
  },
  {
    id: 'sharjah',
    name: 'Sharjah',
    country: 'UAE',
    localities: ['All Localities', 'Al Yarmook', 'Rolla', 'Al Majaz'],
    jamaats: [
      'Sharjah Jamaat (Al Yarmook Markaz)',
      'Al Majaz / Rolla Community Unit',
    ],
  },
  {
    id: 'kuwait',
    name: 'Kuwait',
    country: 'Kuwait',
    localities: ['All Localities', 'Ardiya (Markaz Area)', 'Salmiya', 'Hawally'],
    jamaats: [
      'Kuwait Jamaat (Ardiya Markaz)',
      'Salmiya / Hawally Community Unit',
    ],
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    localities: ['All Localities', 'Northolt (Saifee Masjid)', 'Harrow', 'Ealing'],
    jamaats: [
      'London Jamaat (Northolt / Al-Masjid al-Husaini)',
      'Harrow / Stanmore Community Unit',
      'Ealing / Southall Community Unit',
    ],
  },
  {
    id: 'houston',
    name: 'Houston',
    country: 'USA',
    localities: ['All Localities', 'Sugar Land / Saifee Masjid', 'Spring Branch', 'Katy'],
    jamaats: [
      'Houston Jamaat (Sugar Land / Al-Masjid al-Burhani)',
      'Spring Branch / West Houston Community Unit',
      'Katy Community Unit',
    ],
  },
];

/**
 * Mapping table: City ID -> List of Dawoodi Bohra Jamaats
 */
export const CITY_JAMAAT_MAP: Record<string, string[]> = Object.fromEntries(
  CITIES.map((city) => [city.id, city.jamaats])
);

export function getJamaatsByCityId(cityId: string): string[] {
  return CITY_JAMAAT_MAP[cityId] || [];
}
