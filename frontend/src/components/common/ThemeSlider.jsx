import { useThemeStore } from '../../stores/useThemeStore';
import { BsSun, BsMoon } from 'react-icons/bs';

const ThemeSlider = () => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Theme toggle clicked. Current theme:', theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      className="relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 cursor-pointer"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-300"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      {/* Slider toggle circle */}
      <div
        className={`relative inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300 z-10 ${
          isDark ? 'translate-x-7' : 'translate-x-0.5'
        }`}
      >
        {/* Icon inside slider */}
        {isDark ? (
          <BsSun className="w-4 h-4 text-yellow-400" />
        ) : (
          <BsMoon className="w-4 h-4 text-slate-600" />
        )}
      </div>

      {/* Left icon (moon) */}
      <div className="absolute left-1.5 flex items-center justify-center z-0 pointer-events-none">
        <BsMoon className={`w-4 h-4 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-30'}`} style={{
          color: isDark ? '#0ea5e9' : '#64748b'
        }} />
      </div>

      {/* Right icon (sun) */}
      <div className="absolute right-1.5 flex items-center justify-center z-0 pointer-events-none">
        <BsSun className={`w-4 h-4 transition-opacity duration-300 ${!isDark ? 'opacity-100' : 'opacity-30'}`} style={{
          color: !isDark ? '#f59e0b' : '#64748b'
        }} />
      </div>
    </button>
  );
};

export default ThemeSlider;
