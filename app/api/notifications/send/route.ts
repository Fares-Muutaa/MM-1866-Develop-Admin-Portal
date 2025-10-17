// app/api/notifications/send/route.ts
import { NextResponse } from 'next/server';
import { notifications } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { db } from '@/lib/db/dbpostgres';

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  
  const newNotification = await db.insert(notifications).values({
    user_id: user.id,
    type_id: body.type_id,
    title: body.title,
    message: body.message,
    redirect_url: body.redirect_url,
    data: body.data,
  }).returning();

  return NextResponse.json(newNotification[0]);
}
