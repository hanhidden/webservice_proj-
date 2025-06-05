import bgImage from "../../assets/images/img4.jpg";

export default function HeroSection() {
  return (
    <section className="relative text-slate-200 py-40 text-center overflow-hidden font-poppins">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-70"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      ></div>

      <div
        className="absolute inset-0 bg-black opacity-40"
        aria-hidden="true"
      ></div>

      <div className="relative z-10 max-w-xl mx-auto px-4 animate-fadeIn">
        <h1 className="text-5xl font-bold mb-6 tracking-wide drop-shadow-lg">
          Welcome To The Human Right Monitor
        </h1>
        <p className="text-lg tracking-wide drop-shadow-md">
          We empower individuals to report incidents anonymously and securely.
          Together, we create a safer community.
        </p>
      </div>
    </section>
  );
}
