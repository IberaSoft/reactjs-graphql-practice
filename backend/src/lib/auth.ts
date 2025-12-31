import { Request, Reply } from 'fastify';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface TokenPayload {
  userId: string;
}

export interface ContextUser {
  id: string;
  name: string;
  email: string;
  permissions: string[];
}

export interface GraphQLContext {
  request: Request;
  reply: Reply;
  prisma: typeof prisma;
  userId?: string;
  user?: ContextUser;
}

export async function getUserId(request: Request): Promise<string | null> {
  const token = request.cookies?.token;
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || process.env.APP_SECRET || '') as TokenPayload;
    return payload.userId;
  } catch (error) {
    return null;
  }
}

export async function getUser(userId: string): Promise<ContextUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      permissions: user.permissions,
    };
  } catch (error) {
    return null;
  }
}

export async function createContext(request: Request, reply: Reply): Promise<GraphQLContext> {
  const userId = await getUserId(request);
  const user = userId ? await getUser(userId) : undefined;

  return {
    request,
    reply,
    prisma,
    userId: userId || undefined,
    user,
  };
}

