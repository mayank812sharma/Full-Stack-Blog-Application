const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [50, 'Content must be at least 50 characters'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 0 }, // in minutes
    isFeatured: { type: Boolean, default: false },
    meta: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: comment count
blogSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true,
});

// Virtual: like count
blogSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });
blogSchema.index({ title: 'text', content: 'text', tags: 'text', excerpt: 'text' });

// ─── Pre-save: generate slug + readTime ──────────────────────────────────────
blogSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    let slug = slugify(this.title, { lower: true, strict: true });
    // Ensure uniqueness
    const existing = await mongoose.model('Blog').findOne({ slug, _id: { $ne: this._id } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
    this.slug = slug;
  }

  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200); // avg reading speed
  }

  next();
});

module.exports = mongoose.model('Blog', blogSchema);
