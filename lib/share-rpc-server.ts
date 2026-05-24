import { getSupabaseServiceRole } from '@/lib/supabase-service-role';

export type GuestGetResult = {
  meeting?: Record<string, unknown>;
  requiresHostApproval?: boolean;
};

export async function rpcMeetingShareGuestGet(token: string): Promise<GuestGetResult> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase.rpc('meeting_share_guest_get', { p_token: token });
  if (error) throw new Error(error.message);
  return (data ?? {}) as GuestGetResult;
}

export async function rpcMeetingShareAssertValidToken(token: string): Promise<void> {
  const supabase = getSupabaseServiceRole();
  const { error } = await supabase.rpc('meeting_share_assert_valid_share_token', { p_token: token });
  if (error) throw new Error(error.message);
}

export async function rpcMeetingShareGuestJoin(params: {
  token: string;
  guestUserId: string;
  displayName: string;
  votes: Record<string, unknown>;
}): Promise<Record<string, unknown>> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase.rpc('meeting_share_guest_join', {
    p_token: params.token,
    p_guest_user_id: params.guestUserId,
    p_display_name: params.displayName,
    p_votes: params.votes,
  });
  if (error) throw new Error(error.message);
  return (data ?? {}) as Record<string, unknown>;
}

export async function rpcMeetingShareGuestRequest(params: {
  token: string;
  guestUserId: string;
  displayName: string;
  votes: Record<string, unknown>;
  message: string;
}): Promise<Record<string, unknown>> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase.rpc('meeting_share_guest_request', {
    p_token: params.token,
    p_guest_user_id: params.guestUserId,
    p_display_name: params.displayName,
    p_votes: params.votes,
    p_message: params.message,
  });
  if (error) throw new Error(error.message);
  return (data ?? {}) as Record<string, unknown>;
}

export async function rpcMeetingShareGuestLeave(params: {
  token: string;
  guestUserId: string;
  guestLeaveSecret: string;
}): Promise<void> {
  const supabase = getSupabaseServiceRole();
  const { error } = await supabase.rpc('meeting_share_guest_leave', {
    p_token: params.token,
    p_guest_user_id: params.guestUserId,
    p_guest_leave_secret: params.guestLeaveSecret,
  });
  if (error) throw new Error(error.message);
}
