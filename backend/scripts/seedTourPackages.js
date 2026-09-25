const mongoose = require("mongoose");
const dotenv = require("dotenv");
const TourPackage = require("../model/TourPackage");

dotenv.config();

const makeImage = (title, color) => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="${color}"/>
  <circle cx="960" cy="150" r="95" fill="#facc15" opacity="0.9"/>
  <path d="M0 610 C190 520 300 690 500 600 C720 500 830 660 1200 520 L1200 800 L0 800 Z" fill="#0f766e" opacity="0.9"/>
  <path d="M0 695 C220 620 400 735 610 660 C800 590 950 690 1200 625 L1200 800 L0 800 Z" fill="#064e3b" opacity="0.95"/>
  <text x="70" y="130" fill="#ffffff" font-family="Arial, sans-serif" font-size="58" font-weight="700">${title}</text>
</svg>`;

  return {
    data: Buffer.from(svg.trim()),
    contentType: "image/svg+xml",
  };
};

const packages = [
  {
    packageId: "SL-ADV-001",
    name: "Sigiriya and Knuckles Adventure",
    destination: "Sri Lanka - Sigiriya and Knuckles",
    price: 349,
    startDate: new Date("2026-11-08"),
    endDate: new Date("2026-11-13"),
    tourGuideName: "Nimal Perera",
    tourType: "Adventure",
    description:
      "Climb Sigiriya, explore Dambulla caves, and trek the Knuckles range with a local guide. Includes cultural stops, scenic viewpoints, and comfortable stays.",
    image: makeImage("Sigiriya Adventure", "#2563eb"),
  },
  {
    packageId: "SL-BCH-002",
    name: "South Coast Beach Escape",
    destination: "Sri Lanka - Mirissa and Galle",
    price: 429,
    startDate: new Date("2026-12-02"),
    endDate: new Date("2026-12-07"),
    tourGuideName: "Tharushi Fernando",
    tourType: "Beach",
    description:
      "Relax on the south coast with Mirissa beaches, whale watching, Galle Fort, sunset viewpoints, and curated coastal dining experiences.",
    image: makeImage("South Coast Escape", "#0891b2"),
  },
  {
    packageId: "SL-CLT-003",
    name: "Ancient Kingdoms Cultural Trail",
    destination: "Sri Lanka - Anuradhapura and Polonnaruwa",
    price: 389,
    startDate: new Date("2027-01-10"),
    endDate: new Date("2027-01-16"),
    tourGuideName: "Kasun Jayasinghe",
    tourType: "Cultural",
    description:
      "Discover Sri Lanka's ancient capitals, sacred temples, stupas, museums, and village food traditions with a heritage-focused itinerary.",
    image: makeImage("Cultural Trail", "#7c3aed"),
  },
  {
    packageId: "SL-FAM-004",
    name: "Kandy Family Discovery",
    destination: "Sri Lanka - Kandy and Peradeniya",
    price: 299,
    startDate: new Date("2027-02-05"),
    endDate: new Date("2027-02-09"),
    tourGuideName: "Amara Silva",
    tourType: "Family",
    description:
      "A relaxed family itinerary covering the Temple of the Tooth, Peradeniya Botanical Garden, cultural shows, lakeside walks, and kid-friendly stops.",
    image: makeImage("Kandy Discovery", "#16a34a"),
  },
  {
    packageId: "SL-WLD-005",
    name: "Yala Wildlife Safari",
    destination: "Sri Lanka - Yala National Park",
    price: 499,
    startDate: new Date("2027-03-12"),
    endDate: new Date("2027-03-16"),
    tourGuideName: "Dinesh Maduranga",
    tourType: "Wildlife",
    description:
      "Experience guided jeep safaris in Yala, birdwatching, coastal lagoons, and nature lodges designed for wildlife lovers and photographers.",
    image: makeImage("Yala Safari", "#ea580c"),
  },
  {
    packageId: "SL-HIK-006",
    name: "Ella Highlands Hiking Tour",
    destination: "Sri Lanka - Ella and Nuwara Eliya",
    price: 459,
    startDate: new Date("2027-04-04"),
    endDate: new Date("2027-04-10"),
    tourGuideName: "Malith Wijesinghe",
    tourType: "Hiking",
    description:
      "Hike Little Adam's Peak, visit Nine Arches Bridge, explore tea estates, waterfalls, and cool highland viewpoints across Ella and Nuwara Eliya.",
    image: makeImage("Ella Highlands", "#047857"),
  },
];

const seedTourPackages = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  let inserted = 0;
  let updated = 0;

  for (const tourPackage of packages) {
    const result = await TourPackage.updateOne(
      { packageId: tourPackage.packageId },
      { $set: tourPackage },
      { upsert: true, runValidators: true }
    );

    if (result.upsertedCount > 0) {
      inserted += 1;
    } else if (result.modifiedCount > 0 || result.matchedCount > 0) {
      updated += 1;
    }
  }

  console.log(`Seed complete: ${inserted} inserted, ${updated} updated.`);
};

seedTourPackages()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
