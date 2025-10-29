import mongoose, { Schema, Model, Document, Types } from 'mongoose';

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking schema definition with validation rules
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook to verify that referenced event exists
 * Prevents orphaned bookings with invalid event references
 */
BookingSchema.pre('save', async function (next) {
  // Only validate eventId if it's new or modified
  if (this.isNew || this.isModified('eventId')) {
    try {
      // Check if Event model exists to avoid circular dependency issues
      const EventModel = mongoose.models.Event;
      
      if (!EventModel) {
        return next(new Error('Event model not found. Ensure Event model is registered.'));
      }

      // Verify the event exists in database
      const eventExists = await EventModel.findById(this.eventId).select('_id').lean();

      if (!eventExists) {
        return next(new Error(`Event with ID ${this.eventId} does not exist`));
      }
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

/**
 * Indexes for optimized queries
 */
BookingSchema.index({ eventId: 1 }); // Index for fast event-based lookups
BookingSchema.index({ email: 1 }); // Index for email-based queries
BookingSchema.index({ eventId: 1, email: 1 }); // Compound index for duplicate prevention

/**
 * Export Booking model with singleton pattern
 * Prevents model recompilation in development
 */
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
