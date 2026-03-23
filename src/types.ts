export interface DashboardStats {
  delegates: {
    total: number;
    logged_in: number;
    never_logged: number;
    has_device: number;
  };
  announcements: {
    total: number;
    latest: string;
  };
  leave_forms: {
    total: number;
    reported: number;
    approved: number;
    rejected: number;
  };
  group_chats: {
    total: number;
    deleted: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
}

export interface Delegate {
  id: number;
  name: string;
  email: string;
  title: string;
  phone: string;
  avatar_url: string;
  has_logged_in: boolean;
  first_login_at: string | null;
  device_token: boolean;
  company: {
    id: number;
    name: string;
    country: string;
  };
  team: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface Announcement {
  id: number;
  message: string;
  sent_at: string;
}

export interface LeaveForm {
  id: number;
  status: 'reported' | 'approved' | 'rejected';
  explanation: string;
  reported_at: string;
  leave_type: string;
  reported_by: {
    id: number;
    name: string;
  };
  schedule_id: number;
}

export interface GroupChat {
  id: number;
  title: string;
  room_kind: string;
  member_count: number;
  created_at: string;
  members?: { 
    id: number; 
    name: string;
    role: string;
    avatar_url: string;
  }[];
}

export interface AuditLog {
  id: number;
  action: string;
  auditable_type: string;
  auditable_id: number | null;
  ip_address: string;
  created_at: string;
  delegate: {
    id: number;
    name: string;
  } | null;
}

export interface SecurityLog {
  id: number;
  event: string;
  ip: string;
  created_at: string;
  delegate: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TableTimeView {
  year: number;
  date: string;
  time: string;
  tables: {
    id: number;
    name: string;
    adjacent_tables: string[];
    meetings: any[];
    delegates: any[];
    booth_owner?: any;
  }[];
  times_today: string[];
  days: string[];
  my_table: null;
  layout: {
    type: string;
    rows: number;
    columns: number;
  };
}

export interface Notification {
  id: number;
  notification_type: string;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  delegate: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ConnectionRequest {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester: {
    id: number;
    name: string;
    email: string;
  };
  target: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PaginatedResponse<T, K extends string> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  [key: string]: any; // To allow dynamic keys like 'delegates', 'announcements', etc.
}
