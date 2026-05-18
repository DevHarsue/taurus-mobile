import React from 'react';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { useMyMemberDetail } from '@features/members/hooks/useMyMemberDetail';
import CompleteProfileScreen from '@features/profile/screens/CompleteProfileScreen';
import MemberTabs from './MemberTabs';

export default function MemberShell() {
  const { data: myMember, loading, refetch } = useMyMemberDetail();

  if (loading && !myMember) return <LoadingSpinner />;

  if (myMember && !myMember.cedula) {
    return <CompleteProfileScreen onCompleted={refetch} />;
  }

  return <MemberTabs />;
}
