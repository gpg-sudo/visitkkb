import { MapPin, Heart, Users, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-muted/30 py-16 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            About Kuala Kubu Bharu
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Discover the hidden gem of Selangor - where nature, history, and
            adventure come together.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* About KKB */}
        <section>
          <h2 className="text-3xl font-bold mb-6">
            Welcome to Kuala Kubu Bharu
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kuala Kubu Bharu, affectionately known as KKB, is a charming town
              nestled in the heart of Selangor, Malaysia. Located about 60
              kilometers north of Kuala Lumpur, this hidden gem offers a perfect
              escape from the bustling city life.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Rich in colonial history and surrounded by lush rainforests, KKB
              is a paradise for nature lovers, adventure seekers, and history
              enthusiasts alike. From the adrenaline-pumping white water rafting
              on the Selangor River to peaceful jungle treks leading to stunning
              waterfalls, KKB has something for everyone.
            </p>
          </div>
        </section>

        {/* Why Visit */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Why Visit KKB?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Perfect Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Just an hour from KL, making it ideal for weekend getaways and
                  day trips.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Natural Beauty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Surrounded by pristine rainforests, rivers, and mountains with
                  breathtaking views.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Adventure Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From rafting to paragliding, hiking to jungle trekking -
                  adventure awaits!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Rich Heritage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Colonial architecture and local culture create a unique
                  historical experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About VisitKKB */}
        <section className="bg-muted/30 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">About VisitKKB</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              VisitKKB is your comprehensive guide to exploring Kuala Kubu
              Bharu. We&apos;re passionate about showcasing the best that KKB
              has to offer - from cozy accommodations and thrilling activities
              to delicious local cuisine.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our mission is to make planning your KKB adventure as easy and
              enjoyable as possible. We work with trusted local operators,
              guides, and businesses to bring you authentic experiences while
              supporting the local community.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you&apos;re seeking adventure, relaxation, or cultural
              immersion, VisitKKB is here to help you create unforgettable
              memories in this beautiful corner of Malaysia.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">hello@visitkkb.com</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    Kuala Kubu Bharu, Selangor, Malaysia
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Follow Us</h3>
                  <p className="text-muted-foreground">
                    @visitkkb on Instagram and Facebook
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
