# MongoDB Setup Guide

## Overview
This project uses MongoDB with Mongoose ODM for database operations in a Next.js application with full TypeScript support.

## Files Created

### 1. `lib/mongoose.ts`
Core database connection module with singleton pattern to prevent multiple connections.

**Key Features:**
- ✅ Singleton connection pattern
- ✅ Hot-reload safe (caches connection in development)
- ✅ Production-ready with connection pooling
- ✅ Full TypeScript support (no `any` types)
- ✅ Proper error handling
- ✅ Helper functions: `connectDB()`, `disconnectDB()`, `isConnected()`

### 2. `lib/models/User.model.ts`
Example model demonstrating best practices for Mongoose models with TypeScript.

**Key Features:**
- ✅ TypeScript interfaces extending Mongoose Document
- ✅ Proper validation rules
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Indexed fields for performance
- ✅ Model recompilation prevention

### 3. `app/api/users/route.ts`
Example API route showing how to use the database connection.

**Endpoints:**
- `GET /api/users` - Fetch all users
- `POST /api/users` - Create a new user

## Environment Setup

### Step 1: Configure Environment Variables

Add the following to your `.env` or `.env.local` file:

```env
# MongoDB Connection String
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/your-database-name

# Or MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
```

### Step 2: Install Dependencies (Already Installed)

```bash
npm install mongoose
# or
pnpm add mongoose
# or
yarn add mongoose
```

✅ Mongoose v8.19.2 is already installed in your project.

## Usage Examples

### Basic Connection in API Route

```typescript
import connectDB from '@/lib/mongoose';
import User from '@/lib/models/User.model';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({});
    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}
```

### Creating a New Model

```typescript
import mongoose, { Schema, Model, Document } from 'mongoose';

// Define interface
export interface IProduct extends Document {
  name: string;
  price: number;
  inStock: boolean;
}

// Create schema
const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

// Export model
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
```

### Server Actions (React Server Components)

```typescript
'use server'

import connectDB from '@/lib/mongoose';
import User from '@/lib/models/User.model';

export async function getUsers() {
  try {
    await connectDB();
    const users = await User.find({}).lean();
    return { success: true, users };
  } catch (error) {
    return { success: false, error: 'Failed to fetch users' };
  }
}
```

## Connection Management

### Check Connection Status

```typescript
import { isConnected } from '@/lib/mongoose';

if (isConnected()) {
  console.log('Database is connected');
}
```

### Manual Disconnect (Testing/Cleanup)

```typescript
import { disconnectDB } from '@/lib/mongoose';

await disconnectDB();
```

## Best Practices

### ✅ Do's

1. **Always use the singleton pattern** - Prevents multiple connections
2. **Use `.lean()`** for read-only operations - Better performance
3. **Add indexes** to frequently queried fields
4. **Use TypeScript interfaces** - Better type safety
5. **Handle errors properly** - Always use try-catch blocks
6. **Validate input** before database operations

### ❌ Don'ts

1. **Don't create new connections** in every request
2. **Don't use `any` type** - Defeats TypeScript purpose
3. **Don't forget to validate** user input
4. **Don't expose sensitive data** in API responses
5. **Don't hardcode** connection strings

## Connection Options Explained

```typescript
const options: ConnectOptions = {
  bufferCommands: false,           // Disable buffering for faster failure
  maxPoolSize: 10,                 // Max concurrent connections
  serverSelectionTimeoutMS: 5000,  // Timeout for server selection
  socketTimeoutMS: 45000,          // Socket inactivity timeout
};
```

## Troubleshooting

### Connection Errors

**Problem:** `MongooseError: Operation buffering timed out`
**Solution:** Check if `MONGODB_URI` is correct and MongoDB server is running

**Problem:** `MONGODB_URI is not defined`
**Solution:** Add `MONGODB_URI` to your `.env` file

**Problem:** Multiple connection warnings in development
**Solution:** The singleton pattern handles this - warnings are normal in dev mode

### Performance Issues

- Add indexes to frequently queried fields
- Use `.lean()` for read-only operations
- Use `.select()` to limit returned fields
- Implement pagination for large datasets

## MongoDB Atlas Setup (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string
6. Replace `<username>`, `<password>`, and `<database>` in the connection string
7. Add to `.env` file

## Testing the Setup

### Test API Route

```bash
# GET all users
curl http://localhost:3000/api/users

# POST new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### Test in Browser Console

```javascript
// Create user
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com' })
})
.then(res => res.json())
.then(console.log);

// Get users
fetch('/api/users')
.then(res => res.json())
.then(console.log);
```

## Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Mongoose and Next.js documentation
3. Verify environment variables are set correctly
4. Check MongoDB server/Atlas connection status
