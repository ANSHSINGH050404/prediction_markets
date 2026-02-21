import "dotenv/config";
import { PrismaClient } from "../apps/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const SEED_MARKETS = [
  {
    category: "politics",
    title: "Will BJP win the 2029 Indian General Elections?",
    description: "Predict whether the Bharatiya Janata Party will win a majority in the 2029 Lok Sabha elections",
    endTime: new Date("2029-05-01"),
    outcomes: [
      { title: "Yes - BJP wins" },
      { title: "No - Others win" },
    ],
  },
  {
    category: "politics",
    title: "Who will be the next Chief Minister of Delhi?",
    description: "Predict the next Chief Minister after the Delhi Assembly elections",
    endTime: new Date("2025-12-31"),
    outcomes: [
      { title: "AAP" },
      { title: "BJP" },
      { title: "Congress" },
    ],
  },
  {
    category: "cricket",
    title: "Will India win the 2027 ICC Cricket World Cup?",
    description: "Will India win their 4th Cricket World Cup in 2027?",
    endTime: new Date("2027-04-30"),
    outcomes: [
      { title: "Yes" },
      { title: "No" },
    ],
  },
  {
    category: "cricket",
    title: "Who will win IPL 2026?",
    description: "Predict the winner of Indian Premier League 2026",
    endTime: new Date("2026-05-31"),
    outcomes: [
      { title: "Mumbai Indians" },
      { title: "Chennai Super Kings" },
      { title: "Royal Challengers Bangalore" },
      { title: "Gujarat Titans" },
      { title: "Other" },
    ],
  },
  {
    category: "cricket",
    title: "Will Virat Kohli retire from T20Is before 2027?",
    description: "Will Virat Kohli retire from T20 International cricket before 2027?",
    endTime: new Date("2027-01-01"),
    outcomes: [
      { title: "Yes - Retires" },
      { title: "No - Still playing" },
    ],
  },
  {
    category: "bollywood",
    title: "Which film will be the highest grossing Bollywood film of 2026?",
    description: "Predict which Bollywood film will earn the most at the box office in 2026",
    endTime: new Date("2026-12-31"),
    outcomes: [
      { title: "SRK Film" },
      { title: "Salman Khan Film" },
      { title: "Ranbir Kapoor Film" },
      { title: "Other" },
    ],
  },
  {
    category: "bollywood",
    title: "Will Bollywood have a ₹1000 crore film in 2026?",
    description: "Will any Bollywood film cross ₹1000 crore worldwide in 2026?",
    endTime: new Date("2026-12-31"),
    outcomes: [
      { title: "Yes" },
      { title: "No" },
    ],
  },
  {
    category: "tech",
    title: "Will Reliance Jio launch 6G in India by 2028?",
    description: "Predict whether Reliance Jio will commercially launch 6G services in India by 2028",
    endTime: new Date("2028-12-31"),
    outcomes: [
      { title: "Yes" },
      { title: "No" },
    ],
  },
  {
    category: "tech",
    title: "Which Indian startup will go public in 2026?",
    description: "Predict which Indian startup will have the biggest IPO in 2026",
    endTime: new Date("2026-12-31"),
    outcomes: [
      { title: "Flipkart" },
      { title: "Swiggy" },
      { title: "Zomato" },
      { title: "Byju's" },
      { title: "Other" },
    ],
  },
  {
    category: "economy",
    title: "Will India's GDP growth exceed 7% in FY 2026-27?",
    description: "Predict whether India's GDP will grow above 7% in financial year 2026-27",
    endTime: new Date("2027-03-31"),
    outcomes: [
      { title: "Yes - Above 7%" },
      { title: "No - Below 7%" },
    ],
  },
  {
    category: "economy",
    title: "What will be the value of 1 USD in INR by December 2026?",
    description: "Predict the exchange rate of USD to INR by end of 2026",
    endTime: new Date("2026-12-31"),
    outcomes: [
      { title: "Below ₹80" },
      { title: "₹80-85" },
      { title: "₹85-90" },
      { title: "Above ₹90" },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const marketData of SEED_MARKETS) {
    const { outcomes, ...market } = marketData;
    
    const existing = await prisma.market.findFirst({
      where: { title: market.title },
    });

    if (existing) {
      console.log(`Market already exists: ${market.title}`);
      continue;
    }

    const created = await prisma.market.create({
      data: {
        ...market,
        status: "active",
        outcomes: {
          create: outcomes,
        },
      },
    });

    console.log(`Created market: ${created.title}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
