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

  // 3. Create Subjects & Topics with 3 difficulty levels per topic
  const subjectMaster = [
    {
      name: "Quantitative Aptitude",
      topics: [
        { name: "Number System", easy: 35, medium: 25, hard: 12, folder: "QA_NumberSystem" },
        { name: "Ratio, Proportion and Partnership", easy: 28, medium: 20, hard: 10, folder: "QA_Ratio_Prop" },
        { name: "Percentage", easy: 32, medium: 24, hard: 14, folder: "QA_Percentage" },
        { name: "Average", easy: 25, medium: 18, hard: 8, folder: "QA_Average" },
        { name: "Profit and Loss", easy: 30, medium: 22, hard: 12, folder: "QA_Profit_Loss" },
        { name: "Simple and Compound Interest", easy: 24, medium: 18, hard: 10, folder: "QA_Interest" },
        { name: "Time and Work", easy: 28, medium: 20, hard: 10, folder: "QA_Time_Work" },
        { name: "Time, Speed and Distance", easy: 26, medium: 18, hard: 10, folder: "QA_TSD" },
        { name: "Mixtures and Allegations", easy: 22, medium: 15, hard: 8, folder: "QA_Mixtures" },
      ],
    },
    {
      name: "Logical Reasoning",
      topics: [
        { name: "Blood Relations", easy: 30, medium: 22, hard: 10, folder: "LR_Blood_Relations" },
        { name: "Coding and Decoding", easy: 35, medium: 25, hard: 12, folder: "LR_Coding_Decoding" },
        { name: "Seating Arrangement", easy: 25, medium: 30, hard: 20, folder: "LR_Seating_Arrangement" },
        { name: "Syllogism", easy: 28, medium: 24, hard: 14, folder: "LR_Syllogism" },
        { name: "Direction Sense", easy: 32, medium: 20, hard: 8, folder: "LR_Direction_Sense" },
        { name: "Series", easy: 30, medium: 20, hard: 10, folder: "LR_Series" },
        { name: "Puzzles", easy: 20, medium: 25, hard: 18, folder: "LR_Puzzles" },
      ],
    },
    {
      name: "Verbal Ability",
      topics: [
        { name: "Reading Comprehension", easy: 25, medium: 25, hard: 15, folder: "VA_Reading_Comp" },
        { name: "Sentence Correction", easy: 28, medium: 20, hard: 12, folder: "VA_Sentence_Correction" },
        { name: "Para Jumbles", easy: 22, medium: 18, hard: 10, folder: "VA_Para_Jumbles" },
        { name: "Vocabulary", easy: 35, medium: 25, hard: 15, folder: "VA_Vocabulary" },
        { name: "Fill in the Blanks", easy: 30, medium: 20, hard: 10, folder: "VA_Fill_Blanks" },
      ],
    },
    {
      name: "Technical Competency",
      topics: [
        { name: "Data Structures", easy: 35, medium: 28, hard: 18, folder: "TECH_Data_Structures" },
        { name: "Algorithms", easy: 30, medium: 25, hard: 20, folder: "TECH_Algorithms" },
        { name: "Object Oriented Programming", easy: 35, medium: 25, hard: 15, folder: "TECH_OOP" },
        { name: "Database Management Systems", easy: 32, medium: 24, hard: 16, folder: "TECH_DBMS" },
        { name: "Computer Networks", easy: 34, medium: 24, hard: 15, folder: "TECH_Networks" },
        { name: "Operating Systems", easy: 34, medium: 24, hard: 16, folder: "TECH_OS" },
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

    // Create / update topics with their 3 difficulty level counts
    for (const t of s.topics) {
      const topicCode = `TOP-${String(topicCounter).padStart(5, "0")}`;
      topicCounter++;

      await prisma.topic.upsert({
        where: {
          subjectId_name: {
            subjectId: subject.id,
            name: t.name,
          },
        },
        update: {
          easyCount: t.easy,
          mediumCount: t.medium,
          hardCount: t.hard,
          folderName: t.folder,
        },
        create: {
          topicCode,
          name: t.name,
          subjectId: subject.id,
          easyCount: t.easy,
          mediumCount: t.medium,
          hardCount: t.hard,
          folderName: t.folder,
          createdBy: superadmin.id,
        },
      });
    }
  }

  console.log("✅ Master Subjects and Topics created with individual Easy, Medium, and Hard inventory counts.");

  // Add initial Audit Log
  await prisma.auditLog.create({
    data: {
      entityType: "MASTER_DATA",
      entityId: "SYSTEM_INIT",
      action: "CREATE",
      changeDescription: "Initial system seeding with master data, topics, and initial difficulty levels.",
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
