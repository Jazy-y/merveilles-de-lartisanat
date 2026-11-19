import { NextRequest, NextResponse } from 'next/server';
import { saveUpload } from '@/lib/storage';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';
import { fileTypeFromBuffer } from 'file-type';

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role for file uploads
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const data = await req.formData();
    const files: File[] = data.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      // Basic MIME type validation
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} not allowed. Only images are permitted.` 
        }, { status: 400 });
      }
      
      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum size is 5MB.` 
        }, { status: 400 });
      }
    }

    const filePaths: string[] = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Enhanced content validation
        const fileType = await fileTypeFromBuffer(buffer);
        if (!fileType || !allowedTypes.includes(fileType.mime)) {
          return NextResponse.json({ 
            error: `Invalid file content. Expected image, got ${fileType?.mime || 'unknown'}` 
          }, { status: 400 });
        }

        // Validate image dimensions using sharp
        try {
          const sharp = require('sharp');
          const metadata = await sharp(buffer).metadata();
          
          if (metadata.width && metadata.height) {
            if (metadata.width > 4000 || metadata.height > 4000) {
              return NextResponse.json({ 
                error: `Image too large. Maximum dimensions: 4000x4000px. Got: ${metadata.width}x${metadata.height}` 
              }, { status: 400 });
            }
          }
        } catch (sharpError) {
          if (process.env.NODE_ENV === 'development') console.error('Sharp validation error:', sharpError);
          return NextResponse.json({ 
            error: `Invalid image file: ${file.name}` 
          }, { status: 400 });
        }

        // Generate secure filename
        const fileExtension = fileType.ext || file.name.split('.').pop()?.toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        // Vercel Blob in production; locally a secure folder served through /api/uploads
        const url = await saveUpload(buffer, fileName, fileType.mime, {
          dir: ['uploads', 'secure'],
          urlPrefix: '/api/uploads',
        });
        filePaths.push(url);
      } catch (fileError) {
        if (process.env.NODE_ENV === 'development') console.error(`Error processing file ${file.name}:`, fileError);
        return NextResponse.json({ 
          error: `Failed to process file ${file.name}` 
        }, { status: 500 });
      }
    }

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.UPLOAD_FILE,
      undefined,
      { 
        fileCount: filePaths.length,
        filePaths: filePaths,
        fileNames: files.map(f => f.name)
      }
    );

    return NextResponse.json({ 
      success: true,
      filePaths,
      message: `${filePaths.length} file(s) uploaded successfully`
    }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error uploading files:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
