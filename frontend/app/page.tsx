import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B1538] via-[#A91D3A] to-[#C73659] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-[#8B1538]" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
          Find Your Perfect Study Partner
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-white/90 text-pretty max-w-2xl mx-auto leading-relaxed">
          Connect with peers, collaborate on projects, and achieve academic
          excellence together
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-[#8B1538] hover:bg-white/90 px-8"
          >
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white/10 px-8 bg-transparent"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
