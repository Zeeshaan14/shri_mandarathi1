import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Mail, Phone, Clock, FileText, Building, Award } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Contact Us
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our products or want to place an order? We're here to help you with all your oil
            product needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">
                      Nadur, Brahmavar taluk
                      <br />
                      Udupi district, Karnataka
                      <br />
                      576223
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <a href="tel:+919008496222" className="text-amber-600 hover:text-amber-700 font-medium">
                      +91 9008496222
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a href="mailto:shrimandarathioilmill@gmail.com" className="text-amber-600 hover:text-amber-700">
                      shrimandarathioilmill@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Clock className="h-6 w-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Business Hours</p>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-amber-600" />
                  <div>
                    <span className="font-medium">GST No:</span>
                    <span className="ml-2 text-gray-600">29BNGPM5441K1ZL</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-amber-600" />
                  <div>
                    <span className="font-medium">FSSAI No:</span>
                    <span className="ml-2 text-gray-600">21224160000478</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Contact</h4>
              <a
                href="https://wa.me/919008496222"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input id="phone" placeholder="Your phone number" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea id="message" placeholder="Tell us about your requirements..." rows={4} />
                </div>
                <Button className="w-full bg-amber-600 hover:bg-amber-700">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose Us?</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
                <p className="font-medium">Quality Assured</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium">Certified Products</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-medium">Timely Delivery</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-medium">Trusted Brand</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
