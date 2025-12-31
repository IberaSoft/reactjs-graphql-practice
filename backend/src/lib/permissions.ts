import { ContextUser } from './auth';

export function hasPermission(user: ContextUser | undefined, permissionsNeeded: string[]): void {
  if (!user) {
    throw new Error('You must be logged in!');
  }

  const matchedPermissions = user.permissions.filter((permissionTheyHave) =>
    permissionsNeeded.includes(permissionTheyHave)
  );

  if (!matchedPermissions.length) {
    throw new Error(
      `You do not have sufficient permissions

      : ${permissionsNeeded.join(', ')}

      You Have:

      ${user.permissions.join(', ')}
      `
    );
  }
}

