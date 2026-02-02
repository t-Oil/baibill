'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSchema, OrganizationSchema } from '@/lib/schemas/organization-schema';

interface PendingInvitation {
  uid: string;
  organization: {
    uid: string;
    name: string;
    description?: string;
  };
  role: {
    name: string;
  };
  inviter?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt: string;
}

export default function OrganizationsPage() {
  const { organizations, currentOrg, refreshOrganizations, switchOrg } = useOrganization();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [serverError, setServerError] = useState('');
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrganizationSchema>({
    resolver: zodResolver(organizationSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  const fetchPendingInvitations = async () => {
    try {
      setIsLoadingInvitations(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/organizations/invitations/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPendingInvitations(data.data || []);
    } catch (err) {
      console.error('Failed to fetch pending invitations:', err);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const handleAcceptInvitation = async (invitationUid: string) => {
    try {
      setProcessingInvitation(invitationUid);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/organizations/invitations/${invitationUid}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await refreshOrganizations();
        await fetchPendingInvitations();
      }
    } catch (err) {
      console.error('Failed to accept invitation:', err);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleDeclineInvitation = async (invitationUid: string) => {
    try {
      setProcessingInvitation(invitationUid);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/organizations/invitations/${invitationUid}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchPendingInvitations();
      }
    } catch (err) {
      console.error('Failed to decline invitation:', err);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const getInviterName = (inviter?: PendingInvitation['inviter']) => {
    if (!inviter) return 'Unknown';
    if (inviter.firstName || inviter.lastName) {
      return `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim();
    }
    return inviter.email || 'Unknown';
  };

  const onSubmit = async (data: OrganizationSchema) => {
    setServerError('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.error?.errors?.[0] ||
          responseData.status?.message ||
          'Failed to create organization';
        throw new Error(errorMessage);
      }

      await refreshOrganizations();
      setIsCreating(false);
      reset();
    } catch (err: any) {
      setServerError(err.message || 'Failed to create organization');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)]">Organizations</h1>
              <p className="mt-2 text-[var(--muted)]">Manage your organizations and memberships</p>
            </div>
            <div className="relative group">
              <button
                onClick={() => {
                  if (!user?.plan?.canCreateOrg) {
                    setServerError(`Your ${user?.plan?.displayName || 'current'} plan does not allow creating organizations. Please upgrade.`);
                    return;
                  }
                  setIsCreating(true);
                }}
                disabled={!user?.plan?.canCreateOrg}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !user?.plan?.canCreateOrg
                    ? 'bg-[var(--muted)]/30 text-[var(--muted)] cursor-not-allowed'
                    : 'bg-[var(--button-primary)] text-white hover:bg-[var(--button-hover)]'
                }`}
                title={
                  !user?.plan?.canCreateOrg
                    ? 'Upgrade your plan to create organizations'
                    : 'Create a new organization'
                }
              >
                Create Organization
              </button>
              {!user?.plan?.canCreateOrg && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg text-sm text-[var(--muted)] z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Your {user?.plan?.displayName || 'current'} plan does not allow creating organizations. Please upgrade.
                </div>
              )}
            </div>
          </div>

          {/* Pending Invitations Section */}
          {isLoadingInvitations ? (
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="md" />
                <span className="text-[var(--muted)]">Loading invitations...</span>
              </div>
            </div>
          ) : pendingInvitations.length > 0 ? (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-amber-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-[var(--text)]">
                  Pending Invitations ({pendingInvitations.length})
                </h2>
              </div>
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.uid}
                    className="bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl font-bold flex-shrink-0">
                        {invitation.organization?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text)]">
                          {invitation.organization?.name || 'Unknown Organization'}
                        </h3>
                        <p className="text-sm text-[var(--muted)]">
                          Role:{' '}
                          <span className="capitalize font-medium text-[var(--text)]">
                            {invitation.role?.name || 'member'}
                          </span>
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          Invited by: {getInviterName(invitation.inviter)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <button
                        onClick={() => handleDeclineInvitation(invitation.uid)}
                        disabled={processingInvitation === invitation.uid}
                        className="px-4 py-2 text-[var(--text)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
                      >
                        {processingInvitation === invitation.uid ? 'Processing...' : 'Decline'}
                      </button>
                      <button
                        onClick={() => handleAcceptInvitation(invitation.uid)}
                        disabled={processingInvitation === invitation.uid}
                        className="px-4 py-2 bg-[var(--button-primary)] text-white rounded-lg hover:bg-[var(--button-hover)] transition-colors disabled:opacity-50"
                      >
                        {processingInvitation === invitation.uid ? 'Processing...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {isCreating && (
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-[var(--text)]">New Organization</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)]">Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`mt-1 block w-full rounded-md border bg-[var(--bg)] px-3 py-2 text-[var(--text)] focus:ring-2 focus:ring-[var(--button-primary)] focus:outline-none ${
                      errors.name ? 'border-[var(--error)]' : 'border-[var(--border)]'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-[var(--error)]">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    className={`mt-1 block w-full rounded-md border bg-[var(--bg)] px-3 py-2 text-[var(--text)] focus:ring-2 focus:ring-[var(--button-primary)] focus:outline-none ${
                      errors.description ? 'border-[var(--error)]' : 'border-[var(--border)]'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-[var(--error)]">{errors.description.message}</p>
                  )}
                </div>
                {serverError && <p className="text-sm text-[var(--error)]">{serverError}</p>}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      reset();
                      setServerError('');
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
                        Creating...
                      </span>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org.uid}
                className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-lg bg-[var(--button-primary)]/10 flex items-center justify-center text-[var(--button-primary)] text-xl font-bold">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-[var(--bg)] text-[var(--muted)] rounded-full capitalize">
                    {org.role?.name}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{org.name}</h3>
                <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">
                  {org.description || 'No description'}
                </p>
                <div className="flex justify-between items-center">
                  {currentOrg?.uid === org.uid ? (
                    <span className="flex items-center text-sm font-medium text-[var(--success)]">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Current Organization
                    </span>
                  ) : (
                    <button
                      onClick={() => switchOrg(org)}
                      className="text-sm font-medium text-[var(--button-primary)] hover:underline"
                    >
                      Switch to this Org
                    </button>
                  )}
                  <Link
                    href={`/organizations/${org.uid}`}
                    className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:underline"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
