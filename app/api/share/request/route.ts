import {
  mapAssertTokenError,
  normalizeTokenOrResponse,
  readShareTokenFromApiRequest,
  shareRpcErrorResponse,
} from '@/lib/share-api-http';
import { rpcMeetingShareGuestRequest } from '@/lib/share-rpc-server';

type RequestBody = {
  guestUserId?: string;
  displayName?: string;
  votes?: Record<string, unknown>;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const rawToken = await readShareTokenFromApiRequest(req);
    const tokenOrRes = normalizeTokenOrResponse(rawToken);
    if (tokenOrRes instanceof Response) return tokenOrRes;
    const token = tokenOrRes;

    const body = (await req.json()) as RequestBody;
    const data = await rpcMeetingShareGuestRequest({
      token,
      guestUserId: typeof body.guestUserId === 'string' ? body.guestUserId : '',
      displayName: typeof body.displayName === 'string' ? body.displayName : '',
      votes: body.votes && typeof body.votes === 'object' ? body.votes : {},
      message: typeof body.message === 'string' ? body.message : '',
    });
    return Response.json(data);
  } catch (e) {
    const mapped = mapAssertTokenError(e);
    if (mapped) return mapped;
    const msg = e instanceof Error ? e.message : String(e);
    return shareRpcErrorResponse(msg);
  }
}
