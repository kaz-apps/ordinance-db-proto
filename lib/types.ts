export type UserPlan = 'unregistered' | 'free' | 'premium';

export interface Profile {
  id: string;
  username: string | null;
  created_at: string | null;
  updated_at: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  department: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  website: string | null;
  plan: UserPlan;
}

export interface Ordinance {
  id: string;
  municipalityName: string;
  title: string;
  firstLine: string;
  surveyGroup: string;
  content: string;
  department: string;
  category: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface OrdinanceTableProps {
  ordinances: Ordinance[];
  userPlan: UserPlan;
} 