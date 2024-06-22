import { z } from 'zod';

export enum Roles {
  SuperAdmin = 'super_admin',
  StaffAdmin = 'staff_admin',
  SystemAdmin = 'system_admin',
  ProgrammaticAdmin = 'programmatic_admin',
  ProgrammaticEditor = 'programmatic_editor',
  ProgrammaticViewer = 'programmatic_viewer',
}
export const RoleSchema = z.nativeEnum(Roles);

export const RoleMapSchema = z.record(RoleSchema, z.boolean());
export type RoleMap = z.infer<typeof RoleMapSchema>;

export const defaultRoleMap: RoleMap = Object.fromEntries(
  Object.values(Roles).map((role) => [role, false]),
);

export enum Permissions {
  ViewProgrammeData = 'view_programme_data',
  EditProgrammeData = 'edit_programme_data',
  DeleteProgrammeData = 'delete_programme_data',
  ViewSystemData = 'view_system_data',
  EditSystemData = 'edit_system_data',
  DeleteSystemData = 'delete_system_data',
  ManageUsers = 'manage_users',
}
export const PermissionSchema = z.nativeEnum(Permissions);

export const PermissionMapSchema = z.record(PermissionSchema, z.boolean());
export type PermissionMap = z.infer<typeof PermissionMapSchema>;

export const defaultPermissionMap: PermissionMap = Object.fromEntries(
  Object.values(Permissions).map((permission) => [permission, false]),
);
