type Role = string | null | undefined;

export const canOrganize = (role: Role) => role === 'admin' || role === 'organizer';
export const canManageUsers = (role: Role) => role === 'admin';
export const canManageDisciplines = canManageUsers;
export const canViewAudit = (role: Role) => role === 'admin' || role === 'manager';
export const canValidateQr = canOrganize;
export const canJudgeMatches = (role: Role) => canOrganize(role) || role === 'judge';
export const canManageParticipantRoster = (role: Role) => canJudgeMatches(role) || role === 'manager';
export const canPredict = (role: Role) => canOrganize(role) || role === 'manager';
