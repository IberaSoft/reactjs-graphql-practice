import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { GraphQLContext } from '../lib/auth';
import { hasPermission } from '../lib/permissions';
import { transport, makeANiceEmail } from '../mail';
import stripe from '../stripe';

const randomBytesPromiseified = promisify(randomBytes);

export const Mutation = {
  async createItem(_parent: unknown, args: { title?: string; description?: string; price?: number; image?: string; largeImage?: string }, ctx: GraphQLContext) {
    if (!ctx.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const item = await ctx.prisma.item.create({
      data: {
        user: {
          connect: {
            id: ctx.userId,
          },
        },
        title: args.title || '',
        description: args.description || '',
        price: args.price || 0,
        image: args.image,
        largeImage: args.largeImage,
      },
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

    return item;
  },

  async updateItem(_parent: unknown, args: { id: string; title?: string; description?: string; price?: number }, ctx: GraphQLContext) {
    const updates: { title?: string; description?: string; price?: number } = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.price !== undefined) updates.price = args.price;

    return ctx.prisma.item.update({
      where: { id: args.id },
      data: updates,
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

  async deleteItem(_parent: unknown, args: { id: string }, ctx: GraphQLContext) {
    const item = await ctx.prisma.item.findUnique({
      where: { id: args.id },
      select: {
        id: true,
        title: true,
        userId: true,
      },
    });

    if (!item) {
      throw new Error('Item not found!');
    }

    const ownsItem = item.userId === ctx.userId;
    const hasPermissions = ctx.user?.permissions.some((permission) => ['ADMIN', 'ITEMDELETE'].includes(permission));

    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }

    return ctx.prisma.item.delete({
      where: { id: args.id },
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

  async signup(_parent: unknown, args: { email: string; password: string; name: string }, ctx: GraphQLContext) {
    const email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);

    const user = await ctx.prisma.user.create({
      data: {
        email,
        password,
        name: args.name,
        permissions: { set: ['USER'] },
      },
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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || process.env.APP_SECRET || '');

    ctx.reply.setCookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return user;
  },

  async signin(_parent: unknown, args: { email: string; password: string }, ctx: GraphQLContext) {
    const user = await ctx.prisma.user.findUnique({
      where: { email: args.email.toLowerCase() },
    });

    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }

    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || process.env.APP_SECRET || '');

    ctx.reply.setCookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return ctx.prisma.user.findUnique({
      where: { id: user.id },
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

  signout(_parent: unknown, _args: unknown, ctx: GraphQLContext) {
    ctx.reply.clearCookie('token', {
      path: '/',
    });
    return { message: 'Goodbye!' };
  },

  async requestReset(_parent: unknown, args: { email: string }, ctx: GraphQLContext) {
    const user = await ctx.prisma.user.findUnique({
      where: { email: args.email.toLowerCase() },
    });

    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }

    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    await ctx.prisma.user.update({
      where: { email: args.email.toLowerCase() },
      data: { resetToken, resetTokenExpiry },
    });

    if (transport) {
      await transport.sendMail({
        from: process.env.MAIL_USER || 'noreply@sickfits.com',
        to: user.email,
        subject: 'Your Password Reset Token',
        html: makeANiceEmail(
          `Your Password Reset Token is here!
          \n\n
          <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`
        ),
      });
    }

    return { message: 'Thanks!' };
  },

  async resetPassword(_parent: unknown, args: { resetToken: string; password: string; confirmPassword: string }, ctx: GraphQLContext) {
    if (args.password !== args.confirmPassword) {
      throw new Error("Yo Passwords don't match!");
    }

    const user = await ctx.prisma.user.findFirst({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry: {
          gte: Date.now() - 3600000,
        },
      },
    });

    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }

    const password = await bcrypt.hash(args.password, 10);

    const updatedUser = await ctx.prisma.user.update({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    const token = jwt.sign({ userId: updatedUser.id }, process.env.JWT_SECRET || process.env.APP_SECRET || '');

    ctx.reply.setCookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return ctx.prisma.user.findUnique({
      where: { id: updatedUser.id },
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

  async updatePermissions(_parent: unknown, args: { permissions?: string[]; userId: string }, ctx: GraphQLContext) {
    if (!ctx.userId) {
      throw new Error('You must be logged in!');
    }

    if (!ctx.user) {
      throw new Error('User not found!');
    }

    hasPermission(ctx.user, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.prisma.user.update({
      where: { id: args.userId },
      data: {
        permissions: { set: (args.permissions || []) as any },
      },
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

  async addToCart(_parent: unknown, args: { id: string }, ctx: GraphQLContext) {
    const { userId } = ctx;
    if (!userId) {
      throw new Error('You must be signed in soooon');
    }

    const existingCartItem = await ctx.prisma.cartItem.findFirst({
      where: {
        userId,
        itemId: args.id,
      },
    });

    if (existingCartItem) {
      return ctx.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
        include: {
          item: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return ctx.prisma.cartItem.create({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        },
      },
      include: {
        item: true,
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

  async removeFromCart(_parent: unknown, args: { id: string }, ctx: GraphQLContext) {
    const cartItem = await ctx.prisma.cartItem.findUnique({
      where: { id: args.id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!cartItem) {
      throw new Error('No CartItem Found!');
    }

    if (cartItem.userId !== ctx.userId) {
      throw new Error('Cheatin huhhhh');
    }

    return ctx.prisma.cartItem.delete({
      where: { id: args.id },
      include: {
        item: true,
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

  async createOrder(_parent: unknown, args: { token: string }, ctx: GraphQLContext) {
    const { userId } = ctx;
    if (!userId) {
      throw new Error('You must be signed in to complete this order.');
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        cart: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found!');
    }

    const amount = user.cart.reduce((tally, cartItem) => {
      if (!cartItem.item) return tally;
      return tally + cartItem.item.price * cartItem.quantity;
    }, 0);

    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });

    const orderItems = user.cart.map((cartItem) => {
      if (!cartItem.item) {
        throw new Error('Cart item has no associated item');
      }
      return {
        title: cartItem.item.title,
        description: cartItem.item.description,
        image: cartItem.item.image || '',
        largeImage: cartItem.item.largeImage || '',
        price: cartItem.item.price,
        quantity: cartItem.quantity,
      };
    });

    const order = await ctx.prisma.order.create({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: {
          create: orderItems,
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const cartItemIds = user.cart.map((cartItem) => cartItem.id);
    await ctx.prisma.cartItem.deleteMany({
      where: {
        id: {
          in: cartItemIds,
        },
      },
    });

    return order;
  },
};

