'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteSchema, InviteSchema } from '@/lib/schemas/invite-schema';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useAuth } from '@/contexts/AuthContext';

interface Organization {
  uid: string;
  name: string;
  description?: string;
}

interface Member {
  id: number;
  userId: number;
  user: {
    id: number;
    uid: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  role: {
    id: number;
    name: string;
  };
}

interface PendingInvitation {
  uid: string;
  email?: string;
  userId?: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  role: {
    name: string;
  };
  inviter?: {
    firstName?: string;
    lastName?: string;
  };
}

interface Role {
  id: number;
  name: string;
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const uid = params.uid as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    variant?: 'danger' | 'primary' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue, // For setting default role
  } = useForm<InviteSchema>({
    resolver: zodResolver(inviteSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (uid) {
      fetchData();
    }
  }, [uid]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [orgRes, membersRes, invitationsRes, rolesRes] = await Promise.all([
        fetch(`/api/organizations/${uid}`, { headers }),
        fetch(`/api/organizations/${uid}/members`, { headers }),
        fetch(`/api/organizations/${uid}/invitations`, { headers }),
        fetch('/api/organizations/roles', { headers }),
      ]);

      const [orgData, membersData, invitationsData, rolesData] = await Promise.all([
        orgRes.json(),
        membersRes.json(),
        invitationsRes.json(),
        rolesRes.json(),
      ]);

      if (orgData.data) setOrganization(orgData.data);
      if (membersData.data) setMembers(membersData.data);
      if (invitationsData.data) setPendingInvitations(invitationsData.data);
      if (rolesData.data) {
        setRoles(rolesData.data);
        // Set default role to first non-admin role or first role
        const defaultRole =
          rolesData.data.find((r: Role) => r.name !== 'admin') || rolesData.data[0];
        if (defaultRole) {
          setValue('roleId', defaultRole.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch organization data:', err);
      setError('Failed to load organization data');
    } finally {
      setIsLoading(false);
    }
  };

  const onInviteSubmit = async (data: InviteSchema) => {
    setInviteError('');
    setInviteSuccess('');

    try {
      const token = localStorage.getItem('accessToken');

      // Auto-detect: if contains @, treat as email; otherwise as user ID
      const inviteValue = data.inviteInput.trim();
      const isEmail = inviteValue.includes('@');

      const payload = isEmail
        ? { email: inviteValue, roleId: data.roleId }
        : { userId: parseInt(inviteValue, 10), roleId: data.roleId };

      const response = await fetch(`/api/organizations/${uid}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        setInviteSuccess('Invitation sent successfully!');
        reset({
          inviteInput: '',
          roleId: data.roleId, // Keep the role selected
        });

        // Refresh invitations
        const invitationsRes = await fetch(`/api/organizations/${uid}/invitations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const invitationsData = await invitationsRes.json();
        if (invitationsData.data) setPendingInvitations(invitationsData.data);

        // Also refresh members in case user already exists
        const membersRes = await fetch(`/api/organizations/${uid}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const membersData = await membersRes.json();
        if (membersData.data) setMembers(membersData.data);

        setTimeout(() => {
          setInviteSuccess('');
          setIsInviteModalOpen(false);
        }, 1500);
      } else {
        setInviteError(resData.status?.message || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Failed to send invitation:', err);
      setInviteError('Failed to send invitation');
    }
  };

  /**
   * Resends an invitation to a user.
   * @param invitationUid The UID of the invitation to resend.
   */
  const handleResendInvite = (invitationUid: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Resend Invitation',
      message:
        'Are you sure you want to resend this invitation? The expiration date will be extended.',
      variant: 'primary',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`/api/organizations/${uid}/invitations/${invitationUid}/resend`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            throw new Error('Failed to resend invitation');
          }

          // No need for alert, just close modal on success (or we could show a toast)
        } catch (err) {
          console.error(err);
          alert('Failed to resend invitation'); // Fallback for error or use toast if available
        }
      },
    });
  };

  /**
   * Cancels a pending invitation.
   * @param invitationUid The UID of the invitation to cancel.
   */
  const handleCancelInvite = (invitationUid: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Invitation',
      message:
        'Are you sure you want to cancel this invitation? The user will no longer be able to join.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`/api/organizations/${uid}/invitations/${invitationUid}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            throw new Error('Failed to cancel invitation');
          }

          setPendingInvitations((prev) => prev.filter((inv) => inv.uid !== invitationUid));
        } catch (err) {
          console.error(err);
          alert('Failed to cancel invitation');
        }
      },
    });
  };

  /**
   * Removes a member from the organization.
   * @param memberUid The UID of the user to remove.
   */
  const handleRemoveMember = (memberUid: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Member',
      message:
        'Are you sure you want to remove this member? They will lose access to the organization.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`/api/organizations/${uid}/members/${memberUid}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            throw new Error('Failed to remove member');
          }

          setMembers((prev) => prev.filter((m) => m.user.uid !== memberUid));
        } catch (err) {
          console.error(err);
          alert('Failed to remove member');
        }
      },
    });
  };

  /**
   * Updates a member's role.
   * @param memberUid The UID of the user to update.
   * @param newRoleId The ID of the new role.
   */
  const handleRoleChange = (memberUid: string, newRoleId: number) => {
    const targetRole = roles.find((r) => r.id === newRoleId);

    const performUpdate = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/organizations/${uid}/members/${memberUid}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roleId: newRoleId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update role');
        }

        // If ownership was transferred, we need to refresh the members list entirely
        // because OUR role also changed (from Owner to Admin).
        if (targetRole?.name === 'owner') {
          fetchData(); // Reload everything to reflect new roles
          return;
        }

        setMembers((prev) =>
          prev.map((m) => {
            if (m.user.uid === memberUid) {
              const roleName = roles.find((r) => r.id === newRoleId)?.name || m.role.name;
              return { ...m, role: { id: newRoleId, name: roleName } };
            }
            return m;
          }),
        );
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Failed to update role');
      }
    };

    if (targetRole?.name === 'owner') {
      setConfirmModal({
        isOpen: true,
        title: 'Transfer Ownership?',
        message:
          'You are about to transfer ownership of this organization to this member. You will be demoted to an Administrator. This action cannot be undone.',
        variant: 'warning',
        onConfirm: performUpdate,
      });
    } else {
      performUpdate();
    }
  };

  const getMemberName = (member: Member) => {
    if (member.user.firstName || member.user.lastName) {
      return `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim();
    }
    return member.user.email;
  };

  const getInvitationTarget = (invitation: PendingInvitation) => {
    if (invitation.user) {
      if (invitation.user.firstName || invitation.user.lastName) {
        return `${invitation.user.firstName || ''} ${invitation.user.lastName || ''}`.trim();
      }
      return invitation.user.email || 'Unknown';
    }
    return invitation.email || 'Unknown';
  };

  const executeConfirmAction = async () => {
    if (!confirmModal.onConfirm) return;

    setIsConfirming(true);
    try {
      await confirmModal.onConfirm();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Action failed', error);
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="xl" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !organization) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
              {error || 'Organization not found'}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/organizations')}
                className="p-2 hover:bg-[var(--bg)] rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-[var(--muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text)]">{organization.name}</h1>
                {organization.description && (
                  <p className="mt-1 text-[var(--muted)]">{organization.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-[var(--button-primary)] text-white rounded-lg hover:bg-[var(--button-hover)] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Invite Member
            </button>
          </div>

          {/* Members Section */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-xl font-semibold text-[var(--text)]">
                Members ({members.length})
              </h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {members.length === 0 ? (
                <div className="px-6 py-8 text-center text-[var(--muted)]">No members yet</div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-[var(--button-primary)]/10 flex items-center justify-center text-[var(--button-primary)] font-bold">
                        {getMemberName(member).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{getMemberName(member)}</p>
                        <p className="text-sm text-[var(--muted)]">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={member.role.id}
                        onChange={(e) =>
                          handleRoleChange(member.user.uid, parseInt(e.target.value))
                        }
                        disabled={member.role.name === 'owner'}
                        className="bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm bg-[var(--bg)] text-[var(--text)] capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {roles
                          .filter((role) => {
                            const currentUserMember = members.find(
                              (m) => m.user.email === user?.email,
                            );
                            const isCurrentUserOwner = currentUserMember?.role.name === 'owner';
                            if (role.name === 'owner') return isCurrentUserOwner;
                            return true;
                          })
                          .map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                      </select>

                      <button
                        onClick={() => handleRemoveMember(member.user.uid)}
                        disabled={member.role.name === 'owner'}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove Member"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Invitations Section */}
          {pendingInvitations.length > 0 && (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h2 className="text-xl font-semibold text-[var(--text)]">
                  Pending Invitations ({pendingInvitations.length})
                </h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.uid} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                        {getInvitationTarget(invitation).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--text)]">
                            {getInvitationTarget(invitation)}
                          </p>
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)]">Role: {invitation.role.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResendInvite(invitation.uid)}
                        className="px-3 py-1 text-sm bg-[var(--button-secondary)] text-[var(--text)] border border-[var(--border)] rounded hover:bg-[var(--button-secondary-hover)]"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleCancelInvite(invitation.uid)}
                        className="px-3 py-1 text-sm text-red-500 border border-red-200 bg-red-50 rounded hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] w-full max-w-md shadow-xl">
              <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[var(--text)]">Invite Member</h2>
                <button
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setInviteError('');
                    setInviteSuccess('');
                    reset();
                  }}
                  className="p-1 hover:bg-[var(--bg)] rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-[var(--muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit(onInviteSubmit)} className="p-6 space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Email or User ID
                  </label>
                  <input
                    type="text"
                    {...register('inviteInput')}
                    placeholder="user@example.com or 123"
                    className={`w-full px-3 py-2 rounded-lg border bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button-primary)] focus:outline-none ${
                      errors.inviteInput ? 'border-[var(--error)]' : 'border-[var(--border)]'
                    }`}
                  />
                  {errors.inviteInput && (
                    <p className="text-sm text-[var(--error)] mt-1">{errors.inviteInput.message}</p>
                  )}
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Enter an email address or user ID. Email invitations work for users who
                    haven&apos;t registered yet.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">Role</label>
                  <select
                    {...register('roleId', { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button-primary)] focus:outline-none capitalize"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id} className="capitalize">
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.roleId && (
                    <p className="text-sm text-[var(--error)] mt-1">{errors.roleId.message}</p>
                  )}
                </div>
                {inviteError && (
                  <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                    {inviteError}
                  </div>
                )}
                {inviteSuccess && (
                  <div className="text-sm text-green-500 bg-green-500/10 p-3 rounded-lg">
                    {inviteSuccess}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setInviteError('');
                      setInviteSuccess('');
                      reset();
                    }}
                    className="px-4 py-2 text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[var(--button-primary)] text-white rounded-lg hover:bg-[var(--button-hover)] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" color="white" />
                        Sending...
                      </span>
                    ) : (
                      'Send Invitation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={executeConfirmAction}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          variant={confirmModal.variant}
          isConfirming={isConfirming}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
