import {
  mapAssertTokenError,
  normalizeTokenOrResponse,
  readShareTokenFromApiRequest,
  shareRpcErrorResponse,
} from '@/lib/share-api-http';
import { rpcMeetingShareGuestJoin } from '@/lib/share-rpc-server';

type JoinBody = {
  guestUserId?: string;
  displayName?: string;
  votes?: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const rawToken = await readShareTokenFromApiRequest(req);
    const tokenOrRes = normalizeTokenOrResponse(rawToken);
    if (tokenOrRes instanceof Response) return tokenOrRes;
    const token = tokenOrRes;

    const body = (await req.json()) as JoinBody;
    const data = await rpcMeetingShareGuestJoin({
      token,
      guestUserId: typeof body.guestUserId === 'string' ? body.guestUserId : '',
      displayName: typeof body.displayName === 'string' ? body.displayName : '',
      votes: body.votes && typeof body.votes === 'object' ? body.votes : {},
    });
    return Response.json(data);
  } catch (e) {
    const mapped = mapAssertTokenError(e);
    if (mapped) return mapped;
    const msg = e instanceof Error ? e.message : String(e);
    return shareRpcErrorResponse(msg);
  }
}
