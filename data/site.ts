export type Service = {
  name: string;
  schedule: string;
  address: string;
};

export type Campus = {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  region: string;
  country: string;
  timezone: string;
  address: string;
  phone?: string;
  image: string;
  verse: string;
  verseRef: string;
  services: Service[];
  match: string[];
};

const availability = (item: string) => `${item} will be released once available.`;

export const campuses: Campus[] = [
  {
    slug: "abeokuta",
    name: "Zoe Household Abeokuta",
    shortName: "Abeokuta",
    city: "Abeokuta",
    region: "Nigeria",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    address: "Continental Suites, Ibara, Abeokuta",
    image: "/assets/zoe-abeokuta.jpg",
    verse: "You make known to me the path of life; in your presence there is fullness of joy.",
    verseRef: "Psalm 16:11",
    services: [{ name: "Sunday Gathering", schedule: availability("Service time"), address: "Continental Suites, Ibara, Abeokuta" }],
    match: ["abeokuta", "ogun", "ota", "sango"],
  },
  {
    slug: "atlanta",
    name: "Zoe Household Atlanta",
    shortName: "Atlanta",
    city: "Austell",
    region: "United States",
    country: "USA",
    timezone: "America/New_York",
    address: "6865 Factory Shoals Rd SW, Austell, GA 30168",
    phone: "+1 943-245-0356",
    image: "/assets/zoe-atlanta.jpg",
    verse: "I have come that they may have life, and have it to the full.",
    verseRef: "John 10:10",
    services: [
      { name: "Sunday Service", schedule: "Sundays at 4:00 PM", address: "6865 Factory Shoals Rd SW, Austell, GA 30168" },
      { name: "Bible Study", schedule: "Thursdays at 7:00 PM", address: "320 Riverside Pkwy Suite 100A, Austell, GA 30168" },
    ],
    match: ["atlanta", "austell", "marietta", "douglasville", "factory shoals"],
  },
  {
    slug: "houston",
    name: "Zoe Household Houston",
    shortName: "Houston",
    city: "Houston",
    region: "United States",
    country: "USA",
    timezone: "America/Chicago",
    address: "12658 Goar Rd, Houston, TX 77077",
    image: "/assets/zoe-houston.jpg",
    verse: "The Spirit of him who raised Jesus from the dead is living in you.",
    verseRef: "Romans 8:11",
    services: [{ name: "Sunday Gathering", schedule: availability("Service time"), address: "12658 Goar Rd, Houston, TX 77077" }],
    match: ["houston", "katy", "sugar land", "pearland"],
  },
  {
    slug: "ikeja",
    name: "Zoe Household Ikeja",
    shortName: "Ikeja",
    city: "Ikeja",
    region: "Nigeria",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    address: "1 Lola Holloway, Omole Phase 1, Lagos",
    phone: "+234 816 266 5803",
    image: "/assets/zoe-ikeja.jpg",
    verse: "If anyone is in Christ, the new creation has come.",
    verseRef: "2 Corinthians 5:17",
    services: [{ name: "Sunday Gathering", schedule: availability("Service time"), address: "1 Lola Holloway, Omole Phase 1, Lagos" }],
    match: ["ikeja", "omole", "ogba", "maryland nigeria"],
  },
  {
    slug: "ipaja",
    name: "Zoe Household Ipaja",
    shortName: "Ipaja",
    city: "Ipaja",
    region: "Nigeria",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    address: "TGC Hall, 3B A Close, off Kokomo Road, Iyana-Ipaja",
    phone: "+234 704 142 3847",
    image: "/assets/zoe-ipaja.jpg",
    verse: "Now to him who is able to do immeasurably more than all we ask or imagine.",
    verseRef: "Ephesians 3:20",
    services: [{ name: "Sunday Gathering", schedule: availability("Service time"), address: "TGC Hall, 3B A Close, off Kokomo Road, Iyana-Ipaja" }],
    match: ["ipaja", "iyana ipaja", "alimosho", "ayobo"],
  },
  {
    slug: "london",
    name: "Zoe Household London",
    shortName: "London",
    city: "London",
    region: "United Kingdom",
    country: "UK",
    timezone: "Europe/London",
    address: availability("London gathering location"),
    image: "/assets/zoe-uk.jpg",
    verse: "Let the message of Christ dwell among you richly.",
    verseRef: "Colossians 3:16",
    services: [{ name: "Sunday Gathering", schedule: availability("Service time"), address: availability("London gathering location") }],
    match: ["london", "uk", "united kingdom", "england"],
  },
  {
    slug: "yaba",
    name: "Zoe Household Yaba",
    shortName: "Yaba",
    city: "Yaba",
    region: "Nigeria",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    address: "Unilag Guest House, Akoka Rd, Abule Ijesha, Lagos",
    phone: "+234 903 740 1755",
    image: "/assets/zoe-yaba.jpg",
    verse: "In him was life, and that life was the light of all mankind.",
    verseRef: "John 1:4",
    services: [{ name: "Sunday Gathering", schedule: availability("Service time"), address: "Unilag Guest House, Akoka Rd, Abule Ijesha, Lagos" }],
    match: ["yaba", "unilag", "akoka", "surulere"],
  },
];

