import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * TypeScript interface for User document
 * Extends Document to include Mongoose document properties
 */
export interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema definition for User
 * Defines the structure and validation rules for user documents
 */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Indexes for optimized queries
 */
UserSchema.index({ email: 1 }); // Index on email for faster lookups

/**
 * Export User model with proper TypeScript typing
 * Uses singleton pattern to prevent model recompilation in development
 */
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
