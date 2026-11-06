import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create Default Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  const superadmin = await prisma.user.upsert({
    where: { email: "admin@truskill.com" },
    update: {},
    create: {
      email: "admin@truskill.com",
      name: "Truskill Superadmin",
      passwordHash: adminPassword,
      role: "SUPERADMIN",
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "staff@truskill.com" },
    update: {},
    create: {
      email: "staff@truskill.com",
      name: "Operations Staff",
      passwordHash: staffPassword,
      role: "STAFF",
    },
  });

  console.log("✅ Users created: admin@truskill.com, staff@truskill.com");

  // 2. Create Colleges from PRD Section 7.2
  const collegesData = [
    { name: "D. Y. Patil College of Engineering", code: "DYPCOE" },
    { name: "Symbiosis Skills and Professional University", code: "SBUP" },
    { name: "JSPM Rajarshi Shahu College of Engineering", code: "JSPM" },
  ];

  for (const c of collegesData) {
    const college = await prisma.college.upsert({
      where: { code: c.code },
      update: {},
      create: {
        name: c.name,
        code: c.code,
        createdBy: superadmin.id,
      },
    });

    // Ensure naming sequences exist for both TR and RG categories
    for (const category of ["TR", "RG"]) {
      await prisma.namingSequence.upsert({
        where: {
          collegeId_category: {
            collegeId: college.id,
            category,
          },
        },
        update: {},
        create: {
          collegeId: college.id,
          category,
          currentSequence: 0,
        },
      });
    }
  }

  console.log("✅ Master Colleges and Naming Sequences created.");

  // 3. Create Subjects & Topics from PRD Section 6.2
  const subjectMaster = [
    {
      name: "Quantitative Aptitude",
      topics: [
        "Number System",
        "Ratio, Proportion and Partnership",
        "Percentage",
        "Average",
        "Profit and Loss",
        "Simple and Compound Interest",
        "Time and Work",
        "Time, Speed and Distance",
        "Mixtures and Allegations",
      ],
      inventory: [
        { level: "I_EASY", count: 250, folder: "QuantitativeAptitude_Beginner" },
        { level: "II_MEDIUM", count: 180, folder: "QuantitativeAptitude_Intermediate" },
        { level: "III_HARD", count: 90, folder: "QuantitativeAptitude_Advanced" },
      ],
    },
    {
      name: "Logical Reasoning",
      topics: [
        "Blood Relations",
        "Coding and Decoding",
        "Seating Arrangement",
        "Syllogism",
        "Direction Sense",
        "Series",
        "Puzzles",
      ],
      inventory: [
        { level: "I_EASY", count: 180, folder: "LogicalReasoning_Level1" },
        { level: "II_MEDIUM", count: 150, folder: "LogicalReasoning_Level2" },
        { level: "III_HARD", count: 80, folder: "LogicalReasoning_Level3" },
      ],
    },
    {
      name: "Verbal Ability",
      topics: [
        "Reading Comprehension",
        "Sentence Correction",
        "Para Jumbles",
        "Vocabulary",
        "Fill in the Blanks",
      ],
      inventory: [
        { level: "I_EASY", count: 120, folder: "VerbalAbility_Easy" },
        { level: "II_MEDIUM", count: 100, folder: "VerbalAbility_Medium" },
        { level: "III_HARD", count: 60, folder: "VerbalAbility_Hard" },
      ],
    },
    {
      name: "Technical Competency",
      topics: [
        "Data Structures",
        "Algorithms",
        "Object Oriented Programming",
        "Database Management Systems",
        "Computer Networks",
        "Operating Systems",
      ],
      inventory: [
        { level: "I_EASY", count: 200, folder: "Technical_Easy" },
        { level: "II_MEDIUM", count: 150, folder: "Technical_Medium" },
        { level: "III_HARD", count: 100, folder: "Technical_Hard" },
      ],
    },
  ];

  let topicCounter = 1;

  for (const s of subjectMaster) {
    const subject = await prisma.subject.upsert({
      where: { name: s.name },
      update: {},
      create: {
        name: s.name,
        createdBy: superadmin.id,
      },
    });

    // Create topics
    for (const topicName of s.topics) {
      const topicCode = `TOP-${String(topicCounter).padStart(5, "0")}`;
      topicCounter++;

      const existingTopic = await prisma.topic.findFirst({
        where: { subjectId: subject.id, name: topicName },
      });

      if (!existingTopic) {
        await prisma.topic.create({
          data: {
            topicCode,
            name: topicName,
            subjectId: subject.id,
            createdBy: superadmin.id,
          },
        });
      }
    }

    // Create 3 difficulty inventory records
    for (const inv of s.inventory) {
      await prisma.questionBankInventory.upsert({
        where: {
          subjectId_difficultyLevel: {
            subjectId: subject.id,
            difficultyLevel: inv.level,
          },
        },
        update: {
          questionCount: inv.count,
          folderName: inv.folder,
        },
        create: {
          subjectId: subject.id,
          difficultyLevel: inv.level,
          questionCount: inv.count,
          folderName: inv.folder,
          lastUpdatedBy: superadmin.id,
        },
      });
    }
  }

  console.log("✅ Master Subjects, Topics, and Initial Question Bank Inventories created.");

  // Add initial Audit Log
  await prisma.auditLog.create({
    data: {
      entityType: "MASTER_DATA",
      entityId: "SYSTEM_INIT",
      action: "CREATE",
      changeDescription: "Initial system seeding with master data and default users.",
      changedBy: superadmin.id,
    },
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
