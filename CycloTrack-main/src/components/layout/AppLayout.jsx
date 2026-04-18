import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { supabase } from '@/lib/supabaseClient'

export default function AppLayout() {
    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <div className="min-h-screen bg-background font-inter">
            <div className="flex justify-end p-4">
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-500"
                >
                    Вийти
                </button>
            </div>
            <main className="pb-28">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
