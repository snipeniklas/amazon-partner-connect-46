import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Users,
  Plus, 
  Upload, 
  Mail, 
  FileText,
  List,
  BarChart3,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  contactsCount: number;
  isAdmin: boolean;
}

export function AppSidebar({ contactsCount, isAdmin }: AppSidebarProps) {
  const { t } = useTranslation(['dashboard', 'settings']);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const location = useLocation();

  const navigationItems = [
    {
      path: '/dashboard/overview',
      title: t('dashboard:tabs.dashboard'),
      icon: BarChart3,
    },
    {
      path: '/dashboard/contacts',
      title: t('dashboard:tabs.list'),
      icon: List,
    },
    {
      path: '/dashboard/add-contact',
      title: t('dashboard:tabs.addContact'),
      icon: Plus,
    },
    {
      path: '/dashboard/upload',
      title: t('dashboard:tabs.fileUpload'),
      icon: Upload,
    },
    {
      path: '/dashboard/email',
      title: t('dashboard:tabs.emailSending'),
      icon: Mail,
    },
    {
      path: '/dashboard/forms',
      title: t('dashboard:tabs.formsOverview'),
      icon: FileText,
    },
    {
      path: '/dashboard/settings',
      title: t('settings:metaPixel.title', 'Settings'),
      icon: Settings,
    },
  ];

  const adminItems = isAdmin ? [
    {
      path: '/dashboard/users',
      title: 'Users',
      icon: Users,
    }
  ] : [];

  return (
    <Sidebar className="w-60" collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-900 font-semibold">
            {t('dashboard:title')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                     <NavLink 
                      to={item.path}
                      className={({ isActive }) => 
                        `w-full justify-start ${
                          isActive
                            ? 'bg-amazon-orange text-white' 
                            : 'text-gray-900'
                        }`
                      }
                    >
                       <item.icon className="h-4 w-4 text-inherit" />
                       <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path}
                      className={({ isActive }) => 
                        `w-full justify-start ${
                          isActive
                            ? 'bg-amazon-orange text-white' 
                            : 'text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 text-inherit" />
                      {item.title}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}