import { z } from 'zod';
import { insertUserSchema, insertDonationSchema, type User, type Donation } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<User>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        mobile: z.string().optional(),
        email: z.string().optional(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    getStats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.object({
          totalDonations: z.string(),
          totalOrganizations: z.number(),
          totalBeneficiaries: z.number(),
          employeeFees: z.string(),
          netDonations: z.string(),
        }),
        403: errorSchemas.unauthorized,
      },
    },
    updateSettings: {
      method: 'PATCH' as const,
      path: '/api/admin/settings',
      input: z.object({
        totalOrganizations: z.number().optional(),
        totalBeneficiaries: z.number().optional(),
        employeeFeesPercentage: z.number().optional(),
      }),
      responses: {
        200: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/campaigns',
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/campaigns/:id',
      responses: {
        200: z.custom<any>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns',
      input: z.custom<any>(),
      responses: {
        201: z.custom<any>(),
        403: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/campaigns/:id',
      input: z.custom<any>(),
      responses: {
        200: z.custom<any>(),
        403: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/campaigns/:id',
      responses: {
        200: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  donations: {
    create: {
      method: 'POST' as const,
      path: '/api/donations',
      input: insertDonationSchema,
      responses: {
        200: z.object({ redirectUrl: z.string().optional(), success: z.boolean().optional(), message: z.string().optional(), donationId: z.any().optional() }),
        401: errorSchemas.unauthorized,
      },
    },
    callback: {
      method: 'GET' as const,
      path: '/api/donations/callback',
      responses: {
        200: z.string(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/donations',
      responses: {
        200: z.array(z.custom<Donation>()),
      },
    },
  },
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard',
      responses: {
        200: z.array(z.object({
          name: z.string(),
          totalDonations: z.string(),
          level: z.string().optional(),
          badges: z.array(z.string()).optional(),
        })),
      },
    },
  },
  users: {
    togglePrivacy: {
      method: 'PATCH' as const,
      path: '/api/users/privacy',
      input: z.object({ isPublicDonor: z.boolean() }),
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export type LoginRequest = z.infer<typeof api.auth.login.input>;

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
