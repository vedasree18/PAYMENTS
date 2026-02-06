import React from 'react';
import { Transaction, TransactionType, TransactionStatus, Screen, User } from '../types';
import { formatCurrency } from '../utils';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from 'lucide-react';
import { DesktopHeader, MobileBottomNav } from '../components/Navigation';

interface HistoryProps {
  transactions: Transaction[];
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  user: User;
  onLogout: () => void;
}

export const History: React.FC<HistoryProps> = ({ transactions, onBack, onNavigate, user, onLogout }) => {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 md:bg-gray-100 pb-20 md:pb-0">
      
      <DesktopHeader currentScreen={Screen.HISTORY} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      {/* Content Header */}
      <div className="bg-white p-4 md:p-8 shadow-sm sticky top-0 md:static z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile back button acts as "Go Home" here if navigating deeply, but bottom nav handles main switches */}
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full md:hidden">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Transaction History</h2>
            </div>
            
            <div className="hidden md:flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                 <Filter className="w-4 h-4" /> Filter
               </button>
               <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                 <Download className="w-4 h-4" /> Export
               </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or UPI ID" 
              className="w-full md:max-w-md pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500/20 transition-all border border-transparent focus:border-indigo-200"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p>No transactions yet.</p>
            </div>
          ) : (
            <>
              {/* Mobile List View */}
              <div className="md:hidden space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.status === TransactionStatus.FAILED 
                              ? 'bg-red-50 text-red-500' 
                              : tx.type === TransactionType.CREDIT 
                                ? 'bg-green-50 text-green-600' 
                                : 'bg-gray-50 text-gray-600'
                          }`}>
                            {tx.type === TransactionType.CREDIT ? <ArrowDownLeft className="w-5 h-5"/> : <ArrowUpRight className="w-5 h-5"/>}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{tx.payeeName}</h3>
                          <p className="text-xs text-gray-500">{tx.payeeUpiId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.status === TransactionStatus.FAILED ? 'text-gray-400 line-through' :
                          tx.type === TransactionType.CREDIT ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {tx.type === TransactionType.CREDIT ? '+' : '-'} {formatCurrency(tx.amount)}
                        </p>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          tx.status === TransactionStatus.SUCCESS ? 'bg-green-100 text-green-700' : 
                          tx.status === TransactionStatus.FAILED ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                      <span>{new Date(tx.timestamp).toLocaleString('en-IN')}</span>
                      <span className="font-mono">Ref: {tx.id.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Transaction ID</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Details</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date & Time</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {tx.id.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.type === TransactionType.CREDIT ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                             }`}>
                                {tx.type === TransactionType.CREDIT ? <ArrowDownLeft className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
                             </div>
                             <div>
                               <p className="font-semibold text-gray-900 text-sm">{tx.payeeName}</p>
                               <p className="text-xs text-gray-500">{tx.payeeUpiId}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(tx.timestamp).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                             tx.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-100' : 
                             tx.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                           }`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${
                               tx.status === 'SUCCESS' ? 'bg-green-500' : 
                               tx.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                             }`}></div>
                             {tx.status}
                           </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${
                          tx.type === TransactionType.CREDIT ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {tx.type === TransactionType.CREDIT ? '+' : '-'} {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <MobileBottomNav currentScreen={Screen.HISTORY} onNavigate={onNavigate} />
    </div>
  );
};