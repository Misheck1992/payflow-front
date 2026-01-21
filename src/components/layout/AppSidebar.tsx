import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { menuConfig, MenuItem } from '@/lib/mockData';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const AppSidebar = () => {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!user) return null;

  // Determine menu based on institution type and user role
  const getMenuForUser = () => {
    // If institution type is HUB, use super admin menu
    if (user.institution?.type === 'HUB') {
      return menuConfig['SUPER_ADMIN'] || [];
    }

    // If institution is the special super admin ID, use super admin menu (legacy support)
    if (user.institutionId === '00000000-0000-0000-0000-000000000000') {
      return menuConfig['SUPER_ADMIN'] || [];
    }

    // For SACCO institutions, use SACCO menu
    if (user.institution?.type === 'SACCO') {
      return menuConfig['SACCO_ADMIN'] || [];
    }

    // For EMPLOYER institutions, use employer menu with HR modules
    if (user.institution?.type === 'EMPLOYER') {
      return menuConfig['EMPLOYER_ADMIN'] || [];
    }

    // Default to EMPLOYER_ADMIN menu for other institution types
    return menuConfig['EMPLOYER_ADMIN'] || [];
  };

  const userMenu = getMenuForUser();

  const isActive = (path: string) => currentPath === path;
  
  const isParentActive = (item: MenuItem): boolean => {
    if (isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>;
    const isItemActive = isActive(item.path);
    const isParentItemActive = isParentActive(item);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isChildItem = level > 0;
    
    // Different active styles for parent vs child items
    const getActiveStyles = () => {
      if (isItemActive) {
        return isChildItem 
          ? "bg-primary/20 text-primary border-l-2 border-primary font-medium" 
          : "bg-primary text-primary-foreground font-medium shadow-sm";
      }
      return "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100";
    };

    const getParentActiveStyles = () => {
      if (isParentItemActive) {
        return "bg-primary/10 text-primary font-medium";
      }
      return "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100";
    };
    
    return (
      <div key={item.id}>
        <SidebarMenuItem>
          {hasChildren ? (
            <div
              className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 cursor-pointer ${getParentActiveStyles()}`}
              onClick={() => toggleExpanded(item.id)}
              style={{ paddingLeft: `${12 + level * 16}px` }}
            >
              <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate font-medium flex-1">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-2" />
                  )}
                </>
              )}
            </div>
          ) : (
            <NavLink 
              to={item.path} 
              end 
              className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${getActiveStyles()}`}
              style={{ paddingLeft: `${12 + level * 16}px` }}
            >
              <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
            </NavLink>
          )}
        </SidebarMenuItem>
        
        {/* Render children if expanded and not collapsed */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 px-2 py-4">
          <div className="inline-flex items-center justify-center w-8 h-8">
            <img
              src={`${import.meta.env.BASE_URL}logo-icon.png`}
              alt="PayFlow Icon"
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sm">PayFlow Malawi</h2>
              <p className="text-xs text-muted-foreground">{user.institution.name}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenu.map((item) => renderMenuItem(item, 0))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
};