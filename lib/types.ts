export type UserPlan = 'unregistered' | 'free' | 'premium';

export interface Profile {
  id: string;
  username: string;
  created_at: string;
  full_name: string | null;
  company_name: string | null;
  department_name: string | null;
  phone_number: string | null;
  password: string | null;
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