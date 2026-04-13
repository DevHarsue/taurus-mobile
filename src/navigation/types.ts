export type AuthStackParamList = {
  Login: undefined;
};

export type AdminTabsParamList = {
  Dashboard: undefined;
  Members: undefined;
  Plans: undefined;
  Profile: undefined;
};

export type MembersStackParamList = {
  MembersList: undefined;
  MemberDetail: { id: string };
  CreateMember: undefined;
};

export type PlansStackParamList = {
  PlansHome: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
};

export type MemberTabsParamList = {
  MyProfile: undefined;
  MyQR: undefined;
  RenewalHistory: undefined;
};