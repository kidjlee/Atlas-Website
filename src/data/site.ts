// All clinic details live here. Update this file and every page picks up the change.

export const BOOKING_URL = 'https://atlasabbotsford.janeapp.com/';

export const clinic = {
  name: 'Atlas Massage Therapy',
  shortDescription:
    'A registered massage therapy clinic in Abbotsford, BC, offering personalized, hands-on care from Registered Massage Therapists.',
  phone: {
    display: '(604) 835-5520',
    href: 'tel:+16048355520',
    sms: 'sms:+16048355520',
    e164: '+16048355520',
  },
  email: 'atlasabbotsford@gmail.com',
  address: {
    unit: 'Unit 103',
    street: '33069 Marshall Rd',
    city: 'Abbotsford',
    region: 'BC',
    postalCode: 'V2S 1K4',
    country: 'CA',
  },
  bookingUrl: BOOKING_URL,
  bookingNote: 'Appointments are booked online or by phone. Walk-ins are not available at this time.',
} as const;

export const fullAddress = `${clinic.address.unit}, ${clinic.address.street}, ${clinic.address.city}, ${clinic.address.region} ${clinic.address.postalCode}`;

const mapsQuery = encodeURIComponent(
  `${clinic.name}, 103-33069 Marshall Rd, ${clinic.address.city}, ${clinic.address.region} ${clinic.address.postalCode}`,
);

export const maps = {
  link: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`,
  embed: `https://maps.google.com/maps?q=${mapsQuery}&z=16&output=embed`,
};

export type DayHours = {
  day: string;
  short: string;
  schemaDay: string;
  /** 24-hour "HH:MM" strings, or null when closed. */
  open: string | null;
  close: string | null;
};

// Ordered Monday to Sunday.
export const hours: DayHours[] = [
  { day: 'Monday', short: 'Mon', schemaDay: 'Monday', open: null, close: null },
  { day: 'Tuesday', short: 'Tue', schemaDay: 'Tuesday', open: '08:00', close: '20:00' },
  { day: 'Wednesday', short: 'Wed', schemaDay: 'Wednesday', open: null, close: null },
  { day: 'Thursday', short: 'Thu', schemaDay: 'Thursday', open: null, close: null },
  { day: 'Friday', short: 'Fri', schemaDay: 'Friday', open: '08:00', close: '20:00' },
  { day: 'Saturday', short: 'Sat', schemaDay: 'Saturday', open: '08:00', close: '20:00' },
  { day: 'Sunday', short: 'Sun', schemaDay: 'Sunday', open: '08:00', close: '20:00' },
];

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatHours(d: DayHours): string {
  return d.open && d.close ? `${formatTime(d.open)} – ${formatTime(d.close)}` : 'Closed';
}

/** Groups consecutive days with the same hours, e.g. "Fri – Sun: 8:00 AM – 8:00 PM". */
export function groupedHours(): { days: string; hours: string }[] {
  const groups: { first: DayHours; last: DayHours; hours: string }[] = [];
  for (const d of hours) {
    const label = formatHours(d);
    const prev = groups.at(-1);
    if (prev && prev.hours === label) prev.last = d;
    else groups.push({ first: d, last: d, hours: label });
  }
  return groups.map((g) => ({
    days: g.first === g.last ? g.first.short : `${g.first.short} – ${g.last.short}`,
    hours: g.hours,
  }));
}

export const openDaysSummary = 'Tuesday and Friday to Sunday, 8:00 AM – 8:00 PM';

export type Therapist = {
  slug: string;
  name: string;
  firstName: string;
  title: string;
  pronouns?: string;
  bookingUrl: string;
  photo: string;
  summary: string;
  bio: string[];
};

export const therapists: Therapist[] = [
  {
    slug: 'quy-duong',
    name: 'Quy Duong',
    firstName: 'Quy',
    title: 'Registered Massage Therapist (RMT)',
    bookingUrl: `${BOOKING_URL}#/staff_member/1`,
    photo: 'quy-duong',
    summary:
      'A graduate of CDI College of Massage Therapy, Quy treats pain and discomfort with techniques including Swedish massage, trigger point therapy, and myofascial release.',
    bio: [
      'Quy Duong is a recent graduate of CDI College of Massage Therapy. He has developed the knowledge and skills to treat pain and discomfort through a variety of techniques such as Swedish massage, trigger point therapy, myofascial release, neuromuscular techniques and joint mobilizations.',
      'With a strong interest in physical and mental health, he studied the many parts of the human body. This inspired him to pursue a career in massage therapy. His education and personal experiences have given him a solid understanding of the body’s mechanics, allowing him to help others recover from injuries and manage pain through massage therapy and education. He is committed to lifelong learning, both for his own growth and to better serve his patients.',
      'Outside of his work, Quy enjoys challenging himself physically through many forms of activity. These activities include things like weightlifting, fishing and more.',
    ],
  },
  {
    slug: 'michelle-sison',
    name: 'Michelle Sison',
    firstName: 'Michelle',
    title: 'Registered Massage Therapist (RMT)',
    pronouns: 'She/Her/Hers',
    bookingUrl: `${BOOKING_URL}#/staff_member/2`,
    photo: 'michelle-sison',
    summary: 'Michelle joins our RMT team with a calm, focused approach and strong hands-on skills.',
    bio: ['Michelle joins our RMT team with a calm, focused approach and strong hands-on skills.'],
  },
];

export type Treatment = {
  name: string;
  minutes: number;
  /** Price in CAD including GST, as listed on JaneApp. Omit to hide the price. */
  price?: number;
};

export const treatmentGroups: { heading: string; note?: string; items: Treatment[] }[] = [
  {
    heading: 'Massage therapy',
    note: 'Prices include GST.',
    items: [
      { name: 'Initial assessment', minutes: 60, price: 136 },
      { name: 'Subsequent visit', minutes: 30, price: 84 },
      { name: 'Subsequent visit', minutes: 45, price: 112.35 },
      { name: 'Subsequent visit', minutes: 60, price: 136 },
    ],
  },
  {
    heading: 'ICBC claims',
    note: 'Visits for an active ICBC claim are booked as their own appointment type on JaneApp.',
    items: [
      { name: 'ICBC initial visit', minutes: 60 },
      { name: 'ICBC subsequent visit', minutes: 45 },
    ],
  },
];

export function formatPrice(price: number): string {
  return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`;
}

export const nav = [
  { label: 'Home', path: '' },
  { label: 'Our Team', path: 'our-team/' },
  { label: 'Contact Us', path: 'contact/' },
];
