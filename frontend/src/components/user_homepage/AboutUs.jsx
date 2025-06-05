
import { ShieldCheckIcon, UsersIcon } from 'lucide-react'; 

export default function AboutUs() {
  return (
    <section className="bg-[#beb5aa] py-16 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-[#0d1b2a] mb-6">
          About Us
        </h2>
        <p className="text-lg text-[#0d1b2a] mb-8">
          Our platform is dedicated to promoting justice by empowering victims and witnesses to securely report human rights violations. We collaborate with legal teams, NGOs, and authorities to ensure every case is documented with integrity and respect for anonymity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition duration-300 ">
            <ShieldCheckIcon className="h-12 w-12 text-[#0d1b2a] mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-[#0d1b2a]">Secure & Confidential</h3>
            <p className="text-[#4b3d28]">
              We prioritize the safety of reporters through encryption and pseudonyms to protect identities.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition duration-300 border ">
            <UsersIcon className="h-12 w-12 text-[#0d1b2a] mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-[#0d1b2a]">Community Support</h3>
            <p className="text-[#4b3d28]">
              Our team works with local partners to provide legal aid, counseling, and other resources for victims.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
