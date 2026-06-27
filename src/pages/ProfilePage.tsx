import { useState, useRef, useEffect } from 'react';
import { Camera, UserRound, Plus, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getProfile, updateProfile, uploadAvatar } from '../api/user';
import type { Social, CookingFrequency } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string || 'http://localhost:8000/api')
  .replace(/\/api$/, '');

function resolveAvatar(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

const SOCIAL_PLATFORMS = [
  'Instagram', 'Facebook', 'X (Twitter)', 'LinkedIn',
  'TikTok', 'YouTube', 'WhatsApp', 'Telegram', 'GitHub', 'Other',
];

const COOKING_OPTIONS: { value: CookingFrequency | ''; label: string }[] = [
  { value: '', label: 'Prefer not to say' },
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'often', label: 'Often' },
  { value: 'daily', label: 'Daily' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-red-800' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [occupation, setOccupation] = useState(user?.occupation ?? '');
  const [nationality, setNationality] = useState(user?.nationality ?? '');
  const [cookingFrequency, setCookingFrequency] = useState<CookingFrequency | ''>(
    user?.cooking_frequency ?? ''
  );
  const [smoking, setSmoking] = useState(user?.smoking ?? false);
  const [petOwner, setPetOwner] = useState(user?.pet_owner ?? false);
  const [petFriendly, setPetFriendly] = useState(user?.pet_friendly ?? false);
  const [socials, setSocials] = useState<Social[]>(user?.socials ?? []);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentAvatar = avatarPreview ?? resolveAvatar(user?.avatar_url);

  useEffect(() => {
    getProfile()
      .then((fresh) => {
        updateUser(fresh);
        setName(fresh.name ?? '');
        setUsername(fresh.username ?? '');
        setPhone(fresh.phone ?? '');
        setBio(fresh.bio ?? '');
        setGender(fresh.gender ?? '');
        setOccupation(fresh.occupation ?? '');
        setNationality(fresh.nationality ?? '');
        setCookingFrequency(fresh.cooking_frequency ?? '');
        setSmoking(fresh.smoking ?? false);
        setPetOwner(fresh.pet_owner ?? false);
        setPetFriendly(fresh.pet_friendly ?? false);
        setSocials(fresh.socials ?? []);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const addSocial = () => setSocials((prev) => [...prev, { name: 'Instagram', url: '' }]);

  const updateSocial = (index: number, field: keyof Social, value: string) => {
    setSocials((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const removeSocial = (index: number) => {
    setSocials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      let avatarPath = user?.avatar_url;
      if (avatarFile) {
        try {
          avatarPath = await uploadAvatar(avatarFile);
        } catch {
          // upload endpoint not ready — keep existing avatar
        }
      }

      const updated = await updateProfile({
        name,
        username,
        phone,
        bio,
        avatar_url: avatarPath,
        gender,
        occupation,
        nationality,
        cooking_frequency: cookingFrequency,
        smoking,
        pet_owner: petOwner,
        pet_friendly: petFriendly,
        socials,
      });

      updateUser(updated);
      setSuccess('Profile updated successfully.');
      setAvatarFile(null);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700';
  const disabledClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed';
  const selectClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-700';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center ring-4 ring-gray-100">
                <UserRound size={44} className="text-gray-400" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
            >
              <Camera size={14} className="text-gray-600" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-red-800 hover:underline"
          >
            Change photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user.email} disabled className={disabledClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 0123456789"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input type="text" value={user.role === 'owner' ? 'Owner' : 'Tenant'} disabled className={disabledClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. Malaysian"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* About */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">About</h2>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others a bit about yourself..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none"
          />
        </section>

        {/* Lifestyle */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Lifestyle</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Frequency</label>
            <select
              value={cookingFrequency}
              onChange={(e) => setCookingFrequency(e.target.value as CookingFrequency | '')}
              className={selectClass}
            >
              {COOKING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-1">
            {(
              [
                { label: 'Smoker', value: smoking, onChange: setSmoking },
                { label: 'Pet Owner', value: petOwner, onChange: setPetOwner },
                { label: 'Pet Friendly', value: petFriendly, onChange: setPetFriendly },
              ] as const
            ).map((pref) => (
              <div key={pref.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{pref.label}</span>
                <Toggle checked={pref.value} onChange={pref.onChange} />
              </div>
            ))}
          </div>
        </section>

        {/* Social Media */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Social Media</h2>
            <button
              type="button"
              onClick={addSocial}
              className="flex items-center gap-1 text-sm text-red-800 hover:underline"
            >
              <Plus size={14} />
              Add Social
            </button>
          </div>

          {socials.length === 0 && (
            <p className="text-sm text-gray-400">No social links added yet.</p>
          )}

          <div className="space-y-3">
            {socials.map((social, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={social.name}
                  onChange={(e) => updateSocial(i, 'name', e.target.value)}
                  className="w-40 flex-shrink-0 border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  type="url"
                  value={social.url}
                  onChange={(e) => updateSocial(i, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                />
                <button
                  type="button"
                  onClick={() => removeSocial(i)}
                  className="p-2 text-gray-400 hover:text-red-600 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-gray-400">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-800 text-white py-2.5 rounded-lg font-medium hover:bg-red-900 transition disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
