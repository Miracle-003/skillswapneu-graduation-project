import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, MessageSquare, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B1538] via-[#A91D3A] to-[#C73659] opacity-90" />
        <img
          src="/university-campus-at-sunset-with-students-studying.jpg"
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Find Your Perfect Study Partner</h1>
          <p className="text-xl md:text-2xl mb-8 text-balance opacity-95">
            Connect with peers, collaborate on projects, and achieve academic excellence together
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-white text-[#8B1538] hover:bg-gray-100 font-semibold">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why skill swap?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B1538] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-muted-foreground">
                AI-powered algorithm matches you with compatible study partners based on courses, goals, and learning
                styles
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B1538] rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
              <p className="text-muted-foreground">
                Communicate instantly with your study partners through our integrated messaging system
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B1538] rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Peer Review</h3>
              <p className="text-muted-foreground">
                Get constructive feedback on your work and help others improve through collaborative learning
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B1538] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gamification</h3>
              <p className="text-muted-foreground">
                Earn badges, track progress, and climb leaderboards as you achieve your academic goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students already collaborating and succeeding together
          </p>
          <Button asChild size="lg" className="bg-[#8B1538] hover:bg-[#A91D3A]">
            <Link href="/auth/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 skill swap Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
