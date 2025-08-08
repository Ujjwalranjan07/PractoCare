import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read the db.json file
function readDbFile() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// GET handler for the root API endpoint
export async function GET(request: NextRequest) {
  try {
    const data = readDbFile();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return NextResponse.json(
      { error: 'Failed to read database' },
      { status: 500 }
    );
  }
}