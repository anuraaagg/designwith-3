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
    const info = await ytdl.getInfo(videoUrl)
    
    return NextResponse.json({
      title: info.videoDetails.title,
      artist: info.videoDetails.author.name
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching video details' }, { status: 500 })
  }
} 