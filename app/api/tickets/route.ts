import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId') || searchParams.get('id');
    if (ticketId) {
      const ticket = db.getTicket(ticketId);
      if (!ticket) {
        return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
      }
      const user = ticket.user_id ? db.getUser(ticket.user_id) : null;
      return NextResponse.json({ success: true, ticket, user });
    }

    const userId = searchParams.get('userId') || undefined;
    const tickets = await db.getTickets(userId);
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;
    const ticket_id = body.ticket_id || body.ticketId;
    const ticket_ids = body.ticket_ids || body.ticketIds;
    const { reply_message, author, user_id, subject, message, priority } = body;

    if (action === 'reply' && ticket_id) {
      const updated = await db.replyToTicket(ticket_id, {
        author: author || 'Support Agent',
        message: reply_message,
        is_staff: true,
      });
      return NextResponse.json({ success: true, message: 'Reply sent successfully', ticket: updated });
    }

    if ((action === 'status' || action === 'update_status' || action === 'close') && ticket_id) {
      const newStatus = action === 'close' ? 'Closed' : (body.status || 'Closed');
      const updated = await db.updateTicketStatus(ticket_id, newStatus);
      return NextResponse.json({ success: true, message: `Ticket status updated to ${newStatus}`, ticket: updated });
    }

    if (action === 'batch_status' && Array.isArray(ticket_ids)) {
      const newStatus = body.status || 'Closed';
      ticket_ids.forEach((id: string) => {
        db.updateTicketStatus(id, newStatus);
      });
      return NextResponse.json({ success: true, message: `Tickets updated to ${newStatus}` });
    }

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: 'Subject and message are required' }, { status: 400 });
    }

    const newTicket = await db.createTicket({
      user_id: user_id || 'usr_guest',
      subject,
      message,
      priority: priority || 'Medium',
    });

    return NextResponse.json({ success: true, message: 'Ticket created successfully', ticket: newTicket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
