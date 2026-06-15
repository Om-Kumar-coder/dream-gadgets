export interface Brand {
  name: string;
  image: string;
}

export const BRANDS: Brand[] = [
  { name: 'Apple', image: '/brand/iphone.jpg' },
  { name: 'Samsung', image: '/brand/samsung.jpg' },
  { name: 'OnePlus', image: '/brand/oneplus.jpg' },
  { name: 'Oppo', image: '/brand/oppo.jpg' },
  { name: 'Vivo', image: '/brand/vivo.jpg' },
  { name: 'Realme', image: '/brand/realme.jpg' },
  { name: 'Xiaomi', image: '/brand/mi.jpg' },
  { name: 'Motorola', image: '/brand/motorola.jpg' },
  { name: 'Google', image: '/brand/pixel.jpg' },
  { name: 'Nothing', image: '/brand/nothing.jpg' },
  { name: 'Asus', image: '/brand/asus.jpg' },
  { name: 'Honor', image: '/brand/honor.jpg' },
  { name: 'Infinix', image: '/brand/infinix.jpg' },
  { name: 'iQOO', image: '/brand/iqoo.jpg' },
  { name: 'Nokia', image: '/brand/nokia.jpg' },
  { name: 'POCO', image: '/brand/poco.jpg' },
  { name: 'Tecno', image: '/brand/tecno.jpg' },
];

/** Find a brand by case-insensitive name match */
export function findBrand(name: string): Brand | undefined {
  return BRANDS.find(
    b => b.name.toLowerCase() === name.toLowerCase(),
  );
}
