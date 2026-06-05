import {
  mapAssertTokenError,
  normalizeTokenOrResponse,
  readShareTokenFromApiRequest,
  shareRpcErrorResponse,
} from '@/lib/share-api-http';
import { enrichFriendInviteShareGuestGet } from '@/lib/enrich-guest-profile-photos';
import { rpcFriendInviteShareGuestGet } from '@/lib/friend-invite-rpc-server';

export async function POST(req: Request) {
  try {
    const rawToken = await readShareTokenFromApiRequest(req);
    const tokenOrRes = normalizeTokenOrResponse(rawToken);
    if (tokenOrRes instanceof Response) return tokenOrRes;
    const token = tokenOrRes;

    const data = await enrichFriendInviteShareGuestGet(await rpcFriendInviteShareGuestGet(token));
    return Response.json(data);
  } catch (e) {
    const mapped = mapAssertTokenError(e);
    if (mapped) return mapped;
    const msg = e instanceof Error ? e.message : String(e);
    return shareRpcErrorResponse(msg);
  }
}
