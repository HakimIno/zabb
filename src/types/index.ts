// Common types
export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  phoneNumber: string;
  otp?: string;
}

export interface GoogleLoginForm {
  idToken: string;
  accessToken: string;
}

// Navigation types
export type RootStackParamList = {
  index: undefined;
  login: undefined;
  home: undefined;
  profile: undefined;
};

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onPress?: () => void;
}

export interface TextProps extends BaseComponentProps {
  variant?: 'default' | 'large' | 'lead' | 'small' | 'muted' | 'code';
  numberOfLines?: number;
}
