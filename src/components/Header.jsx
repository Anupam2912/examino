import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { userProfile } = useAuth();

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-inter font-semibold text-brand">
          Welcome, {userProfile?.first_name || 'Student'}
        </h1>
      </div>

      <Link to="/profile" className="flex items-center gap-2 hover:text-brand transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-label="Profile"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="md:inline hidden">Profile</span>
      </Link>
    </header>
  );
}
