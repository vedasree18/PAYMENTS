import React, { useState } from 'react';
import { Screen, Contact, User } from '../types';
import { Search, ChevronLeft, UserPlus, ArrowRight, Clock, Users, ShieldCheck, Zap } from 'lucide-react';
import { DesktopHeader, MobileBottomNav } from '../components/Navigation';
import { Button } from '../components/Button';

interface SendMoneyProps {
  onBack: () => void;
  onSelectRecipient: (upiId: string, name: string) => void;
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const MOCK_CONTACTS: Contact[] = [
  { name: 'Rahul Sharma', upiId: 'rahul@okaxis', avatarColor: 'bg-blue-100 text-blue-600', isRecent: true },
  { name: 'Priya Patel', upiId: 'priya@hdfc', avatarColor: 'bg-pink-100 text-pink-600', isRecent: true },
  { name: 'Zomato Foods', upiId: 'merchant.zomato@upi', avatarColor: 'bg-red-100 text-red-600', isRecent: true },
  { name: 'Amit Verma', upiId: 'amit.v@icici', avatarColor: 'bg-green-100 text-green-600' },
  { name: 'Sneha Gupta', upiId: 'sneha@oksbi', avatarColor: 'bg-purple-100 text-purple-600' },
  { name: 'Wifi Bill', upiId: 'actfibernet@upi', avatarColor: 'bg-orange-100 text-orange-600' },
  { name: 'Vikram Singh', upiId: 'vikram@paytm', avatarColor: 'bg-indigo-100 text-indigo-600' },
  { name: 'Anjali Rao', upiId: 'anjali@ybl', avatarColor: 'bg-teal-100 text-teal-600' },
  { name: 'Kiran Enterprises', upiId: 'kiran.ent@sbi', avatarColor: 'bg-yellow-100 text-yellow-600' },
];

export const SendMoney: React.FC<SendMoneyProps> = ({ onBack, onSelectRecipient, user, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Filter logic
  const filteredContacts = MOCK_CONTACTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.upiId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualUpi = () => {
    if (!searchQuery) return;
    const name = searchQuery.includes('@') ? 'New Recipient' : searchQuery;
    // On desktop, we select it first. On mobile, we go straight to pay.
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      onSelectRecipient(searchQuery, name);
    } else {
      setSelectedContact({
        name: name,
        upiId: searchQuery,
        avatarColor: 'bg-gray-100 text-gray-600',
        isRecent: false
      });
    }
  };

  const handleContactClick = (contact: Contact) => {
    // Mobile: Navigate immediately
    if (window.innerWidth < 768) {
      onSelectRecipient(contact.upiId, contact.name);
    } else {
      // Desktop: Select for preview
      setSelectedContact(contact);
    }
  };

  const isQueryUpi = searchQuery.includes('@') || searchQuery.includes('.');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DesktopHeader currentScreen={Screen.SEND_MONEY} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 md:p-8">
        
        {/* LEFT COLUMN: Search & Directory */}
        <div className="col-span-1 md:col-span-5 flex flex-col h-full md:bg-white md:rounded-[2rem] md:shadow-sm md:border md:border-gray-100 overflow-hidden">
          
          {/* Header & Search */}
          <div className="p-4 md:p-6 bg-white sticky top-0 z-20 border-b border-gray-100 md:border-none">
             <div className="md:hidden flex items-center gap-3 mb-4">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Send Money</h1>
             </div>
             
             <h2 className="hidden md:block text-2xl font-bold text-gray-900 mb-6">Select Recipient</h2>

             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Name, mobile number, or UPI ID"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-0">
             
             {/* New Contact Action */}
             {searchQuery && (
                <div className="mb-6 md:px-6 animate-fade-in">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">New Payment</h3>
                  <button 
                    onClick={handleManualUpi}
                    className="w-full bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Pay to <span className="text-indigo-600">"{searchQuery}"</span></p>
                        <p className="text-xs text-gray-500">{isQueryUpi ? 'Verified UPI ID' : 'Verify Name on next step'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
             )}

             {/* Recents Horizontal Scroll */}
             {!searchQuery && (
                <div className="mb-6 md:px-6">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Recent
                   </h3>
                   <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {MOCK_CONTACTS.filter(c => c.isRecent).map((contact, idx) => (
                         <button 
                           key={idx}
                           onClick={() => handleContactClick(contact)}
                           className="flex flex-col items-center gap-2 group min-w-[70px]"
                         >
                           <div className={`w-14 h-14 rounded-full ${contact.avatarColor} flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-110 transition-transform relative`}>
                             {contact.name.charAt(0)}
                             <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                             </div>
                           </div>
                           <span className="text-xs font-medium text-gray-600 text-center w-full truncate px-1 group-hover:text-indigo-600 transition-colors">
                             {contact.name.split(' ')[0]}
                           </span>
                         </button>
                      ))}
                   </div>
                </div>
             )}

             {/* All Contacts List */}
             <div className="md:px-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4 flex items-center gap-2">
                   <Users className="w-3 h-3" /> All Contacts
                </h3>
                <div className="divide-y divide-gray-50">
                   {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact, idx) => (
                         <button 
                           key={idx}
                           onClick={() => handleContactClick(contact)}
                           className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left rounded-xl ${selectedContact?.upiId === contact.upiId ? 'bg-indigo-50 ring-1 ring-indigo-100' : ''}`}
                         >
                           <div className={`w-10 h-10 rounded-full ${contact.avatarColor} flex items-center justify-center font-bold text-sm shrink-0`}>
                             {contact.name.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="font-semibold text-gray-900 truncate">{contact.name}</p>
                             <p className="text-xs text-gray-500 font-mono truncate">{contact.upiId}</p>
                           </div>
                           {selectedContact?.upiId === contact.upiId && (
                              <div className="text-indigo-600 font-medium text-xs px-2 py-1 bg-white rounded-md shadow-sm">Selected</div>
                           )}
                         </button>
                      ))
                   ) : (
                      <div className="p-12 text-center">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-6 h-6 text-gray-400" />
                         </div>
                         <p className="text-gray-500 text-sm font-medium">No contacts found</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview & Action (Desktop Only) */}
        <div className="hidden md:flex col-span-7 flex-col justify-center items-center p-8 relative">
           
           {selectedContact ? (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-md animate-fade-in text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent"></div>
                 
                 <div className="relative z-10">
                    <div className={`w-24 h-24 mx-auto rounded-full ${selectedContact.avatarColor} flex items-center justify-center text-3xl font-bold shadow-lg mb-6`}>
                       {selectedContact.name.charAt(0)}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedContact.name}</h2>
                    <div className="flex items-center justify-center gap-2 mb-8">
                       <span className="text-gray-500 font-mono text-sm bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                          {selectedContact.upiId}
                       </span>
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Banking Name</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{selectedContact.name.toUpperCase()}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Last Paid</p>
                          <p className="text-sm font-medium text-gray-900">2 days ago</p>
                       </div>
                    </div>

                    <Button 
                       fullWidth 
                       onClick={() => onSelectRecipient(selectedContact.upiId, selectedContact.name)}
                       className="py-4 text-lg shadow-indigo-200 shadow-lg"
                    >
                       Pay {selectedContact.name.split(' ')[0]} <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    
                    <p className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
                       <ShieldCheck className="w-3 h-3" /> Payments are 100% secure
                    </p>
                 </div>
              </div>
           ) : (
              <div className="text-center opacity-60">
                 <div className="w-64 h-64 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 border-2 border-indigo-100 rounded-full animate-ping opacity-20"></div>
                    <Zap className="w-24 h-24 text-indigo-200" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a recipient</h2>
                 <p className="text-gray-500 max-w-xs mx-auto">Choose a contact from the list or search for a new UPI ID to start a payment.</p>
              </div>
           )}

        </div>

      </main>

      <MobileBottomNav currentScreen={Screen.SEND_MONEY} onNavigate={onNavigate} />
    </div>
  );
};