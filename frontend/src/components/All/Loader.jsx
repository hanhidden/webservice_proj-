
import { FaBalanceScale } from "react-icons/fa";

const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-blink text-[#132333]">
      <FaBalanceScale size={200} />
    </div>
  </div>
);

export default Loader;
