// CartIcon.tsx
import { forwardRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";

const CartIcon = forwardRef<HTMLDivElement>((_props, ref) => {
  const navigate = useNavigate();
  const { totalCount } = useCart();
  const [animate, setAnimate] = useState(false);
  const [prevCount, setPrevCount] = useState(totalCount);

  useEffect(() => {
    if (totalCount > prevCount) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCount(totalCount);
  }, [totalCount, prevCount]);

  return (
    <div
      ref={ref}
      className="fixed bottom-4 left-4 cursor-pointer z-50"
      onClick={() => navigate("/buyerCart")}
    >
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-orange-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5.2a1 1 0 001 1.2h12a1 1 0 001-1.2L17 13M7 13L5.4 5M17 13l1.6-6"
          />
        </svg>
        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-semibold transform ${
              animate ? "scale-150" : "scale-100"
            } transition-transform duration-300`}
          >
            {totalCount}
          </span>
        )}
      </div>
    </div>
  );
});

export default CartIcon;
