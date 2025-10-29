import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event schema definition with validation rules
 */
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: function (arr: string[]) {
          return arr.length > 0;
        },
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: function (arr: string[]) {
          return arr.length > 0;
        },
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook to generate slug and normalize date/time
 * Runs before document is saved to database
 */
EventSchema.pre('save', async function (next) {
  // Generate slug only if title is new or modified
  if (this.isModified('title')) {
    const baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    let uniqueSlug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness by appending counter if needed
    while (await mongoose.models.Event.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
  }

  // Normalize and validate date format
  if (this.isModified('date')) {
    const dateStr = this.date.trim();
    
    // Try to parse and normalize date to ISO format
    const parsedDate = new Date(dateStr);
    
    if (isNaN(parsedDate.getTime())) {
      // If not parseable, keep original but validate it's not empty
      if (!dateStr) {
        return next(new Error('Date cannot be empty'));
      }
    }
  }

  // Normalize time format (trim whitespace)
  if (this.isModified('time')) {
    this.time = this.time.trim();
    
    if (!this.time) {
      return next(new Error('Time cannot be empty'));
    }
  }

  next();
});

/**
 * Indexes for optimized queries
 */
EventSchema.index({ slug: 1 }); // Unique index on slug
EventSchema.index({ date: 1 }); // Index for date-based queries
EventSchema.index({ tags: 1 }); // Index for tag-based filtering
EventSchema.index({ mode: 1 }); // Index for mode filtering

/**
 * Export Event model with singleton pattern
 * Prevents model recompilation in development
 */
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
