export type UserRole = 'subscriber' | 'admin';

export type Credentials = {
  email: string;
  password: string;
};

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type ProfileInput = {
  name: string;
  avatar: 'ember' | 'lumen' | 'tide' | 'moss' | 'dusk';
  maturity_limit: 7 | 13 | 16 | 18;
};

export type Profile = ProfileInput & {
  id: string;
  active: boolean;
};

export type CatalogResponse = {
  items: Array<{
    id: string;
    name: string;
    available: boolean;
    published: boolean;
  }>;
  count: number;
};

export type ApiError = {
  code: string;
  message: string;
  correlationId: string;
};
