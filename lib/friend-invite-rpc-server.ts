import { getSupabaseServiceRole } from '@/lib/supabase-service-role';

export type FriendInviteGuestGetResult = {
  ok?: boolean;
  inviterAppUserId?: string;
  nickname?: string | null;
  photoUrl?: string | null;
  gDna?: string | null;
};

export async function rpcFriendInviteShareGuestGet(
  token: string,
): Promise<FriendInviteGuestGetResult> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase.rpc('friend_invite_share_guest_get', {
    p_token: token,
  });
  if (error) throw new Error(error.message);
  return (data ?? { ok: false }) as FriendInviteGuestGetResult;
}
