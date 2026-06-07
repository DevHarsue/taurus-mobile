import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { PlanBase } from '@app-types/plan';

// ─── Param Lists ───────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  Register: undefined;
};

export type AdminTabsParamList = {
  Dashboard: undefined;
  Members: undefined;
  Plans: undefined;
  QRScanner: undefined;
  Profile: undefined;
};

export type MembersStackParamList = {
  MembersList: undefined;
  MemberDetail: { id: string };
  CreateMember: undefined;
  RenewMembership: { memberId: string; memberName?: string };
  EditMember: { id: string };
  FingerprintEnroll: { memberId: string; memberName: string };
};

export type PlansStackParamList = {
  PlansHome: undefined;
  CreatePlan: undefined;
  EditPlan: { plan: PlanBase };
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  AccessLog: undefined;
  Devices: undefined;
  AuditTrail: undefined;
  AuditDetail: { id: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  PendingSync: undefined;
};

export type QRScannerStackParamList = {
  QRScannerHome: undefined;
};

export type MemberTabsParamList = {
  MyProfile: undefined;
  MyQR: undefined;
  RenewalHistory: undefined;
};

export type MemberProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
};

export type MemberQRStackParamList = {
  QRHome: undefined;
  Settings: undefined;
};

export type MemberHistoryStackParamList = {
  HistoryHome: undefined;
  Settings: undefined;
};

// ─── Typed Screen Props ────────────────────────────────────────────────────

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type DashboardScreenProps = NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>;
export type AccessLogScreenProps = NativeStackScreenProps<DashboardStackParamList, 'AccessLog'>;
export type DevicesScreenProps = NativeStackScreenProps<DashboardStackParamList, 'Devices'>;
export type AuditTrailScreenProps = NativeStackScreenProps<DashboardStackParamList, 'AuditTrail'>;
export type AuditDetailScreenProps = NativeStackScreenProps<DashboardStackParamList, 'AuditDetail'>;
export type MembersListScreenProps = NativeStackScreenProps<MembersStackParamList, 'MembersList'>;
export type MemberDetailScreenProps = NativeStackScreenProps<MembersStackParamList, 'MemberDetail'>;
export type CreateMemberScreenProps = NativeStackScreenProps<MembersStackParamList, 'CreateMember'>;
export type RenewMembershipScreenProps = NativeStackScreenProps<MembersStackParamList, 'RenewMembership'>;
export type PlansScreenProps = NativeStackScreenProps<PlansStackParamList, 'PlansHome'>;
export type EditMemberScreenProps = NativeStackScreenProps<MembersStackParamList, 'EditMember'>;
export type FingerprintEnrollScreenProps = NativeStackScreenProps<MembersStackParamList, 'FingerprintEnroll'>;
export type CreatePlanScreenProps = NativeStackScreenProps<PlansStackParamList, 'CreatePlan'>;
export type EditPlanScreenProps = NativeStackScreenProps<PlansStackParamList, 'EditPlan'>;
export type QRScannerScreenProps = NativeStackScreenProps<QRScannerStackParamList, 'QRScannerHome'>;
export type ProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export type MyProfileScreenProps = BottomTabScreenProps<MemberTabsParamList, 'MyProfile'>;
export type MyQRScreenProps = BottomTabScreenProps<MemberTabsParamList, 'MyQR'>;
export type RenewalHistoryScreenProps = BottomTabScreenProps<MemberTabsParamList, 'RenewalHistory'>;

export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;
export type ResetPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
