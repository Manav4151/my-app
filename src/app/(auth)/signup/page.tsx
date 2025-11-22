// "use client";

// import React from 'react';

// const SignUpPage = () => {
//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
//             <div className="w-full max-w-md p-8 m-4 space-y-6 bg-white border border-gray-200 rounded-2xl shadow-xl dark:bg-gray-800/50 dark:border-gray-700">
//                 <div className="text-center">
//                     <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
//                         Create your Account
//                     </h2>
//                 </div>

//                 <form className="space-y-6" action="#" method="POST">
//                     <div className="space-y-4 rounded-md">
//                         <div>
//                             <label htmlFor="name" className="sr-only">Full Name</label>
//                             <input
//                                 id="name"
//                                 name="name"
//                                 type="text"
//                                 autoComplete="name"
//                                 required
//                                 className="relative block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 transition-shadow duration-200"
//                                 placeholder="Full Name"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="email-signup" className="sr-only">Email address</label>
//                             <input
//                                 id="email-signup"
//                                 name="email"
//                                 type="email"
//                                 autoComplete="email"
//                                 required
//                                 className="relative block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 transition-shadow duration-200"
//                                 placeholder="Email address"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="password-signup" className="sr-only">Password</label>
//                             <input
//                                 id="password-signup"
//                                 name="password"
//                                 type="password"
//                                 autoComplete="new-password"
//                                 required
//                                 className="relative block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 transition-shadow duration-200"
//                                 placeholder="Password"
//                             />
//                         </div>
//                     </div>
//                     <div>
//                         <button
//                             type="submit"
//                             className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-200 hover:scale-105"
//                         >
//                             Create Account
//                         </button>
//                     </div>
//                 </form>
//                 <p className="text-sm text-center text-gray-600 dark:text-gray-400">
//                     Already have an account?{' '}
//                     <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
//                         Sign in
//                     </a>
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default SignUpPage;


import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return <SignUpForm />;
}
