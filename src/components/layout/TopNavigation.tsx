import React from 'react';
import { Bell, ChevronDown, LogOut, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const TopNavigation = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = () => {
    // Check institution type first
    if (user.institution?.type === 'HUB') {
      return 'SUPER ADMIN';
    }

    if (user.institution?.type === 'SACCO' || user.institution?.type === 'FINANCIAL_INSTITUTION') {
      return 'SACCO ADMIN';
    }

    if (user.institution?.type === 'EMPLOYER') {
      return 'EMPLOYER ADMIN';
    }

    // Check user role as fallback
    if (user.role === 'SUPER_ADMIN') {
      return 'SUPER ADMIN';
    }

    if (user.role === 'SACCO_ADMIN') {
      return 'SACCO ADMIN';
    }

    // Default fallback
    return user.role?.replace('_', ' ') || 'USER';
  };

  const getRoleBadgeColor = (roleDisplay: string) => {
    switch (roleDisplay) {
      case 'SUPER ADMIN': return 'bg-destructive text-destructive-foreground';
      case 'EMPLOYER ADMIN': return 'bg-primary text-primary-foreground';
      case 'SACCO ADMIN': return 'bg-green-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Sidebar toggle and breadcrumb */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getRoleBadgeColor(getRoleDisplayName())}>
                {getRoleDisplayName()}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{user.institution.name}</span>
            </div>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};