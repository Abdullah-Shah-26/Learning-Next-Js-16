import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/lib/models/User.model';

/**
 * GET /api/users
 * Retrieves all users from the database
 * 
 * @returns {Promise<NextResponse>} JSON response with users array or error
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Establish database connection
    await connectDB();

    // Fetch all users from database
    const users = await User.find({}).select('-__v').lean();

    return NextResponse.json(
      {
        success: true,
        data: users,
        count: users.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Creates a new user in the database
 * 
 * @param {NextRequest} request - Next.js request object containing user data
 * @returns {Promise<NextResponse>} JSON response with created user or error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Establish database connection
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and email are required',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await User.create({ name, email });

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
      },
      { status: 500 }
    );
  }
}
