import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import { logOut } from '../firebase/auth';

interface SettingsScreenProps {
  user: User;
  onSaveChanges: (updatedUser: User) => void;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input className={`flex h-12 w-full rounded-lg border-none bg-white/60 px-4 py-2 text-base text-black placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${props.className}`} {...props} />
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onSaveChanges }) => {
  const [formData, setFormData] = useState<User>(user);
  const profileImageUrl = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80';

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSaveChanges = () => {
    onSaveChanges(formData);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f3e8ff] to-[#d8b4fe] text-zinc-800 font-sans flex flex-col p-6">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Profile</h1>
        <img src={profileImageUrl} alt="Profile" className="w-14 h-14 rounded-full border-2 border-white" />
      </header>

      <div className="flex-1 flex flex-col">
        <div className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="firstName" className="font-semibold">First Name</Label>
            <Input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="lastName" className="font-semibold">Last Name</Label>
            <Input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email" className="font-semibold">Email</Label>
            <Input type="email" id="email" value={formData.email} onChange={handleInputChange} readOnly />
          </div>
        </div>
        
        <div className="mt-auto space-y-3 pt-8">
          <Button 
            className="w-full bg-black text-white rounded-lg h-12 text-base font-semibold hover:bg-gray-800 focus-visible:ring-black" 
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
          <Button 
            className="w-full bg-transparent text-black border border-black rounded-lg h-12 text-base font-semibold hover:bg-black/10 focus-visible:ring-black" 
            onClick={logOut}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;