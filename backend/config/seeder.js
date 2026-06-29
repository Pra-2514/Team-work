const User = require("../models/User");
const Category = require("../models/Category");
const Service = require("../models/Service");
const Pricing = require("../models/Pricing");

const seedDatabase = async () => {
  try {
    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found. Seeding initial users...");
      await User.create([
        {
          name: "Owner User",
          email: "owner@codeadda.dev",
          password: "owner123",
          role: "owner",
          bio: "Founding Owner of Code Adda Studio.",
        },
        {
          name: "Admin User",
          email: "admin@codeadda.dev",
          password: "admin123",
          role: "admin",
          bio: "Managing Administrator.",
        },
        {
          name: "Developer User",
          email: "dev@codeadda.dev",
          password: "dev123",
          role: "developer",
          bio: "Full Stack Engineer & Tech Developer.",
        },
        {
          name: "Test Client",
          email: "user@codeadda.dev",
          password: "password123",
          role: "client",
          bio: "Default Test Client Account.",
        },
      ]);
      console.log("Users seeded successfully!");
    }

    // 2. Seed Categories and Services if empty
    const categoryCount = await Category.countDocuments();
    let webCat, mobileCat, designCat, marketingCat, aiCat;

    if (categoryCount === 0) {
      console.log("No categories found. Seeding categories...");
      webCat = await Category.create({ name: "Web Development", description: "Business and personal websites" });
      mobileCat = await Category.create({ name: "Mobile App Development", description: "Android and iOS applications" });
      designCat = await Category.create({ name: "Creative Design", description: "UI/UX, logo, graphic and video production" });
      marketingCat = await Category.create({ name: "Digital Marketing & SEO", description: "Growth hacking and optimizations" });
      aiCat = await Category.create({ name: "AI & Automation", description: "Workflows and machine learning integration" });
      console.log("Categories seeded successfully!");
    } else {
      webCat = await Category.findOne({ name: "Web Development" });
      mobileCat = await Category.findOne({ name: "Mobile App Development" });
      designCat = await Category.findOne({ name: "Creative Design" });
      marketingCat = await Category.findOne({ name: "Digital Marketing & SEO" });
      aiCat = await Category.findOne({ name: "AI & Automation" });
    }

    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0 && webCat && mobileCat && designCat && marketingCat && aiCat) {
      console.log("No services found. Seeding services...");
      await Service.create([
        {
          name: "Business Websites",
          description: "Conversion-focused company sites that load fast and look premium.",
          category: webCat._id,
          startingPrice: 29999,
          estimatedDelivery: "7-14 Days",
          technologies: ["React", "Next.js", "TailwindCSS"],
        },
        {
          name: "Portfolio Websites",
          description: "Personal & creative portfolios that make recruiters stop scrolling.",
          category: webCat._id,
          startingPrice: 9999,
          estimatedDelivery: "5-7 Days",
          technologies: ["React", "Framer Motion", "Vanilla CSS"],
        },
        {
          name: "E-commerce",
          description: "Stores built to sell — carts, payments, dashboards, the works.",
          category: webCat._id,
          startingPrice: 49999,
          estimatedDelivery: "14-21 Days",
          technologies: ["Next.js", "Node.js", "MongoDB", "Stripe"],
        },
        {
          name: "Android App Dev",
          description: "Native & cross-platform Android apps that feel buttery smooth.",
          category: mobileCat._id,
          startingPrice: 39999,
          estimatedDelivery: "21-30 Days",
          technologies: ["Flutter", "Kotlin", "Firebase"],
        },
        {
          name: "iOS App Dev",
          description: "Elegant iOS apps engineered for performance and the App Store.",
          category: mobileCat._id,
          startingPrice: 49999,
          estimatedDelivery: "21-30 Days",
          technologies: ["Swift", "Flutter", "Cocoapods"],
        },
        {
          name: "UI / UX Design",
          description: "Research-driven interfaces that users love and remember.",
          category: designCat._id,
          startingPrice: 14999,
          estimatedDelivery: "7-10 Days",
          technologies: ["Figma", "Adobe XD"],
        },
        {
          name: "Video Editing",
          description: "Reels, ads, and brand films cut for maximum impact.",
          category: designCat._id,
          startingPrice: 4999,
          estimatedDelivery: "3-5 Days",
          technologies: ["Premiere Pro", "After Effects"],
        },
        {
          name: "Graphic Design",
          description: "Logos, posters & social posts that define your visual identity.",
          category: designCat._id,
          startingPrice: 2999,
          estimatedDelivery: "2-4 Days",
          technologies: ["Photoshop", "Illustrator", "Figma"],
        },
        {
          name: "Digital Marketing",
          description: "Campaigns that turn attention into measurable growth.",
          category: marketingCat._id,
          startingPrice: 19999,
          estimatedDelivery: "Monthly Retainer",
          technologies: ["Google Ads", "Meta Ads", "Analytics"],
        },
        {
          name: "SEO Services",
          description: "Rank higher, get found, and own your search results.",
          category: marketingCat._id,
          startingPrice: 9999,
          estimatedDelivery: "14-30 Days",
          technologies: ["Ahrefs", "Semrush", "Google Search Console"],
        },
        {
          name: "Content Creation",
          description: "Words & visuals that tell your story and drive action.",
          category: marketingCat._id,
          startingPrice: 7999,
          estimatedDelivery: "5-7 Days",
          technologies: ["Copywriting", "Canva", "AI Writing Assistants"],
        },
        {
          name: "AI & Automation",
          description: "Custom AI agents & workflows that save you hours every week.",
          category: aiCat._id,
          startingPrice: 34999,
          estimatedDelivery: "14-21 Days",
          technologies: ["Python", "OpenAI API", "Langchain", "Make.com"],
        },
      ]);
      console.log("Services seeded successfully!");
    }

    // 3. Seed Pricing Plans if empty
    const pricingCount = await Pricing.countDocuments();
    if (pricingCount === 0) {
      console.log("No pricing plans found. Seeding pricing plans...");
      await Pricing.create([
        {
          name: "Starter",
          price: "₹9,999",
          period: "/ project",
          tagline: "For individuals & personal brands",
          features: ["1-3 page website", "Responsive design", "Basic SEO setup", "1 round of revisions", "Delivery in 5-7 days"],
          accent: "#A1A1AA",
          highlight: false,
        },
        {
          name: "Pro",
          price: "₹29,999",
          period: "/ project",
          tagline: "For startups & growing businesses",
          features: ["Up to 8 custom pages", "UI/UX + brand kit", "CMS / e-commerce ready", "Advanced SEO", "3 rounds of revisions", "30 days support"],
          accent: "#00F0FF",
          highlight: true,
        },
        {
          name: "Elite",
          price: "Custom",
          period: "/ retainer",
          tagline: "For scale-ups & full digital partnerships",
          features: ["Web + Mobile + AI", "Dedicated team", "Video & content production", "Marketing & SEO retainer", "Unlimited revisions", "Priority 24/7 support"],
          accent: "#FF003C",
          highlight: false,
        },
      ]);
      console.log("Pricing plans seeded successfully!");
    }
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
  }
};

module.exports = seedDatabase;
