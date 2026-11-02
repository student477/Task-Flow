import React, { useState } from 'react';
import {
  User,
  Building,
  Mail,
  Shield,
  Palette,
  KeyRound,
  Check,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const COLOR_PALETTE = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Slate', value: '#334155' }
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    organization: user?.organization || '',
    avatarColor: user?.avatarColor || '#4f46e5'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    const res = await updateProfile(formData);
    setIsSaving(false);

    if (res.success) {
      toast.success('Profile settings updated successfully!');
    } else {
      toast.error(res.message || 'Failed to update profile settings.');
    }
  };

  const displayName = formData.name || user?.name || 'Engineer';
  const displayEmail = user?.email || 'user@taskflow.dev';
  const displayInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Account & Preferences</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Profile & Organization Settings
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your personal identity, organization affiliation, and avatar appearance across TaskFlow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile Card Overview */}
        <Card padding="p-6" className="text-center md:col-span-1">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white"
                style={{ backgroundColor: formData.avatarColor }}
              >
                {displayInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <h3 className="text-base font-bold text-slate-900">{displayName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{displayEmail}</p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-brand-500" />
              <span>{user?.role === 'admin' ? 'Workspace Admin' : 'Active Member'}</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Organization:</span>
              <span className="font-semibold text-slate-800">{user?.organization || 'Personal'}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Database Status:</span>
              <span className="font-semibold text-emerald-600">MongoDB Synced</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Member Since:</span>
              <span className="font-semibold text-slate-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </Card>

        {/* Right Column: Editable Profile Form */}
        <Card padding="p-6" className="md:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Account Preferences
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Account Email (Primary Key)"
              icon={Mail}
              value={displayEmail}
              disabled
              helperText="Email address is immutable and serves as your unique security identity."
              className="bg-slate-50 cursor-not-allowed text-slate-500"
            />

            <Input
              label="Organization / Workspace Name"
              icon={Building}
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="e.g. Acme SaaS Product Division"
            />

            {/* Avatar Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span>Avatar Theme Color</span>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarColor: c.value })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      formData.avatarColor === c.value
                        ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-xs ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: c.value }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                icon={Save}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Security Specifications Card */}
      <Card padding="p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <KeyRound className="w-5 h-5 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Security & Session Infrastructure
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          TaskFlow uses zero-trust security principles. Session tokens, hashed credentials, and role privileges are validated on every backend transaction.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Credential Hashing
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              bcryptjs (10 Salt Rounds)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Session Handling
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Stateless JWT Bearer
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Authorization Matrix
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Project-Scoped RBAC
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
