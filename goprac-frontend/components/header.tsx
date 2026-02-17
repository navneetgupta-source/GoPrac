/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useUserStore } from "@/stores/userStore";
import Cookies from "js-cookie";
import { ChevronDown, EllipsisVertical, Mail, Lock, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { logout } from "@/actions/logout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from "next/navigation";


export function Header() {

  const userType = useUserStore((state) => state.userType);
  const userName = useUserStore((state) => state.userName);
  const setUser = useUserStore((state) => state.setUser);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loginParam = searchParams.get("login");
    if (loginParam === "1") {
      // trigger your modal opening function here
      setAuthTab('login');
      setAuthOpen(true);
    }
  }, [searchParams]);

  // const logoutUser = async () => {
  //   await logout();
  //   useUserStore.getState().reset();
  //   window.location.href = "/";
  // };

  const logoutUser = async () => {
    await logout();
    useUserStore.getState().reset();
    router.refresh();
  };

  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);


  const googleLoginRef = useRef<HTMLDivElement | null>(null);
  const googleSignupRef = useRef<HTMLDivElement | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGsiScriptLoaded, setIsGsiScriptLoaded] = useState(false);


  const [forgotPwdEmail, setForgotPwdEmail] = useState('');
  const [forgotPwdMsg, setForgotPwdMsg] = useState('');
  const [forgotPwdLoading, setForgotPwdLoading] = useState(false);
  const [showForgotPwd, setShowForgotPwd] = useState(false);

  // Load GIS script
  useEffect(() => {
    if ((window as any).google?.accounts?.id) {
      setIsGsiScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGsiScriptLoaded(true);
    script.onerror = () => console.error("Google GSI script failed to load.");
    document.body.appendChild(script);
    return () => {
      const scriptTag = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptTag) document.body.removeChild(scriptTag);
    };
  }, []);

  // Render Google Sign-In button when modal/tab is open
  useEffect(() => {
    if (!authOpen || !isGsiScriptLoaded || !(window as any).google?.accounts?.id) {
      return;
    }

    const timeout = setTimeout(() => {

      // console.log("google accounts id", (window as any).google.accounts.id);

      const renderGoogleButton = (ref: React.RefObject<HTMLDivElement | null>, callback: any, text: string) => {
        if (ref.current) {
          ref.current.innerHTML = '';
          (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: callback,
          });
          (window as any).google.accounts.id.renderButton(ref.current, {
            theme: 'outline', size: 'large', width: 300, text: text, logo_alignment: 'center',
          });
        }
      };

      if (authTab === 'login') {
        renderGoogleButton(googleLoginRef, handleGoogleLogin, 'signin_with');
      } else if (authTab === 'signup') {
        renderGoogleButton(googleSignupRef, handleGoogleSignup, 'signup_with');
      }
    }, 0);
    return () => clearTimeout(timeout);
    // console.log('googleSignupRef', googleSignupRef.current);
  }, [authOpen, authTab, isGsiScriptLoaded, googleLoginRef.current, googleSignupRef.current]);

  async function handleGoogleLogin(response: any) {

    console.log("response", response);

    setGoogleLoading(true);
    setAuthError('');

    var id_token = response.credential;
    console.log(id_token);
    var base64Url = id_token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    var user = JSON.parse(jsonPayload);
    console.log(user);

    var email = user.email;

    try {

      const check = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?signInGRouteCheckUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${email}`,
      });
      const checked = await check.json();

      if (checked.status == 'new') {
        setAuthError(`User with given Google account's email cannot be found.`);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?signInGRoute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: "idtoken=" + id_token,
      });
      const data = await res.json();
      if (data.status == '1') {
        Cookies.set('pracUserName', data.name, { path: '/', expires: 60 });
        Cookies.set('PracIsLoggedin', 'true', { path: '/', expires: 60 });
        Cookies.set('PracLoggedInRoute', 'GOOGLE', { path: '/', expires: 60 });
        Cookies.set('pracUser', data.userId, { path: '/', expires: 60 });
        Cookies.set('_GP_', encodeURIComponent(data.jwtToken), { path: '/', expires: 60 });
        Cookies.set('pracUserType', data.usertype, { path: '/', expires: 60 });
        setUser({
          userId: data.userId,
          userType: data.usertype,
          pracIsLoggedin: 'true',
          userName: data.name,
          userEmailId: data.email,
          userMobile: data.mobile,
          jwtToken: data.jwtToken,
        });
        // check if we need to redirect to prev page
        const redirectTo = searchParams.get('redirectTo');
        if (redirectTo && redirectTo.startsWith('/')) {
          router.replace(redirectTo);
        } else {
          router.replace('/dashboard');
        }
        setAuthOpen(false);
      } else {
        setAuthError('Google login failed.');
      }

    } catch (err) {
      setAuthError('Google login failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGoogleSignup(response: any) {

    console.log("response", response);
    setGoogleLoading(true);
    setAuthError('');

    var id_token = response.credential;
    console.log(id_token);
    var base64Url = id_token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    var user = JSON.parse(jsonPayload);
    console.log(user);


    var name = user.name;
    var email = user.email;
    try {

      const check = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?signInGRouteCheckUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${email}`,
      });
      const checked = await check.json();

      if (checked.status == 'exists') {
        setAuthError(`User with given Google account's email already exists.`);
        return;
      }




      let companySource: string | null = null;
      if (typeof window !== 'undefined') {
        companySource = localStorage.getItem('companySource');
        localStorage.removeItem('companySource');
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?signUp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: name,
          emailId: email,
          password: "dEfaultPwd@123",
          userSource: 'gpc',
          source: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
          companySource,
          id_token: id_token,
          loginRoute: 'GOOGLE',
        }),
      });
      const data = await res.json();
      if (data.status == '1' || data.status == '2') {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?signInGRoute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: "idtoken=" + id_token,
        });
        const data = await res.json();
        if (data.status == '1') {
          Cookies.set('pracUserName', data.name, { path: '/', expires: 60 });
          Cookies.set('PracIsLoggedin', 'true', { path: '/', expires: 60 });
          Cookies.set('PracLoggedInRoute', 'GOOGLE', { path: '/', expires: 60 });
          Cookies.set('pracUser', data.userId, { path: '/', expires: 60 });
          Cookies.set('_GP_', encodeURIComponent(data.jwtToken), { path: '/', expires: 60 });
          Cookies.set('pracUserType', data.usertype, { path: '/', expires: 60 });
          setUser({
            userId: data.userId,
            userType: data.usertype,
            pracIsLoggedin: 'true',
            userName: data.name,
            userEmailId: data.email,
            userMobile: data.mobile,
            jwtToken: data.jwtToken,
          });
          // check if we need to redirect to prev page
          const redirectTo = searchParams.get('redirectTo');
          if (redirectTo && redirectTo.startsWith('/')) {
            router.replace(redirectTo);
          } else {
            router.replace('/dashboard');
          }
          setAuthOpen(false);
        } else {
          setAuthError('Google login failed.');
        }

        setTimeout(() => setAuthOpen(false), 2000);
      } else if (data.status === '0') {
        setAuthError('Profile already exists, please login.');
      } else if (data.status === '3') {
        setAuthError('Profile exists. Please verify your account via the email sent.');
      } else {
        setAuthError('Google sign up failed.');
      }
    } catch (err) {
      setAuthError('Google sign up failed.');
    } finally {
      setGoogleLoading(false);
    }
  }


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?signIn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (data.status === '1') {
        // Set cookies
        Cookies.set('pracUserName', data.name, { path: '/', expires: 60 });
        Cookies.set('PracIsLoggedin', 'true', { path: '/', expires: 60 });
        Cookies.set('PracLoggedInRoute', 'GOPRAC', { path: '/', expires: 60 });
        Cookies.set('pracUser', data.userId, { path: '/', expires: 60 });
        Cookies.set('_GP_', encodeURIComponent(data.jwtToken), { path: '/', expires: 60 });
        Cookies.set('pracUserType', data.usertype, { path: '/', expires: 60 });
        // Update zustand
        setUser({
          userId: data.userId,
          userType: data.usertype,
          pracIsLoggedin: 'true',
          userName: data.name,
          userEmailId: data.email,
          userMobile: data.mobile,
          jwtToken: data.jwtToken,
        });
        // check if we need to redirect to prev page
        const redirectTo = searchParams.get('redirectTo');
        if (redirectTo && redirectTo.startsWith('/')) {
          router.replace(redirectTo);
        } else{
          router.replace('/dashboard');
        }
        setAuthOpen(false);
        setLoginEmail(''); setLoginPassword('');
      } else if (data.status === '2') {
        setAuthError('Please verify your email before logging in.');
      } else if (data.status === '3') {
        setAuthError('Account not active.');
      } else {
        setAuthError('Invalid email or password.');
      }
    } catch (err) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');

    if (!signupEmail || !signupPassword || !signupName || !signupConfirmPassword) {
      setAuthError('Please fill all fields.');
      return;
    }

    // Only allow letters, spaces, and (optionally) dots
    const nameRegex = /^[a-zA-Z\s.]+$/;
    if (!nameRegex.test(signupName.trim())) {
      setAuthError('Name can only contain letters, spaces, and dots.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthLoading(true);

    var companySource = localStorage.getItem("companySource");
    localStorage.removeItem("companySource");
    var source = window.location.pathname + window.location.search;

    try {
      let companySource: string | null = null;
      if (typeof window !== 'undefined') {
        companySource = localStorage.getItem('companySource');
        localStorage.removeItem('companySource');
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?signUp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: signupName,
          emailId: signupEmail,
          password: signupPassword,
          userSource: 'gpc',
          source: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
          companySource,
          id_token: '',
          loginRoute: 'GOPRAC',
        }),
      });
      const data = await res.json();
      if (data.status == '1' || data.status == '2') {
        setAuthError('Sign up successful! Please check your email to verify your account.');
        setSignupEmail(''); setSignupPassword(''); setSignupName(''); setSignupConfirmPassword('');
        setTimeout(() => setAuthOpen(false), 2000);
      } else if (data.status == '0') {
        setAuthError('Profile already exists, please login.');
      } else if (data.status == '3') {
        setAuthError('Profile exists. Please verify your account via the email sent.');
      } else {
        setAuthError('Error while creating the profile.');
      }
    } catch (err) {
      setAuthError('Sign up failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }



  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotPwdMsg('');
    setForgotPwdLoading(true);

    try {
      const source = typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?forgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: forgotPwdEmail, source }),
      });
      const data = await res.json();
      if (data.result == 'Success') {
        setForgotPwdMsg(data.response);
        setTimeout(() => setShowForgotPwd(false), 5000);
      } else {
        setForgotPwdMsg(data.response || 'Error occurred');
      }
    } catch {
      setForgotPwdMsg('There is an error, please try again');
      setTimeout(() => setShowForgotPwd(false), 3000);
    } finally {
      setForgotPwdLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container px-6 md:px-30 mx-auto flex h-16 items-center justify-between">
        <Menubar className="sm:hidden">
          <MenubarMenu>
            <MenubarTrigger>
              <EllipsisVertical />
            </MenubarTrigger>
            <MenubarContent>
              {(() => { const pathname = usePathname(); return null })()}

              {userType && (<>             <MenubarItem className="cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                      {userName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{userName}</span>
                  </div>
                </div>
              </MenubarItem>
                <MenubarSeparator />
              </>)}

              {userType && (
                <>
                  <Link href="/dashboard">
                    <MenubarItem className={pathname === '/dashboard' ? 'text-blue-600 font-bold bg-blue-50' : ''}>Dashboard</MenubarItem>
                  </Link>
                  <MenubarSeparator />
                </>
              )}
              {/* <Link href="/">
                <MenubarItem className={pathname === '/' ? 'text-blue-600 font-bold bg-blue-50' : ''}>For Learners</MenubarItem>
              </Link>
              <MenubarSeparator /> */}
              {!userType && (<>
                <Link href="/institutes">
                  <MenubarItem className={pathname === '/institutes' ? 'text-blue-600 font-bold bg-blue-50' : ''}>For Institutes</MenubarItem>
                </Link>
                <MenubarSeparator />
              </>)}
              {!userType && (<>
                <Link href="/companypage">
                  <MenubarItem className={pathname === '/companypge' ? 'text-blue-600 font-bold bg-blue-50' : ''}>For Company</MenubarItem>
                </Link>
                <MenubarSeparator />

              </>)}
              {!userType && (<>
                <Link href="/aboutus">
                  <MenubarItem className={pathname === '/aboutus' ? 'text-blue-600 font-bold bg-blue-50' : ''}>About Us</MenubarItem>
                </Link>
                <MenubarSeparator />
              </>)}

            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <div className="flex items-center">
            <span className="text-2xl font-bold text-slate-800">Go</span>
            <span className="text-2xl font-bold  text-orange-500">Prac</span>
          </div>
        </Link>
        <nav className="items-center gap-6 hidden sm:flex">

          {userType && (
            <Link
              href="/dashboard"
              className={`text-sm font-medium hover:text-slate-900 ${pathname === '/dashboard' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
            >
              Dashboard
            </Link>)}

          {!userType && (<>
            <Link
              href="/"
              className={`text-sm font-medium hover:text-slate-900 ${pathname === '/' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
            >
              For Professionals
            </Link>
          </>)}

          {!userType && (<>
            <Link
              href="/institutes"
              className={`text-sm font-medium hover:text-slate-900 ${pathname === '/institutes' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
            >
              For Institutes
            </Link>
          </>)}
          {!userType && (<>

            <Link
              href="/companypage"
              className={`text-sm font-medium hover:text-slate-900 ${pathname === '/companypage' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
            >
              For Company
            </Link>


          </>)}
          {!userType && (<>
            <Link
              href="/aboutus"
              className={`text-sm font-medium hover:text-slate-900 ${pathname === '/aboutus' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
            >
              About Us
            </Link>
          </>)}
          <Link
            href="/blogs"
            className={`text-sm font-medium hover:text-slate-900 ${
              pathname === '/blogs' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            Blogs
          </Link>
        </nav>

        <div className="cursor-pointer">
          {userType && (
            <Menubar className="border-0 shadow-none cursor-pointer">
              <MenubarMenu>
                <MenubarTrigger>
                  <div id="userInfo" className="flex items-center gap-1 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                      {userName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{userName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </MenubarTrigger>
                <MenubarContent>
                  <Link href="/dashboard">
                <MenubarItem className="cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Dashboard
                      </span>
                    </div>
                  </div>
                </MenubarItem>
                </Link>
                <MenubarSeparator />
                  <a href="/profile">
                    <MenubarItem className="cursor-pointer">My Profile</MenubarItem>
                  </a>

                  {userType == "admin" && (
                    <>
                      <MenubarSeparator />
                      <MenubarSub>
                        <MenubarSubTrigger className="">Dashboards</MenubarSubTrigger>
                        <MenubarSubContent>
                          <a href="/practice-invitation">
                            <MenubarItem className="cursor-pointer">Practice Invitation Dashboard</MenubarItem>
                          </a>
                          <a href="/scheduleInterview">
                            <MenubarItem className="cursor-pointer">Schedule Interview</MenubarItem>
                          </a>
                          <a href="/service-dashboard">
                            <MenubarItem className="cursor-pointer">Service Dashboard</MenubarItem>
                          </a>
                          <a href="/apm">
                            <MenubarItem className="cursor-pointer">APM Dashboard</MenubarItem>
                          </a>
                          <a href="/lead-management">
                            <MenubarItem className="cursor-pointer">Lead Management</MenubarItem>
                          </a>
                          <a href="/feedback-dashboard">
                            <MenubarItem className="cursor-pointer">Assessment Dashboard</MenubarItem>
                          </a>
                          <a href="/assessment-dashboard">
                            <MenubarItem className="cursor-pointer">Assessment Dashboard New</MenubarItem>
                          </a>
                          <a href="/questions">
                            <MenubarItem className="cursor-pointer">Question Dashboard</MenubarItem>
                          </a>
                          <a href="/panels">
                            <MenubarItem className="cursor-pointer">Panel Dashboard</MenubarItem>
                          </a>
                          <a href="/practicequeue">
                            <MenubarItem className="cursor-pointer">Practice Queue</MenubarItem>
                          </a>
                          <a href="/practiceDashboard">
                            <MenubarItem className="cursor-pointer">Practice Assign</MenubarItem>
                          </a>
                          <a href="/feedbackReport">
                            <MenubarItem className="cursor-pointer">Feedback Dashboard</MenubarItem>
                          </a>
                          <a href="/users">
                            <MenubarItem className="cursor-pointer">Users Dashboard</MenubarItem>
                          </a>
                        </MenubarSubContent>
                      </MenubarSub>
                      <MenubarSeparator />

                      <MenubarSub>
                        <MenubarSubTrigger>Reports</MenubarSubTrigger>
                        <MenubarSubContent>
                          <Link href="/institute-job-report">
                            <MenubarItem className="cursor-pointer">Institute Job Report</MenubarItem>
                          </Link>
                          <a href="/learner-activity-report">
                            <MenubarItem className="cursor-pointer">Learner Activity Report</MenubarItem>
                          </a>
                          <a href="/canalytics">
                            <MenubarItem className="cursor-pointer">Competency Analytics Report</MenubarItem>
                          </a>
                          <a href="/event-report">
                            <MenubarItem className="cursor-pointer">Interview Status</MenubarItem>
                          </a>
                          <a href="/ServiceReport">
                            <MenubarItem className="cursor-pointer">Service Report</MenubarItem>
                          </a>
                          <a href="/live_report">
                            <MenubarItem className="cursor-pointer">Job Completion</MenubarItem>
                          </a>
                          <a href="/promotion">
                            <MenubarItem className="cursor-pointer">Job Promotion</MenubarItem>
                          </a>
                          <a href="/tractionReport">
                            <MenubarItem className="cursor-pointer">Traction Report</MenubarItem>
                          </a>
                          <a href="/skill-report">
                            <MenubarItem className="cursor-pointer">College Emp Report</MenubarItem>
                          </a>
                          <a href="/expert-account">
                            <MenubarItem className="cursor-pointer">Expert Account</MenubarItem>
                          </a>
                          <a href="/interview-profile-report">
                            <MenubarItem className="cursor-pointer">Interview Profile</MenubarItem>
                          </a>
                          <a href="/sendgrid-dashboard">
                            <MenubarItem className="cursor-pointer">Marketing Data</MenubarItem>
                          </a>
                          <a href="/expert-calculation">
                            <MenubarItem className="cursor-pointer">Feedback Speed</MenubarItem>
                          </a>
                          <a href="/profileSummary">
                            <MenubarItem className="cursor-pointer">Profile Summary</MenubarItem>
                          </a>
                          <a href="/student-activity">
                            <MenubarItem className="cursor-pointer">Student Activity</MenubarItem>
                          </a>
                          <a href="/reason-of-rejection">
                            <MenubarItem className="cursor-pointer">Reason of Rejection</MenubarItem>
                          </a>
                        </MenubarSubContent>
                      </MenubarSub>
                      <MenubarSeparator />
                      <a href="/interviewCreation">
                        <MenubarItem className="cursor-pointer">Job Creation</MenubarItem>
                      </a>
                      <a href="/jobcreation">
                        <MenubarItem className="cursor-pointer">Job Creation New</MenubarItem>
                      </a>
                      <a href="/practiceCreation">
                        <MenubarItem className="cursor-pointer">Practice Creation</MenubarItem>
                      </a>
                      <a href="/practicecreationnew">
                        <MenubarItem className="cursor-pointer">Practice Creation New</MenubarItem>
                      </a>
                      <a href="/content-work">
                        <MenubarItem className="cursor-pointer">Content Work</MenubarItem>
                      </a>
                      <a href="/recruiterPerformance">
                        <MenubarItem className="cursor-pointer">Recruiter Performance</MenubarItem>
                      </a>
                      <a href="/content-followup-engine">
                        <MenubarItem className="cursor-pointer">Followup Engine</MenubarItem>
                      </a>
                      <a href="/interviews">
                        <MenubarItem className="cursor-pointer">Manage Interview</MenubarItem>
                      </a>
                      <a href="/student-control">
                        <MenubarItem className="cursor-pointer">Student Control</MenubarItem>
                      </a>
                      <a href="/companyEmailTemplate">
                        <MenubarItem className="cursor-pointer">Company EmailTemplate</MenubarItem>
                      </a>
                    </>
                  )}

                  {userType == "corporate" && (
                    <>
                    <MenubarSeparator />
                      {/* <a href="/history">
                        <MenubarItem className="cursor-pointer">Interviews Taken</MenubarItem>
                      </a> */}
                      <a href="/practice-invitation">
                        <MenubarItem className="cursor-pointer">Practice Invitation Dashboard</MenubarItem>
                      </a>
                      <a href="/learner-activity-report">
                        <MenubarItem className="cursor-pointer">Learner Activity Report</MenubarItem>
                      </a>
                      {/* <MenubarSeparator />
                      <MenubarSub>
                        <MenubarSubTrigger>Dashboards</MenubarSubTrigger>
                        <MenubarSubContent>
                          <a href="/practice-invitation">
                            <MenubarItem className="cursor-pointer">Practice Invitation Dashboard</MenubarItem>
                          </a>
                          <a href="/corporate-login">
                            <MenubarItem className="cursor-pointer">Assessed Profile</MenubarItem>
                          </a>
                          <a href="/scheduleInterview">
                            <MenubarItem className="cursor-pointer">Schedule Interview</MenubarItem>
                          </a>
                          <a href="/service-dashboard">
                            <MenubarItem className="cursor-pointer">Service Dashboard</MenubarItem>
                          </a>
                        </MenubarSubContent>
                      </MenubarSub>
                      <MenubarSeparator />

                      <MenubarSub>
                        <MenubarSubTrigger>Reports</MenubarSubTrigger>
                        <MenubarSubContent>
                          <a href="/learner-activity-report">
                            <MenubarItem className="cursor-pointer">Learner Activity Report</MenubarItem>
                          </a>
                          <a href="/event-report">
                            <MenubarItem className="cursor-pointer">Interview Status</MenubarItem>
                          </a>
                          <a href="/ServiceReport">
                            <MenubarItem className="cursor-pointer">Service Report</MenubarItem>
                          </a>
                          <a href="/profileSummary">
                            <MenubarItem className="cursor-pointer">Profile Summary</MenubarItem>
                          </a>
                        </MenubarSubContent>
                      </MenubarSub>
                      <MenubarSeparator />
                      <a href="/interviewCreation">
                        <MenubarItem className="cursor-pointer">Job Creation</MenubarItem>
                      </a> */}
                    </>
                  )}

                  {userType == "college" && (
                    <>
                      <MenubarSeparator />
                      {/* <a href="/history">
                        <MenubarItem className="cursor-pointer">Interviews Taken</MenubarItem>
                      </a> */}
                      <a href="/practice-invitation">
                        <MenubarItem className="cursor-pointer">Practice Invitation Dashboard</MenubarItem>
                      </a>
                      <a href="/learner-activity-report">
                        <MenubarItem className="cursor-pointer">Learner Activity Report</MenubarItem>
                      </a>

                    </>
                  )}

                  {userType && (
                    <>
                      <MenubarSeparator />

                      <MenubarItem className="cursor-pointer" onClick={() => logoutUser()}>
                        Log Out
                      </MenubarItem>
                    </>
                  )}
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}
          {!userType && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setAuthTab('login'); setAuthOpen(true); }}>Login</Button>
              <Button onClick={() => { setAuthTab('signup'); setAuthOpen(true); }}>Sign Up</Button>
            </div>
          )}
          <Dialog open={authOpen} onOpenChange={setAuthOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{authTab === 'login' ? 'Login to GoPrac' : 'Sign Up for GoPrac'}</DialogTitle>
              </DialogHeader>
              <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  {!showForgotPwd ? (
                    <>
                      <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input id="loginEmail" type="email" placeholder="Email" className="w-full border rounded px-3 py-2 pl-10" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input id="loginPassword" type="password" placeholder="Password" className="w-full border rounded px-3 py-2 pl-10" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                        </div>
                        <Button id="loginSubmit" className="w-full" type="submit" disabled={authLoading}>{authLoading ? 'Logging in...' : 'Login'}</Button>
                      </form>
                      <div className="my-2 text-center">
                        <button
                          type="button"
                          className="text-xs text-blue-600 underline"
                          onClick={() => setShowForgotPwd(true)}
                        >
                          Forgot password?
                        </button>
                      </div>
                      {authError && authTab === 'login' &&
                        <div className="text-red-500 text-sm mt-2 text-center">{authError}</div>}
                      <div className="my-4 text-center text-gray-500 text-xs">or</div>
                      <div ref={googleLoginRef} className="flex justify-center my-2" />
                      {googleLoading && <div className="text-center text-xs text-gray-500">Signing in with Google...</div>}
                    </>) : (
                    <>
                      <form className="space-y-4" onSubmit={handleForgotPassword}>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full border rounded px-3 py-2 pl-10"
                            value={forgotPwdEmail}
                            onChange={e => setForgotPwdEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button className="w-full" type="submit" disabled={forgotPwdLoading}>
                          {forgotPwdLoading ? 'Recovering...' : 'Recover Account'}
                        </Button>
                        {forgotPwdMsg && (
                          <div className="text-blue-600 text-sm mt-2 text-center">{forgotPwdMsg}</div>
                        )}
                        <div className="my-2 text-center">
                          <button
                            type="button"
                            className="text-xs text-blue-600 underline"
                            onClick={() => setShowForgotPwd(false)}
                          >
                            Back to Login
                          </button>
                        </div>
                      </form>
                    </>
                  )
                  }
                </TabsContent>
                <TabsContent value="signup">
                  <form className="space-y-4" onSubmit={handleSignup}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" placeholder="Full Name" className="w-full border rounded px-3 py-2 pl-10" value={signupName} onChange={e => setSignupName(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="email" placeholder="Email" className="w-full border rounded px-3 py-2 pl-10" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="password" placeholder="Password" className="w-full border rounded px-3 py-2 pl-10" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="password" placeholder="Confirm Password" className="w-full border rounded px-3 py-2 pl-10" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} required />
                    </div>
                    <Button className="w-full" type="submit" disabled={authLoading}>{authLoading ? 'Signing up...' : 'Sign Up'}</Button>
                  </form>
                  {authError && authTab === 'signup' && <div className="text-red-500 text-sm mt-2 text-center">{authError}</div>}
                  <div className="my-4 text-center text-gray-500 text-xs">or</div>
                  <div ref={googleSignupRef} className="flex justify-center my-2" />
                  {googleLoading && <div className="text-center text-xs text-gray-500">Signing up with Google...</div>}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
