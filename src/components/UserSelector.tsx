import React, { useState, useEffect } from 'react';
import { User, Plus, ChevronDown } from 'lucide-react';
import { User as UserType } from '../types';

interface UserSelectorProps {
  currentUser: UserType | null;
  onUserChange: (user: UserType | null) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ currentUser, onUserChange }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      onUserChange(newUser);
      setNewUserName('');
      setNewUserEmail('');
      setShowCreateForm(false);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2 hover:bg-white transition-colors shadow-sm"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-slate-700">
          {currentUser ? currentUser.name : 'Select User'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 min-w-64 z-50">
          <div className="p-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onUserChange(user);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </button>
            ))}
            
            <div className="border-t border-slate-200 mt-2 pt-2">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-blue-600"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">Create New User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto my-auto transform translate-y-0">
            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewUserName('');
                    setNewUserEmail('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;