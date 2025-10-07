import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard = ({ children, className, hover = true }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg",
        hover && "transition-all duration-300 hover:bg-white/15 hover:shadow-xl hover:scale-105",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