export const beliefs = [
  ["God", "We believe in one true, living, and eternal God, the Creator of all things, who is holy, sovereign, and full of love and justice. God exists eternally in three persons: Father, Son, and Holy Spirit.", "Deuteronomy 6:4 · Genesis 1:1 · 1 Timothy 1:17 · Revelation 4:11"],
  ["Jesus Christ", "We believe that Jesus Christ is the Son of God, fully God and fully man. He lived a sinless life, died for our sins, rose again, and is Savior, Lord, and soon-coming King.", "John 1:1 · Philippians 2:6–8 · Luke 1:35 · John 14:6 · 1 Corinthians 15:3–4"],
  ["The Holy Spirit", "We believe the Holy Spirit is the presence and power of God at work in the world today. He leads, teaches, fills, empowers, and produces the fruit of holiness.", "John 14:26 · Acts 1:8 · Romans 8:14 · Galatians 5:22–23"],
  ["The Trinity", "We believe in one God who exists in three distinct, co-equal Persons: God the Father, God the Son, and God the Holy Spirit.", "Matthew 28:19 · 2 Corinthians 13:14 · John 14:16–17"],
  ["Salvation", "We believe salvation is by grace through faith in Jesus Christ alone. Through Him we are forgiven, made new, and brought into right relationship with God.", "Ephesians 2:8–9 · Romans 10:9 · Titus 3:5"],
  ["Sanctification", "We believe sanctification is both a one-time act and a lifelong process through which the Holy Spirit transforms us into the likeness of Christ.", "1 Thessalonians 5:23 · 2 Corinthians 3:18 · Romans 12:1–2"],
  ["The Gifts of the Holy Spirit", "We believe the gifts of the Holy Spirit remain active and available today for the building up of the Body of Christ and the advancement of God’s kingdom.", "1 Corinthians 12:4–11 · Romans 12:6–8 · 1 Corinthians 14:1"],
  ["Holy Communion", "We believe Communion is a sacred remembrance of Christ’s death, a celebration of His resurrection, and a declaration of our unity in Him.", "Luke 22:19–20 · 1 Corinthians 11:23–26"],
  ["Marriage", "We believe marriage is a sacred, lifelong covenant between one man and one woman, reflecting Christ’s relationship with His Church.", "Genesis 2:24 · Matthew 19:4–6 · Ephesians 5:25, 31–32"],
  ["Resurrection", "We believe in the bodily resurrection of Jesus Christ, which guarantees the future resurrection of all believers.", "1 Corinthians 15:20–22 · John 11:25–26 · Philippians 3:10–11"],
  ["The Second Coming", "We believe in the visible, glorious return of Jesus Christ. Believers are called to live in readiness, hope, and holiness as we await Him.", "Acts 1:11 · Revelation 22:12 · 1 Thessalonians 4:16–17 · Titus 2:13"],
] as const;

export const faqs = [
  ["What should I expect when I visit Zoe?", "Expect a warm welcome, worship, prayer, practical teaching from Scripture, and a household ready to help you settle in."],
  ["Do I need to let someone know I am coming?", "No. You are always welcome to attend. The optional visitor form simply helps the local team prepare to welcome you and answer questions before Sunday."],
  ["What should I wear?", "Come as you are. Zoe is a place to meet with God and people, not a dress code to get right."],
  ["Can I bring my children?", "Yes. Zoe Arrows welcomes children. Check-in guidance and optional pre-registration are available on every campus page."],
  ["How do I find a campus near me?", "Use the address finder on the Visit page or browse all seven Zoe Household locations."],
  ["Can I join online?", "Yes. If a physical campus is not near you, share your email through Zoe Online and the team will contact you with access details."],
  ["How do I receive service reminders?", "Enter your email on the relevant campus page to join that campus’s service reminder list."],
  ["How can I submit a prayer request?", "Use the dedicated Prayer page so your request can be routed carefully to the appropriate prayer team."],
  ["How can I give?", "Use the Give page to support Zoe Global or a specific campus through its available giving method."],
] as const;

export const sermons = [
  { title: "How to Heal with Intrusive Thoughts", topic: "Mental Health", series: "Thought Life", campus: "Atlanta" },
  { title: "Tracing the Use of Water & Baptism in the Old Testament", topic: "Doctrine", series: "Baptism", campus: "Atlanta" },
  { title: "We Need Each Other", topic: "Church", series: "Community", campus: "Atlanta" },
  { title: "How to Hear From God", topic: "Prayer", series: "Guidance", campus: "Atlanta" },
  { title: "Tongues", topic: "Holy Spirit", series: "Spiritual Gifts", campus: "Atlanta" },
  { title: "A Call to Evangelize", topic: "Evangelism", series: "Mission", campus: "Atlanta" },
  { title: "Once Saved Forever Saved", topic: "Theology", series: "Salvation", campus: "Atlanta" },
  { title: "How to Move Mountains — Part 1", topic: "Faith", series: "How to Move Mountains", campus: "Atlanta" },
  { title: "Am I Ready for Marriage?", topic: "Marriage", series: "Relationships", campus: "Atlanta" },
] as const;

export const routes = [
  "/",
  "/about",
  "/about/beliefs",
  "/about/faqs",
  "/visit",
  ...campuses.map((campus) => `/visit/${campus.slug}`),
  "/sermons",
  "/pneuma-worship",
  "/events",
  "/events/ignite",
  "/events/camp-meeting",
  "/events/still-waters",
  "/resources",
  "/resources/scholarship",
  "/prayer",
  "/give",
] as const;

export const socialLinks = {
  instagram: "https://www.instagram.com/zoehousehold_global/",
  youtube: "https://www.youtube.com/@PastorDolapoLawal",
  spotify: "https://open.spotify.com/artist/4mSJ0AM0ayxUboM1tvwiOs",
  tiktok: "https://www.tiktok.com/@zoe.household.atl",
};

export const pastorDolapoBio =
  "Pastor Dolapo Lawal is the Lead Pastor of The Zoe Household Global, a fast-growing, vibrant church with expressions across the world. Called to reveal Christ, he teaches the Word of God with simplicity and precision. His depth in the Word and passion to reach the world with truth have endeared many to his ministry. Pastor Dolapo has released numerous songs for the edification of the body of Christ. He resides in Atlanta with his wife, Temiloluwa, and their two children.";
