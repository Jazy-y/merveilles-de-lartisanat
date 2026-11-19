import { NextRequest, NextResponse } from 'next/server';
import { saveUpload } from '@/lib/storage';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';

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

    // Validate file types and sizes for videos
    const allowedTypes = [
      'video/mp4', 
      'video/webm', 
      'video/ogg', 
      'video/avi', 
      'video/mov', 
      'video/wmv',
      'video/quicktime', // Alternative MIME type for .mov files
      'video/x-msvideo', // Alternative MIME type for .avi files
      'video/x-ms-wmv'   // Alternative MIME type for .wmv files
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB for videos

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        if (process.env.NODE_ENV === 'development') console.error(`File type validation failed: ${file.type} not in allowed types:`, allowedTypes);
        return NextResponse.json({ 
          error: `File type ${file.type} not allowed. Only video files are permitted. Allowed types: ${allowedTypes.join(', ')}` 
        }, { status: 400 });
      }
      
      if (file.size > maxSize) {
        if (process.env.NODE_ENV === 'development') console.error(`File size validation failed: ${file.name} is ${file.size} bytes, max allowed: ${maxSize} bytes`);
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum size is 100MB.` 
        }, { status: 400 });
      }
    }

    const filePaths: string[] = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const fileName = `video-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        // Vercel Blob in production; locally public/uploads
        const url = await saveUpload(buffer, fileName, file.type || 'video/mp4', {
          dir: ['public', 'uploads'],
          urlPrefix: '/uploads',
        });
        filePaths.push(url);
      } catch (fileError) {
        if (process.env.NODE_ENV === 'development') console.error(`Error processing video file ${file.name}:`, fileError);
        return NextResponse.json({ 
          error: `Failed to process video file ${file.name}` 
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
        fileNames: files.map(f => f.name),
        fileType: 'video'
      }
    );

    return NextResponse.json({ 
      success: true,
      filePaths,
      message: `${filePaths.length} video file(s) uploaded successfully`
    }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error uploading video files:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
