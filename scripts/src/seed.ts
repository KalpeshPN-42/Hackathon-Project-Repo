import { db, usersTable, jobsTable } from "@workspace/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const recruiterHash = await bcrypt.hash("password123", 10);
  const studentHash = await bcrypt.hash("password123", 10);
  const adminHash = await bcrypt.hash("password123", 10);

  const [recruiter] = await db
    .insert(usersTable)
    .values({
      email: "recruiter@techcorp.com",
      passwordHash: recruiterHash,
      name: "Sarah Johnson",
      role: "recruiter",
      profileComplete: true,
    })
    .onConflictDoNothing()
    .returning();

  const [student] = await db
    .insert(usersTable)
    .values({
      email: "student@example.com",
      passwordHash: studentHash,
      name: "Alex Kumar",
      role: "student",
      profileComplete: false,
    })
    .onConflictDoNothing()
    .returning();

  await db
    .insert(usersTable)
    .values({
      email: "admin@techpath.com",
      passwordHash: adminHash,
      name: "TechPath Admin",
      role: "admin",
      profileComplete: true,
    })
    .onConflictDoNothing();

  if (recruiter) {
    const jobs = [
      {
        recruiterId: recruiter.id,
        company: "Google",
        title: "Software Engineering Intern",
        description: "Join Google's engineering team for a 12-week summer internship. Work on real products used by billions of people worldwide. You'll collaborate with experienced engineers, attend tech talks, and contribute to meaningful projects.",
        type: "internship" as const,
        location: "Bangalore, India",
        isRemote: false,
        techStack: JSON.stringify(["Python", "Go", "Java", "Kubernetes"]) as any,
        minPay: "80000",
        maxPay: "100000",
        experienceLevel: "fresher" as const,
        requirements: JSON.stringify(["Currently pursuing B.Tech/B.E. in CS or related field", "Strong problem solving skills", "Knowledge of data structures and algorithms"]) as any,
        responsibilities: JSON.stringify(["Build and test new features", "Participate in code reviews", "Collaborate with cross-functional teams"]) as any,
        benefits: JSON.stringify(["Competitive stipend", "Free meals", "Housing allowance", "Return offer opportunity"]) as any,
        openings: 50,
        status: "active" as const,
      },
      {
        recruiterId: recruiter.id,
        company: "Microsoft",
        title: "Frontend Developer",
        description: "Build beautiful, performant web experiences for Microsoft's cloud products. You will work on Azure Portal and related services, ensuring millions of developers have a great experience using Microsoft cloud.",
        type: "fulltime" as const,
        location: "Hyderabad, India",
        isRemote: true,
        techStack: JSON.stringify(["React", "TypeScript", "Azure", "CSS"]) as any,
        minPay: "150000",
        maxPay: "250000",
        experienceLevel: "junior" as const,
        requirements: JSON.stringify(["1-3 years of experience in frontend development", "Strong React.js skills", "Experience with TypeScript", "Understanding of web performance"]) as any,
        responsibilities: JSON.stringify(["Develop and maintain frontend applications", "Write clean, tested code", "Participate in design reviews", "Mentor junior engineers"]) as any,
        benefits: JSON.stringify(["Health insurance", "Stock options", "Remote work flexibility", "Learning budget"]) as any,
        openings: 5,
        status: "active" as const,
      },
      {
        recruiterId: recruiter.id,
        company: "Flipkart",
        title: "Backend Engineer - Data Platform",
        description: "Work on Flipkart's data infrastructure that powers real-time analytics for India's largest e-commerce platform. Handle massive scale challenges and build systems processing millions of events per second.",
        type: "fulltime" as const,
        location: "Bangalore, India",
        isRemote: false,
        techStack: JSON.stringify(["Java", "Kafka", "Spark", "Hadoop", "PostgreSQL"]) as any,
        minPay: "180000",
        maxPay: "300000",
        experienceLevel: "mid" as const,
        requirements: JSON.stringify(["3-5 years of backend development experience", "Strong Java skills", "Experience with distributed systems", "Knowledge of data pipelines"]) as any,
        responsibilities: JSON.stringify(["Design and build data pipelines", "Optimize query performance", "Ensure system reliability", "Write technical documentation"]) as any,
        benefits: JSON.stringify(["ESOP", "Annual bonus", "Health + term insurance", "Flexible hours"]) as any,
        openings: 3,
        status: "active" as const,
      },
      {
        recruiterId: recruiter.id,
        company: "Razorpay",
        title: "Full Stack Developer Intern",
        description: "Be a part of India's leading fintech company. Work on payment infrastructure that processes billions of dollars in transactions. Gain hands-on experience with cutting-edge technologies and real-world scale.",
        type: "internship" as const,
        location: "Bangalore, India",
        isRemote: false,
        techStack: JSON.stringify(["Node.js", "React", "PostgreSQL", "Redis"]) as any,
        minPay: "50000",
        maxPay: "70000",
        experienceLevel: "fresher" as const,
        requirements: JSON.stringify(["Pursuing B.Tech/MCA", "Good understanding of web technologies", "Familiarity with databases"]) as any,
        responsibilities: JSON.stringify(["Build APIs and frontend components", "Write unit tests", "Debug production issues"]) as any,
        benefits: JSON.stringify(["Competitive stipend", "Mentorship", "Pre-placement offer possibility", "Certificate"]) as any,
        openings: 10,
        status: "active" as const,
      },
      {
        recruiterId: recruiter.id,
        company: "Atlassian",
        title: "DevOps Engineer",
        description: "Help Atlassian's teams build and maintain world-class CI/CD infrastructure. You will work on tooling that thousands of internal engineers use every day to ship great software faster.",
        type: "fulltime" as const,
        location: "Remote",
        isRemote: true,
        techStack: JSON.stringify(["AWS", "Terraform", "Docker", "Jenkins", "Python"]) as any,
        minPay: "200000",
        maxPay: "350000",
        experienceLevel: "mid" as const,
        requirements: JSON.stringify(["2-4 years of DevOps/Infrastructure experience", "Strong AWS knowledge", "Experience with IaC tools", "Scripting skills in Python/Bash"]) as any,
        responsibilities: JSON.stringify(["Manage cloud infrastructure", "Automate deployment pipelines", "Improve system reliability", "Incident response"]) as any,
        benefits: JSON.stringify(["100% remote", "Top-tier compensation", "Learning budget", "Team retreats"]) as any,
        openings: 2,
        status: "active" as const,
      },
      {
        recruiterId: recruiter.id,
        company: "Swiggy",
        title: "Machine Learning Engineer",
        description: "Build recommendation systems and demand forecasting models for Swiggy's food delivery platform. Your models directly impact customer experience and operational efficiency across India.",
        type: "fulltime" as const,
        location: "Bangalore, India",
        isRemote: false,
        techStack: JSON.stringify(["Python", "TensorFlow", "PyTorch", "Spark", "MLflow"]) as any,
        minPay: "220000",
        maxPay: "380000",
        experienceLevel: "senior" as const,
        requirements: JSON.stringify(["5+ years of ML engineering experience", "Strong Python skills", "Experience deploying ML models at scale", "Knowledge of recommendation systems"]) as any,
        responsibilities: JSON.stringify(["Design and train ML models", "Deploy models to production", "A/B test experiments", "Collaborate with data scientists"]) as any,
        benefits: JSON.stringify(["ESOPs", "Annual bonus", "Free Swiggy credits", "Health insurance"]) as any,
        openings: 4,
        status: "active" as const,
      },
    ];

    for (const job of jobs) {
      await db.insert(jobsTable).values(job).onConflictDoNothing();
    }
    console.log(`Seeded ${jobs.length} jobs`);
  }

  console.log("Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Student:   student@example.com / password123");
  console.log("  Recruiter: recruiter@techcorp.com / password123");
  console.log("  Admin:     admin@techpath.com / password123");
}

seed().catch(console.error).finally(() => process.exit(0));
