import {
  mapAssertTokenError,
  normalizeTokenOrResponse,
  readShareTokenFromApiRequest,
  shareRpcErrorResponse,
} from '@/lib/share-api-http';
import { enrichMeetingShareGuestGet } from '@/lib/enrich-guest-profile-photos';
import { rpcMeetingShareGuestGet } from '@/lib/share-rpc-server';

export async function POST(req: Request) {
  try {
    const rawToken = await readShareTokenFromApiRequest(req);
    const tokenOrRes = normalizeTokenOrResponse(rawToken);
    if (tokenOrRes instanceof Response) return tokenOrRes;
    const token = tokenOrRes;

    const data = await enrichMeetingShareGuestGet(await rpcMeetingShareGuestGet(token));
    return Response.json(data);
  } catch (e) {
    const mapped = mapAssertTokenError(e);
    if (mapped) return mapped;
    const msg = e instanceof Error ? e.message : String(e);
    return shareRpcErrorResponse(msg);
  }
}
