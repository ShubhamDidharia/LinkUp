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
      className="relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#E8450A] focus:ring-offset-2 dark:focus:ring-offset-[#111111] cursor-pointer"
      style={{
        backgroundColor: isDark ? '#2A2A2A' : '#2A2A2A',
      }}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-300"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, #2A2A2A 0%, #2A2A2A 100%)'
            : 'linear-gradient(135deg, #2A2A2A 0%, #2A2A2A 100%)',
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      {/* Slider toggle circle */}
      <div
        className={`relative inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-[#1A1A1A] shadow-lg transition-transform duration-300 z-10 ${
          isDark ? 'translate-x-7' : 'translate-x-0.5'
        }`}
      >
        {/* Icon inside slider */}
        {isDark ? (
          <BsSun className="w-4 h-4 text-[#E8450A]" />
        ) : (
          <BsMoon className="w-4 h-4 text-[#E8450A]" />
        )}
      </div>

      {/* Left icon (moon) */}
      <div className="absolute left-1.5 flex items-center justify-center z-0 pointer-events-none">
        <BsMoon className={`w-4 h-4 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-30'}`} style={{
          color: isDark ? '#E8450A' : '#888888'
        }} />
      </div>

      {/* Right icon (sun) */}
      <div className="absolute right-1.5 flex items-center justify-center z-0 pointer-events-none">
        <BsSun className={`w-4 h-4 transition-opacity duration-300 ${!isDark ? 'opacity-100' : 'opacity-30'}`} style={{
          color: !isDark ? '#E8450A' : '#888888'
        }} />
      </div>
    </button>
  );
};

export default ThemeSlider;
