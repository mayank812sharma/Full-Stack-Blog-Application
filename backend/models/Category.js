const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: [200, 'Description cannot exceed 200 characters'], default: '' },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '📝' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual('blogCount', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'category',
  count: true,
  match: { status: 'published' },
});

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
