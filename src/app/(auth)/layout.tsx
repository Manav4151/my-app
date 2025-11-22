import { BookOpen, Library, Users, Star, ArrowRight } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--background)]">
            {/* Left Section - Book-themed Branding */}
            <div className="w-full lg:w-1/2 bg-[var(--primary)] p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-lg transform rotate-12"></div>
                    <div className="absolute top-32 right-16 w-24 h-24 border-2 border-white rounded-lg transform -rotate-12"></div>
                    <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-white rounded-lg transform rotate-45"></div>
                    <div className="absolute bottom-32 right-10 w-28 h-28 border-2 border-white rounded-lg transform -rotate-45"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold">BookVault</h1>
                            <p className="text-white/80 text-sm">Digital Library Management</p>
                        </div>
                    </div>
                    <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
                        Organize, manage, and discover your digital book collection with ease
                    </p>
                </div>

                <div className="hidden lg:block space-y-8 relative z-10">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">
                            Your Personal Library Awaits
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    <Library className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Smart Organization</h3>
                                    <p className="text-white/80">
                                        Categorize and tag your books for easy discovery and management
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    <Star className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Personal Collection</h3>
                                    <p className="text-white/80">
                                        Build your digital library with detailed book information and notes
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Community Features</h3>
                                    <p className="text-white/80">
                                        Share recommendations and discover new books from fellow readers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <span>Join thousands of book lovers</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Mobile Features */}
                <div className="lg:hidden mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <Library className="w-5 h-5 text-white/70" />
                        <span className="text-white/80">Smart Organization</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-white/70" />
                        <span className="text-white/80">Personal Collection</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-white/70" />
                        <span className="text-white/80">Community Features</span>
                    </div>
                </div>
            </div>

            {/* Right Section - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-[var(--surface)]">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}
