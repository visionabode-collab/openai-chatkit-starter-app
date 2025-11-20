export const runtime = "edge";

export async function GET(): Promise<Response> {
  try {
    // Get current time in Trinidad & Tobago timezone
    const now = new Date();
    const trinidadTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Port_of_Spain',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Port_of_Spain',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).formatToParts(now);

    const weekday = parts.find(p => p.type === 'weekday')?.value || '';
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

    return new Response(
      JSON.stringify({
        current_time: trinidadTime,
        day_of_week: weekday,
        hour_24: hour,
        minute: minute,
        timezone: 'America/Port_of_Spain'
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Get current time error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get current time' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(): Promise<Response> {
  return GET();
}
