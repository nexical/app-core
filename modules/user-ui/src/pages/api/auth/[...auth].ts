import type { APIRoute } from 'astro';
import { Auth } from '@auth/core';
import { authConfig } from '../../../../auth.config';

export const GET: APIRoute = async (context) => {
  return Auth(context.request, authConfig);
};

export const POST: APIRoute = async (context) => {
  return Auth(context.request, authConfig);
};
