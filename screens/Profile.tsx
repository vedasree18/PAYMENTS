import React, { useState, useRef } from 'react';
import { Screen, User } from '../types';
import { DesktopHeader, MobileBottomNav } from '../components/Navigation';
import { Switch } from '../components/Switch';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  User as UserIcon, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Copy, 
  Check, 
  Phone, 
  Mail,
  Wallet,
  Smartphone,
  ChevronLeft,
  Bell,
  CreditCard,
  Moon,
  HelpCircle,
  X,
  Edit2,
  Lock
} from 'lucide-react';
import QRCode from 'react-qr-code';

interface ProfileProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

type SettingsView = 'MAIN' | 'ACCOUNT' | 'SECURITY' | 'PAYMENTS' | 'NOTIFICATIONS' | 'APPEARANCE' | 'ABOUT';

// --- Helper Components ---

const Toast = ({ message, show }: { message: string, show: boolean }) => (
  <div className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 z-[100] ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
    <span className="text-sm font-medium">{message}</span>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Profile: React.FC<ProfileProps> = ({ user, onNavigate, onLogout, onUpdateUser }) => {
  const [currentView, setCurrentView] = useState<SettingsView>('MAIN');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Modal States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);

  // Form States
  const [editName, setEditName] = useState(user.name);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [pinForm, setPinForm] = useState({ current: '', new: '', confirm: '' });
  const [formError, setFormError] = useState('');

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUpdatePreference = (section: keyof typeof user.preferences, key: string, value: any) => {
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        [section]: {
          // @ts-ignore
          ...user.preferences[section],
          [key]: value
        }
      }
    };
    onUpdateUser(updatedUser);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  // --- ACTIONS ---

  const handleSaveProfile = () => {
    if (editName.trim().length < 2) {
      setFormError('Name must be at least 2 characters');
      return;
    }
    onUpdateUser({ ...user, name: editName });
    setShowEditProfile(false);
    showNotification('Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (!passForm.current || !passForm.new || !passForm.confirm) {
      setFormError('All fields are required');
      return;
    }
    if (user.password && passForm.current !== user.password) {
      setFormError('Current password is incorrect');
      return;
    }
    if (passForm.new.length < 6) {
      setFormError('New password must be at least 6 characters');
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setFormError('New passwords do not match');
      return;
    }
    
    onUpdateUser({ ...user, password: passForm.new });
    setShowChangePass(false);
    setPassForm({ current: '', new: '', confirm: '' });
    showNotification('Password changed successfully');
  };

  const handleChangePin = () => {
    if (pinForm.current.length !== 4 || pinForm.new.length !== 4 || pinForm.confirm.length !== 4) {
      setFormError('All PINs must be 4 digits');
      return;
    }
    if (pinForm.current !== user.upiPin) {
      setFormError('Current PIN is incorrect');
      return;
    }
    if (pinForm.new !== pinForm.confirm) {
      setFormError('New PINs do not match');
      return;
    }

    onUpdateUser({ ...user, upiPin: pinForm.new });
    setShowChangePin(false);
    setPinForm({ current: '', new: '', confirm: '' });
    showNotification('UPI PIN changed successfully');
  };

  // --- RENDERERS ---

  const renderHeader = (title: string) => (
    <div className="flex items-center gap-3 mb-6">
      <button 
        onClick={() => {
            setCurrentView('MAIN');
            setFormError('');
        }}
        className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );

  const renderAccount = () => {
    const upiUri = `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.name)}&cu=INR`;
    
    const handleCopy = () => {
      navigator.clipboard.writeText(user.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification('UPI ID copied to clipboard');
    };

    return (
      <div className="animate-fade-in">
        {renderHeader('Account & QR')}
        
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6 text-center relative">
          <button 
            onClick={() => { setEditName(user.name); setFormError(''); setShowEditProfile(true); }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-2xl font-bold mx-auto mb-4">
            {user.name.charAt(0)}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <button onClick={handleCopy} className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-gray-50 rounded-full text-sm text-gray-600 hover:bg-gray-100">
             {user.upiId}
             {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>

          <div className="mt-8 bg-white p-4 rounded-xl border border-gray-100 inline-block shadow-lg shadow-indigo-50/50">
             <QRCode value={upiUri} size={180} />
          </div>
          <p className="text-xs text-gray-400 mt-4">Scan to pay directly to wallet</p>
        </div>

        <div className="space-y-4">
          <InfoRow label="Mobile Number" value={user.phoneNumber} icon={<Phone className="w-4 h-4" />} />
          <InfoRow label="Email Address" value={user.email} icon={<Mail className="w-4 h-4" />} />
          <InfoRow label="KYC Status" value="Verified" icon={<Shield className="w-4 h-4 text-green-500" />} />
        </div>
      </div>
    );
  };

  const renderSecurity = () => (
    <div className="animate-fade-in">
      {renderHeader('Security')}
      <div className="space-y-6">
        <Section title="Access Control">
          <ToggleRow 
            label="App Lock" 
            desc="Require PIN to open app"
            checked={user.preferences.security.appLock}
            onChange={(v) => handleUpdatePreference('security', 'appLock', v)}
          />
          <ToggleRow 
            label="Biometric Login" 
            desc="Use FaceID or Fingerprint"
            checked={user.preferences.security.biometric}
            onChange={(v) => handleUpdatePreference('security', 'biometric', v)}
          />
        </Section>
        
        <Section title="Credentials">
          <ActionRow 
            label="Change UPI PIN" 
            desc="Update your 4-digit transaction PIN"
            onClick={() => { setFormError(''); setPinForm({current: '', new: '', confirm: ''}); setShowChangePin(true); }} 
          />
          <ActionRow 
            label="Change Password" 
            desc="Update your login password"
            onClick={() => { setFormError(''); setPassForm({current: '', new: '', confirm: ''}); setShowChangePass(true); }} 
          />
        </Section>

        <Section title="Devices">
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                 <Smartphone className="w-5 h-5 text-gray-500" />
                 <div>
                    <p className="text-sm font-semibold text-gray-900">Current Session</p>
                    <p className="text-xs text-gray-500">Active now</p>
                 </div>
              </div>
           </div>
        </Section>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="animate-fade-in">
      {renderHeader('Payments & Limits')}
      <div className="space-y-6">
        <Section title="Preferences">
          <ToggleRow 
             label="Payment Confirmation" 
             desc="Show confirmation before PIN"
             checked={user.preferences.payments.confirmPayment}
             onChange={(v) => handleUpdatePreference('payments', 'confirmPayment', v)}
          />
        </Section>

        <Section title="Limits">
          <div className="px-4 py-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Daily Transaction Limit</span>
              <span className="font-bold text-gray-900">₹{user.preferences.payments.transactionLimit.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="100000" 
              step="1000"
              value={user.preferences.payments.transactionLimit}
              onChange={(e) => handleUpdatePreference('payments', 'transactionLimit', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-xs text-gray-400 mt-2">Maximum amount per transaction attempt.</p>
          </div>
        </Section>

        <Section title="Saved Methods">
          <ActionRow label="Manage Bank Accounts" desc="HDFC Bank •• 4582 (Primary)" onClick={() => {}} />
          <ActionRow label="Saved Cards" desc="Visa, Mastercard" onClick={() => {}} />
        </Section>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="animate-fade-in">
      {renderHeader('Notifications')}
      <div className="space-y-6">
        <Section title="Alerts">
           <ToggleRow 
             label="Payment Alerts" 
             desc="Get notified for every transaction"
             checked={user.preferences.notifications.payment}
             onChange={(v) => handleUpdatePreference('notifications', 'payment', v)}
           />
           <ToggleRow 
             label="Failed Transactions" 
             desc="Instant alerts for failures"
             checked={user.preferences.notifications.failedTxn}
             onChange={(v) => handleUpdatePreference('notifications', 'failedTxn', v)}
           />
        </Section>
        <Section title="Marketing">
           <ToggleRow 
             label="Promotional Offers" 
             desc="Cashback and rewards updates"
             checked={user.preferences.notifications.promotional}
             onChange={(v) => handleUpdatePreference('notifications', 'promotional', v)}
           />
        </Section>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="animate-fade-in">
      {renderHeader('Appearance')}
      <div className="space-y-6">
        <Section title="Theme">
           <ToggleRow 
             label="Dark Mode" 
             desc="Enable dark theme interface"
             checked={user.preferences.appearance.darkMode}
             onChange={(v) => {
               handleUpdatePreference('appearance', 'darkMode', v);
               showNotification(v ? 'Dark mode enabled' : 'Light mode enabled');
             }}
           />
        </Section>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="animate-fade-in">
      {renderHeader('About & Support')}
      <div className="space-y-6">
         <Section title="Help Center">
            <ActionRow label="FAQs" onClick={() => {}} />
            <ActionRow label="Contact Support" onClick={() => {}} />
         </Section>
         <Section title="Legal">
            <ActionRow label="Terms of Service" onClick={() => {}} />
            <ActionRow label="Privacy Policy" onClick={() => {}} />
         </Section>
         <div className="text-center pt-8 pb-4">
            <p className="text-sm font-bold text-gray-900">NovaPay</p>
            <p className="text-xs text-gray-500">Version 2.4.0 (Build 8921)</p>
         </div>
      </div>
    </div>
  );

  const renderMain = () => (
    <div className="animate-fade-in">
      {/* Profile Summary Card */}
      <div 
        onClick={() => setCurrentView('ACCOUNT')}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 mb-8 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name}</h2>
          <p className="text-sm text-gray-500 font-mono">{user.upiId}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
        </div>
      </div>

      <div className="space-y-6">
        <Section title="Settings">
           <MenuItem 
             icon={<Shield className="w-5 h-5 text-emerald-600" />} 
             label="Security" 
             onClick={() => setCurrentView('SECURITY')} 
             bg="bg-emerald-50"
           />
           <MenuItem 
             icon={<CreditCard className="w-5 h-5 text-blue-600" />} 
             label="Payments & Limits" 
             onClick={() => setCurrentView('PAYMENTS')} 
             bg="bg-blue-50"
           />
           <MenuItem 
             icon={<Bell className="w-5 h-5 text-orange-600" />} 
             label="Notifications" 
             onClick={() => setCurrentView('NOTIFICATIONS')} 
             bg="bg-orange-50"
           />
           <MenuItem 
             icon={<Moon className="w-5 h-5 text-purple-600" />} 
             label="Appearance" 
             onClick={() => setCurrentView('APPEARANCE')} 
             bg="bg-purple-50"
           />
        </Section>

        <Section title="Support">
           <MenuItem 
             icon={<HelpCircle className="w-5 h-5 text-gray-600" />} 
             label="About & Help" 
             onClick={() => setCurrentView('ABOUT')} 
             bg="bg-gray-100"
           />
        </Section>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-4 mt-4 text-red-600 font-semibold bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col bg-gray-50 md:bg-gray-100 pb-24 md:pb-0`}>
      <DesktopHeader currentScreen={Screen.PROFILE} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8">
        {/* Title for Desktop only when on main view */}
        {currentView === 'MAIN' && (
          <div className="hidden md:flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
               <UserIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        )}

        {/* Dynamic Content */}
        {currentView === 'MAIN' && renderMain()}
        {currentView === 'ACCOUNT' && renderAccount()}
        {currentView === 'SECURITY' && renderSecurity()}
        {currentView === 'PAYMENTS' && renderPayments()}
        {currentView === 'NOTIFICATIONS' && renderNotifications()}
        {currentView === 'APPEARANCE' && renderAppearance()}
        {currentView === 'ABOUT' && renderAbout()}

      </div>

      <Toast message={toastMsg} show={showToast} />
      <MobileBottomNav currentScreen={Screen.PROFILE} onNavigate={onNavigate} />

      {/* MODALS */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile">
          <div className="space-y-4">
             <Input 
               label="Full Name" 
               value={editName} 
               onChange={(e) => setEditName(e.target.value)} 
               autoFocus
             />
             {formError && <p className="text-red-500 text-sm">{formError}</p>}
             <Button fullWidth onClick={handleSaveProfile}>Save Changes</Button>
          </div>
      </Modal>

      <Modal isOpen={showChangePass} onClose={() => setShowChangePass(false)} title="Change Password">
          <div className="space-y-4">
             <Input 
                type="password" label="Current Password" 
                value={passForm.current} 
                onChange={e => setPassForm({...passForm, current: e.target.value})}
             />
             <Input 
                type="password" label="New Password" 
                value={passForm.new} 
                onChange={e => setPassForm({...passForm, new: e.target.value})}
             />
             <Input 
                type="password" label="Confirm Password" 
                value={passForm.confirm} 
                onChange={e => setPassForm({...passForm, confirm: e.target.value})}
             />
             {formError && <p className="text-red-500 text-sm">{formError}</p>}
             <Button fullWidth onClick={handleChangePassword}>Update Password</Button>
          </div>
      </Modal>

      <Modal isOpen={showChangePin} onClose={() => setShowChangePin(false)} title="Change UPI PIN">
          <div className="space-y-4">
             <Input 
                type="tel" maxLength={4} label="Current PIN" 
                value={pinForm.current} 
                onChange={e => setPinForm({...pinForm, current: e.target.value.replace(/\D/g, '')})}
                className="tracking-widest"
             />
             <Input 
                type="tel" maxLength={4} label="New PIN" 
                value={pinForm.new} 
                onChange={e => setPinForm({...pinForm, new: e.target.value.replace(/\D/g, '')})}
                className="tracking-widest"
             />
             <Input 
                type="tel" maxLength={4} label="Confirm PIN" 
                value={pinForm.confirm} 
                onChange={e => setPinForm({...pinForm, confirm: e.target.value.replace(/\D/g, '')})}
                className="tracking-widest"
             />
             {formError && <p className="text-red-500 text-sm">{formError}</p>}
             <Button fullWidth onClick={handleChangePin}>Update PIN</Button>
          </div>
      </Modal>

    </div>
  );
};

// --- Sub-components for Settings Layout ---

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">{title}</h3>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
      {children}
    </div>
  </div>
);

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; bg: string }> = ({ icon, label, onClick, bg }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${bg} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="font-semibold text-gray-900">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
  </button>
);

const ToggleRow: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between p-4">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

const ActionRow: React.FC<{ label: string; desc?: string; onClick: () => void }> = ({ label, desc, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left active:bg-gray-100 transition-colors">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      {desc && <p className="text-xs text-gray-500">{desc}</p>}
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300" />
  </button>
);

const InfoRow: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);