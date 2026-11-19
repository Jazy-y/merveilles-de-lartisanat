import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

/**
 * Persists an uploaded file and returns the URL to store in the database.
 *
 * - On Vercel (BLOB_READ_WRITE_TOKEN set): Vercel Blob, because the
 *   serverless filesystem is read-only and not persistent.
 * - Locally: the original behaviour, writing to disk.
 */
export async function saveUpload(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  local: { dir: string[]; urlPrefix: string },
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob')
    const blob = await put(`uploads/${fileName}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    })
    return blob.url
  }
  const dir = join(process.cwd(), ...local.dir)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, fileName), buffer)
  return `${local.urlPrefix}/${fileName}`
}
