import {
  mapAssertTokenError,
  normalizeTokenOrResponse,
  readShareTokenFromApiRequest,
  shareRpcErrorResponse,
} from '@/lib/share-api-http';
import { rpcMeetingShareGuestLeave } from '@/lib/share-rpc-server';

type LeaveBody = {
  guestUserId?: string;
  guestLeaveSecret?: string;
};

export async function POST(req: Request) {
  try {
    const rawToken = await readShareTokenFromApiRequest(req);
    const tokenOrRes = normalizeTokenOrResponse(rawToken);
    if (tokenOrRes instanceof Response) return tokenOrRes;
    const token = tokenOrRes;

    const body = (await req.json()) as LeaveBody;
    await rpcMeetingShareGuestLeave({
      token,
      guestUserId: typeof body.guestUserId === 'string' ? body.guestUserId : '',
      guestLeaveSecret: typeof body.guestLeaveSecret === 'string' ? body.guestLeaveSecret : '',
    });
    return Response.json({ ok: true });
  } catch (e) {
    const mapped = mapAssertTokenError(e);
    if (mapped) return mapped;
    const msg = e instanceof Error ? e.message : String(e);
    return shareRpcErrorResponse(msg);
  }
}
