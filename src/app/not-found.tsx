"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/components";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        <span className="text-4xl font-bold text-blue-500">404</span>
                    </div>
                    <CardTitle className="text-2xl text-slate-100">Page Not Found</CardTitle>
                    <p className="text-slate-400 text-sm">
                        The page you are looking for doesn&apos;t exist or has been moved.
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="w-full bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                    >
                        <ArrowLeft className="mr-2" size={16} />
                        Go Back
                    </Button>
                    <Button
                        onClick={() => router.push("/")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Home className="mr-2" size={16} />
                        Go to Home
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
