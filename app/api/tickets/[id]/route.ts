import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = db.getTicket(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }
    const user = ticket.user_id ? db.getUser(ticket.user_id) : null;
    return NextResponse.json({ success: true, ticket, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, reply_message, author, status, priority } = body;

    const ticket = db.getTicket(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    if (action === 'reply') {
      if (!reply_message || !reply_message.trim()) {
        return NextResponse.json({ success: false, error: 'Reply message cannot be empty' }, { status: 400 });
      }
      const updated = db.replyToTicket(ticket.id, {
        author: author || 'Support Staff',
        message: reply_message.trim(),
        is_staff: true,
      });
      // Automatically set status to Answered
      if (updated && updated.status !== 'Closed') {
        db.updateTicketStatus(ticket.id, 'Answered' as any);
      }
      return NextResponse.json({ success: true, message: 'Reply sent successfully', ticket: updated });
    }

    if (action === 'status' && status) {
      const updated = db.updateTicketStatus(ticket.id, status);
      return NextResponse.json({ success: true, message: `Status updated to ${status}`, ticket: updated });
    }

    if (action === 'priority' && priority) {
      ticket.priority = priority;
      db.persist();
      return NextResponse.json({ success: true, message: `Priority updated to ${priority}`, ticket });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

