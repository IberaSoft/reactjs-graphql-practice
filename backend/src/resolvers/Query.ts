import { GraphQLContext } from '../lib/auth';
import { Prisma } from '@prisma/client';

interface ItemWhereInput {
  id?: string;
  id_not?: string;
  id_in?: string[];
  id_not_in?: string[];
  title_contains?: string;
  description_contains?: string;
  price?: number;
  price_gte?: number;
  price_lte?: number;
}

interface ItemOrderByInput {
  createdAt?: 'asc' | 'desc';
  price?: 'asc' | 'desc';
  title?: 'asc' | 'desc';
}

interface ItemWhereUniqueInput {
  id?: string;
}

interface ItemsArgs {
  where?: ItemWhereInput;
  orderBy?: ItemOrderByInput;
  skip?: number;
  first?: number;
}

interface ItemArgs {
  where: ItemWhereUniqueInput;
}

export const Query = {
  async items(_parent: unknown, args: ItemsArgs, ctx: GraphQLContext) {
    const where: Prisma.ItemWhereInput = {};

    if (args.where) {
      if (args.where.id) where.id = args.where.id;
      if (args.where.id_not) where.id = { not: args.where.id_not };
      if (args.where.id_in) where.id = { in: args.where.id_in };
      if (args.where.id_not_in) where.id = { notIn: args.where.id_not_in };
      if (args.where.title_contains) where.title = { contains: args.where.title_contains, mode: 'insensitive' };
      if (args.where.description_contains) where.description = { contains: args.where.description_contains, mode: 'insensitive' };
      if (args.where.price !== undefined) where.price = args.where.price;
      if (args.where.price_gte) where.price = { gte: args.where.price_gte };
      if (args.where.price_lte) where.price = { lte: args.where.price_lte };
    }

    const orderBy: Prisma.ItemOrderByWithRelationInput = {};
    if (args.orderBy) {
      if (args.orderBy.createdAt) orderBy.createdAt = args.orderBy.createdAt;
      if (args.orderBy.price) orderBy.price = args.orderBy.price;
      if (args.orderBy.title) orderBy.title = args.orderBy.title;
    } else {
      orderBy.createdAt = 'desc';
    }

    return ctx.prisma.item.findMany({
      where,
      orderBy,
      skip: args.skip,
      take: args.first,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async item(_parent: unknown, args: ItemArgs, ctx: GraphQLContext) {
    const where: Prisma.ItemWhereUniqueInput = {};
    if (args.where.id) where.id = args.where.id;

    return ctx.prisma.item.findUnique({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async itemsConnection(_parent: unknown, args: { where?: ItemWhereInput }, ctx: GraphQLContext) {
    const where: Prisma.ItemWhereInput = {};

    if (args.where) {
      if (args.where.id) where.id = args.where.id;
      if (args.where.title_contains) where.title = { contains: args.where.title_contains, mode: 'insensitive' };
      if (args.where.description_contains) where.description = { contains: args.where.description_contains, mode: 'insensitive' };
      if (args.where.price !== undefined) where.price = args.where.price;
      if (args.where.price_gte) where.price = { gte: args.where.price_gte };
      if (args.where.price_lte) where.price = { lte: args.where.price_lte };
    }

    const count = await ctx.prisma.item.count({ where });

    return {
      aggregate: {
        count,
      },
    };
  },

  async me(_parent: unknown, _args: unknown, ctx: GraphQLContext) {
    if (!ctx.userId) {
      return null;
    }

    return ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      include: {
        cart: {
          include: {
            item: true,
          },
        },
        items: true,
        orders: {
          include: {
            items: true,
          },
        },
      },
    });
  },

  async users(_parent: unknown, _args: unknown, ctx: GraphQLContext) {
    return ctx.prisma.user.findMany({
      include: {
        cart: {
          include: {
            item: true,
          },
        },
        items: true,
        orders: {
          include: {
            items: true,
          },
        },
      },
    });
  },
};

