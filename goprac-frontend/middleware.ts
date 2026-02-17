import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/review', '/users', '/questions', '/lead-management', '/assessment-dashboard','/jobcreation', '/practicecreationnew', '/learner-activity-report', '/practice-invitation', '/institute-job-report'];
const ADMIN_ONLY_ROUTES = ['/users', '/questions', '/lead-management' , '/assessment-dashboard', '/jobcreation', '/practicecreationnew' ];
// Block students only
const NON_STUDENT_ROUTES = [
    '/learner-activity-report', 
    '/practice-invitation', 
    '/institute-job-report'
];

export function middleware(request: NextRequest) {
    const isLoggedIn = request.cookies.get('PracIsLoggedin')?.value === 'true';
    const userType = request.cookies.get('pracUserType')?.value;

    const path = request.nextUrl.pathname;

    const isProtected = PROTECTED_ROUTES.some((route) => path.startsWith(route));

    // Authentication check
    if (isProtected && !isLoggedIn) {
        const loginUrl = new URL('/', request.url);
        loginUrl.searchParams.set('login', '1');
        loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search);
        return NextResponse.redirect(loginUrl);
    }

    // Authorization check - admin-only routes
    const isAdminOnly = ADMIN_ONLY_ROUTES.some((route) => path.startsWith(route));
    if (isAdminOnly && userType !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Authorization check - block students from these routes
    const isNonStudentRoute = NON_STUDENT_ROUTES.some((route) => path.startsWith(route));
    if (isNonStudentRoute && (userType === 'student')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/review/:path*', '/users', '/questions', '/lead-management', '/assessment-dashboard','/jobcreation','/practicecreationnew', '/learner-activity-report', '/practice-invitation', '/institute-job-report'],
};
