import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage.jsx';
import HomePage from './pages/home/HomePage';
import LandingPage from './pages/landing/LandingPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel.jsx';
import NotificationPage from './pages/notification/NotificationPage..jsx';
import ProfilePage from './pages/profile/ProfilePage';
import BookmarkedPostsPage from './pages/bookmarks/BookmarkedPostsPage';
import SearchUsersPage from './pages/search/SearchUsersPage';
import SettingsPage from './pages/settings/SettingsPage';
import { Toaster } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useThemeStore } from './stores/useThemeStore';


function App() {
  const { theme } = useThemeStore();
  const location = useLocation();
  const isLandingPage = location.pathname === '/' && !localStorage.getItem('theme-storage');

  // Initialize theme on mount
  useEffect(() => {
    // Get the theme from localStorage or use default
    const stored = localStorage.getItem('theme-storage');
    let initialTheme = 'light';
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        initialTheme = parsed.state?.theme || 'light';
      } catch {
        initialTheme = 'light';
      }
    }

    // Apply initial theme
    const htmlElement = document.documentElement;
    if (initialTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, []);

  // Sync theme changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme]);

  const {data : authUser, isLoading} = useQuery({
    //we use aquery key to cache the data, so that we dont have to make a 
    // request to the server every time we visit the page
    queryKey : ['authUser'],
    queryFn: async()=>{
      try {
        const res = await fetch('/api/auth/getMe');
        const data  = await res.json();
        if(data.error)return null;
        if(!res.ok){
          throw new Error(data.error || "Something went wrong" );
        }
        console.log("authUser is here", data);
        return data;
        
      } catch (error) {
        throw new Error(error);
      }
    },
  })
 if(isLoading){
  return(
    <div className='h-screen flex justify-center items-center'>
      <LoadingSpinner size='lg'/>
    </div>
  )
 }

  // Landing page with full width
  if (!authUser && location.pathname === '/') {
    return (
      <>
        <Routes>
          <Route path='/' element={<LandingPage/>} />
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignUpPage/>}/>
          <Route path='*' element={<Navigate to='/'/>} />
        </Routes>
        <Toaster/>
      </>
    )
  }

  // App layout with sidebar and right panel
  return (
    <>
      <div className='flex min-w-screen max-w-6xl mx-auto bg-white dark:bg-slate-900 transition-colors duration-200'>
       {authUser && <Sidebar/>}
        <Routes>
          <Route path='/' element={authUser ? <HomePage/> : <Navigate to='/login'/>} />
          <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to = '/'/>}/>
          <Route path='/signup' element={ !authUser ? <SignUpPage/>  : <Navigate to = '/'/>}/>
          <Route path='/notifications' element={authUser ? <NotificationPage/>: <Navigate to='/login'/>}/>
          <Route path='/profile/:username' element={authUser ? <ProfilePage/> : <Navigate to='/login'/>}/>
          <Route path='/bookmarks' element={authUser ? <BookmarkedPostsPage/> : <Navigate to='/login'/>}/>
          <Route path='/search' element={authUser ? <SearchUsersPage/> : <Navigate to='/login'/>}/>
          <Route path='/settings' element={authUser ? <SettingsPage/> : <Navigate to='/login'/>}/>
        </Routes>
        {authUser && <RightPanel/>}
        <Toaster/>

      </div>
    </>
  )
}

export default App
