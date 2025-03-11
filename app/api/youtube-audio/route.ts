import { NextResponse } from 'next/server'
import ytdl from 'ytdl-core'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return new NextResponse('Missing video ID', { status: 400 })
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${id}`
    const stream = ytdl(videoUrl, { filter: 'audioonly' })
    
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'audio/mp4',
      },
    })
  } catch (error) {
    return new NextResponse('Error streaming audio', { status: 500 })
  }
} 