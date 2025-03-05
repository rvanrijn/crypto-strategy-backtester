import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// Handler for file uploads
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // Validate the file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get the file name and validate extension
    const originalFilename = file.name;
    const fileExtension = path.extname(originalFilename).toLowerCase();
    
    if (fileExtension !== '.csv') {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Generate the path where the file will be saved
    const uploadDir = path.join(process.cwd(), 'public/data');
    const filePath = path.join(uploadDir, originalFilename);

    // Write the file to disk
    await writeFile(filePath, buffer);

    // Verify the file was saved
    return NextResponse.json({
      filename: originalFilename,
      size: buffer.length,
      path: `/data/${originalFilename}`,
      success: true
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file', details: error.message },
      { status: 500 }
    );
  }
}
