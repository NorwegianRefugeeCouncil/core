import { z } from 'zod';

export enum Roles {
  SuperAdmin = 'super-admin',
  StaffAdmin = 'staff-admin',
  SystemAdmin = 'system-admin',
  ProgrammaticAdmin = 'programmatic-admin',
  ProgrammaticEditor = 'programmatic-editor',
  ProgrammaticViewer = 'programmatic-viewer',
}
export const RoleSchema = z.nativeEnum(Roles);
