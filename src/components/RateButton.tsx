import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface RateButtonProps {
  productId?: string | number;
  productName: string;
  size?: "sm" | "default" | "lg";
  variant?: "outline" | "default" | "secondary" | "ghost" | "gradient";
  className?: string;
}

const RateButton = ({ productId, productName, size = "sm", variant = "outline", className }: RateButtonProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  const submit = () => {
    if (rating === 0) {
      toast("Select a rating before submitting");
      return;
    }
    toast.success(`Rated ${productName} ${rating} star${rating > 1 ? "s" : ""}`);
    setOpen(false);
    setReview("");
    setRating(0);
  };

  return (
    <>
      <Button size={size} variant={variant} className={className} onClick={() => setOpen(true)}>
        Rate
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {productName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${i} star`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${i <= (hover || rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this product"
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={submit}>Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RateButton;
