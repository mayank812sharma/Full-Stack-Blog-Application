const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

const connectDB = require('../config/db');

const categories = [
  { name: 'Technology', description: 'Latest in tech', color: '#6366f1', icon: '💻' },
  { name: 'Design', description: 'UI/UX and design systems', color: '#f59e0b', icon: '🎨' },
  { name: 'Programming', description: 'Code tutorials and guides', color: '#10b981', icon: '👨‍💻' },
  { name: 'Career', description: 'Career growth and tips', color: '#3b82f6', icon: '🚀' },
  { name: 'Lifestyle', description: 'Life and productivity', color: '#ec4899', icon: '🌱' },
];

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Blog.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    username: 'admin',
    email: 'admin@blogapp.com',
    password: 'Admin@1234',
    role: 'admin',
    bio: 'Platform administrator',
  });

  // Create demo user
  const user = await User.create({
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@blogapp.com',
    password: 'John@1234',
    bio: 'Full Stack Developer | Writer',
  });

  // Create categories
  const cats = await Category.insertMany(categories);

  // Create sample blogs
  const blogs = await Blog.create([
    {
      title: 'Building Scalable APIs with Node.js and Express',
      excerpt: 'Learn how to build production-grade REST APIs using Node.js, Express, and MongoDB with proper architecture.',
      content: `# Building Scalable APIs\n\nBuilding scalable APIs requires careful planning and the right tools.\n\n## Setting Up Express\n\nExpress is a minimal web framework for Node.js...\n\n## Database Design\n\nProper schema design is critical for performance...\n\n## Authentication\n\nJWT-based authentication provides stateless security...\n\nThis is a comprehensive guide to building APIs that scale.`.repeat(5),
      author: user._id,
      category: cats[2]._id,
      tags: ['nodejs', 'express', 'api', 'backend'],
      status: 'published',
      isFeatured: true,
      views: 1200,
    },
    {
      title: 'The Future of Web Development in 2025',
      excerpt: 'Exploring the latest trends shaping the future of web development including AI, edge computing, and more.',
      content: `# The Future of Web Development\n\nWeb development continues to evolve rapidly...\n\n## AI Integration\n\nAI-powered tools are transforming how we write code...\n\n## Edge Computing\n\nRunning code closer to users reduces latency significantly...\n\nExciting times ahead for developers!`.repeat(5),
      author: admin._id,
      category: cats[0]._id,
      tags: ['webdev', 'trends', 'future', 'ai'],
      status: 'published',
      isFeatured: true,
      views: 2500,
    },
    {
      title: 'Design Systems That Scale',
      excerpt: 'How to build and maintain design systems that grow with your product and team.',
      content: `# Design Systems That Scale\n\nA design system is more than a UI library...\n\n## Foundations\n\nStart with design tokens for colors, typography, and spacing...\n\n## Component Library\n\nBuild reusable, accessible components...\n\nInvestment in design systems pays dividends long-term.`.repeat(5),
      author: user._id,
      category: cats[1]._id,
      tags: ['design', 'ui', 'components', 'figma'],
      status: 'published',
      views: 800,
    },
  ]);

  // Create sample comments
  await Comment.create([
    { content: 'Great article! Very informative.', author: admin._id, blog: blogs[0]._id },
    { content: 'This helped me a lot with my project, thanks!', author: user._id, blog: blogs[1]._id },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@blogapp.com / Admin@1234');
  console.log('👤 User: john@blogapp.com / John@1234');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
