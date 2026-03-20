type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "h-12 px-6 font-semibold rounded-xl transition";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
